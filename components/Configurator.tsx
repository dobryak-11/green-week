"use client";

import Link from "next/link";
import { useState } from "react";
import Calculator from "@/components/Calculator";
import FilterPanel from "@/components/FilterPanel";
import {
  ALLERGENS, DAY_OPTIONS, DIETS, DISCOUNT, GOALS, KCALS, MEALS,
  hasGap, macros, pickDish, totalPrice, type Dish, type Filters, type Goal,
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

function DishPhoto({ dish }: { dish: Dish }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-green-200 to-green-600 text-5xl font-bold text-white">
        {dish.name[0]}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/dishes/${dish.id}.jpg`}
      alt={dish.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-40 w-full object-cover"
    />
  );
}

function DishRow({ dish, mealName, time, info }: { dish: Dish; mealName: string; time: string; info: string }) {
  return (
    <div className="group relative border-t border-neutral-200">
      <button
        type="button"
        className="block w-full rounded-lg py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-700"
      >
        <div className="text-xs text-neutral-600">{mealName} · {time}</div>
        <div className="font-semibold group-hover:text-green-700">{dish.name}</div>
        <div className="text-sm text-neutral-600">{info}</div>
      </button>

      <div
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-30 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <DishPhoto dish={dish} />
        <div className="p-4">
          <div className="font-semibold">{dish.name}</div>
          <p className="mt-1 text-sm text-neutral-700">{dish.desc}</p>
          <p className="mt-2 text-xs text-neutral-600"><b>Состав:</b> {dish.ingredients}</p>
          <p className="mt-1 text-xs text-neutral-600">
            <b>Аллергены:</b>{" "}
            {dish.allergens.length ? dish.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ") : "из списка фильтра не указаны"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {dish.diet === "vegan" && <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-800">Веганское</span>}
            {dish.diet === "veg" && <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-800">Вегетарианское</span>}
          </div>
          <p className="mt-2 text-xs text-neutral-600">{info}</p>
        </div>
      </div>
    </div>
  );
}

export default function Configurator() {
  const [goal, setGoal] = useState<Goal>("bal");
  const [kcal, setKcal] = useState<number>(1600);
  const [days, setDays] = useState<number>(5);
  const [filters, setFilters] = useState<Filters>({ diet: "any", allergens: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [day, setDay] = useState(0);

  const m = macros(kcal, goal);
  const price = totalPrice(kcal, days);
  const gap = hasGap(filters);
  const count = (filters.diet !== "any" ? 1 : 0) + filters.allergens.length;
  const href =
    `/checkout?goal=${goal}&kcal=${kcal}&days=${days}` +
    `&diet=${filters.diet}&allergens=${filters.allergens.join(",")}`;

  return (
    <>
      <section id="calc" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-10">
        <h2 className="mb-2 text-2xl font-bold">Рассчитайте свою норму калорий</h2>
        <p className="mb-5 max-w-xl text-neutral-700">
          Введите данные, и мы подберём подходящий рацион. Его можно изменить вручную ниже.
        </p>
        <Calculator goal={goal} setGoal={setGoal} onApply={setKcal} />
      </section>

      <section id="menu" className="mx-auto max-w-5xl scroll-mt-4 px-4 pb-16">
        <h2 className="mb-5 text-2xl font-bold">Соберите меню на неделю</h2>
        <div className="grid gap-5 md:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-green-200 bg-white p-4 text-neutral-900">
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
              <div className="mt-4">
                <div className="mb-2 text-sm font-semibold">Питание и аллергены</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="min-h-10 rounded-full border border-green-700 px-4 text-sm font-semibold text-green-800"
                  >
                    Фильтр{count > 0 ? ` (${count})` : ""}
                  </button>
                  {filters.diet !== "any" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">{DIETS[filters.diet]}</span>
                  )}
                  {filters.allergens.map((a) => (
                    <span key={a} className="rounded-full bg-pink-100 px-3 py-1 text-xs text-pink-800">
                      без: {ALLERGENS[a].toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-white p-4 text-neutral-900">
              <h3 className="mb-1 text-lg font-semibold">Ваше меню</h3>
              <p className="mb-3 text-xs text-neutral-600">Наведите курсор на блюдо, чтобы увидеть фото, состав и аллергены.</p>
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
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
                const dish = pickDish(mi, day, filters);
                if (!dish) {
                  return (
                    <div key={meal.name} className="border-t border-neutral-200 py-3 text-sm text-pink-700">
                      {meal.name}: нет подходящих блюд. Уберите часть ограничений в фильтре.
                    </div>
                  );
                }
                const k = Math.round((kcal * meal.share) / 10) * 10;
                const mm = macros(k, goal);
                return (
                  <DishRow
                    key={dish.id}
                    dish={dish}
                    mealName={meal.name}
                    time={meal.time}
                    info={`${k} ккал · Б ${mm.p} г · Ж ${mm.f} г · У ${mm.c} г`}
                  />
                );
              })}
              <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm">
                Итого за день: <b>{kcal} ккал</b> · Белки <b>{m.p} г</b> · Жиры <b>{m.f} г</b> · Углеводы <b>{m.c} г</b>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-green-200 bg-white p-4 text-neutral-900 md:sticky md:top-4">
            <h3 className="mb-3 text-lg font-semibold">Ваш заказ</h3>
            <div className="py-1 text-sm">{GOALS[goal].label}, {kcal} ккал</div>
            <div className="flex justify-between py-1 text-sm"><span>{days} дней</span><span>{fmt(price.base)}</span></div>
            {price.discount > 0 && (
              <div className="flex justify-between py-1 text-sm">
                <span>Скидка {DISCOUNT[days] * 100}%</span><span>−{fmt(price.discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold">
              <span>К оплате</span><span>{fmt(price.total)}</span>
            </div>
            {gap ? (
              <>
                <span aria-disabled="true" className="mt-3 block w-full rounded-xl bg-neutral-300 py-3 text-center font-semibold text-neutral-600">
                  Оформить заказ
                </span>
                <p className="mt-2 text-xs text-pink-700">
                  Для этих ограничений нет блюд на все приёмы пищи. Уберите часть фильтров.
                </p>
              </>
            ) : (
              <Link href={href} className="mt-3 block w-full rounded-xl bg-pink-700 py-3 text-center font-semibold text-white">
                Оформить заказ
              </Link>
            )}
          </aside>
        </div>
      </section>

      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} />
    </>
  );
}