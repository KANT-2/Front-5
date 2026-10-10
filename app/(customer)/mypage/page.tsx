import type { Metadata } from "next";
import MyPageView from "@/components/MyPageView";

export const metadata: Metadata = { title: "마이페이지 — leaf & bowl" };

export default function MyPagePage() {
  return <MyPageView />;
}
