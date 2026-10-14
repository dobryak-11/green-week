"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import { ALLERGENS, DIETS, GOALS } from "@/lib/menu";
import { loadOrders, type SavedOrder } from "@/lib/orders";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setOrders(null); return; }
    loadOrders().then(setOrders).catch(() => setError("Не удалось загрузить заказы. Обновите страницу."));
  }, [user]);

  const last = orders?.[0];

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold">Личный кабинет</h1>

        {loading ? (
          <p className="text-neutral-600">Загрузка…</p>
        ) : !user ? (
          <section className="rounded-2xl border border-sky-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold">Вход или регистрация</h2>
            <LoginForm />
          </section>
        ) : (
          <>
            <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-white p-5">
              <div>
                <div className="text-sm text-neutral-600">Вы вошли как</div>
                <div className="font-semibold">{user.email}</div>
                {last && <div className="mt-1 text-sm text-neutral-600">{last.name} · {last.phone} · {last.city}, {last.address}</div>}
              </div>
              <button onClick={signOut} className="min-h-10 rounded-xl border border-sky-700 px-4 text-sm font-semibold text-sky-800">
                Выйти
              </button>
            </section>

            <h2 className="mb-3 text-lg font-semibold">История заказов</h2>
            {error && <p role="alert" className="text-pink-700">{error}</p>}
            {orders === null && !error ? (
              <p className="text-neutral-600">Загрузка…</p>
            ) : orders && orders.length === 0 ? (
              <div className="rounded-2xl border border-sky-200 bg-white p-6 text-center">
                <p className="text-neutral-700">Заказов пока нет.</p>
                <Link href="/#calc" className="mt-3 inline-block rounded-xl bg-sky-700 px-5 py-2 font-semibold text-white">
                  Подобрать рацион
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders?.map((o) => (
                  <article key={o.id} className="rounded-2xl border border-sky-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">Заказ № {o.id.slice(0, 8).toUpperCase()}</div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-800">{o.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      от {new Date(o.created_at).toLocaleDateString("ru-RU")} · доставка с{" "}
                      {new Date(o.first_delivery).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {o.slot.toLowerCase()}
                    </p>
                    <p className="mt-2 text-sm">
                      {GOALS[o.goal].label}, {o.kcal} ккал, {o.days} дней
                      {o.diet !== "any" && ` · ${DIETS[o.diet].toLowerCase()}`}
                      {o.allergens.length > 0 && ` · без: ${o.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ")}`}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold">{fmt(o.total)}</span>
                      <Link
                        href={`/checkout?goal=${o.goal}&kcal=${o.kcal}&days=${o.days}&diet=${o.diet}&allergens=${o.allergens.join(",")}`}
                        className="min-h-10 rounded-xl border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-800"
                      >
                        Повторить заказ
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}