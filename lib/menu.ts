export type Goal = "loss" | "bal" | "mass";
export type Sex = "m" | "f";
export type Diet = "any" | "veg" | "vegan";
export type DishDiet = "none" | "veg" | "vegan";
export type Allergen =
  | "gluten" | "milk" | "eggs" | "nuts" | "peanuts"
  | "fish" | "shellfish" | "soy" | "sesame" | "honey";
export type Filters = { diet: Diet; allergens: Allergen[] };
export type Dish = {
  id: string; name: string; diet: DishDiet; allergens: Allergen[];
  ingredients: string; desc: string;
};

export const GOALS: Record<Goal, { label: string; split: [number, number, number]; factor: number }> = {
  loss: { label: "Похудение", split: [35, 30, 35], factor: 0.85 },
  bal: { label: "Баланс", split: [25, 30, 45], factor: 1 },
  mass: { label: "Набор массы", split: [30, 25, 45], factor: 1.15 },
};

export const KCALS = [1200, 1600, 2000, 2500] as const;
export const DAY_OPTIONS = [5, 6, 7] as const;
export const PRICE_PER_DAY: Record<number, number> = { 1200: 780, 1600: 920, 2000: 1080, 2500: 1250 };
export const DISCOUNT: Record<number, number> = { 5: 0, 6: 0.05, 7: 0.1 };

export const DIETS: Record<Diet, string> = {
  any: "Любое питание",
  veg: "Вегетарианское",
  vegan: "Веганское",
};

export const ALLERGENS: Record<Allergen, string> = {
  gluten: "Глютен",
  milk: "Молоко",
  eggs: "Яйца",
  nuts: "Орехи",
  peanuts: "Арахис",
  fish: "Рыба",
  shellfish: "Ракообразные и моллюски",
  soy: "Соя",
  sesame: "Кунжут",
  honey: "Мёд",
};

export const ACTIVITY = [
  { k: 1.2, label: "Сидячая работа, почти нет движения" },
  { k: 1.375, label: "Лёгкие тренировки 1–3 раза в неделю" },
  { k: 1.55, label: "Тренировки 3–5 раз в неделю" },
  { k: 1.725, label: "Интенсивные нагрузки почти каждый день" },
];

export function nearestKcal(x: number): number {
  return KCALS.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
}

// Формула Миффлина — Сан-Жеора
export function calcKcal(sex: Sex, age: number, height: number, weight: number, activity: number, goal: Goal) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === "m" ? 5 : -161);
  const need = Math.round(bmr * activity);
  const target = Math.round(need * GOALS[goal].factor);
  return { need, target, plan: nearestKcal(target) };
}

// [название, тип питания, аллергены через пробел, состав, описание]
type Row = [string, DishDiet, string, string, string];
const make = (prefix: string, rows: Row[]): Dish[] =>
  rows.map(([name, diet, al, ingredients, desc], i) => ({
    id: `${prefix}${i + 1}`,
    name,
    diet,
    allergens: al.split(" ").filter(Boolean) as Allergen[],
    ingredients,
    desc,
  }));

