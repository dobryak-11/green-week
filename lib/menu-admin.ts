import { supabase } from "@/lib/supabase";
import { DEFAULT_MENU, type Dish } from "@/lib/menu";
import { dishToRow, parseMap, rowToDish, type DishRow } from "@/lib/menu-db";

export type MenuAdminData = {
  dishes: Dish[];
  prices: Record<number, number>;
  discounts: Record<number, number>;
  seeded: boolean;
};

export async function loadMenuAdmin(): Promise<MenuAdminData> {
  const [d, s] = await Promise.all([
    supabase.from("dishes").select("*").order("meal").order("sort").order("created_at"),
    supabase.from("settings").select("key,value"),
  ]);
  if (d.error) throw d.error;
  if (s.error) throw s.error;
  const st = new Map((s.data ?? []).map((r) => [r.key as string, r.value as unknown]));
  const rows = (d.data ?? []) as DishRow[];
  const seeded = st.get("menu_seeded") === true || rows.length > 0;
  return {
    dishes: seeded ? rows.map(rowToDish) : DEFAULT_MENU.dishes,
    prices: parseMap(st.get("prices"), DEFAULT_MENU.prices),
    discounts: parseMap(st.get("discounts"), DEFAULT_MENU.discounts),
    seeded,
  };
}

export async function seedMenu() {
  const a = await supabase.from("dishes").upsert(DEFAULT_MENU.dishes.map(dishToRow));
  if (a.error) throw a.error;
  const b = await supabase.from("settings").upsert([{ key: "menu_seeded", value: true }]);
  if (b.error) throw b.error;
}

export async function saveSettings(prices: Record<number, number>, discounts: Record<number, number>) {
  const { error } = await supabase.from("settings").upsert([
    { key: "prices", value: prices },
    { key: "discounts", value: discounts },
  ]);
  if (error) throw error;
}

export async function saveDish(d: Dish) {
  const { error } = await supabase.from("dishes").upsert(dishToRow(d));
  if (error) throw error;
}

export async function deleteDish(id: string) {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadDishPhoto(file: File, dishId: string): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Подойдут только JPG, PNG или WebP.");
  }
  if (file.size > 2 * 1024 * 1024) throw new Error("Файл больше 2 МБ, уменьшите его.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${dishId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("dishes")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("dishes").getPublicUrl(path).data.publicUrl;
}