import { supabase } from "@/lib/supabase";
import { MEALS, pickDish, type Allergen, type Diet } from "@/lib/menu";

export type PayMethod = "online" | "courier";
export type Profile = { goal_weight: number | null; pay_default: PayMethod };
export type WeightRow = { id: string; week_start: string; weight: number; note: string | null };
export type Address = {
  id: string; label: string; city: string; address: string;
  apt: string | null; floor: string | null; comment: string | null; is_default: boolean;
};
export type NewAddress = { label: string; city: string; address: string; apt: string; floor: string; comment: string };
export type Review = {
  id: string; order_id: string; dish_id: string; dish_name: string; rating: number;
  text: string | null; author: string | null; approved: boolean; created_at: string;
};
export type TicketMessage = { id: string; from_staff: boolean; body: string; created_at: string };
export type Ticket = { id: string; subject: string; status: string; created_at: string; ticket_messages: TicketMessage[] };

export function mondayOf(d = new Date()): string {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return [x.getFullYear(), String(x.getMonth() + 1).padStart(2, "0"), String(x.getDate()).padStart(2, "0")].join("-");
}

/* профиль */
export async function loadProfile(): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("goal_weight,pay_default").maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? { goal_weight: null, pay_default: "online" };
}
export async function saveProfile(uid: string, patch: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: uid, ...patch, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* вес */
export async function loadWeights(): Promise<WeightRow[]> {
  const { data, error } = await supabase
    .from("weights").select("id,week_start,weight,note").order("week_start", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as WeightRow[]).map((r) => ({ ...r, weight: Number(r.weight) }));
}
export async function saveWeight(uid: string, weekStart: string, weight: number, note: string) {
  const { error } = await supabase
    .from("weights")
    .upsert({ user_id: uid, week_start: weekStart, weight, note: note.trim() || null }, { onConflict: "user_id,week_start" });
  if (error) throw error;
}
export async function deleteWeight(id: string) {
  const { error } = await supabase.from("weights").delete().eq("id", id);
  if (error) throw error;
}

/* адреса */
export async function loadAddresses(): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses").select("*")
    .order("is_default", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Address[];
}
export async function addAddress(uid: string, a: NewAddress, makeDefault: boolean) {
  if (makeDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", uid);
  const { error } = await supabase.from("addresses").insert({ ...a, user_id: uid, is_default: makeDefault });
  if (error) throw error;
}
export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}
export async function setDefaultAddress(uid: string, id: string) {
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", uid);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  if (error) throw error;
}

/* отзывы */
export async function loadMyReviews(uid: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}
export async function saveReview(
  uid: string,
  r: { order_id: string; dish_id: string; dish_name: string; rating: number; text: string; author: string }
) {
  const { error } = await supabase.from("reviews").insert({ ...r, text: r.text.trim() || null, user_id: uid });
  if (error) throw error;
}
export async function loadApprovedReviews(limit = 6): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as Review[];
}
export function dishesOfOrder(o: { days: number; diet: Diet; allergens: Allergen[] }) {
  const f = { diet: o.diet, allergens: o.allergens };
  const map = new Map<string, string>();
  for (let d = 0; d < o.days; d++) {
    MEALS.forEach((_, mi) => {
      const x = pickDish(mi, d, f);
      if (x) map.set(x.id, x.name);
    });
  }
  return [...map].map(([id, name]) => ({ id, name }));
}

/* поддержка */
export async function loadTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("id,subject,status,created_at,ticket_messages(id,from_staff,body,created_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Ticket[]).map((t) => ({
    ...t,
    ticket_messages: [...t.ticket_messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}
export async function createTicket(uid: string, subject: string, body: string) {
  const { data, error } = await supabase
    .from("tickets").insert({ user_id: uid, subject: subject.trim() }).select("id").single();
  if (error) throw error;
  const m = await supabase.from("ticket_messages").insert({ ticket_id: data.id, body: body.trim() });
  if (m.error) throw m.error;
}
export async function addTicketMessage(ticketId: string, body: string) {
  const { error } = await supabase.from("ticket_messages").insert({ ticket_id: ticketId, body: body.trim() });
  if (error) throw error;
}