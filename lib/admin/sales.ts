import { z } from 'zod';
import type { Catalog } from './catalog';

export const salesPeriods = ['all', 'today', '7d', '30d'] as const;
export type SalesPeriod = typeof salesPeriods[number];
export const salesDataSchema = z.object({
  updatedAt: z.string().datetime({ offset: true }),
  orders: z.array(z.object({
    id: z.string().min(1),
    status: z.enum(['pending', 'paid', 'completed', 'cancelled', 'refunded']),
    paidAt: z.string().datetime({ offset: true }).nullable(),
    items: z.array(z.object({
      productId: z.string().min(1),
      productType: z.enum(['salad', 'drink', 'dressing', 'custom']),
      productName: z.string().min(1),
      quantity: z.number().int().positive().max(1000000),
      refundedQuantity: z.number().int().nonnegative().default(0),
    }).refine(item => item.refundedQuantity <= item.quantity, '환불 수량은 판매 수량을 초과할 수 없습니다.')),
  }).refine(order => !['paid', 'completed', 'refunded'].includes(order.status) || order.paidAt !== null, '결제 확정 주문에는 결제 시각이 필요합니다.')),
}).refine(data => new Set(data.orders.map(order => order.id)).size === data.orders.length, '주문 번호가 중복되었습니다.');
export type SalesData = z.infer<typeof salesDataSchema>;
export type SalesRow = {
  productId: string; name: string; image: string; quantity: number;
  rank: number | null; share: number; archived: boolean;
};
export type SalesReport = {
  period: SalesPeriod; connected: boolean; updatedAt: string | null;
  totalQuantity: number; orderCount: number; rows: SalesRow[];
};

// Periods use Korean calendar days, including today, and never include future sales.
export function salesPeriodStart(period: SalesPeriod, now: Date): number {
  if (period === 'all') return -Infinity;
  const koreanDay = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 1;
  return Date.parse(`${koreanDay}T00:00:00+09:00`) - (days - 1) * 86400000;
}

export function buildSalesReport(catalog: Catalog, data: SalesData | null, period: SalesPeriod, now = new Date()): SalesReport {
  const products = new Map(catalog.products.filter(p => p.type === 'salad').map(p => [p.id, p]));
  const quantities = new Map<string, { name: string; quantity: number }>();
  for (const product of products.values()) {
    if (!product.deleted) quantities.set(product.id, { name: product.name, quantity: 0 });
  }
  let orderCount = 0;
  const start = salesPeriodStart(period, now);
  for (const order of data?.orders ?? []) {
    if (!['paid', 'completed'].includes(order.status) || !order.paidAt) continue;
    const paidAt = Date.parse(order.paidAt);
    if (paidAt < start || paidAt > now.getTime()) continue;
    let counted = false;
    for (const item of order.items) {
      const quantity = item.quantity - item.refundedQuantity;
      if (item.productType !== 'salad' || quantity <= 0) continue;
      const existing = quantities.get(item.productId);
      quantities.set(item.productId, { name: existing?.name ?? products.get(item.productId)?.name ?? item.productName, quantity: (existing?.quantity ?? 0) + quantity });
      counted = true;
    }
    if (counted) orderCount++;
  }
  const sorted = [...quantities].sort((a, b) => b[1].quantity - a[1].quantity || a[0].localeCompare(b[0]));
  const totalQuantity = sorted.reduce((sum, [, item]) => sum + item.quantity, 0);
  let rank = 0;
  let previousQuantity = -1;
  const rows = sorted.map(([productId, item], index): SalesRow => {
    if (item.quantity !== previousQuantity) rank = index + 1;
    previousQuantity = item.quantity;
    const product = products.get(productId);
    return { productId, name: item.name, image: product?.image ?? '', quantity: item.quantity, rank: item.quantity > 0 ? rank : null, share: totalQuantity ? item.quantity / totalQuantity * 100 : 0, archived: !product || product.deleted };
  });
  return { period, connected: data !== null, updatedAt: data?.updatedAt ?? null, totalQuantity, orderCount, rows };
}
