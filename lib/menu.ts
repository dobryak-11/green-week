export type Goal = "loss" | "bal" | "mass";
export type Exclusion = "v" | "gf" | "lf";
export type Dish = { name: string; tags: Exclusion[] };

export const GOALS: Record<Goal, { label: string; split: [number, number, number] }> = {
  loss: { label: "Похудение", split: [35, 30, 35] },
  bal: { label: "Баланс", split: [25, 30, 45] },
  mass: { label: "Набор массы", split: [30, 25, 45] },
};

export const KCALS = [1200, 1600, 2000, 2500] as const;
export const DAY_OPTIONS = [5, 6, 7] as const;
export const PRICE_PER_DAY: Record<number, number> = { 1200: 780, 1600: 920, 2000: 1080, 2500: 1250 };
export const DISCOUNT: Record<number, number> = { 5: 0, 6: 0.05, 7: 0.1 };

export const EXCLUSIONS: Record<Exclusion, string> = {
  v: "Вегетарианское",
  gf: "Без глютена",
  lf: "Без лактозы",
};

const d = (name: string, tags: string): Dish => ({ name, tags: tags.split(" ") as Exclusion[] });

export const MEALS = [
  {
    name: "Завтрак", time: "08:00", share: 0.25,
    dishes: [
      d("Овсянка с ягодами и миндалём", "v lf"),
      d("Омлет со шпинатом и томатами", "v gf"),
      d("Сырники из творога с йогуртом", "v"),
      d("Гречневая каша с яблоком и корицей", "v gf lf"),
      d("Тост с авокадо и яйцом-пашот", "v lf"),
      d("Творожная запеканка с изюмом", "v"),
      d("Чиа-пудинг с манго", "v gf lf"),
    ],
  },
  {
    name: "Обед", time: "13:00", share: 0.35,
    dishes: [
      d("Курица терияки с бурым рисом", "lf"),
      d("Лосось с киноа и брокколи", "gf lf"),
      d("Индейка с булгуром и овощами", "lf"),
      d("Нут с овощами и кус-кусом", "v lf"),
      d("Говядина с гречкой и цукини", "gf lf"),
      d("Паста из цельнозерновой муки с креветками", "lf"),
      d("Боул с тофу и эдамаме", "v gf lf"),
    ],
  },
  {
    name: "Перекус", time: "16:30", share: 0.1,
    dishes: [
      d("Греческий йогурт с орехами", "v gf"),
      d("Хумус с овощными палочками", "v gf lf"),
      d("Яблоко и горсть миндаля", "v gf lf"),
      d("Смузи из шпината и банана", "v gf lf"),
      d("Творог с ягодами", "v gf"),
      d("Шарики из фиников и орехов", "v gf lf"),
      d("Морковь с гуакамоле", "v gf lf"),
    ],
  },
  {
    name: "Ужин", time: "19:00", share: 0.3,
    dishes: [
      d("Запечённая треска с овощами", "gf lf"),
      d("Куриное филе с салатом из киноа", "gf lf"),
      d("Овощное рагу с фасолью", "v gf lf"),
      d("Индейка с цветной капустой", "gf lf"),
      d("Форель с картофелем и спаржей", "gf lf"),
      d("Тыквенный крем-суп с семечками", "v gf lf"),
      d("Кабачковые оладьи с йогуртовым соусом", "v"),
    ],
  },
];

export function pickDish(mealIndex: number, day: number, excl: Exclusion[]): Dish | null {
  const pool = MEALS[mealIndex].dishes.filter((x) => excl.every((t) => x.tags.includes(t)));
  return pool.length ? pool[day % pool.length] : null;
}

export function macros(kcal: number, goal: Goal) {
  const [p, f, c] = GOALS[goal].split;
  return {
    p: Math.round((kcal * p) / 100 / 4),
    f: Math.round((kcal * f) / 100 / 9),
    c: Math.round((kcal * c) / 100 / 4),
  };
}

export function totalPrice(kcal: number, days: number) {
  const base = PRICE_PER_DAY[kcal] * days;
  const discount = Math.round(base * DISCOUNT[days]);
  return { base, discount, total: base - discount };
}