import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const body = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });
const display = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "ВАКУУМ — здоровое питание на неделю",
  description: "Рассчитайте норму калорий, выберите рацион и получайте готовую еду с доставкой.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${body.variable} ${display.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}