import Link from "next/link";
import { STORE_AREA, STORE_HOURS, STORE_NAME } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="wrap">
      <Link className="logo" href="/">
        leaf &amp; bowl<span className="logo-sub footer-sub">작은 습관, 더 싱그러운 하루.</span>
      </Link>
      <p className="footer-store">
        {STORE_NAME} (가상 매장) · {STORE_AREA} · {STORE_HOURS}
      </p>
      <div>
        © 2026 leaf &amp; bowl concept.
        <span>체험용 사이트 · 메뉴/가격/매장은 예시이며 실제 주문·결제는 이루어지지 않습니다.</span>
      </div>
    </footer>
  );
}
