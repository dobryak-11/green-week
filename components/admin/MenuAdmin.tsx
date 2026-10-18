"use client";

import { useCallback, useEffect, useState } from "react";
import { useMenu } from "@/components/MenuProvider";
import { ALLERGENS, MEALS, type Allergen, type Dish, type DishDiet } from "@/lib/menu";
import {
  deleteDish, loadMenuAdmin, saveDish, saveSettings, seedMenu, uploadDishPhoto, type MenuAdminData,
} from "@/lib/menu-admin";

const DISH_DIET: Record<DishDiet, string> = { none: "Обычное", veg: "Вегетарианское", vegan: "Веганское" };
const field =
  "min-h-11 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 text-sm outline-none focus:border-orange-400";
type Row = { a: string; b: string };

function RowsEditor({
  title, hintA, hintB, rows, setRows,
}: { title: string; hintA: string; hintB: string; rows: Row[]; setRows: (r: Row[]) => void }) {
  const change = (i: number, k: "a" | "b", v: string) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input aria-label={hintA} className={field} inputMode="decimal" placeholder={hintA} value={r.a} onChange={(e) => change(i, "a", e.target.value)} />
            <input aria-label={hintB} className={field} inputMode="decimal" placeholder={hintB} value={r.b} onChange={(e) => change(i, "b", e.target.value)} />
            <button onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Удалить строку" className="min-h-11 min-w-11 text-[#5B6785] hover:text-pink-700">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setRows([...rows, { a: "", b: "" }])} className="mt-2 min-h-10 rounded-full border-2 border-[#0B1B3A] px-4 text-sm font-bold">
        + Добавить строку
      </button>
    </div>
  );
}

