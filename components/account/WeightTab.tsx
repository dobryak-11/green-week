"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { deleteWeight, loadProfile, loadWeights, mondayOf, saveProfile, saveWeight, type WeightRow } from "@/lib/account";

const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";
const kg = (n: number) => n.toFixed(1).replace(".", ",") + " кг";
const diff = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(1).replace(".", ",") + " кг";
const dateOf = (s: string) => new Date(s + "T12:00:00");
const short = (s: string) => dateOf(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

function Chart({ rows, goal }: { rows: WeightRow[]; goal: number | null }) {
  const W = 600, H = 220, P = 32;
  const vals = rows.map((r) => r.weight).concat(goal != null ? [goal] : []);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const x = (i: number) => (rows.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (rows.length - 1));
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2 * P);
  const pts = rows.map((r, i) => `${x(i)},${y(r.weight)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="График веса по неделям">
      {goal != null && (
        <>
          <line x1={P} x2={W - P} y1={y(goal)} y2={y(goal)} stroke="#4CC26B" strokeWidth="2" strokeDasharray="6 6" />
          <text x={W - P} y={y(goal) - 6} textAnchor="end" fontSize="12" fill="#2f8f4a">цель {kg(goal)}</text>
        </>
      )}
      {rows.length > 1 && <polyline points={pts} fill="none" stroke="#FF8A3D" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
      {rows.map((r, i) => (
        <g key={r.id}>
          <circle cx={x(i)} cy={y(r.weight)} r="6" fill="#0B1B3A" stroke="#fff" strokeWidth="2" />
          <text x={x(i)} y={y(r.weight) - 12} textAnchor="middle" fontSize="12" fill="#0B1B3A">{r.weight.toFixed(1).replace(".", ",")}</text>
          {(i === 0 || i === rows.length - 1) && (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#5B6785">{short(r.week_start)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function WeightTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WeightRow[] | null>(null);
  const [goal, setGoal] = useState("");
  const [goalSaved, setGoalSaved] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [w, p] = await Promise.all([loadWeights(), loadProfile()]);
      setRows(w);
      setGoalSaved(p.goal_weight == null ? null : Number(p.goal_weight));
      setGoal(p.goal_weight == null ? "" : String(p.goal_weight).replace(".", ","));
      const cur = w.find((r) => r.week_start === mondayOf());
      if (cur) { setInput(String(cur.weight).replace(".", ",")); setNote(cur.note ?? ""); }
    } catch {
      setErr("Не удалось загрузить данные. Обновите страницу.");
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const parse = (s: string) => Number(s.replace(",", "."));

  const save = async () => {
    setErr(""); setOk("");
    const w = parse(input);
    if (!user || !(w >= 30 && w <= 300)) { setErr("Введите вес от 30 до 300 кг."); return; }
    setBusy(true);
    try { await saveWeight(user.id, mondayOf(), w, note); setOk("Записали вес за эту неделю."); await refresh(); }
    catch { setErr("Не удалось сохранить. Попробуйте ещё раз."); }
    setBusy(false);
  };

  const saveGoal = async () => {
    setErr(""); setOk("");
    if (!user) return;
    const g = goal.trim() === "" ? null : parse(goal);
    if (g !== null && !(g >= 30 && g <= 300)) { setErr("Цель должна быть от 30 до 300 кг."); return; }
    try { await saveProfile(user.id, { goal_weight: g }); setOk("Цель сохранена."); await refresh(); }
    catch { setErr("Не удалось сохранить цель."); }
  };

  const remove = async (id: string) => {
    try { await deleteWeight(id); await refresh(); } catch { setErr("Не удалось удалить запись."); }
  };

  if (rows === null) return <p className="text-[#5B6785]">{err || "Загрузка…"}</p>;

  const thisWeek = rows.some((r) => r.week_start === mondayOf());
  const first = rows[0];
  const last = rows[rows.length - 1];
  const prev = rows.length > 1 ? rows[rows.length - 2] : null;
  const total = first && last ? last.weight - first.weight : 0;
  const weeks = first && last ? Math.max(1, Math.round((dateOf(last.week_start).getTime() - dateOf(first.week_start).getTime()) / (7 * 86400000))) : 1;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="text-lg font-semibold">Взвешивание на этой неделе</h2>
        <p className="mt-1 text-sm text-[#5B6785]">
          {thisWeek ? "Запись за эту неделю есть, её можно изменить." : "На этой неделе вы ещё не записывали вес. Взвешивайтесь в один и тот же день, утром, до еды."}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
          <label className="text-sm font-semibold">Вес, кг
            <input className={field} inputMode="decimal" value={input} onChange={(e) => setInput(e.target.value)} />
          </label>
          <label className="text-sm font-semibold">Заметка (необязательно)
            <input className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Самочувствие, тренировки…" />
          </label>
        </div>
        <button onClick={save} disabled={busy} className="mt-4 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
          {busy ? "Сохраняем…" : "Записать вес"}
        </button>
        {err && <p role="alert" className="mt-2 text-sm text-pink-700">{err}</p>}
        {ok && <p className="mt-2 text-sm text-green-700">{ok}</p>}
      </section>

      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-1 text-lg font-semibold">Цель по весу</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-semibold">Желаемый вес, кг
            <input className={`${field} w-40`} inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </label>
          <button onClick={saveGoal} className="min-h-11 rounded-full border-2 border-[#0B1B3A] px-5 text-sm font-bold">Сохранить цель</button>
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="rounded-3xl bg-orange-100 p-5 text-sm">Когда вы запишете первый вес, здесь появятся график и итоги недели.</p>
      ) : (
        <>
          <section className="rounded-3xl bg-[#0B1B3A] p-5 text-white">
            <h2 className="text-lg font-semibold">Итоги</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div><div className="text-xs text-sky-200">Сейчас</div><div className="font-display text-xl font-bold">{kg(last.weight)}</div></div>
              <div><div className="text-xs text-sky-200">За неделю</div><div className="font-display text-xl font-bold">{prev ? diff(last.weight - prev.weight) : "—"}</div></div>
              <div><div className="text-xs text-sky-200">С начала</div><div className="font-display text-xl font-bold">{rows.length > 1 ? diff(total) : "—"}</div></div>
              <div><div className="text-xs text-sky-200">До цели</div><div className="font-display text-xl font-bold">{goalSaved != null ? kg(Math.abs(last.weight - goalSaved)) : "—"}</div></div>
            </div>
            {rows.length > 1 && (
              <p className="mt-3 text-sm text-sky-100/80">В среднем {diff(total / weeks)} в неделю. Если вес меняется резко или вам плохо, обсудите это с врачом.</p>
            )}
          </section>

          <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
            <Chart rows={rows} goal={goalSaved} />
            <ul className="mt-4 divide-y divide-[#F0E4D3]">
              {[...rows].reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>Неделя с {short(r.week_start)}</span>
                  <span className="min-w-0 flex-1 truncate text-[#5B6785]">{r.note}</span>
                  <b>{kg(r.weight)}</b>
                  <button onClick={() => remove(r.id)} aria-label="Удалить запись" className="min-h-9 px-2 text-[#5B6785] hover:text-pink-700">✕</button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}