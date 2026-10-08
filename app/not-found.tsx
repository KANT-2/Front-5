import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap pv-wrap not-found">
      <span className="eyebrow">NOT FOUND</span>
      <h1>찾으시는 메뉴가 없어요.</h1>
      <p>주소를 다시 확인하거나 전체 메뉴에서 골라보세요.</p>
      <Link className="primary" href="/#menu">
        메뉴 보러 가기 <span>↗</span>
      </Link>
    </main>
  );
}
