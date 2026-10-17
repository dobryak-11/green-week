"use client";

import { useEffect, useState } from "react";
import AddressTab from "@/components/account/AddressTab";
import OrdersTab from "@/components/account/OrdersTab";
import PaymentTab from "@/components/account/PaymentTab";
import ReviewsTab from "@/components/account/ReviewsTab";
import SupportTab from "@/components/account/SupportTab";
import WeightTab from "@/components/account/WeightTab";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import { loadOrders, type SavedOrder } from "@/lib/orders";
import PublicReviews from "@/components/PublicReviews";

const TABS = [
  ["orders", "Заказы"],
  ["weight", "Вес"],
  ["addresses", "Адреса"],
  ["payment", "Оплата"],
  ["reviews", "Отзывы"],
  ["support", "Поддержка"],
] as const;
type Tab = (typeof TABS)[number][0];

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setOrders(null); return; }
    loadOrders().then(setOrders).catch(() => setError("Не удалось загрузить заказы. Обновите страницу."));
  }, [user]);

  const last = orders?.[0];
  const spent = orders?.reduce((s, o) => s + o.total, 0) ?? 0;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold md:text-4xl">Личный кабинет</h1>

        {loading ? (
          <p className="text-[#5B6785]">Загрузка…</p>
        ) : !user ? (
          <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold">Вход или регистрация</h2>
            <LoginForm />
          </section>
        ) : (
          <>
            <section className="mb-5 flex flex-wrap items-center gap-4 rounded-3xl bg-[#0B1B3A] p-5 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-400 font-display text-2xl font-bold text-[#0B1B3A]">
                {(user.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{last?.name ?? user.email}</div>
                <div className="truncate text-sm text-sky-200">{user.email}</div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><div className="font-display text-xl font-bold">{orders?.length ?? 0}</div><div className="text-sky-200">заказов</div></div>
                <div><div className="font-display text-xl font-bold">{fmt(spent)}</div><div className="text-sky-200">на сумму</div></div>
              </div>
              <button onClick={signOut} className="min-h-11 rounded-full border-2 border-white/40 px-5 text-sm font-semibold transition hover:bg-white hover:text-[#0B1B3A]">
                Выйти
              </button>
            </section>

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

            {tab === "orders" && <OrdersTab orders={orders} error={error} />}
            {tab === "weight" && <WeightTab />}
            {tab === "addresses" && <AddressTab />}
            {tab === "payment" && <PaymentTab />}
            {tab === "reviews" && <ReviewsTab orders={orders} />}
            {tab === "support" && <SupportTab />}
          </>
        )}
      </div>
    </main>
  );
}