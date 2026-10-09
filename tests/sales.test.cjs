/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const { buildSalesReport, salesDataSchema, salesPeriodStart } = require('../lib/admin/sales.ts');
const now = new Date('2026-10-09T03:00:00Z');
const products = [
  { id: 'a', type: 'salad', name: 'A 샐러드', image: '/a.png', deleted: false, badge: 'BEST' },
  { id: 'b', type: 'salad', name: 'B 샐러드', image: '', deleted: false, badge: '' },
  { id: 'c', type: 'salad', name: 'C 샐러드', image: '', deleted: false, badge: '' },
  { id: 'zero', type: 'salad', name: '미판매', image: '', deleted: false },
  { id: 'drink', type: 'drink', name: '음료', deleted: false },
];
const catalog = { products };
const item = (productId, quantity, refundedQuantity = 0, productType = 'salad') => ({ productId, productType, productName: productId, quantity, refundedQuantity });
const order = (id, items, status = 'paid', paidAt = '2026-10-09T01:00:00Z') => ({ id, status, paidAt, items });
const data = orders => salesDataSchema.parse({ updatedAt: now.toISOString(), orders });

test('ranks by net salad units, excludes cancelled/unpaid/refunded orders and options, preserves badges', () => {
  const before = structuredClone(catalog);
  const result = buildSalesReport(catalog, data([
    order('1', [item('a', 5, 1), item('a', 2), item('drink', 20, 0, 'drink'), item('custom', 4, 0, 'custom')]),
    order('2', [item('b', 6)], 'completed'),
    order('3', [item('c', 3)]),
    order('4', [item('c', 100)], 'cancelled'),
    order('5', [item('c', 100)], 'pending', null),
    order('6', [item('c', 100)], 'refunded'),
    order('7', [item('c', 3, 3)]),
  ]), 'all', now);
  assert.equal(result.totalQuantity, 15);
  assert.equal(result.orderCount, 3);
  assert.deepEqual(result.rows.map(r => [r.productId, r.quantity, r.rank]), [['a', 6, 1], ['b', 6, 1], ['c', 3, 3], ['zero', 0, null]]);
  assert.equal(result.rows[0].share, 40);
  assert.deepEqual(catalog, before);
});

test('periods include Korean midnight and exclude earlier and future payments', () => {
  assert.equal(salesPeriodStart('today', now), Date.parse('2026-10-08T15:00:00Z'));
  assert.equal(salesPeriodStart('7d', now), Date.parse('2026-10-02T15:00:00Z'));
  assert.equal(salesPeriodStart('30d', now), Date.parse('2026-09-09T15:00:00Z'));
  const source = data([
    order('boundary', [item('a', 2)], 'paid', '2026-10-08T15:00:00Z'),
    order('before', [item('a', 10)], 'paid', '2026-10-08T14:59:59Z'),
    order('future', [item('a', 100)], 'paid', '2026-10-10T01:00:00Z'),
  ]);
  assert.equal(buildSalesReport(catalog, source, 'today', now).totalQuantity, 2);
  assert.equal(buildSalesReport(catalog, source, 'all', now).totalQuantity, 12);
  assert.equal(salesPeriodStart('today', new Date('2026-10-08T16:00:00Z')), Date.parse('2026-10-08T15:00:00Z'));
});

test('historical sales survive menu deletion and missing data differs from zero sales', () => {
  const historical = { products: [...products, { id: 'deleted', type: 'salad', name: '삭제된 샐러드', deleted: true }] };
  const result = buildSalesReport(historical, data([order('1', [item('deleted', 3), item('purged', 2)])]), 'all', now);
  assert.equal(result.totalQuantity, 5);
  assert.equal(result.rows.find(r => r.productId === 'deleted').archived, true);
  assert.equal(result.rows.find(r => r.productId === 'purged').name, 'purged');
  assert.equal(buildSalesReport(catalog, null, 'all', now).connected, false);
  const empty = buildSalesReport(catalog, data([]), 'all', now);
  assert.equal(empty.connected, true);
  assert.ok(empty.rows.every(r => r.rank === null));
});

