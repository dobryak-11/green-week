"use client";

import Link from "next/link";
import { ALLERGENS, DIETS, GOALS } from "@/lib/menu";
import type { SavedOrder } from "@/lib/orders";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function OrdersTab({ orders, error }: { orders: SavedOrder[] | null; error: string }) {
  if (error) return <p role="alert" className="text-pink-700">{error}</p>;
  if (orders === null) return <p className="text-[#5B6785]">Загрузка…</p>;
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-8 text-center">
        <p className="text-[#44506f]">Заказов пока нет.</p>
        <Link href="/#calc" className="mt-4 inline-block rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A]">
          Подобрать рацион
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <article key={o.id} className="card-lift rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">Заказ № {o.id.slice(0, 8).toUpperCase()}</div>
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold">{o.status}</span>
          </div>
          <p className="mt-1 text-sm text-[#5B6785]">
            от {new Date(o.created_at).toLocaleDateString("ru-RU")} · доставка с{" "}
            {new Date(o.first_delivery).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {o.slot.toLowerCase()}
          </p>
          <p className="mt-2 text-sm">
            {GOALS[o.goal].label}, {o.kcal} ккал, {o.days} дней
            {o.diet !== "any" && ` · ${DIETS[o.diet].toLowerCase()}`}
            {o.allergens.length > 0 && ` · без: ${o.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ")}`}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-lg font-bold">{fmt(o.total)}</span>
            <Link
              href={`/checkout?goal=${o.goal}&kcal=${o.kcal}&days=${o.days}&diet=${o.diet}&allergens=${o.allergens.join(",")}`}
              className="min-h-11 rounded-full bg-orange-400 px-5 py-2.5 text-sm font-bold text-[#0B1B3A] transition hover:bg-orange-300"
            >
              Повторить заказ
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}