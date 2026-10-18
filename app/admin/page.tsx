"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomersAdmin from "@/components/admin/CustomersAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import ReviewsAdmin from "@/components/admin/ReviewsAdmin";
import SupportAdmin from "@/components/admin/SupportAdmin";
import MenuAdmin from "@/components/admin/MenuAdmin";
import { useAuth } from "@/components/AuthProvider";
import {
  buildCustomers, loadAllOrders, loadAllReviews, loadAllTickets,
  type AdminOrder, type AdminReview, type AdminTicket,
} from "@/lib/admin";

type Tab = "orders" | "customers" | "reviews" | "support" | "menu";
const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [o, r, t] = await Promise.all([loadAllOrders(), loadAllReviews(), loadAllTickets()]);
      setOrders(o); setReviews(r); setTickets(t);
    } catch {
      setError("Не удалось загрузить данные. Обновите страницу.");
    }
  }, []);

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin, refresh]);

  const customers = useMemo(() => buildCustomers(orders ?? []), [orders]);

  if (loading) return <main className="min-h-screen px-4 py-10"><p className="mx-auto max-w-5xl text-[#5B6785]">Загрузка…</p></main>;

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-lg rounded-3xl border-2 border-[#F0E4D3] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">Нет доступа</h1>
          <p className="mt-2 text-[#5B6785]">Эта страница только для администраторов.</p>
          <Link href="/account" className="mt-4 inline-block rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A]">
            {user ? "В кабинет" : "Войти"}
          </Link>
        </div>
      </main>
    );
  }

  const revenue = (orders ?? []).filter((o) => o.status !== "Отменён").reduce((s, o) => s + o.total, 0);
  const stats = [
    ["Новых заказов", String((orders ?? []).filter((o) => o.status === "Принят").length), "bg-amber-200"],
    ["Выручка", fmt(revenue), "bg-lime-200"],
    ["Отзывов на проверке", String(reviews.filter((r) => !r.approved).length), "bg-sky-200"],
    ["Открытых обращений", String(tickets.filter((t) => t.status !== "Закрыто").length), "bg-orange-200"],
  ];
  const TABS: [Tab, string][] = [
    ["orders", "Заказы"], ["customers", "Клиенты"], ["reviews", "Отзывы"], ["support", "Поддержка"],["menu", "Меню и цены"],
  ];

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold md:text-4xl">Админка</h1>
        {error && <p role="alert" className="mb-4 text-pink-700">{error}</p>}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([t, v, c]) => (
            <div key={t} className={`rounded-3xl p-4 ${c}`}>
              <div className="font-display text-2xl font-bold">{v}</div>
              <div className="text-xs text-[#0B1B3A]/70">{t}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={
                "min-h-11 shrink-0 rounded-full border-2 px-5 text-sm font-bold transition " +
                (tab === id ? "border-orange-400 bg-orange-400 text-[#0B1B3A]" : "border-[#F0E4D3] bg-white hover:border-orange-300")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {orders === null ? (
          <p className="text-[#5B6785]">Загрузка…</p>
        ) : (
          <>
            {tab === "orders" && <OrdersAdmin orders={orders} onChanged={refresh} />}
            {tab === "customers" && <CustomersAdmin customers={customers} />}
            {tab === "reviews" && <ReviewsAdmin reviews={reviews} customers={customers} onChanged={refresh} />}
            {tab === "support" && <SupportAdmin tickets={tickets} customers={customers} onChanged={refresh} />}
            {tab === "menu" && <MenuAdmin />}
          </>
        )}
      </div>
    </main>
  );
}