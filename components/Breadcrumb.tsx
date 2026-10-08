import Link from "next/link";
import { Fragment } from "react";

export type Crumb = [label: string, href?: string];

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumb" aria-label="현재 위치">
      {items.map(([label, href]) =>
        href ? (
          <Fragment key={label}>
            <Link href={href}>{label}</Link>
            <span aria-hidden="true">›</span>
          </Fragment>
        ) : (
          <b key={label} aria-current="page">
            {label}
          </b>
        ),
      )}
    </nav>
  );
}
