import type { Allergen, Diet, Goal } from "@/lib/menu";

export type SavedOrder = {
  id: string; createdAt: string; status: string;
  goal: Goal; kcal: number; days: number; diet: Diet; allergens: Allergen[];
  total: number; firstDelivery: string; slot: string; city: string; address: string;
  name: string; phone: string; email: string;
};

const KEY = "gw_orders";

export function loadOrders(): SavedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveOrder(o: SavedOrder) {
  try {
    const list = loadOrders();
    list.unshift(o);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* хранилище недоступно, пропускаем */
  }
}