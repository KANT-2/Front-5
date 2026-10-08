/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
// Load the project's TypeScript domain modules without a second test toolchain.
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith("@/")
      ? path.join(__dirname, "..", request.slice(2))
      : request,
    ...args,
  );
};
const {
  customerSeed,
  migrateCatalog,
} = require("../lib/admin/customer-seed.ts");
const { catalogSchema } = require("../lib/admin/catalog.ts");
const { customerCatalog } = require("../lib/customer/catalog.ts");
const { PRODUCTS } = require("../data/products.ts");
const snapshot = (catalog) => ({
  catalog,
  revision: 1,
  updatedAt: new Date().toISOString(),
});
test("customer data seeds valid admin data without changing product URLs", () => {
  const seed = customerSeed();
  catalogSchema.parse(seed);
  const data = customerCatalog(snapshot(seed));
  assert.equal(data.visibleProducts.length, PRODUCTS.length);
  for (const p of PRODUCTS) {
    const actual = data.getProduct(p.id);
    assert.equal(actual.name, p.name);
    assert.equal(actual.price, p.price);
    assert.equal(actual.imageUrl, p.imageUrl);
    assert.equal(actual.description, p.description);
    assert.deepEqual(actual.allergens, p.allergens);
  }
  assert.ok(data.reviews.length > 0);
  assert.ok(data.ingredients.length > 0);
});
test("edits, visibility, new stable IDs, options and cart prices share one snapshot", () => {
  const seed = customerSeed();
  seed.products[0].name = "수정 메뉴";
  seed.products[0].price = 15000;
  seed.products[0].status = "soldout";
  seed.products[1].status = "hidden";
  seed.products[2].deleted = true;
  seed.products.push({
    ...seed.products[0],
    id: "new-salad",
    customerId: undefined,
    status: "active",
  });
  const migrated = migrateCatalog(seed);
  const data = customerCatalog(snapshot(migrated));
  assert.equal(data.getProduct(0).name, "수정 메뉴");
  assert.equal(data.getProduct(0).price, 15000);
  assert.equal(data.getProduct(1), undefined);
  assert.equal(data.getProduct(2), undefined);
  const next = migrated.products.at(-1);
  assert.equal(next.customerId, 12);
  assert.equal(migrateCatalog(migrated).products.at(-1).customerId, 12);
  assert.equal(
    data.itemAvailable({ id: 0, dressing: 0, drinks: [], qty: 1 }),
    false,
  );
  migrated.products[0].status = "active";
  migrated.products.find((p) => p.id === "drink-0").price = 5000;
  let latest = customerCatalog(snapshot(migrated));
  const item = {
    id: 0,
    dressing: 0,
    drinks: [0],
    qty: 1,
    optionSelections: { dressing: ["dressing-0"], drinks: ["drink-0"] },
  };
  assert.equal(latest.itemUnitPrice(item), 20000);
  assert.equal(latest.itemAvailable(item), true);
  migrated.products.find((p) => p.id === "drink-0").status = "hidden";
  latest = customerCatalog(snapshot(migrated));
  assert.equal(latest.itemAvailable(item), false);
});
test("persistent edits survive restart; revision conflicts and review moderation are shared", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "front5-catalog-"));
  process.env.ADMIN_DATA_DIR = directory;
  try {
    const {
      readCatalog,
      writeCatalog,
      appendCustomerReview,
    } = require("../lib/admin/store.ts");
    const initial = await readCatalog();
    initial.catalog.products[0].price = 16000;
    const saved = await writeCatalog(initial.catalog, initial.revision);
    assert.equal(saved.revision, 2);
    assert.equal((await readCatalog()).catalog.products[0].price, 16000);
    assert.equal(await writeCatalog(initial.catalog, 1), null);
    const reviewed = await appendCustomerReview({
      id: "test-review",
      pid: 0,
      author: "고객",
      stars: 5,
      title: "좋은 메뉴",
      text: "고객과 관리자 화면에서 함께 확인할 리뷰입니다.",
      via: "delivery",
    });
    assert.ok(
      customerCatalog(reviewed).reviews.some((r) => r.id === "test-review"),
    );
    reviewed.catalog.reviews.find((r) => r.id === "test-review").deleted = true;
    const moderated = await writeCatalog(reviewed.catalog, reviewed.revision);
    assert.ok(
      !customerCatalog(moderated).reviews.some((r) => r.id === "test-review"),
    );
    const replay=await appendCustomerReview({id:'test-review',pid:0,author:'고객',stars:5,title:'좋은 메뉴',text:'이관 과정에서 삭제한 리뷰가 다시 등록되지 않아야 합니다.',via:'delivery'});
    assert.equal(replay.revision,moderated.revision);
    assert.ok(!customerCatalog(replay).reviews.some(r=>r.id==='test-review'));
    const old = {
      catalog: customerSeed(),
      revision: 8,
      updatedAt: new Date().toISOString(),
    };
    old.catalog.products[0].name = "기존 수정 보존";
    fs.writeFileSync(path.join(directory, "catalog.json"), JSON.stringify(old));
    const migrated = await readCatalog();
    assert.equal(migrated.catalog.products[0].name, "기존 수정 보존");
    assert.equal(migrated.revision, 9);
    assert.ok(fs.existsSync(path.join(directory, "catalog.v1.backup.json")));
  } finally {
    delete process.env.ADMIN_DATA_DIR;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("custom options, new-item cart persistence and public visibility are consistent", () => {
  const seed = customerSeed();
  seed.groups.push({
    id: "custom",
    name: "추가 토핑",
    source: "custom",
    required: true,
    multiple: true,
    deleted: false,
    choices: [
      {
        id: "12345678-1234-1234-1234-123456789012",
        name: "추가 토핑",
        price: 700,
      },
    ],
  });
  seed.products[0].optionIds.push("custom");
  let data = customerCatalog(snapshot(seed));
  const item = data.defaultItem(0);
  assert.ok(item);
  assert.equal(data.itemUnitPrice(item), 11600);
  assert.equal(data.itemAvailable(item), true);
  seed.groups.at(-1).choices[0].price = 1000;
  data = customerCatalog(snapshot(seed));
  assert.equal(data.itemUnitPrice(item), 11900);
  seed.groups.at(-1).deleted = true;
  assert.equal(customerCatalog(snapshot(seed)).itemAvailable(item), false);
  seed.products[1].status = "hidden";
  seed.reviews[0].deleted = true;
  const { publicSnapshot } = require("../lib/customer/catalog.ts");
  const publicData = publicSnapshot(snapshot(seed));
  assert.equal(publicData.catalog.products[1].name, "");
  assert.ok(
    !publicData.catalog.reviews.some((r) => r.id === seed.reviews[0].id),
  );
  const storage = require("../lib/storage.ts");
  const memory = new Map();
  global.localStorage = {
    setItem: (key, value) => memory.set(key, value),
    getItem: (key) => memory.get(key) ?? null,
  };
  try {
    storage.saveCart([{ ...item, id: 12 }]);
    const restored = storage.loadCart();
    assert.equal(restored[0].id, 12);
    assert.deepEqual(restored[0].optionSelections, item.optionSelections);
  } finally {
    delete global.localStorage;
  }
});
