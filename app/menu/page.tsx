import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import MenuSection from "@/components/MenuSection";

export const metadata: Metadata = { title: "전체 메뉴 — leaf & bowl" };

export default function MenuPage() {
  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["메뉴"]]} />
      <MenuSection />
    </main>
  );
}
