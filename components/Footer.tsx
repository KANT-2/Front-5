import Link from "next/link";
import { DELIVERY_AREA_LABEL, DELIVERY_HOURS } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="wrap">
      <Link className="logo" href="/">
        leaf &amp; bowl<span className="logo-sub footer-sub">작은 습관, 더 싱그러운 하루.</span>
      </Link>
      <p className="footer-store">
        배달 가능 {DELIVERY_AREA_LABEL} · {DELIVERY_HOURS}
      </p>
      <div>
        © 2026 leaf &amp; bowl concept.
      </div>
    </footer>
  );
}
