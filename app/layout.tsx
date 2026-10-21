import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import MenuProvider from "@/components/MenuProvider";
import Navbar from "@/components/Navbar";

const body = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });
const display = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "ВАКУУМ — здоровое питание на неделю",
  description: "Рассчитайте норму калорий, выберите рацион и получайте готовую еду с доставкой.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1B3A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${body.variable} ${display.variable}`}>
      <body className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] antialiased md:pb-0">
        <AuthProvider>
          <MenuProvider>
            <Navbar />
            {children}
            <Footer />
            <BottomNav />
            <CookieBanner />
          </MenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}