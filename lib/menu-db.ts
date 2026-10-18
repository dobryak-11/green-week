import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_MENU, type Allergen, type Dish, type DishDiet, type Menu } from "@/lib/menu";

export type DishRow = {
  id: string; meal: number; name: string; diet: DishDiet; allergens: Allergen[] | null;
  ingredients: string; description: string; photo_url: string | null; active: boolean; sort: number;
};

export const rowToDish = (r: DishRow): Dish => ({
  id: r.id, meal: r.meal, name: r.name, diet: r.diet, allergens: r.allergens ?? [],
  ingredients: r.ingredients, desc: r.description, photo: r.photo_url, active: r.active, sort: r.sort,
});

export const dishToRow = (d: Dish) => ({
  id: d.id, meal: d.meal, name: d.name, diet: d.diet, allergens: d.allergens,
  ingredients: d.ingredients, description: d.desc, photo_url: d.photo, active: d.active, sort: d.sort,
});

export function parseMap(v: unknown, fallback: Record<number, number>): Record<number, number> {
  if (!v || typeof v !== "object") return fallback;
  const out: Record<number, number> = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
    const key = Number(k), val = Number(x);
    if (Number.isFinite(key) && Number.isFinite(val)) out[key] = val;
  }
  return Object.keys(out).length ? out : fallback;
}

export async function fetchMenu(db: SupabaseClient): Promise<Menu> {
  const [d, s] = await Promise.all([
    db.from("dishes").select("*").order("meal").order("sort").order("created_at"),
    db.from("settings").select("key,value"),
  ]);
  if (d.error || s.error) return DEFAULT_MENU;
  const st = new Map((s.data ?? []).map((r) => [r.key as string, r.value as unknown]));
  const rows = (d.data ?? []) as DishRow[];
  const seeded = st.get("menu_seeded") === true || rows.length > 0;
  return {
    dishes: seeded ? rows.map(rowToDish) : DEFAULT_MENU.dishes,
    prices: parseMap(st.get("prices"), DEFAULT_MENU.prices),
    discounts: parseMap(st.get("discounts"), DEFAULT_MENU.discounts),
  };
}