"use client";

import { useState } from "react";
import { ACTIVITY, GOALS, calcKcal, type Goal, type Sex } from "@/lib/menu";

type Props = { goal: Goal; setGoal: (g: Goal) => void; onApply: (kcal: number) => void };

const input = "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";

export default function Calculator({ goal, setGoal, onApply }: Props) {
  const [sex, setSex] = useState<Sex>("f");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [act, setAct] = useState(1);
  const [result, setResult] = useState<{ need: number; target: number; plan: number } | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const a = +age, h = +height, w = +weight;
    if (!(a >= 18 && a <= 80) || !(h >= 140 && h <= 220) || !(w >= 40 && w <= 250)) {
      setError("Проверьте данные: возраст 18–80 лет, рост 140–220 см, вес 40–250 кг.");
      setResult(null);
      return;
    }
    setError("");
    const r = calcKcal(sex, a, h, w, ACTIVITY[act].k, goal);
    setResult(r);
    onApply(r.plan);
  };

  const chip = (active: boolean) =>
    "min-h-10 rounded-full border px-4 text-sm font-medium " +
    (active ? "border-sky-700 bg-sky-700 text-white" : "border-neutral-300 bg-white");

  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-5 text-neutral-900">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm font-semibold">Пол</div>
          <div className="mt-2 flex gap-2">
            <button className={chip(sex === "f")} onClick={() => setSex("f")}>Женский</button>
            <button className={chip(sex === "m")} onClick={() => setSex("m")}>Мужской</button>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold">Цель</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(GOALS) as Goal[]).map((g) => (
              <button key={g} className={chip(goal === g)} onClick={() => setGoal(g)}>{GOALS[g].label}</button>
            ))}
          </div>
        </div>
        <label className="text-sm font-semibold">Возраст, лет
          <input className={input} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label className="text-sm font-semibold">Рост, см
          <input className={input} type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <label className="text-sm font-semibold">Вес, кг
          <input className={input} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="text-sm font-semibold">Активность
          <select className={input} value={act} onChange={(e) => setAct(+e.target.value)}>
            {ACTIVITY.map((a, i) => <option key={a.k} value={i}>{a.label}</option>)}
          </select>
        </label>
      </div>

      <button onClick={run} className="mt-4 rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white">
        Рассчитать и подобрать рацион
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-pink-700">{error}</p>}

      {result && (
        <div className="mt-4 rounded-xl bg-sky-50 p-4 text-sm">
          <p>Для поддержания веса вам нужно около <b>{result.need} ккал</b> в день.</p>
          <p className="mt-1">С учётом цели «{GOALS[goal].label}»: <b>{result.target} ккал</b>.</p>
          <p className="mt-1">Ближайший рацион: <b>{result.plan} ккал</b>, он уже выбран ниже. Если смените цель, нажмите «Рассчитать» ещё раз.</p>
        </div>
      )}
      <p className="mt-3 text-xs text-neutral-600">
        Расчёт ориентировочный (формула Миффлина — Сан-Жеора) и не заменяет консультацию врача.
      </p>
    </div>
  );
}
