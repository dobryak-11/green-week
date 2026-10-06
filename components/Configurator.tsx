"use client";

import { useState } from "react";
import {
  DAY_OPTIONS, DISCOUNT, EXCLUSIONS, GOALS, KCALS, MEALS,
  macros, pickDish, totalPrice, type Exclusion, type Goal,
} from "@/lib/menu";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-10 rounded-full border px-4 text-sm font-medium " +
        (active ? "border-green-700 bg-green-700 text-white" : "border-neutral-300 bg-white text-neutral-900")
      }
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function Configurator() {
  const [goal, setGoal] = useState<Goal>("bal");
  const [kcal, setKcal] = useState<number>(1600);
  const [days, setDays] = useState<number>(5);
  const [excl, setExcl] = useState<Exclusion[]>([]);
  const [day, setDay] = useState(0);

  const toggle = (k: Exclusion) =>
    setExcl((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const m = macros(kcal, goal);
  const price = totalPrice(kcal, days);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-green-200 bg-white p-4 text-neutral-900">
          <Group title="Цель">
            {(Object.keys(GOALS) as Goal[]).map((g) => (
              <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>{GOALS[g].label}</Chip>
            ))}
          </Group>
          <Group title="Калорийность в день">
            {KCALS.map((k) => (
              <Chip key={k} active={kcal === k} onClick={() => setKcal(k)}>{k} ккал</Chip>
            ))}
          </Group>
          <Group title="Сколько дней в неделе">
            {DAY_OPTIONS.map((n) => (
              <Chip key={n} active={days === n} onClick={() => { setDays(n); if (day >= n) setDay(0); }}>
                {n} дней
              </Chip>
            ))}
          </Group>
          <Group title="Без чего готовить">
            {(Object.keys(EXCLUSIONS) as Exclusion[]).map((k) => (
              <Chip key={k} active={excl.includes(k)} onClick={() => toggle(k)}>{EXCLUSIONS[k]}</Chip>
            ))}
          </Group>
        </section>

        <section className="rounded-2xl border border-green-200 bg-white p-4 text-neutral-900">
          <h2 className="mb-3 text-lg font-semibold">Ваше меню</h2>
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {Array.from({ length: days }, (_, i) => (
              <button
                key={i}
                onClick={() => setDay(i)}
                className={
                  "min-w-16 rounded-xl border px-3 py-2 text-sm " +
                  (day === i ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300")
                }
              >
                День {i + 1}
              </button>
            ))}
          </div>
          {MEALS.map((meal, mi) => {
            const dish = pickDish(mi, day, excl);
            const k = Math.round((kcal * meal.share) / 10) * 10;
            const mm = macros(k, goal);
            return (
              <div key={meal.name} className="border-t border-neutral-200 py-3 first:border-t-0">
                <div className="text-xs text-neutral-600">{meal.name} · {meal.time}</div>
                {dish ? (
                  <>
                    <div className="font-semibold">{dish.name}</div>
                    <div className="text-sm text-neutral-600">
                      {k} ккал · Б {mm.p} г · Ж {mm.f} г · У {mm.c} г
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-neutral-600">Нет подходящих блюд, уберите часть ограничений</div>
                )}
              </div>
            );
          })}
          <div className="mt-2 rounded-xl bg-green-50 p-3 text-sm">
            Итого за день: <b>{kcal} ккал</b> · Белки <b>{m.p} г</b> · Жиры <b>{m.f} г</b> · Углеводы <b>{m.c} г</b>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-green-200 bg-white p-4 text-neutral-900 md:sticky md:top-4">
        <h2 className="mb-3 text-lg font-semibold">Ваш заказ</h2>
        <div className="flex justify-between py-1 text-sm"><span>{GOALS[goal].label}, {kcal} ккал</span></div>
        <div className="flex justify-between py-1 text-sm"><span>{days} дней</span><span>{fmt(price.base)}</span></div>
        {price.discount > 0 && (
          <div className="flex justify-between py-1 text-sm">
            <span>Скидка {DISCOUNT[days] * 100}%</span><span>−{fmt(price.discount)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold">
          <span>К оплате</span><span>{fmt(price.total)}</span>
        </div>
        <button className="mt-3 w-full rounded-xl bg-pink-700 py-3 font-semibold text-white">
          Оформить заказ
        </button>
      </aside>
    </div>
  );
}