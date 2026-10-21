"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

const LINKS = [
  { id: "about", label: "О нас", href: "/#about" },
  { id: "packaging", label: "Упаковка", href: "/#packaging" },
  { id: "calc", label: "Расчёт", href: "/#calc" },
  { id: "menu", label: "Меню", href: "/#menu" },
  { id: "faq", label: "Вопросы", href: "/faq" },
];
const SCROLL_IDS = ["about", "packaging", "calc", "menu"];

const pill = "rounded-full px-4 py-2 text-sm font-semibold transition";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const home = pathname === "/";
  const [active, setActive] = useState("");
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!home) {
      setActive("");
      return;
    }
    const els = SCROLL_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const isOn = (id: string) => (id === "faq" ? pathname === "/faq" : home && active === id);
  const linkClass = (on: boolean) =>
    `${pill} ${on ? "bg-orange-400 text-[#0B1B3A]" : "bg-white text-[#0B1B3A] hover:bg-orange-100"}`;
  const cabinet = `${pill} bg-sky-400 text-[#0B1B3A] hover:bg-sky-300`;
  const cabinetLabel = user ? "Кабинет" : "Войти";

  return (
    <header className="sticky top-0 z-40 bg-[#0B1B3A] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:gap-10">
        <Link href="/" aria-label="На главную">
          <Logo className="h-10" dark />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Основное меню">
          {LINKS.map((l) => (
            <Link key={l.id} href={l.href} className={linkClass(isOn(l.id))}>{l.label}</Link>
          ))}
          {isAdmin && <Link href="/admin" className={linkClass(pathname.startsWith("/admin"))}>Админка</Link>}
          <Link href="/account" className={`${cabinet} ml-2`}>{cabinetLabel}</Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {isAdmin && <Link href="/admin" className={`${pill} bg-white text-[#0B1B3A]`}>Админка</Link>}
          <Link href="/account" className={cabinet}>{cabinetLabel}</Link>
        </div>
      </div>

      <div
        ref={bar}
        className="h-[3px] origin-left bg-gradient-to-r from-orange-400 via-amber-300 to-lime-300"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}