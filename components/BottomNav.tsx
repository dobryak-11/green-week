"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const svg = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
} as const;

const ICONS: Record<string, React.ReactNode> = {
  home: <svg {...svg}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  calc: <svg {...svg}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h4" /></svg>,
  menu: <svg {...svg}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4" /></svg>,
  faq: <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" /></svg>,
  account: <svg {...svg}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
};

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    { k: "home", label: "Главная", href: "/" },
    { k: "calc", label: "Расчёт", href: "/calc" },
    { k: "menu", label: "Меню", href: "/menu" },
    { k: "faq", label: "Вопросы", href: "/faq" },
    { k: "account", label: user ? "Кабинет" : "Войти", href: "/account" },
  ];
  const on = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Нижнее меню"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B1B3A] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.k}>
            <Link
              href={it.href}
              aria-current={on(it.href) ? "page" : undefined}
              className={
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition " +
                (on(it.href) ? "text-orange-300" : "text-white/70")
              }
            >
              <span className={"rounded-full px-4 py-1 transition " + (on(it.href) ? "bg-orange-400/20" : "")}>{ICONS[it.k]}</span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}