test('rejects duplicate orders, invalid refunds, quantities and missing payment timestamps', () => {
  assert.throws(() => data([order('same', [item('a', 1)]), order('same', [item('a', 1)])]));
  assert.throws(() => data([order('1', [item('a', 1, 2)])]));
  assert.throws(() => data([order('1', [item('a', -1)])]));
  assert.throws(() => data([order('1', [item('a', 1.5)])]));
  assert.throws(() => data([order('1', [item('a', 1)], 'paid', null)]));
});

test('sales adapter reads persisted records, distinguishes missing files and reports corrupt data', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'front5-sales-'));
  const previous = process.env.ADMIN_DATA_DIR;
  process.env.ADMIN_DATA_DIR = directory;
  const { readSalesData } = require('../lib/admin/sales-store.ts');
  try {
    assert.equal(await readSalesData(), null);
    fs.writeFileSync(path.join(directory, 'sales-orders.json'), JSON.stringify(data([order('1', [item('a', 2)])])));
    assert.equal((await readSalesData()).orders[0].items[0].quantity, 2);
    fs.writeFileSync(path.join(directory, 'sales-orders.json'), '{bad json');
    await assert.rejects(readSalesData());
  } finally {
    if (previous === undefined) delete process.env.ADMIN_DATA_DIR; else process.env.ADMIN_DATA_DIR = previous;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('drink and dressing reports count normalized option units and refunds within each category', () => {
  const source = data([
    order('mixed', [item('a', 3, 1), item('drink', 2, 0, 'drink'), item('dressing', 6, 2, 'dressing')]),
    order('standalone', [item('drink', 3, 1, 'drink')]),
    order('cancelled', [item('drink', 100, 0, 'drink'), item('dressing', 100, 0, 'dressing')], 'cancelled'),
    order('refunded', [item('drink', 100, 0, 'drink')], 'refunded'),
    order('fully-refunded-option', [item('drink', 1, 1, 'drink'), item('dressing', 1, 1, 'dressing')]),
  ]);
  const expanded = {products:[...products,{id:'dressing',type:'dressing',name:'무료 드레싱',image:'',deleted:false},{id:'unused-dressing',type:'dressing',name:'미선택',image:'',deleted:false}]};
  const drinks = buildSalesReport(expanded, source, 'all', now, 'drink');
  assert.equal(drinks.productType, 'drink');
  assert.equal(drinks.totalQuantity, 4);
  assert.equal(drinks.orderCount, 2);
  assert.deepEqual(drinks.rows.map(r=>[r.productId,r.quantity,r.rank,r.share]), [['drink',4,1,100]]);
  const dressings = buildSalesReport(expanded, source, 'all', now, 'dressing');
  assert.equal(dressings.totalQuantity, 4);
  assert.equal(dressings.orderCount, 1);
  assert.deepEqual(dressings.rows.map(r=>[r.productId,r.quantity,r.rank]), [['dressing',4,1],['unused-dressing',0,null]]);
  assert.equal(buildSalesReport(expanded, source, 'all', now).totalQuantity, 2);
});

test('category reports preserve archived products, ties, periods and missing data', () => {
  const expanded={products:[...products,{id:'old-drink',type:'drink',name:'판매 종료 음료',deleted:true}]};
  const source=data([order('today',[item('drink',2,0,'drink'),item('old-drink',2,0,'drink'),item('purged-drink',1,0,'drink')]),order('old',[item('drink',10,0,'drink')],'paid','2026-10-01T00:00:00Z')]);
  const result=buildSalesReport(expanded,source,'today',now,'drink');
  assert.equal(result.totalQuantity,5);
  assert.deepEqual(result.rows.map(r=>r.rank),[1,1,3]);
  assert.equal(result.rows.find(r=>r.productId==='old-drink').archived,true);
  assert.equal(result.rows.find(r=>r.productId==='purged-drink').name,'purged-drink');
  assert.equal(result.rows.find(r=>r.productId==='drink').share,40);
  assert.equal(buildSalesReport(expanded,null,'all',now,'dressing').connected,false);
  const empty=buildSalesReport(expanded,data([]),'all',now,'drink');
  assert.equal(empty.connected,true);
  assert.equal(empty.totalQuantity,0);
  assert.ok(empty.rows.every(r=>r.rank===null));
});
