"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { dishesOfOrder, loadMyReviews, saveReview, type Review } from "@/lib/account";
import type { SavedOrder } from "@/lib/orders";
import { useMenu } from "@/components/MenuProvider";

const DAY = 86400000;
const openAt = (o: SavedOrder) => new Date(o.first_delivery + "T12:00:00").getTime() + 7 * DAY;
const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";

export default function ReviewsTab({ orders }: { orders: SavedOrder[] | null }) {
  const { user } = useAuth();
  const { menu } = useMenu();
  const [mine, setMine] = useState<Review[]>([]);
  const [orderId, setOrderId] = useState("");
  const [dishId, setDishId] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try { setMine(await loadMyReviews(user.id)); } catch { setErr("Не удалось загрузить отзывы."); }
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);

  const eligible = useMemo(() => (orders ?? []).filter((o) => openAt(o) <= Date.now()), [orders]);
  const order = eligible.find((o) => o.id === orderId) ?? eligible[0];
  const dishes = useMemo(() => {
    if (!order) return [];
    const done = new Set(mine.filter((r) => r.order_id === order.id).map((r) => r.dish_id));
    return dishesOfOrder(menu, order).filter((d) => !done.has(d.id));
  }, [order, mine, menu]);
  const dish = dishes.find((d) => d.id === dishId) ?? dishes[0];

  const send = async () => {
    setErr(""); setMsg("");
    if (!user || !order || !dish) return;
    setBusy(true);
    try {
      await saveReview(user.id, {
        order_id: order.id, dish_id: dish.id, dish_name: dish.name, rating, text,
        author: order.name.split(" ")[0] || "Клиент",
      });
      setMsg("Спасибо! Отзыв появится на сайте после проверки.");
      setText(""); setRating(5); setDishId("");
      await refresh();
    } catch { setErr("Не удалось отправить отзыв."); }
    setBusy(false);
  };

  if (orders === null) return <p className="text-[#5B6785]">Загрузка…</p>;

  const nextOpen = orders.length ? Math.min(...orders.map(openAt)) : null;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-1 text-lg font-semibold">Оставить отзыв на блюдо</h2>
        {eligible.length === 0 ? (
          <p className="text-sm text-[#5B6785]">
            {nextOpen
              ? `Отзыв можно оставить через неделю после начала доставки. Ближайший: ${new Date(nextOpen).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}.`
              : "Когда вы закажете рацион и пройдёт неделя, здесь можно будет оценить блюда."}
          </p>
        ) : !dish ? (
          <p className="text-sm text-[#5B6785]">Вы уже оценили все блюда этого заказа. Спасибо!</p>
        ) : (
          <>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Заказ
                <select className={field} value={order.id} onChange={(e) => { setOrderId(e.target.value); setDishId(""); }}>
                  {eligible.map((o) => (
                    <option key={o.id} value={o.id}>№ {o.id.slice(0, 8).toUpperCase()} от {new Date(o.created_at).toLocaleDateString("ru-RU")}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">Блюдо
                <select className={field} value={dish.id} onChange={(e) => setDishId(e.target.value)}>
                  {dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Оценка">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} из 5`}
                  className={"min-h-11 min-w-11 text-3xl transition " + (n <= rating ? "text-amber-400" : "text-[#E6DDD0]")}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="mt-2 block text-sm font-semibold">Ваш отзыв
              <textarea className={field} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Что понравилось, что можно улучшить" />
            </label>
            <p className="mt-2 text-xs text-[#5B6785]">Отзыв публикуется на сайте после проверки, с вашим именем без фамилии.</p>
            <button onClick={send} disabled={busy} className="mt-3 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
              {busy ? "Отправляем…" : "Отправить отзыв"}
            </button>
          </>
        )}
        {msg && <p className="mt-2 text-sm text-green-700">{msg}</p>}
        {err && <p role="alert" className="mt-2 text-sm text-pink-700">{err}</p>}
      </section>

      {mine.length > 0 && (
        <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Мои отзывы</h2>
          <ul className="space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="rounded-2xl bg-[#FFFAF3] p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{r.dish_name}</b>
                  <span className={"rounded-full px-3 py-0.5 text-xs font-bold " + (r.approved ? "bg-lime-300" : "bg-amber-200")}>
                    {r.approved ? "Опубликован" : "На проверке"}
                  </span>
                </div>
                <div className="text-amber-400">{"★".repeat(r.rating)}<span className="text-[#E6DDD0]">{"★".repeat(5 - r.rating)}</span></div>
                {r.text && <p className="mt-1 text-[#44506f]">{r.text}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}