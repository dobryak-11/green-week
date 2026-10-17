"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadProfile, saveProfile, type PayMethod } from "@/lib/account";

const OPTIONS: [PayMethod, string, string][] = [
  ["online", "Картой онлайн", "Оплата на защищённой странице платёжного сервиса"],
  ["courier", "При получении", "Оплатите курьеру при доставке"],
];

export default function PaymentTab() {
  const { user } = useAuth();
  const [method, setMethod] = useState<PayMethod>("online");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile().then((p) => setMethod(p.pay_default)).catch(() => setMsg("Не удалось загрузить настройки."));
  }, []);

  const pick = async (m: PayMethod) => {
    setMethod(m);
    if (!user) return;
    try { await saveProfile(user.id, { pay_default: m }); setMsg("Сохранено."); }
    catch { setMsg("Не удалось сохранить."); }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Способ оплаты по умолчанию</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map(([v, t, d]) => (
            <button
              key={v}
              onClick={() => pick(v)}
              aria-pressed={method === v}
              className={
                "rounded-2xl border-2 p-4 text-left transition " +
                (method === v ? "border-orange-400 bg-orange-50" : "border-[#F0E4D3] hover:border-orange-300")
              }
            >
              <div className="font-semibold">{t}</div>
              <div className="mt-1 text-sm text-[#5B6785]">{d}</div>
            </button>
          ))}
        </div>
        {msg && <p className="mt-3 text-sm text-[#5B6785]">{msg}</p>}
      </section>

      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold">Банковские карты</h2>
        <p className="text-sm text-[#5B6785]">Сохранённых карт нет.</p>
        <p className="mt-3 rounded-2xl bg-amber-100 p-3 text-xs text-[#44506f]">
          Сохранение карты станет доступно после подключения платёжного сервиса. Номер карты мы никогда не
          получаем и не храним: его хранит только сам платёжный сервис.
        </p>
      </section>
    </div>
  );
}