export default function MenuAdmin() {
  const { reload } = useMenu();
  const [data, setData] = useState<MenuAdminData | null>(null);
  const [priceRows, setPriceRows] = useState<Row[]>([]);
  const [discRows, setDiscRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (resetRows: boolean) => {
    try {
      const d = await loadMenuAdmin();
      setData(d);
      if (resetRows) {
        setPriceRows(Object.entries(d.prices).sort((x, y) => +x[0] - +y[0]).map(([a, b]) => ({ a, b: String(b) })));
        setDiscRows(Object.entries(d.discounts).sort((x, y) => +x[0] - +y[0]).map(([a, b]) => ({ a, b: String(Math.round(b * 100)) })));
      }
    } catch {
      setErr("Не удалось загрузить меню. Проверьте, что SQL из инструкции выполнен.");
    }
  }, []);
  useEffect(() => { load(true); }, [load]);

  const run = async (fn: () => Promise<void>, ok: string, resetRows = false) => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      await fn();
      await reload();
      await load(resetRows);
      setMsg(ok);
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : "Не получилось, попробуйте ещё раз.");
    }
    setBusy(false);
  };

  const savePrices = () => {
    const prices: Record<number, number> = {};
    for (const r of priceRows) {
      const k = Number(r.a), v = Number(r.b.replace(",", "."));
      if (!Number.isInteger(k) || k < 800 || k > 5000 || !(v >= 1 && v <= 100000)) {
        setErr(`Проверьте строку «${r.a}»: калорийность 800–5000, цена 1–100000 ₽ в день.`);
        return;
      }
      prices[k] = Math.round(v);
    }
    const discounts: Record<number, number> = {};
    for (const r of discRows) {
      const n = Number(r.a), p = Number(r.b.replace(",", "."));
      if (!Number.isInteger(n) || n < 1 || n > 14 || !(p >= 0 && p <= 50)) {
        setErr(`Проверьте строку «${r.a}»: дней от 1 до 14, скидка от 0 до 50%.`);
        return;
      }
      discounts[n] = p / 100;
    }
    if (!Object.keys(prices).length || !Object.keys(discounts).length) {
      setErr("Нужна хотя бы одна строка в каждой таблице.");
      return;
    }
    run(() => saveSettings(prices, discounts), "Цены и скидки сохранены.", true);
  };

  const newDish = (meal: number): Dish => ({
    id: MEALS[meal].prefix + Date.now().toString(36),
    meal, name: "", diet: "none", allergens: [], ingredients: "", desc: "", photo: null, active: true,
    sort: data?.dishes.filter((d) => d.meal === meal).length ?? 0,
  });

  const saveEditing = () => {
    if (!editing) return;
    if (editing.name.trim().length < 2) { setErr("Укажите название блюда."); return; }
    const d: Dish = { ...editing, name: editing.name.trim(), ingredients: editing.ingredients.trim(), desc: editing.desc.trim() };
    run(async () => { await saveDish(d); setEditing(null); }, "Блюдо сохранено.");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !editing) return;
    setErr(""); setBusy(true);
    try {
      const url = await uploadDishPhoto(f, editing.id);
      setEditing((cur) => (cur ? { ...cur, photo: url } : cur));
    } catch (x) {
      setErr(x instanceof Error && x.message ? x.message : "Не удалось загрузить фото.");
    }
    setBusy(false);
  };

  const toggleAllergen = (a: Allergen) =>
    setEditing((cur) =>
      cur ? { ...cur, allergens: cur.allergens.includes(a) ? cur.allergens.filter((x) => x !== a) : [...cur.allergens, a] } : cur
    );

  if (!data) return <p className="text-[#5B6785]">{err || "Загрузка…"}</p>;

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-2xl bg-lime-200 p-3 text-sm font-semibold">{msg}</p>}
      {err && !editing && <p role="alert" className="rounded-2xl bg-pink-100 p-3 text-sm text-pink-800">{err}</p>}

      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-1 text-lg font-semibold">Цены и скидки</h2>
        <p className="mb-4 text-xs text-[#5B6785]">Изменения касаются только новых заказов: уже оформленные остаются с прежней суммой.</p>
        <div className="grid gap-6 md:grid-cols-2">
          <RowsEditor title="Цена за один день, ₽" hintA="Калорий" hintB="Цена, ₽" rows={priceRows} setRows={setPriceRows} />
          <RowsEditor title="Скидка по числу дней" hintA="Дней" hintB="Скидка, %" rows={discRows} setRows={setDiscRows} />
        </div>
        <button onClick={savePrices} disabled={busy} className="mt-4 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
          Сохранить цены и скидки
        </button>
      </section>

      {!data.seeded ? (
        <section className="rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50 p-6">
          <h2 className="text-lg font-semibold">Блюда ещё не загружены в базу</h2>
          <p className="mt-1 text-sm text-[#44506f]">
            Сейчас сайт показывает встроенное стартовое меню (28 блюд). Загрузите его в базу один раз, и после этого
            его можно будет редактировать здесь.
          </p>
          <button onClick={() => run(seedMenu, "Стартовое меню загружено, теперь его можно редактировать.", true)} disabled={busy} className="mt-4 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
            Загрузить стартовое меню
          </button>
        </section>
      ) : (
        MEALS.map((meal, mi) => {
          const list = data.dishes.filter((d) => d.meal === mi);
          return (
            <section key={meal.name} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{meal.name} <span className="text-sm font-normal text-[#5B6785]">· {list.length} блюд</span></h2>
                <button onClick={() => { setErr(""); setIsNew(true); setEditing(newDish(mi)); }} className="min-h-10 rounded-full bg-lime-300 px-4 text-sm font-bold">
                  + Добавить блюдо
                </button>
              </div>
              {list.length === 0 && <p className="text-sm text-[#5B6785]">Блюд нет.</p>}
              <ul className="divide-y divide-[#F0E4D3]">
                {list.map((d) => (
                  <li key={d.id} className={"flex flex-wrap items-center gap-3 py-3 " + (d.active ? "" : "opacity-50")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {d.photo ? <img src={d.photo} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 font-bold">{d.name[0]}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-[#5B6785]">
                        {DISH_DIET[d.diet]}{d.allergens.length > 0 && ` · аллергены: ${d.allergens.map((a) => ALLERGENS[a].toLowerCase()).join(", ")}`}
                        {!d.active && " · скрыто"}
                      </div>
                    </div>
                    <button onClick={() => run(() => saveDish({ ...d, active: !d.active }), d.active ? "Блюдо скрыто." : "Блюдо снова в меню.")} disabled={busy} className="min-h-10 rounded-full border-2 border-[#F0E4D3] px-4 text-sm font-bold">
                      {d.active ? "Скрыть" : "Показать"}
                    </button>
                    <button onClick={() => { setErr(""); setIsNew(false); setEditing(d); }} className="min-h-10 rounded-full border-2 border-[#0B1B3A] px-4 text-sm font-bold">
                      Изменить
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1B3A]/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div role="dialog" aria-modal="true" aria-label="Редактирование блюда" onClick={(e) => e.stopPropagation()} className="pop flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border-2 border-[#F0E4D3] bg-[#FFFAF3] text-[#0B1B3A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E4D3] px-6 py-4">
              <h2 className="text-xl font-bold">{isNew ? "Новое блюдо" : "Редактирование блюда"}</h2>
              <button onClick={() => setEditing(null)} aria-label="Закрыть" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl hover:bg-orange-100">×</button>
            </div>
            <div className="space-y-3 overflow-y-auto px-6 py-5">
              <label className="block text-sm font-semibold">Название
                <input className={field} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">Приём пищи
                  <select className={field} value={editing.meal} onChange={(e) => setEditing({ ...editing, meal: Number(e.target.value) })}>
                    {MEALS.map((m, i) => <option key={m.name} value={i}>{m.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">Тип питания
                  <select className={field} value={editing.diet} onChange={(e) => setEditing({ ...editing, diet: e.target.value as DishDiet })}>
                    {(Object.keys(DISH_DIET) as DishDiet[]).map((d) => <option key={d} value={d}>{DISH_DIET[d]}</option>)}
                  </select>
                </label>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Аллергены в блюде</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ALLERGENS) as Allergen[]).map((a) => (
                    <label key={a} className="flex min-h-10 items-center gap-2 text-sm">
                      <input type="checkbox" checked={editing.allergens.includes(a)} onChange={() => toggleAllergen(a)} />
                      {ALLERGENS[a]}
                    </label>
                  ))}
                </div>
              </div>
              <label className="block text-sm font-semibold">Состав
                <input className={field} value={editing.ingredients} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">Описание
                <textarea className={`${field} py-2`} rows={3} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} />
              </label>
              <div>
                <div className="mb-2 text-sm font-semibold">Фото (JPG, PNG или WebP до 2 МБ)</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {editing.photo && <img src={editing.photo} alt="" className="mb-2 h-32 w-full rounded-2xl object-cover" />}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="block w-full text-sm" />
                {editing.photo && (
                  <button onClick={() => setEditing({ ...editing, photo: null })} className="mt-2 text-sm font-semibold text-pink-700 underline">Убрать фото</button>
                )}
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Показывать в меню
              </label>
              {err && <p role="alert" className="rounded-2xl bg-pink-100 p-3 text-sm text-pink-800">{err}</p>}
            </div>
            <div className="flex flex-wrap gap-3 border-t border-[#F0E4D3] bg-white px-6 py-4">
              {!isNew && (
                <button
                  onClick={() => { if (confirm("Удалить блюдо насовсем? Лучше просто скрыть его.")) run(async () => { await deleteDish(editing.id); setEditing(null); }, "Блюдо удалено."); }}
                  className="min-h-12 rounded-full border-2 border-pink-300 px-5 font-bold text-pink-700"
                >
                  Удалить
                </button>
              )}
              <button onClick={() => setEditing(null)} className="min-h-12 flex-1 rounded-full border-2 border-[#0B1B3A] font-bold">Отмена</button>
              <button onClick={saveEditing} disabled={busy} className="min-h-12 flex-1 rounded-full bg-orange-400 font-bold text-[#0B1B3A] disabled:opacity-60">
                {busy ? "Сохраняем…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}