"use client";

import { useMemo, useState } from "react";
import { ALLERGENS, DIETS, GOALS } from "@/lib/menu";
import { ORDER_STATUSES, setOrderStatus, type AdminOrder } from "@/lib/admin";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const COLOR: Record<string, string> = {
  "Принят": "bg-amber-200", "Готовится": "bg-orange-200", "В доставке": "bg-sky-200",
  "Доставлен": "bg-lime-300", "Отменён": "bg-pink-200",
};
const field = "min-h-11 rounded-xl border-2 border-[#F0E4D3] bg-white px-3 text-sm outline-none focus:border-orange-400";

export default function OrdersAdmin({ orders, onChanged }: { orders: AdminOrder[]; onChanged: () => void }) {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "delivery">("new");
  const [err, setErr] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = orders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!s || [o.name, o.email, o.phone, o.address, o.id].some((v) => v.toLowerCase().includes(s)))
    );
    return r.sort(
      sort === "new"
        ? (a, b) => b.created_at.localeCompare(a.created_at)
        : (a, b) => a.first_delivery.localeCompare(b.first_delivery)
    );
  }, [orders, status, q, sort]);

  const change = async (id: string, st: string) => {
    setErr("");
    try { await setOrderStatus(id, st); onChanged(); } catch { setErr("Не удалось сменить статус."); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${field} min-w-56 flex-1`} placeholder="Поиск: имя, почта, телефон, адрес" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={field} value={sort} onChange={(e) => setSort(e.target.value as "new" | "delivery")}>
          <option value="new">Сначала новые</option>
          <option value="delivery">По дате доставки</option>
        </select>
      </div>
      {err && <p role="alert" className="mb-3 text-sm text-pink-700">{err}</p>}
      {list.length === 0 && <p className="text-[#5B6785]">Заказов не найдено.</p>}
      <div className="space-y-3">
        {list.map((o) => (
          <article key={o.id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <b>№ {o.id.slice(0, 8).toUpperCase()}</b>
                <span className="ml-2 text-sm text-[#5B6785]">{new Date(o.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <select
                value={o.status}
                onChange={(e) => change(o.id, e.target.value)}
                aria-label="Статус заказа"
                className={`min-h-11 rounded-full px-4 text-sm font-bold ${COLOR[o.status] ?? "bg-amber-200"}`}
              >
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div><b>{o.name}</b></div>
              <div>{o.phone} · {o.email}</div>
              <div className="sm:col-span-2">
                {o.city}, {o.address}{o.apt ? `, кв. ${o.apt}` : ""}{o.floor ? `, ${o.floor}` : ""}
                {o.comment && <span className="text-[#5B6785]"> · «{o.comment}»</span>}
              </div>
              <div>
                {GOALS[o.goal].label}, {o.kcal} ккал, {o.days} дн.
                {o.diet !== "any" && ` · ${DIETS[o.diet].toLowerCase()}`}
              </div>
              <div>
                Доставка с {new Date(o.first_delivery + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {o.slot.toLowerCase()}
              </div>
              {o.allergens.length > 0 && (
                <div className="font-semibold text-pink-700 sm:col-span-2">
                  Исключить: {o.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ")}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#F0E4D3] pt-3 text-sm">
              <span>{o.pay === "online" ? "Картой онлайн" : "При получении"}</span>
              <b className="font-display text-lg">{fmt(o.total)}</b>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}