"use client";

import { useEffect } from "react";
import { ALLERGENS, DIETS, type Allergen, type Diet, type Filters } from "@/lib/menu";

type Props = { open: boolean; onClose: () => void; filters: Filters; setFilters: (f: Filters) => void };

export default function FilterPanel({ open, onClose, filters, setFilters }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (a: Allergen) =>
    setFilters({
      ...filters,
      allergens: filters.allergens.includes(a)
        ? filters.allergens.filter((x) => x !== a)
        : [...filters.allergens, a],
    });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Фильтр по питанию и аллергенам"
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Фильтр меню</h2>
          <button onClick={onClose} aria-label="Закрыть" className="min-h-10 min-w-10 text-2xl">×</button>
        </div>

        <div className="mb-2 text-sm font-semibold">Тип питания</div>
        {(Object.keys(DIETS) as Diet[]).map((d) => (
          <label key={d} className="flex min-h-11 items-center gap-3">
            <input type="radio" name="diet" checked={filters.diet === d} onChange={() => setFilters({ ...filters, diet: d })} />
            {DIETS[d]}
          </label>
        ))}

        <div className="mb-2 mt-5 text-sm font-semibold">Исключить аллергены</div>
        {(Object.keys(ALLERGENS) as Allergen[]).map((a) => (
          <label key={a} className="flex min-h-11 items-center gap-3">
            <input type="checkbox" checked={filters.allergens.includes(a)} onChange={() => toggle(a)} />
            {ALLERGENS[a]}
          </label>
        ))}

        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-neutral-700">
          Блюда готовятся на кухне, где используются все перечисленные продукты, поэтому следы аллергенов
          исключить нельзя. При тяжёлой аллергии свяжитесь с нами до заказа.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setFilters({ diet: "any", allergens: [] })}
            className="min-h-11 flex-1 rounded-xl border border-neutral-300 font-semibold"
          >
            Сбросить
          </button>
          <button onClick={onClose} className="min-h-11 flex-1 rounded-xl bg-green-700 font-semibold text-white">
            Показать меню
          </button>
        </div>
      </div>
    </div>
  );
}