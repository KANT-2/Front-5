"use client";

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Trophy, ShoppingBag } from 'lucide-react';
import { Button } from './button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import type { SalesPeriod, SalesReport, SalesRow } from '@/lib/admin/sales';
import styles from './SalesRanking.module.css';

const periods: { value: SalesPeriod; label: string }[] = [
  { value: 'all', label: '전체 기간' }, { value: 'today', label: '오늘' },
  { value: '7d', label: '최근 7일' }, { value: '30d', label: '최근 30일' },
];
const number = (value: number) => value.toLocaleString('ko-KR');
const dateTime = (value: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function MenuPhoto({ row }: { row: SalesRow }) {
  const [failed, setFailed] = useState(false);
  // Catalog images are uploads or existing local assets, with varying dimensions.
  // eslint-disable-next-line @next/next/no-img-element
  return row.image && !failed ? <img className={styles.photo} src={row.image} alt="" onError={() => setFailed(true)} /> : <span className={styles.photo}><ShoppingBag size={24} aria-hidden="true" /></span>;
}

export default function SalesRanking() {
  const [period, setPeriod] = useState<SalesPeriod>('all');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      setReport(null);
      try {
        const response = await fetch(`/api/admin/sales?period=${period}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw Error('판매 내역을 불러오지 못했습니다. 다시 시도해주세요.');
        const result: SalesReport = await response.json();
        if (!controller.signal.aborted) setReport(result);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '판매 내역을 불러오지 못했습니다.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [period, refresh]);
  const leaders = report?.rows.filter(row => row.rank !== null && row.rank <= 3) ?? [];
  const rankedRows = report?.rows.filter(row => row.rank !== null) ?? [];
  const rankCounts = new Map<number | null, number>();
  for (const row of rankedRows) rankCounts.set(row.rank, (rankCounts.get(row.rank) ?? 0) + 1);
  const tiedRanks = new Set([...rankCounts].filter(([, count]) => count > 1).map(([rank]) => rank));

  return <div className={styles.page}>
    <div className="page-heading"><div><div className="eyebrow">SALAD SALES RANKING</div><h1>샐러드 판매 순위</h1><p className="muted">판매 수량으로 알아보는 가장 많이 찾는 샐러드.</p></div><Button variant="outline" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} aria-hidden="true" />새로고침</Button></div>
    <div className={styles.toolbar}><div className={styles.periods} role="group" aria-label="판매 순위 조회 기간">{periods.map(item => <Button key={item.value} variant={period === item.value ? 'default' : 'outline'} aria-pressed={period === item.value} onClick={() => setPeriod(item.value)}>{item.label}</Button>)}</div><span className="meta">한국 시간 기준 · 1분마다 자동 갱신</span></div>
    <p className={styles.note}>결제 확정된 샐러드 수량을 집계하며, 취소·환불 수량은 제외합니다. 같은 수량은 공동 순위로 표시합니다.</p>
    <div aria-live="polite" aria-busy={loading}>
      {loading ? <section className="surface empty">판매 순위를 불러오는 중입니다…</section> : error ? <section className="surface empty"><p role="alert" className="error">{error}</p><Button variant="outline" onClick={() => setRefresh(value => value + 1)}>다시 시도</Button></section> : report && <>
        {!report.connected && <section className={styles.connection}><BarChart3 size={28} aria-hidden="true" /><div><h2>판매 데이터 연결을 기다리고 있습니다</h2><p>실제 주문 내역이 연결되면 판매 수량과 순위가 자동으로 표시됩니다.</p></div></section>}
        <div className={styles.summary}><section className="surface"><span className="meta">총 샐러드 판매 수량</span><strong>{report.connected ? number(report.totalQuantity) : '—'}<small>개</small></strong></section><section className="surface"><span className="meta">샐러드 판매 주문</span><strong>{report.connected ? number(report.orderCount) : '—'}<small>건</small></strong></section><section className="surface"><span className="meta">판매된 샐러드 종류</span><strong>{report.connected ? number(report.rows.filter(row => row.quantity > 0).length) : '—'}<small>종</small></strong></section></div>
        <section aria-labelledby="sales-top-title"><div className={styles.sectionTitle}><h2 id="sales-top-title"><Trophy size={20} aria-hidden="true" />판매 TOP 3</h2><span className="meta">판매 수량 기준</span></div>{leaders.length ? <div className={styles.leaders}>{leaders.map(row => <article key={row.productId} className={`surface ${styles.leader}`}><span className={styles.rank}>{tiedRanks.has(row.rank) ? '공동 ' : ''}{row.rank}위</span><MenuPhoto row={row} /><h3>{row.name}</h3>{row.archived && <span className="meta">삭제된 메뉴</span>}<strong>{number(row.quantity)}<small>개 판매</small></strong><span className="meta">전체 판매의 {row.share.toFixed(1)}%</span></article>)}</div> : <div className="surface empty">{report.connected ? '선택한 기간에 판매된 샐러드가 없습니다.' : '판매 데이터가 연결되면 상위 메뉴가 표시됩니다.'}</div>}</section>
        <section aria-labelledby="sales-all-title"><div className={styles.sectionTitle}><h2 id="sales-all-title"><BarChart3 size={20} aria-hidden="true" />전체 메뉴 판매 현황</h2><span className="meta">{report.rows.length}개 메뉴</span></div><div className={`surface ${styles.table}`}><Table><TableHeader><TableRow><TableHead>순위</TableHead><TableHead>샐러드</TableHead><TableHead className="text-right">판매 수량</TableHead><TableHead className="text-right">판매 비중</TableHead></TableRow></TableHeader><TableBody>{report.rows.map(row => <TableRow key={row.productId}><TableCell><span className={row.rank !== null && row.rank <= 3 ? styles.tableRank : ''}>{row.rank === null ? '—' : `${tiedRanks.has(row.rank) ? '공동 ' : ''}${row.rank}위`}</span></TableCell><TableCell><div className={styles.menu}><MenuPhoto row={row} /><div><strong>{row.name}</strong>{row.archived && <div className="meta">삭제된 메뉴 · 판매 기록 유지</div>}</div></div></TableCell><TableCell className={`text-right ${styles.quantity}`}>{report.connected ? `${number(row.quantity)}개` : '—'}</TableCell><TableCell className="text-right">{report.connected ? `${row.share.toFixed(1)}%` : '—'}</TableCell></TableRow>)}</TableBody></Table>{!report.rows.length && <p className="empty">표시할 샐러드 메뉴가 없습니다.</p>}</div></section>
        {report.updatedAt && <p className={styles.updated}>판매 데이터 갱신: {dateTime(report.updatedAt)}</p>}
      </>}
    </div>
  </div>;
}
