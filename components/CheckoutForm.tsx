"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import { ALLERGENS, DIETS, GOALS, type Allergen, type Diet, type Goal } from "@/lib/menu";
import { saveOrder } from "@/lib/orders";

type Props = { goal: Goal; kcal: number; days: number; diet: Diet; allergens: Allergen[]; base: number; discount: number; total: number };

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const SLOTS = ["Накануне, 18:00–20:00", "Утром, 06:00–08:00", "Утром, 08:00–10:00"];
const input = "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";

const localIso = (d: Date) =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

export default function CheckoutForm({ goal, kcal, days, diet, allergens, base, discount, total }: Props) {
  const { user, loading } = useAuth();
  const [f, setF] = useState({
    name: "", phone: "", email: "", city: "", address: "", apt: "", floor: "",
    comment: "", date: "", slot: SLOTS[0], pay: "online",
  });
  const [minDate, setMinDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new Date();
    t.setDate(t.getDate() + 2);
    const iso = localIso(t);
    setMinDate(iso);
    setF((s) => ({ ...s, date: s.date || iso }));
  }, []);

  useEffect(() => {
    if (user?.email) setF((s) => ({ ...s, email: s.email || user.email! }));
  }, [user]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = "Укажите имя";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Укажите телефон полностью";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Проверьте email";
    if (f.city.trim().length < 2) e.city = "Укажите город";
    if (f.address.trim().length < 5) e.address = "Укажите улицу и дом";
    if (!f.date) e.date = "Выберите дату первой доставки";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    setSaveError("");
    try {
      await saveOrder({
        goal, kcal, days, diet, allergens, total,
        first_delivery: f.date, slot: f.slot,
        name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(),
        city: f.city.trim(), address: f.address.trim(),
        apt: f.apt.trim(), floor: f.floor.trim(), comment: f.comment.trim(), pay: f.pay,
      });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch {
      setSaveError("Не удалось сохранить заказ. Попробуйте ещё раз.");
    }
    setSaving(false);
  };

  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-pink-700">{errors[k]}</p>;

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-sky-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Заказ принят</h1>
        <p className="mt-3 text-neutral-700">
          {f.name}, мы привезём первый набор {new Date(f.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {f.slot.toLowerCase()}.
        </p>
        <p className="mt-2 font-semibold">{fmt(total)}</p>
        {f.pay === "online" && (
          <p className="mt-2 text-sm text-neutral-600">Онлайн-оплата пока не подключена, оплатите заказ при получении.</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/account" className="rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white">Мои заказы</Link>
          <Link href="/" className="rounded-xl border border-sky-700 px-6 py-3 font-semibold text-sky-800">На главную</Link>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-neutral-600">Загрузка…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-sky-200 bg-white p-6">
        <Link href="/#menu" className="text-sm text-sky-800 underline">← Вернуться к меню</Link>
        <h1 className="mb-1 mt-3 text-2xl font-bold">Войдите, чтобы оформить заказ</h1>
        <p className="mb-4 text-sm text-neutral-600">Ваш рацион сохранён, после входа вы вернётесь к оформлению.</p>
        <LoginForm />
      </div>
    );
  }

  return (
    <>
      <Link href="/#menu" className="text-sm text-sky-800 underline">← Вернуться к меню</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold">Оформление заказа</h1>
      <div className="grid gap-5 md:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-sky-200 bg-white p-5">
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

          <section className="rounded-2xl border border-sky-200 bg-white p-5">
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

          <section className="rounded-2xl border border-sky-200 bg-white p-5">
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

          <section className="rounded-2xl border border-sky-200 bg-white p-5">
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
              Данные карты вводятся на защищённой странице платёжного сервиса, мы их не получаем и не храним.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-sky-200 bg-white p-5 md:sticky md:top-24">
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
          <button onClick={submit} disabled={saving} className="mt-3 w-full rounded-xl bg-sky-700 py-3 font-semibold text-white disabled:opacity-60">
            {saving ? "Сохраняем…" : "Подтвердить заказ"}
          </button>
          {saveError && <p role="alert" className="mt-2 text-sm text-pink-700">{saveError}</p>}
        </aside>
      </div>
    </>
  );
}