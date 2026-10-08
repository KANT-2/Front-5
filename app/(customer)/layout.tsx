import type { Metadata, Viewport } from "next";
import CartDrawer from "@/components/CartDrawer";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ReviewsProvider from "@/components/ReviewsProvider";
import ToastProvider from "@/components/ToastProvider";
import "../globals.css";

export const metadata: Metadata = {
  title: "leaf & bowl — 오늘의 신선한 한 그릇",
  description: "오늘의 신선한 한 그릇, leaf & bowl. 샐러드를 고르고 픽업과 예약 배달을 체험해보세요.",
};

export const viewport: Viewport = {
  themeColor: "#194B38",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>
          <ReviewsProvider>
            <CartProvider>
              <div className="announcement">FRESH EVERY DAY · 오늘의 신선함을, 당신의 한 끼로</div>
              <Header />
              {children}
              <Footer />
              <CartDrawer />
            </CartProvider>
          </ReviewsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
