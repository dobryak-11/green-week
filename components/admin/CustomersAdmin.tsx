"use client";

import { useMemo, useState } from "react";
import type { Customer } from "@/lib/admin";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default function CustomersAdmin({ customers }: { customers: Customer[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers
      .filter((c) => !s || [c.name, c.email, c.phone, c.city].some((v) => v.toLowerCase().includes(s)))
      .sort((a, b) => b.total - a.total);
  }, [customers, q]);

  return (
    <div>
      <input
        className="mb-4 min-h-11 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 text-sm outline-none focus:border-orange-400"
        placeholder="Поиск: имя, почта, телефон, город"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {list.length === 0 && <p className="text-[#5B6785]">Клиентов пока нет.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <article key={c.user_id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-[#5B6785]">{c.email}</div>
            <div className="text-sm text-[#5B6785]">{c.phone}</div>
            <div className="text-sm text-[#5B6785]">{c.city}, {c.address}</div>
            <div className="mt-3 flex justify-between border-t border-[#F0E4D3] pt-3 text-sm">
              <span>Заказов: <b>{c.orders}</b></span>
              <span>На сумму: <b>{fmt(c.total)}</b></span>
            </div>
            <div className="mt-1 text-xs text-[#5B6785]">Последний заказ: {new Date(c.last).toLocaleDateString("ru-RU")}</div>
          </article>
        ))}
      </div>
    </div>
  );
}