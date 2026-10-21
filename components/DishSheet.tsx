"use client";

import { useEffect, useState } from "react";
import { ALLERGENS, MEALS, macros, type Dish, type Goal } from "@/lib/menu";

export const MEAL_TONES = [
  "from-amber-200 to-amber-400",
  "from-orange-200 to-orange-400",
  "from-lime-200 to-lime-400",
  "from-sky-200 to-sky-400",
];
const EXTS = ["jpg", "png", "webp"];

export function DishPhoto({ dish, tone, className = "h-40" }: { dish: Dish; tone: string; className?: string }) {
  const sources = [...(dish.photo ? [dish.photo] : []), ...EXTS.map((e) => `/dishes/${dish.id}.${e}`)];
  const [i, setI] = useState(0);
  if (i >= sources.length) {
    return (
      <div className={`flex ${className} items-center justify-center bg-gradient-to-br ${tone} font-display text-6xl font-bold text-[#0B1B3A]/60`}>
        {dish.name[0]}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sources[i]} alt={dish.name} loading="lazy" onError={() => setI(i + 1)} className={`${className} w-full object-cover`} />
  );
}

export default function DishSheet({
  dish, mealIndex, kcal, goal, onClose,
}: { dish: Dish; mealIndex: number; kcal: number; goal: Goal; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const meal = MEALS[mealIndex];
  const k = Math.round((kcal * meal.share) / 10) * 10;
  const mm = macros(k, goal);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1B3A]/60 backdrop-blur-sm md:items-center md:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        onClick={(e) => e.stopPropagation()}
        className="sheet-up flex max-h-[92svh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-[#FFFAF3] pb-[env(safe-area-inset-bottom)] text-[#0B1B3A] shadow-2xl md:rounded-[2rem]"
      >
        <div className="relative">
          <DishPhoto dish={dish} tone={MEAL_TONES[mealIndex]} className="h-56" />
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl shadow"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="text-xs text-[#5B6785]">{meal.name} · {meal.time}</div>
          <h2 className="mt-1 text-xl font-bold leading-snug">{dish.name}</h2>
          <p className="mt-2 text-sm text-[#44506f]">{dish.desc}</p>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-white p-2"><b className="block text-base">{k}</b>ккал</div>
            <div className="rounded-2xl bg-white p-2"><b className="block text-base text-[#FF6B4A]">{mm.p}</b>белки, г</div>
            <div className="rounded-2xl bg-white p-2"><b className="block text-base text-[#E0A800]">{mm.f}</b>жиры, г</div>
            <div className="rounded-2xl bg-white p-2"><b className="block text-base text-[#2f9d50]">{mm.c}</b>углев., г</div>
          </div>

          <p className="mt-4 text-sm"><b>Состав:</b> {dish.ingredients}</p>
          <p className="mt-2 text-sm">
            <b>Аллергены:</b>{" "}
            {dish.allergens.length ? dish.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ") : "из списка фильтра не указаны"}
          </p>
          {dish.diet !== "none" && (
            <span className="mt-3 inline-block rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold">
              {dish.diet === "vegan" ? "Веганское" : "Вегетарианское"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}