"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const LINKS = [
  { id: "about", label: "О нас" },
  { id: "calc", label: "Расчёт" },
  { id: "menu", label: "Меню" },
  { id: "faq", label: "Вопросы" },
];

const pill = "rounded-full px-4 py-2 text-sm font-medium transition-colors";

export default function Navbar() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!home) {
      setActive("");
      return;
    }
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  const linkClass = (on: boolean) =>
    `${pill} ${on ? "bg-sky-700 text-white" : "text-sky-900 hover:bg-sky-100"}`;
  const cabinet = `${pill} border border-sky-700 text-sky-800 hover:bg-sky-700 hover:text-white ${
    pathname.startsWith("/account") ? "bg-sky-700 text-white" : ""
  }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="На главную">
          <Logo className="h-10" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Основное меню">
          {LINKS.map((l) => (
            <Link key={l.id} href={`/#${l.id}`} className={linkClass(active === l.id)}>
              {l.label}
            </Link>
          ))}
          <Link href="/account" className={`${cabinet} ml-2`}>Кабинет</Link>
        </nav>

        <button
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-2xl text-sky-900 md:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-sky-100 px-4 pb-4 pt-2 md:hidden" aria-label="Мобильное меню">
          {LINKS.map((l) => (
            <Link key={l.id} href={`/#${l.id}`} onClick={() => setOpen(false)} className={linkClass(active === l.id)}>
              {l.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className={cabinet}>Кабинет</Link>
        </nav>
      )}
    </header>
  );
}
