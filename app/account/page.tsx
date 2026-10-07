"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ALLERGENS, DIETS, GOALS } from "@/lib/menu";
import { loadOrders, type SavedOrder } from "@/lib/orders";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function AccountPage() {
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  useEffect(() => {
    setOrders(loadOrders());
  }, []);
  const last = orders?.[0];

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-green-800 underline">← На главную</Link>
        <h1 className="mb-4 mt-3 text-3xl font-bold">Личный кабинет</h1>

        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
          Демо-режим: заказы хранятся только в этом браузере. Вход по телефону или почте и хранение на сервере
          добавим вместе с базой данных.
        </div>

        {last && (
          <section className="mb-5 rounded-2xl border border-green-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Мои данные</h2>
            <p className="text-sm">{last.name}</p>
            <p className="text-sm text-neutral-600">{last.phone} · {last.email}</p>
            <p className="text-sm text-neutral-600">{last.city}, {last.address}</p>
          </section>
        )}

        <h2 className="mb-3 text-lg font-semibold">История заказов</h2>
        {orders === null ? (
          <p className="text-neutral-600">Загрузка…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-green-200 bg-white p-6 text-center">
            <p className="text-neutral-700">Заказов пока нет.</p>
            <Link href="/#calc" className="mt-3 inline-block rounded-xl bg-green-700 px-5 py-2 font-semibold text-white">
              Подобрать рацион
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <article key={o.id} className="rounded-2xl border border-green-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">Заказ {o.id}</div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">{o.status}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                  от {new Date(o.createdAt).toLocaleDateString("ru-RU")} · доставка с{" "}
                  {new Date(o.firstDelivery).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {o.slot.toLowerCase()}
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
                    className="min-h-10 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-800"
                  >
                    Повторить заказ
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}