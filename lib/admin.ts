import { supabase } from "@/lib/supabase";
import type { Review, Ticket } from "@/lib/account";
import type { SavedOrder } from "@/lib/orders";

export const ORDER_STATUSES = ["Принят", "Готовится", "В доставке", "Доставлен", "Отменён"] as const;
export const TICKET_STATUSES = ["Открыто", "В работе", "Закрыто"] as const;

export type AdminOrder = SavedOrder & { user_id: string };
export type AdminReview = Review & { user_id: string };
export type AdminTicket = Ticket & { user_id: string };
export type Customer = {
  user_id: string; name: string; email: string; phone: string; city: string; address: string;
  orders: number; total: number; last: string;
};

export function buildCustomers(orders: AdminOrder[]): Customer[] {
  const m = new Map<string, Customer>();
  for (const o of orders) {
    const paid = o.status === "Отменён" ? 0 : o.total;
    const c = m.get(o.user_id);
    if (!c) {
      m.set(o.user_id, {
        user_id: o.user_id, name: o.name, email: o.email, phone: o.phone, city: o.city,
        address: o.address, orders: 1, total: paid, last: o.created_at,
      });
    } else {
      c.orders += 1;
      c.total += paid;
    }
  }
  return [...m.values()];
}

export async function loadAllOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminOrder[];
}
export async function setOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function loadAllReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminReview[];
}
export async function setReviewApproved(id: string, approved: boolean) {
  const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
  if (error) throw error;
}
export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function loadAllTickets(): Promise<AdminTicket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("id,user_id,subject,status,created_at,ticket_messages(id,from_staff,body,created_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as AdminTicket[]).map((t) => ({
    ...t,
    ticket_messages: [...t.ticket_messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}
export async function staffReply(ticketId: string, body: string) {
  const { error } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: ticketId, body: body.trim(), from_staff: true });
  if (error) throw error;
}
export async function setTicketStatus(id: string, status: string) {
  const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
  if (error) throw error;
}