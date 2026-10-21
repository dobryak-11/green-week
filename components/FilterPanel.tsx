"use client";

import { useEffect, useRef } from "react";
import { ALLERGENS, DIETS, hasGap, type Allergen, type Diet, type Filters } from "@/lib/menu";
import { useMenu } from "@/components/MenuProvider";

type Props = { open: boolean; onClose: () => void; filters: Filters; setFilters: (f: Filters) => void };

export default function FilterPanel({ open, onClose, filters, setFilters }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const { menu } = useMenu();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (a: Allergen) =>
    setFilters({
      ...filters,
      allergens: filters.allergens.includes(a)
        ? filters.allergens.filter((x) => x !== a)
        : [...filters.allergens, a],
    });

  const count = (filters.diet !== "any" ? 1 : 0) + filters.allergens.length;
  const gap = hasGap(menu, filters);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1B3A]/60 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтр по питанию и аллергенам"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] pb-[env(safe-area-inset-bottom)] md:rounded-[2rem] border-2 border-[#F0E4D3] bg-[#FFFAF3] text-[#0B1B3A] shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-[#F0E4D3] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">Фильтр меню</h2>
            <p className="mt-0.5 text-sm text-[#5B6785]">
              {count > 0 ? `Выбрано: ${count}` : "Ничего не выбрано, показываем всё меню"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl transition hover:bg-orange-100"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-2 text-sm font-semibold">Тип питания</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIETS) as Diet[]).map((d) => (
              <button
                key={d}
                onClick={() => setFilters({ ...filters, diet: d })}
                aria-pressed={filters.diet === d}
                className={
                  "min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition " +
                  (filters.diet === d
                    ? "border-lime-400 bg-lime-300"
                    : "border-[#F0E4D3] bg-white hover:border-lime-300")
                }
              >
                {DIETS[d]}
              </button>
            ))}
          </div>

          <div className="mb-2 mt-6 text-sm font-semibold">Исключить аллергены</div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ALLERGENS) as Allergen[]).map((a) => {
              const on = filters.allergens.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggle(a)}
                  aria-pressed={on}
                  className={
                    "flex min-h-12 items-center gap-2 rounded-2xl border-2 px-4 text-left text-sm font-semibold transition " +
                    (on
                      ? "border-pink-400 bg-pink-100 text-pink-800"
                      : "border-[#F0E4D3] bg-white hover:border-orange-300")
                  }
                >
                  <span
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs " +
                      (on ? "bg-pink-500 text-white" : "bg-[#F0E4D3]")
                    }
                  >
                    {on ? "✕" : ""}
                  </span>
                  {ALLERGENS[a]}
                </button>
              );
            })}
          </div>

          {gap && (
            <p role="alert" className="mt-5 rounded-2xl bg-pink-100 p-3 text-sm text-pink-800">
              Для таких ограничений нет блюд на все приёмы пищи. Уберите часть фильтров.
            </p>
          )}

          <p className="mt-5 rounded-2xl bg-amber-100 p-3 text-xs text-[#44506f]">
            Блюда готовятся на кухне, где используются все перечисленные продукты, поэтому следы аллергенов
            исключить нельзя. При тяжёлой аллергии свяжитесь с нами до заказа.
          </p>
        </div>

        <div className="flex gap-3 border-t border-[#F0E4D3] bg-white px-6 py-4">
          <button
            onClick={() => setFilters({ diet: "any", allergens: [] })}
            className="min-h-12 flex-1 rounded-full border-2 border-[#0B1B3A] font-bold transition hover:bg-[#0B1B3A] hover:text-white"
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className="min-h-12 flex-1 rounded-full bg-orange-400 font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/60 transition hover:bg-orange-300"
          >
            Показать меню
          </button>
        </div>
      </div>
    </div>
  );
}