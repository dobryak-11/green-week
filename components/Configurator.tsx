"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Calculator from "@/components/Calculator";
import DishSheet, { DishPhoto, MEAL_TONES } from "@/components/DishSheet";
import FilterPanel from "@/components/FilterPanel";
import { useMenu } from "@/components/MenuProvider";
import Reveal from "@/components/Reveal";
import {
  ALLERGENS, DIETS, GOALS, MEALS, dayOptions, hasGap, kcalOptions, macros, pickDish, totalPrice,
  type Dish, type Filters, type Goal,
} from "@/lib/menu";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const pct = (r: number) => Math.round(r * 100);
const MEAL_COLORS = ["bg-amber-300", "bg-orange-400", "bg-lime-300", "bg-sky-300"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition " +
        (active ? "border-[#0B1B3A] bg-[#0B1B3A] text-white" : "border-[#F0E4D3] bg-white hover:border-orange-300")
      }
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c }} />;
}

function DishRow({
  dish, mealIndex, kcal, goal, onOpen,
}: { dish: Dish; mealIndex: number; kcal: number; goal: Goal; onOpen: () => void }) {
  const meal = MEALS[mealIndex];
  const k = Math.round((kcal * meal.share) / 10) * 10;
  const mm = macros(k, goal);
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-[#F0E4D3] bg-white p-4 text-left transition hover:border-orange-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <span className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-[#0B1B3A] ${MEAL_COLORS[mealIndex]}`}>
          {meal.time}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-[#5B6785]">{meal.name}</span>
          <span className="block font-semibold leading-snug">{dish.name}</span>
          <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-[#5B6785]">
            <b className="text-[#0B1B3A]">{k} ккал</b>
            <span><Dot c="#FF6B4A" />Б {mm.p} г</span>
            <span><Dot c="#FFC83D" />Ж {mm.f} г</span>
            <span><Dot c="#4CC26B" />У {mm.c} г</span>
          </span>
        </span>
        <span className="text-xl text-[#5B6785] md:hidden" aria-hidden="true">›</span>
      </button>

      <div
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 hidden w-80 max-w-[calc(100vw-2rem)] translate-y-2 overflow-hidden rounded-3xl border-2 border-[#F0E4D3] bg-white opacity-0 shadow-2xl transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 md:block"
      >
        <DishPhoto dish={dish} tone={MEAL_TONES[mealIndex]} />
        <div className="p-4">
          <div className="font-semibold">{dish.name}</div>
          <p className="mt-1 text-sm text-[#44506f]">{dish.desc}</p>
          <p className="mt-2 text-xs text-[#5B6785]"><b>Состав:</b> {dish.ingredients}</p>
          <p className="mt-1 text-xs text-[#5B6785]">
            <b>Аллергены:</b>{" "}
            {dish.allergens.length ? dish.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ") : "из списка фильтра не указаны"}
          </p>
          {dish.diet !== "none" && (
            <span className="mt-2 inline-block rounded-full bg-lime-200 px-3 py-0.5 text-xs font-semibold text-[#0B1B3A]">
              {dish.diet === "vegan" ? "Веганское" : "Вегетарианское"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Configurator() {
  const { menu } = useMenu();
  const kcalList = kcalOptions(menu);
  const dayList = dayOptions(menu);

  const [goal, setGoal] = useState<Goal>("bal");
  const [kcalSel, setKcalSel] = useState<number>(1600);
  const [daysSel, setDaysSel] = useState<number>(5);
  const [filters, setFilters] = useState<Filters>({ diet: "any", allergens: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [daySel, setDaySel] = useState(0);
  const [sheet, setSheet] = useState<{ dish: Dish; mealIndex: number } | null>(null);

  const menuRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const [inMenu, setInMenu] = useState(false);
  const [asideSeen, setAsideSeen] = useState(false);

  useEffect(() => {
    const a = menuRef.current, b = asideRef.current;
    if (!a || !b) return;
    const io1 = new IntersectionObserver(([e]) => setInMenu(e.isIntersecting), { threshold: 0.05 });
    const io2 = new IntersectionObserver(([e]) => setAsideSeen(e.isIntersecting), { threshold: 0.2 });
    io1.observe(a);
    io2.observe(b);
    return () => { io1.disconnect(); io2.disconnect(); };
  }, []);

  const openDish = (dish: Dish, mealIndex: number) => {
    if (window.matchMedia("(max-width: 767px)").matches) setSheet({ dish, mealIndex });
  };

  const kcal = kcalList.includes(kcalSel) ? kcalSel : kcalList[0];
  const days = dayList.includes(daysSel) ? daysSel : dayList[0];
  const day = Math.min(daySel, days - 1);

  const m = macros(kcal, goal);
  const split = GOALS[goal].split;
  const price = totalPrice(menu, kcal, days);
  const gap = hasGap(menu, filters);
  const count = (filters.diet !== "any" ? 1 : 0) + filters.allergens.length;
  const nextDays = dayList.find((n) => n > days);
  const curRate = menu.discounts[days] ?? 0;
  const nextRate = nextDays ? menu.discounts[nextDays] ?? 0 : 0;
  const href =
    `/checkout?goal=${goal}&kcal=${kcal}&days=${days}` +
    `&diet=${filters.diet}&allergens=${filters.allergens.join(",")}`;
  const showBar = inMenu && !asideSeen;

  return (
    <>
      <section id="calc" className="scroll-mt-20 bg-[#FFF1DC]">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <Reveal>
            <span className="inline-block rounded-full bg-orange-400 px-4 py-1 text-sm font-bold text-[#0B1B3A]">Шаг 1</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Рассчитайте свою норму калорий</h2>
            <p className="mb-8 mt-3 max-w-xl text-[#44506f]">
              Введите данные, и мы подберём подходящий рацион. Его можно изменить вручную ниже.
            </p>
          </Reveal>
          <Calculator goal={goal} setGoal={setGoal} onApply={setKcalSel} />
        </div>
      </section>

      <section id="menu" ref={menuRef} className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-32 pt-12 md:pb-16 md:pt-16">
        <Reveal>
          <span className="inline-block rounded-full bg-lime-300 px-4 py-1 text-sm font-bold text-[#0B1B3A]">Шаг 2</span>
          <h2 className="mb-8 mt-3 text-3xl font-bold md:text-4xl">Соберите меню на неделю</h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div>
            <div className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
              <Group title="Цель">
                {(Object.keys(GOALS) as Goal[]).map((g) => (
                  <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>{GOALS[g].label}</Chip>
                ))}
              </Group>
              <Group title="Калорийность в день">
                {kcalList.map((k) => (
                  <Chip key={k} active={kcal === k} onClick={() => setKcalSel(k)}>{k} ккал</Chip>
                ))}
              </Group>
              <Group title="Сколько дней в неделе">
                {dayList.map((n) => (
                  <Chip key={n} active={days === n} onClick={() => setDaysSel(n)}>{n} дней</Chip>
                ))}
              </Group>
              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold">Питание и аллергены</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="min-h-11 rounded-full bg-orange-400 px-5 text-sm font-bold text-[#0B1B3A] transition hover:bg-orange-300"
                  >
                    Фильтр{count > 0 ? ` (${count})` : ""}
                  </button>
                  {filters.diet !== "any" && (
                    <span className="rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold">{DIETS[filters.diet]}</span>
                  )}
                  {filters.allergens.map((a) => (
                    <span key={a} className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800">
                      без: {ALLERGENS[a].toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-1 text-xl font-semibold">Ваше меню</h3>
              <p className="mb-4 text-xs text-[#5B6785]">
                <span className="md:hidden">Нажмите на блюдо, чтобы увидеть фото, состав и аллергены.</span>
                <span className="hidden md:inline">Наведите курсор на блюдо, чтобы увидеть фото, состав и аллергены.</span>
              </p>
              <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {Array.from({ length: days }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setDaySel(i)}
                    className={
                      "min-h-11 shrink-0 rounded-2xl border-2 px-5 text-sm font-bold transition " +
                      (day === i ? "border-orange-400 bg-orange-400 text-[#0B1B3A]" : "border-[#F0E4D3] bg-white hover:border-orange-300")
                    }
                  >
                    День {i + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {MEALS.map((meal, mi) => {
                  const dish = pickDish(menu, mi, day, filters);
                  if (!dish) {
                    return (
                      <div key={meal.name} className="rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 text-sm text-pink-800">
                        {meal.name}: нет подходящих блюд. Уберите часть ограничений в фильтре.
                      </div>
                    );
                  }
                  return (
                    <DishRow
                      key={dish.id}
                      dish={dish}
                      mealIndex={mi}
                      kcal={kcal}
                      goal={goal}
                      onOpen={() => openDish(dish, mi)}
                    />
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl bg-[#0B1B3A] p-5 text-white">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-sky-200">Итого за день</div>
                    <div key={kcal} className="pop font-display text-3xl font-bold">{kcal} ккал</div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span><Dot c="#FF6B4A" />Б <b>{m.p} г</b></span>
                    <span><Dot c="#FFC83D" />Ж <b>{m.f} г</b></span>
                    <span><Dot c="#4CC26B" />У <b>{m.c} г</b></span>
                  </div>
                </div>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="transition-[width] duration-700" style={{ width: `${split[0]}%`, background: "#FF6B4A" }} />
                  <div className="transition-[width] duration-700" style={{ width: `${split[1]}%`, background: "#FFC83D" }} />
                  <div className="transition-[width] duration-700" style={{ width: `${split[2]}%`, background: "#4CC26B" }} />
                </div>
              </div>
            </div>
          </div>

          <aside ref={asideRef} className="h-fit rounded-3xl border-2 border-[#F0E4D3] bg-white p-5 shadow-sm md:sticky md:top-24">
            <h3 className="mb-3 text-lg font-semibold">Ваш заказ</h3>
            <div className="py-1 text-sm">{GOALS[goal].label}, {kcal} ккал</div>
            <div className="flex justify-between py-1 text-sm text-[#5B6785]">
              <span>{days} дней × {fmt(menu.prices[kcal] ?? 0)}</span><span>{fmt(price.base)}</span>
            </div>
            {price.discount > 0 && (
              <div className="flex justify-between py-1 text-sm font-semibold text-green-700">
                <span>Скидка {pct(curRate)}%</span><span>−{fmt(price.discount)}</span>
              </div>
            )}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0E4D3]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-lime-300 transition-[width] duration-500"
                style={{ width: `${(days / Math.max(...dayList)) * 100}%` }}
              />
            </div>
            {nextDays && nextRate > curRate && (
              <p className="mt-2 rounded-xl bg-amber-100 p-3 text-xs">
                Возьмите {nextDays} дней, и скидка будет {pct(nextRate)}%.
              </p>
            )}
            <div className="mt-3 flex items-baseline justify-between border-t border-[#F0E4D3] pt-3">
              <span className="font-semibold">К оплате</span>
              <span key={price.total} className="pop font-display text-2xl font-bold">{fmt(price.total)}</span>
            </div>
            {gap ? (
              <>
                <span aria-disabled="true" className="mt-4 block w-full rounded-full bg-[#E6DDD0] py-3.5 text-center font-bold text-[#8a8478]">
                  Оформить заказ
                </span>
                <p className="mt-2 text-xs text-pink-700">Для этих ограничений нет блюд на все приёмы пищи. Уберите часть фильтров.</p>
              </>
            ) : (
              <Link href={href} className="mt-4 block w-full rounded-full bg-orange-400 py-3.5 text-center font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/60 transition hover:-translate-y-0.5 hover:bg-orange-300">
                Оформить заказ
              </Link>
            )}
          </aside>
        </div>
      </section>

      {showBar && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 md:hidden">
          <div className="sheet-up flex items-center gap-3 rounded-2xl bg-[#0B1B3A] p-3 text-white shadow-2xl">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-sky-200">{GOALS[goal].label}, {kcal} ккал, {days} дн.</div>
              <div className="font-display text-xl font-bold">{fmt(price.total)}</div>
            </div>
            {gap ? (
              <span className="rounded-full bg-white/20 px-4 py-3 text-sm font-bold">Измените фильтр</span>
            ) : (
              <Link href={href} className="rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A]">Заказать</Link>
            )}
          </div>
        </div>
      )}

      {sheet && (
        <DishSheet dish={sheet.dish} mealIndex={sheet.mealIndex} kcal={kcal} goal={goal} onClose={() => setSheet(null)} />
      )}
      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} />
    </>
  );
}