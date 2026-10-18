"use client";

import { useState } from "react";
import { deleteReview, setReviewApproved, type AdminReview, type Customer } from "@/lib/admin";

export default function ReviewsAdmin({
  reviews, customers, onChanged,
}: { reviews: AdminReview[]; customers: Customer[]; onChanged: () => void }) {
  const [onlyPending, setOnlyPending] = useState(true);
  const [err, setErr] = useState("");
  const who = new Map(customers.map((c) => [c.user_id, c]));
  const list = reviews.filter((r) => !onlyPending || !r.approved);

  const run = async (fn: () => Promise<void>) => {
    setErr("");
    try { await fn(); onChanged(); } catch { setErr("Не получилось, попробуйте ещё раз."); }
  };

  return (
    <div>
      <label className="mb-4 flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
        Показывать только ожидающие проверки
      </label>
      {err && <p role="alert" className="mb-3 text-sm text-pink-700">{err}</p>}
      {list.length === 0 && <p className="text-[#5B6785]">Отзывов нет.</p>}
      <div className="space-y-3">
        {list.map((r) => (
          <article key={r.id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <b>{r.dish_name}</b>
              <span className={"rounded-full px-3 py-0.5 text-xs font-bold " + (r.approved ? "bg-lime-300" : "bg-amber-200")}>
                {r.approved ? "Опубликован" : "Ожидает проверки"}
              </span>
            </div>
            <div className="text-amber-400">{"★".repeat(r.rating)}<span className="text-[#E6DDD0]">{"★".repeat(5 - r.rating)}</span></div>
            {r.text && <p className="mt-1 text-sm text-[#44506f]">{r.text}</p>}
            <p className="mt-2 text-xs text-[#5B6785]">
              {r.author ?? "Клиент"} · {who.get(r.user_id)?.email ?? "—"} · {new Date(r.created_at).toLocaleDateString("ru-RU")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.approved ? (
                <button onClick={() => run(() => setReviewApproved(r.id, false))} className="min-h-10 rounded-full border-2 border-[#0B1B3A] px-4 text-sm font-bold">Скрыть</button>
              ) : (
                <button onClick={() => run(() => setReviewApproved(r.id, true))} className="min-h-10 rounded-full bg-lime-300 px-4 text-sm font-bold">Опубликовать</button>
              )}
              <button
                onClick={() => { if (confirm("Удалить отзыв насовсем?")) run(() => deleteReview(r.id)); }}
                className="min-h-10 rounded-full border-2 border-pink-300 px-4 text-sm font-bold text-pink-700"
              >
                Удалить
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}