export const MEALS = [
  {
    name: "Завтрак", time: "08:00", share: 0.25,
    dishes: make("b", [
      ["Овсянка с ягодами и миндалём", "veg", "gluten nuts honey", "Овсяные хлопья, рисовое молоко, ягоды, миндаль, мёд", "Нежная овсянка на рисовом молоке с сезонными ягодами и хрустящим миндалём."],
      ["Омлет со шпинатом и томатами", "veg", "eggs", "Яйца, шпинат, томаты черри, оливковое масло", "Воздушный омлет с молодым шпинатом и сладкими томатами, много белка."],
      ["Сырники из творога с йогуртом", "veg", "milk eggs", "Творог, яйцо, рисовая мука, натуральный йогурт", "Румяные сырники из мягкого творога с йогуртом вместо сметаны."],
      ["Гречневая каша с яблоком и корицей", "vegan", "", "Гречка, яблоко, корица, рисовое молоко", "Тёплая гречневая каша с запечённым яблоком и ароматом корицы."],
      ["Тост с авокадо и яйцом-пашот", "veg", "gluten eggs", "Цельнозерновой хлеб, авокадо, яйцо, лимонный сок", "Хрустящий тост с кремовым авокадо и яйцом-пашот."],
      ["Творожная запеканка с изюмом", "veg", "milk eggs gluten", "Творог, яйцо, изюм, манная крупа, ваниль", "Нежная запеканка без лишнего сахара, сладость даёт изюм."],
      ["Чиа-пудинг с манго", "vegan", "", "Семена чиа, кокосовое молоко, манго", "Прохладный пудинг на кокосовом молоке с кусочками манго."],
    ]),
  },
  {
    name: "Обед", time: "13:00", share: 0.35,
    dishes: make("l", [
      ["Курица терияки с бурым рисом", "none", "soy gluten sesame", "Куриное филе, бурый рис, соус терияки, брокколи, кунжут", "Нежное филе в лёгком соусе терияки с бурым рисом и овощами."],
      ["Лосось с киноа и брокколи", "none", "fish", "Филе лосося, киноа, брокколи, лимон", "Запечённый лосось с рассыпчатой киноа и брокколи на пару."],
      ["Индейка с булгуром и овощами", "none", "gluten", "Филе индейки, булгур, болгарский перец, морковь", "Сочная индейка с булгуром и запечёнными овощами."],
      ["Нут с овощами и кус-кусом", "vegan", "gluten", "Нут, кус-кус, цукини, томаты, специи", "Ароматное овощное рагу с нутом, подаётся с кус-кусом."],
      ["Говядина с гречкой и цукини", "none", "", "Говядина, гречка, цукини, лук", "Тушёная говядина с гречкой и цукини, много белка и железа."],
      ["Паста из цельнозерновой муки с креветками", "none", "gluten shellfish", "Цельнозерновая паста, креветки, чеснок, томаты, базилик", "Паста с креветками в томатном соусе с базиликом."],
      ["Боул с тофу и эдамаме", "vegan", "soy sesame", "Тофу, эдамаме, рис, огурец, морковь, кунжут", "Растительный боул с запечённым тофу, эдамаме и свежими овощами."],
    ]),
  },
  {
    name: "Перекус", time: "16:30", share: 0.1,
    dishes: make("s", [
      ["Греческий йогурт с орехами", "veg", "milk nuts honey", "Греческий йогурт, грецкий орех, мёд", "Густой йогурт с горстью орехов и каплей мёда."],
      ["Хумус с овощными палочками", "vegan", "sesame", "Нут, тахини, лимон, морковь, сельдерей", "Домашний хумус с хрустящими палочками из свежих овощей."],
      ["Яблоко и горсть миндаля", "vegan", "nuts", "Яблоко, миндаль", "Простой перекус: сочное яблоко и миндаль для долгой сытости."],
      ["Смузи из шпината и банана", "vegan", "", "Шпинат, банан, рисовое молоко, семена льна", "Зелёный смузи без добавленного сахара с мягким вкусом банана."],
      ["Творог с ягодами", "veg", "milk", "Творог, ягоды, мята", "Лёгкий творог с ягодами, много кальция и белка."],
      ["Шарики из фиников и орехов", "vegan", "nuts", "Финики, орехи, кокосовая стружка", "Энергетические шарики без сахара, сладость даёт финик."],
      ["Морковь с гуакамоле", "vegan", "", "Морковь, авокадо, лайм, кинза", "Свежая морковь с домашним гуакамоле."],
    ]),
  },
  {
    name: "Ужин", time: "19:00", share: 0.3,
    dishes: make("d", [
      ["Запечённая треска с овощами", "none", "fish", "Филе трески, цукини, томаты, лимон, оливковое масло", "Лёгкая нежирная рыба, запечённая с овощами и лимоном."],
      ["Куриное филе с салатом из киноа", "none", "", "Куриное филе, киноа, огурец, зелень, лимонная заправка", "Куриное филе на гриле с прохладным салатом из киноа."],
      ["Овощное рагу с фасолью", "vegan", "", "Фасоль, баклажан, перец, томаты, зелень", "Сытное овощное рагу с фасолью, тёплое и лёгкое на ужин."],
      ["Индейка с цветной капустой", "none", "", "Филе индейки, цветная капуста, куркума, чеснок", "Запечённая индейка с хрустящей цветной капустой и куркумой."],
      ["Форель с картофелем и спаржей", "none", "fish", "Филе форели, молодой картофель, спаржа, лимон", "Запечённая форель с молодым картофелем и спаржей."],
      ["Тыквенный крем-суп с семечками", "vegan", "", "Тыква, морковь, имбирь, кокосовые сливки, тыквенные семечки", "Бархатный крем-суп из тыквы с имбирём и хрустящими семечками."],
      ["Кабачковые оладьи с йогуртовым соусом", "veg", "eggs milk", "Кабачок, яйцо, рисовая мука, йогурт, укроп", "Румяные оладьи из кабачка с лёгким йогуртовым соусом."],
    ]),
  },
];

export function isSuitable(d: Dish, f: Filters): boolean {
  if (f.diet === "vegan" && d.diet !== "vegan") return false;
  if (f.diet === "veg" && d.diet === "none") return false;
  return !d.allergens.some((a) => f.allergens.includes(a));
}

export function pickDish(mealIndex: number, day: number, f: Filters): Dish | null {
  const pool = MEALS[mealIndex].dishes.filter((x) => isSuitable(x, f));
  return pool.length ? pool[day % pool.length] : null;
}

// true, если хотя бы для одного приёма пищи нет подходящих блюд
export function hasGap(f: Filters): boolean {
  return MEALS.some((_, i) => pickDish(i, 0, f) === null);
}

export function parseFilters(diet?: string, allergens?: string): Filters {
  return {
    diet: diet === "veg" || diet === "vegan" ? diet : "any",
    allergens: (allergens ?? "").split(",").filter((x): x is Allergen => x in ALLERGENS),
  };
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