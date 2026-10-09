import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import DrinksView from "@/components/DrinksView";

export const metadata: Metadata = { title: "음료 — leaf & bowl" };

export default function DrinksPage() {
  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["음료"]]} />
      <DrinksView />
    </main>
  );
}
