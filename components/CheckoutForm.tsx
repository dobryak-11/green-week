"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ALLERGENS, DIETS, GOALS, type Allergen, type Diet, type Goal } from "@/lib/menu";
import { saveOrder } from "@/lib/orders";

type Props = { goal: Goal; kcal: number; days: number; diet: Diet; allergens: Allergen[]; base: number; discount: number; total: number };
const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const SLOTS = ["Накануне, 18:00–20:00", "Утром, 06:00–08:00", "Утром, 08:00–10:00"];
const input = "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";

const localIso = (d: Date) =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

export default function CheckoutForm({ goal, kcal, days, diet, allergens, base, discount, total }: Props) {
  const [f, setF] = useState({
    name: "", phone: "", email: "", city: "", address: "", apt: "", floor: "",
    comment: "", date: "", slot: SLOTS[0], pay: "online",
  });
  const [minDate, setMinDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new Date();
    t.setDate(t.getDate() + 2);
    const iso = localIso(t);
    setMinDate(iso);
    setF((s) => ({ ...s, date: s.date || iso }));
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = "Укажите имя";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Укажите телефон полностью";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Проверьте email";
    if (f.city.trim().length < 2) e.city = "Укажите город";
    if (f.address.trim().length < 5) e.address = "Укажите улицу и дом";
    if (!f.date) e.date = "Выберите дату первой доставки";
    setErrors(e);
    if (Object.keys(e).length) return;
    saveOrder({
      id: "GW-" + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      status: "Принят",
      goal, kcal, days, diet, allergens, total,
      firstDelivery: f.date, slot: f.slot, city: f.city, address: f.address,
      name: f.name, phone: f.phone, email: f.email,
    });
    // Здесь позже будет отправка заказа на сервер и переход к оплате
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-pink-700">{errors[k]}</p>;

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Заказ принят</h1>
        <p className="mt-3 text-neutral-700">
          {f.name}, мы привезём первый набор {new Date(f.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {f.slot.toLowerCase()}.
        </p>
        <p className="mt-2 font-semibold">{fmt(total)}</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-semibold text-white">На главную</Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/#menu" className="text-sm text-green-800 underline">← Вернуться к меню</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold">Оформление заказа</h1>
      <div className="grid gap-5 md:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-green-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Контакты</h2>
            <label className="mt-2 block text-sm font-semibold">Имя
              <input className={input} value={f.name} onChange={set("name")} autoComplete="name" />
            </label>{err("name")}
            <label className="mt-2 block text-sm font-semibold">Телефон
              <input className={input} type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
            </label>{err("phone")}
            <label className="mt-2 block text-sm font-semibold">Email
              <input className={input} type="email" value={f.email} onChange={set("email")} autoComplete="email" />
            </label>{err("email")}
          </section>

          <section className="rounded-2xl border border-green-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Адрес доставки</h2>
            <label className="mt-2 block text-sm font-semibold">Город
              <input className={input} value={f.city} onChange={set("city")} autoComplete="address-level2" />
            </label>{err("city")}
            <label className="mt-2 block text-sm font-semibold">Улица и дом
              <input className={input} value={f.address} onChange={set("address")} autoComplete="street-address" />
            </label>{err("address")}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">Квартира
                <input className={input} value={f.apt} onChange={set("apt")} />
              </label>
              <label className="block text-sm font-semibold">Подъезд, этаж
                <input className={input} value={f.floor} onChange={set("floor")} />
              </label>
            </div>
            <label className="mt-2 block text-sm font-semibold">Комментарий курьеру
              <textarea className={input} rows={2} value={f.comment} onChange={set("comment")} />
            </label>
          </section>

          <section className="rounded-2xl border border-green-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Доставка</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Дата первой доставки
                <input className={input} type="date" min={minDate} value={f.date} onChange={set("date")} />
              </label>
              <label className="block text-sm font-semibold">Время
                <select className={input} value={f.slot} onChange={set("slot")}>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>{err("date")}
          </section>

          <section className="rounded-2xl border border-green-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Оплата</h2>
            {[
              ["online", "Картой онлайн"],
              ["courier", "При получении"],
            ].map(([v, l]) => (
              <label key={v} className="flex min-h-11 items-center gap-3 text-base">
                <input type="radio" name="pay" checked={f.pay === v} onChange={() => setF((s) => ({ ...s, pay: v }))} />
                {l}
              </label>
            ))}
            <p className="mt-2 text-xs text-neutral-600">
              Данные карты вы введёте на защищённой странице платёжного сервиса, мы их не получаем и не храним.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-green-200 bg-white p-5 md:sticky md:top-4">
          <h2 className="mb-3 text-lg font-semibold">Ваш заказ</h2>
          <div className="py-1 text-sm">{GOALS[goal].label}, {kcal} ккал</div>
           {(diet !== "any" || allergens.length > 0) && (
            <div className="py-1 text-sm text-neutral-600">
              {[
                diet !== "any" ? DIETS[diet] : null,
                allergens.length ? "Без: " + allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ") : null,
              ].filter(Boolean).join(". ")}
            </div>
          )}
          <div className="flex justify-between py-1 text-sm"><span>{days} дней</span><span>{fmt(base)}</span></div>
          {discount > 0 && <div className="flex justify-between py-1 text-sm"><span>Скидка</span><span>−{fmt(discount)}</span></div>}
          <div className="flex justify-between py-1 text-sm"><span>Доставка</span><span>0 ₽</span></div>
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold">
            <span>К оплате</span><span>{fmt(total)}</span>
          </div>
          <button onClick={submit} className="mt-3 w-full rounded-xl bg-pink-700 py-3 font-semibold text-white">
            {f.pay === "online" ? "Перейти к оплате" : "Подтвердить заказ"}
          </button>
        </aside>
      </div>
    </>
  );
}