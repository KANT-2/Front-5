import type { Metadata } from "next";
import LoginView from "@/components/LoginView";

export const metadata: Metadata = { title: "로그인 — leaf & bowl" };

export default function LoginPage() {
  return <LoginView />;
}
