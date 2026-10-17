"use client";

import { useMemo, useState } from "react";
import { ACTIVITY, GOALS, calcKcal, macros, type Goal, type Sex } from "@/lib/menu";

type Props = { goal: Goal; setGoal: (g: Goal) => void; onApply: (kcal: number) => void };

const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";
const R = 54;
const C = 2 * Math.PI * R;

function Seg({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition " +
        (on ? "border-[#0B1B3A] bg-[#0B1B3A] text-white" : "border-[#F0E4D3] bg-white hover:border-orange-300")
      }
    >
      {children}
    </button>
  );
}

export default function Calculator({ goal, setGoal, onApply }: Props) {
  const [sex, setSex] = useState<Sex>("f");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [act, setAct] = useState(1);

  const a = +age, h = +height, w = +weight;
  const valid = a >= 18 && a <= 80 && h >= 140 && h <= 220 && w >= 40 && w <= 250;
  const r = useMemo(
    () => (valid ? calcKcal(sex, a, h, w, ACTIVITY[act].k, goal) : null),
    [valid, sex, a, h, w, act, goal]
  );
  const m = r ? macros(r.target, goal) : null;
  const split = GOALS[goal].split;
  const progress = r ? Math.min(r.target / 3200, 1) : 0;

  const apply = () => {
    if (!r) return;
    onApply(r.plan);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-6">
        <div className="text-sm font-semibold">Пол</div>
        <div className="mt-2 flex gap-2">
          <Seg on={sex === "f"} onClick={() => setSex("f")}>Женский</Seg>
          <Seg on={sex === "m"} onClick={() => setSex("m")}>Мужской</Seg>
        </div>

        <div className="mt-4 text-sm font-semibold">Цель</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(GOALS) as Goal[]).map((g) => (
            <Seg key={g} on={goal === g} onClick={() => setGoal(g)}>{GOALS[g].label}</Seg>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <label className="text-sm font-semibold">Возраст
            <input className={field} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
          <label className="text-sm font-semibold">Рост, см
            <input className={field} type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
          </label>
          <label className="text-sm font-semibold">Вес, кг
            <input className={field} type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold">Активность
          <select className={field} value={act} onChange={(e) => setAct(+e.target.value)}>
            {ACTIVITY.map((x, i) => <option key={x.k} value={i}>{x.label}</option>)}
          </select>
        </label>

        {!valid && (
          <p role="alert" className="mt-3 text-sm text-pink-700">
            Проверьте данные: возраст 18–80 лет, рост 140–220 см, вес 40–250 кг.
          </p>
        )}
        <p className="mt-4 text-xs text-[#5B6785]">
          Расчёт ориентировочный (формула Миффлина — Сан-Жеора) и не заменяет консультацию врача.
        </p>
      </div>

      <div className="flex flex-col rounded-3xl bg-[#0B1B3A] p-6 text-white">
        {r && m ? (
          <>
            <div className="relative mx-auto h-44 w-44">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="12" />
                <circle
                  cx="70" cy="70" r={R} fill="none" stroke="#FF8A3D" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
                  style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div key={r.target} className="pop font-display text-4xl font-bold">{r.target}</div>
                <div className="text-xs text-sky-200">ккал в день</div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-sky-100/80">
              Для поддержания веса: <b className="text-white">{r.need} ккал</b>. С учётом цели «{GOALS[goal].label}» мы считаем <b className="text-white">{r.target} ккал</b>.
            </p>

            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10">
              <div className="transition-[width] duration-700" style={{ width: `${split[0]}%`, background: "#FF6B4A" }} />
              <div className="transition-[width] duration-700" style={{ width: `${split[1]}%`, background: "#FFC83D" }} />
              <div className="transition-[width] duration-700" style={{ width: `${split[2]}%`, background: "#4CC26B" }} />
            </div>
            <div className="mt-2 grid grid-cols-3 text-center text-sm">
              <div><b>{m.p} г</b><div className="text-xs text-sky-200">белки</div></div>
              <div><b>{m.f} г</b><div className="text-xs text-sky-200">жиры</div></div>
              <div><b>{m.c} г</b><div className="text-xs text-sky-200">углеводы</div></div>
            </div>

            <button
              onClick={apply}
              className="mt-6 rounded-full bg-orange-400 px-6 py-3.5 font-bold text-[#0B1B3A] transition hover:-translate-y-0.5 hover:bg-orange-300"
            >
              Подобрать рацион {r.plan} ккал
            </button>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-sky-100/80">
            Введите свои данные, и здесь появится ваша норма калорий.
          </div>
        )}
      </div>
    </div>
  );
}