"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

const pill = "rounded-full px-4 py-2 text-sm font-semibold transition-colors";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

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

  const isOn = (id: string) => (id === "faq" ? pathname === "/faq" : home && active === id);
  const linkClass = (on: boolean) =>
    `${pill} ${on ? "bg-sky-300 text-sky-950" : "bg-white text-sky-950 hover:bg-sky-100"}`;
  const cabinet = `${pill} bg-sky-400 text-sky-950 hover:bg-sky-300`;
  const cabinetLabel = user ? "Кабинет" : "Войти";

  return (
    <header className="sticky top-0 z-40 border-b border-sky-900 bg-sky-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-10 px-4 py-3">
        <Link href="/" aria-label="На главную">
          <Logo className="h-10" dark />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Основное меню">
          {LINKS.map((l) => (
            <Link key={l.id} href={l.href} className={linkClass(isOn(l.id))}>{l.label}</Link>
          ))}
          <Link href="/account" className={`${cabinet} ml-2`}>{cabinetLabel}</Link>
        </nav>

        <button
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-2xl text-white md:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-2 border-t border-sky-900 px-4 pb-4 pt-3 md:hidden" aria-label="Мобильное меню">
          {LINKS.map((l) => (
            <Link key={l.id} href={l.href} onClick={() => setOpen(false)} className={linkClass(isOn(l.id))}>{l.label}</Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className={cabinet}>{cabinetLabel}</Link>
        </nav>
      )}
    </header>
  );
}