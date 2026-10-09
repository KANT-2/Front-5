import { connection } from 'next/server';
import { readCatalog } from '@/lib/admin/store';
import { readSalesData } from '@/lib/admin/sales-store';
import { buildSalesReport, salesPeriods, type SalesPeriod } from '@/lib/admin/sales';
import { jsonError } from '@/lib/admin/server';

export async function GET(request: Request) {
  await connection();
  const period = new URL(request.url).searchParams.get('period') ?? 'all';
  if (!salesPeriods.includes(period as SalesPeriod)) return jsonError('올바른 조회 기간을 선택해주세요.');
  try {
    const [snapshot, data] = await Promise.all([readCatalog(), readSalesData()]);
    return Response.json(buildSalesReport(snapshot.catalog, data, period as SalesPeriod), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Sales report read', error);
    return jsonError('판매 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', 503);
  }
}
