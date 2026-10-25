"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import { addAddress, loadAddresses, loadProfile, type Address } from "@/lib/account";
import { ALLERGENS, DIETS, GOALS, type Allergen, type Diet, type Goal } from "@/lib/menu";
import { saveOrder } from "@/lib/orders";

type Props = { goal: Goal; kcal: number; days: number; diet: Diet; allergens: Allergen[]; base: number; discount: number; total: number };

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const SLOTS = ["Накануне, 18:00–20:00", "Утром, 06:00–08:00", "Утром, 08:00–10:00"];
const ADDR_KEYS = ["city", "address", "apt", "floor", "comment"];
const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";
const primary =
  "w-full rounded-full bg-orange-400 py-3.5 font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/60 transition hover:-translate-y-0.5 hover:bg-orange-300 disabled:opacity-60";

const localIso = (d: Date) =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

function Card({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
      <h2 className="mb-3 flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-400 text-sm font-bold text-[#0B1B3A]">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CheckoutForm({ goal, kcal, days, diet, allergens, base, discount, total }: Props) {
  const { user, loading } = useAuth();
  const [f, setF] = useState({
    name: "", phone: "", email: "", city: "", address: "", apt: "", floor: "",
    comment: "", date: "", slot: SLOTS[0], pay: "online",
  });
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [saveNew, setSaveNew] = useState(false);
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
    if (!user) return;
    setF((s) => ({ ...s, email: s.email || user.email || "" }));
    loadProfile().then((p) => setF((s) => ({ ...s, pay: p.pay_default }))).catch(() => {});
    loadAddresses()
      .then((list) => {
        setAddrs(list);
        const d = list.find((a) => a.is_default);
        if (d) applyAddr(d);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const applyAddr = (a: Address) => {
    setPicked(a.id);
    setF((s) => ({ ...s, city: a.city, address: a.address, apt: a.apt ?? "", floor: a.floor ?? "", comment: a.comment ?? "" }));
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (ADDR_KEYS.includes(k)) setPicked(null);
    setF((s) => ({ ...s, [k]: e.target.value }));
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = "Укажите имя";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Укажите телефон полностью";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Проверьте email";
    if (f.city.trim().length < 2) e.city = "Укажите город";
    if (f.address.trim().length < 5) e.address = "Укажите улицу и дом";
    if (!f.date) e.date = "Выберите дату первой доставки";
    setErrors(e);
    if (Object.keys(e).length) {
      setSaveError("Проверьте поля: " + Object.values(e).join(", ").toLowerCase() + ".");
      setTimeout(
        () => document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }),
        50
      );
      return;
    }

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
      if (saveNew && !picked && user) {
        try {
          await addAddress(
            user.id,
            { label: "Другое", city: f.city.trim(), address: f.address.trim(), apt: f.apt.trim(), floor: f.floor.trim(), comment: f.comment.trim() },
            addrs.length === 0
          );
        } catch { /* адрес не сохранился, но заказ принят */ }
      }
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
      <div className="pop mx-auto max-w-lg rounded-3xl border-2 border-[#F0E4D3] bg-white p-8 text-center">
        <svg viewBox="0 0 52 52" className="mx-auto h-20 w-20" aria-hidden="true">
          <circle cx="26" cy="26" r="24" fill="#B6F23D" />
          <path className="draw" d="M14 27l8 8 16-17" fill="none" stroke="#0B1B3A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="mt-4 text-2xl font-bold">Заказ принят</h1>
        <p className="mt-3 text-[#44506f]">
          {f.name}, мы привезём первый набор {new Date(f.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, {f.slot.toLowerCase()}.
        </p>
        <p className="mt-2 font-display text-xl font-bold">{fmt(total)}</p>
        {f.pay === "online" && (
          <p className="mt-2 text-sm text-[#5B6785]">Онлайн-оплата пока не подключена, оплатите заказ при получении.</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account" className="rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A]">Мои заказы</Link>
          <Link href="/" className="rounded-full border-2 border-[#0B1B3A] px-6 py-3 font-bold text-[#0B1B3A]">На главную</Link>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-[#5B6785]">Загрузка…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border-2 border-[#F0E4D3] bg-white p-6">
        <Link href="/menu" className="text-sm font-semibold underline">← Вернуться к меню</Link>
        <h1 className="mb-1 mt-3 text-2xl font-bold">Войдите, чтобы оформить заказ</h1>
        <p className="mb-4 text-sm text-[#5B6785]">Ваш рацион сохранён, после входа вы вернётесь к оформлению.</p>
        <LoginForm />
      </div>
    );
  }

  return (
    <>
      <Link href="/menu" className="text-sm font-semibold underline">← Вернуться к меню</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold">Оформление заказа</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card n={1} title="Контакты">
            <label className="block text-sm font-semibold">Имя
              <input className={field} value={f.name} onChange={set("name")} autoComplete="name" />
            </label>{err("name")}
            <label className="mt-3 block text-sm font-semibold">Телефон
              <input className={field} type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
            </label>{err("phone")}
            <label className="mt-3 block text-sm font-semibold">Email
              <input className={field} type="email" value={f.email} onChange={set("email")} autoComplete="email" />
            </label>{err("email")}
          </Card>

          <Card n={2} title="Адрес доставки">
            {addrs.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 text-sm font-semibold">Сохранённые адреса</div>
                <div className="flex flex-wrap gap-2">
                  {addrs.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyAddr(a)}
                      aria-pressed={picked === a.id}
                      className={
                        "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition " +
                        (picked === a.id ? "border-[#0B1B3A] bg-[#0B1B3A] text-white" : "border-[#F0E4D3] hover:border-orange-300")
                      }
                    >
                      {a.label}: {a.address}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="block text-sm font-semibold">Город
              <input className={field} value={f.city} onChange={set("city")} autoComplete="address-level2" />
            </label>{err("city")}
            <label className="mt-3 block text-sm font-semibold">Улица и дом
              <input className={field} value={f.address} onChange={set("address")} autoComplete="street-address" />
            </label>{err("address")}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">Квартира
                <input className={field} value={f.apt} onChange={set("apt")} />
              </label>
              <label className="block text-sm font-semibold">Подъезд, этаж
                <input className={field} value={f.floor} onChange={set("floor")} />
              </label>
            </div>
            <label className="mt-3 block text-sm font-semibold">Комментарий курьеру
              <textarea className={field} rows={2} value={f.comment} onChange={set("comment")} />
            </label>
            {!picked && (
              <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} />
                Сохранить этот адрес в кабинете
              </label>
            )}
          </Card>

          <Card n={3} title="Дата и время">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Дата первой доставки
                <input className={field} type="date" min={minDate} value={f.date} onChange={set("date")} />
              </label>
              <label className="block text-sm font-semibold">Время
                <select className={field} value={f.slot} onChange={set("slot")}>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>{err("date")}
          </Card>

          <Card n={4} title="Оплата">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["online", "Картой онлайн"],
                ["courier", "При получении"],
              ].map(([v, l]) => (
                <label
                  key={v}
                  className={
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 font-semibold transition " +
                    (f.pay === v ? "border-orange-400 bg-orange-50" : "border-[#F0E4D3] hover:border-orange-300")
                  }
                >
                  <input type="radio" name="pay" checked={f.pay === v} onChange={() => setF((s) => ({ ...s, pay: v }))} />
                  {l}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#5B6785]">
              Данные карты вводятся на защищённой странице платёжного сервиса, мы их не получаем и не храним.
            </p>
          </Card>
        </div>

        <aside className="h-fit rounded-3xl border-2 border-[#F0E4D3] bg-white p-5 md:sticky md:top-24">
          <h2 className="mb-3 text-lg font-semibold">Ваш заказ</h2>
          <div className="py-1 text-sm">{GOALS[goal].label}, {kcal} ккал</div>
          {(diet !== "any" || allergens.length > 0) && (
            <div className="py-1 text-sm text-[#5B6785]">
              {[
                diet !== "any" ? DIETS[diet] : null,
                allergens.length ? "Без: " + allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ") : null,
              ].filter(Boolean).join(". ")}
            </div>
          )}
          <div className="flex justify-between py-1 text-sm"><span>{days} дней</span><span>{fmt(base)}</span></div>
          {discount > 0 && <div className="flex justify-between py-1 text-sm font-semibold text-green-700"><span>Скидка</span><span>−{fmt(discount)}</span></div>}
          <div className="flex justify-between py-1 text-sm"><span>Доставка</span><span>0 ₽</span></div>
          <div className="mt-2 flex items-baseline justify-between border-t border-[#F0E4D3] pt-3">
            <span className="font-semibold">К оплате</span>
            <span className="font-display text-2xl font-bold">{fmt(total)}</span>
          </div>
          <button onClick={submit} disabled={saving} className={`mt-4 ${primary}`}>
            {saving ? "Сохраняем…" : "Подтвердить заказ"}
          </button>
          {saveError && <p role="alert" className="mt-2 text-sm text-pink-700">{saveError}</p>}
        </aside>
      </div>
    </>
  );
}