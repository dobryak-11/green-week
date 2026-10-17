"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { addAddress, deleteAddress, loadAddresses, setDefaultAddress, type Address } from "@/lib/account";

const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";

export default function AddressTab() {
  const { user } = useAuth();
  const [list, setList] = useState<Address[] | null>(null);
  const [f, setF] = useState({ label: "Дом", city: "", address: "", apt: "", floor: "", comment: "" });
  const [def, setDef] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () => loadAddresses().then(setList).catch(() => setErr("Не удалось загрузить адреса.")),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const add = async () => {
    setErr("");
    if (!user) return;
    if (f.city.trim().length < 2 || f.address.trim().length < 5) { setErr("Укажите город и улицу с домом."); return; }
    setBusy(true);
    try {
      await addAddress(user.id, { ...f, city: f.city.trim(), address: f.address.trim() }, def || (list?.length ?? 0) === 0);
      setF({ label: "Дом", city: "", address: "", apt: "", floor: "", comment: "" });
      setDef(false);
      await refresh();
    } catch { setErr("Не удалось сохранить адрес."); }
    setBusy(false);
  };

  const act = async (fn: () => Promise<void>) => {
    try { await fn(); await refresh(); } catch { setErr("Не получилось, попробуйте ещё раз."); }
  };

  return (
    <div className="space-y-5">
      {list === null ? (
        <p className="text-[#5B6785]">Загрузка…</p>
      ) : list.length === 0 ? (
        <p className="rounded-3xl bg-orange-100 p-5 text-sm">Сохранённых адресов пока нет. Добавьте первый ниже.</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <article key={a.id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <b>{a.label}</b>
                {a.is_default && <span className="rounded-full bg-lime-300 px-3 py-0.5 text-xs font-bold">Основной</span>}
              </div>
              <p className="mt-1 text-sm">{a.city}, {a.address}{a.apt ? `, кв. ${a.apt}` : ""}{a.floor ? `, ${a.floor}` : ""}</p>
              {a.comment && <p className="text-sm text-[#5B6785]">{a.comment}</p>}
              <div className="mt-3 flex gap-2">
                {!a.is_default && user && (
                  <button onClick={() => act(() => setDefaultAddress(user.id, a.id))} className="min-h-10 rounded-full border-2 border-[#0B1B3A] px-4 text-sm font-bold">Сделать основным</button>
                )}
                <button onClick={() => act(() => deleteAddress(a.id))} className="min-h-10 rounded-full border-2 border-pink-300 px-4 text-sm font-bold text-pink-700">Удалить</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Новый адрес</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Название
            <select className={field} value={f.label} onChange={set("label")}>
              <option>Дом</option><option>Работа</option><option>Другое</option>
            </select>
          </label>
          <label className="text-sm font-semibold">Город
            <input className={field} value={f.city} onChange={set("city")} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Улица и дом
            <input className={field} value={f.address} onChange={set("address")} />
          </label>
          <label className="text-sm font-semibold">Квартира
            <input className={field} value={f.apt} onChange={set("apt")} />
          </label>
          <label className="text-sm font-semibold">Подъезд, этаж
            <input className={field} value={f.floor} onChange={set("floor")} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Комментарий курьеру
            <input className={field} value={f.comment} onChange={set("comment")} />
          </label>
        </div>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={def} onChange={(e) => setDef(e.target.checked)} /> Сделать основным
        </label>
        <button onClick={add} disabled={busy} className="mt-2 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
          {busy ? "Сохраняем…" : "Сохранить адрес"}
        </button>
        {err && <p role="alert" className="mt-2 text-sm text-pink-700">{err}</p>}
      </section>
    </div>
  );
}