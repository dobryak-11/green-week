import { supabase } from "@/lib/supabase";
import type { Allergen, Diet, Goal } from "@/lib/menu";

export type NewOrder = {
  goal: Goal; kcal: number; days: number; diet: Diet; allergens: Allergen[]; total: number;
  first_delivery: string; slot: string; name: string; phone: string; email: string;
  city: string; address: string; apt: string; floor: string; comment: string; pay: string;
};

export type SavedOrder = NewOrder & { id: string; created_at: string; status: string };

export async function loadOrders(): Promise<SavedOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedOrder[];
}

export async function saveOrder(o: NewOrder): Promise<string> {
  const { data, error } = await supabase.from("orders").insert(o).select("id").single();
  if (error) throw error;
  return data.id as string;
}