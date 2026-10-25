"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadProfile, saveProfile } from "@/lib/account";
import { ALLERGENS, GOALS, type Filters, type Goal } from "@/lib/menu";

type State = { goal: Goal; kcal: number; days: number; filters: Filters };
type Ctx = State & {
  setGoal: (g: Goal) => void;
  setKcal: (k: number) => void;
  setDays: (d: number) => void;
  setFilters: (f: Filters) => void;
};

const EMPTY: Filters = { diet: "any", allergens: [] };
const DEFAULT: State = { goal: "bal", kcal: 1600, days: 5, filters: EMPTY };
const KEY = "vk_ration";

const RationCtx = createContext<Ctx>({
  ...DEFAULT,
  setGoal: () => {}, setKcal: () => {}, setDays: () => {}, setFilters: () => {},
});
export const useRation = () => useContext(RationCtx);

function sanitize(f: unknown): Filters | null {
  if (!f || typeof f !== "object") return null;
  const x = f as { diet?: unknown; allergens?: unknown };
  return {
    diet: x.diet === "veg" || x.diet === "vegan" ? x.diet : "any",
    allergens: Array.isArray(x.allergens) ? x.allergens.filter((a): a is keyof typeof ALLERGENS => a in ALLERGENS) : [],
  };
}
const hasAny = (f: Filters) => f.diet !== "any" || f.allergens.length > 0;

export default function RationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id;
  const [s, setS] = useState<State>(DEFAULT);
  const [ready, setReady] = useState(false);
  const sRef = useRef(s);
  sRef.current = s;
  const synced = useRef<string | null>(null);
  const prevUid = useRef<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<State>;
        setS({
          goal: p.goal && p.goal in GOALS ? p.goal : DEFAULT.goal,
          kcal: Number.isFinite(p.kcal) ? Number(p.kcal) : DEFAULT.kcal,
          days: Number.isFinite(p.days) ? Number(p.days) : DEFAULT.days,
          filters: sanitize(p.filters) ?? EMPTY,
        });
      }
    } catch {
      /* хранилище недоступно */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }, [s, ready]);

  // вошли в аккаунт: берём фильтр из профиля
  useEffect(() => {
    if (!ready || !uid) return;
    let cancelled = false;
    loadProfile()
      .then(async (p) => {
        if (cancelled) return;
        const remote = sanitize(p.filters);
        if (remote) {
          setS((cur) => ({ ...cur, filters: remote }));
        } else if (hasAny(sRef.current.filters)) {
          await saveProfile(uid, { filters: sRef.current.filters }).catch(() => {});
        }
        synced.current = uid;
      })
      .catch(() => { synced.current = uid; });
    return () => { cancelled = true; };
  }, [ready, uid]);

  // изменили фильтр: сохраняем в профиль
  const filtersKey = JSON.stringify(s.filters);
  useEffect(() => {
    if (!uid || synced.current !== uid) return;
    const t = setTimeout(() => {
      saveProfile(uid, { filters: sRef.current.filters }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [filtersKey, uid]);

  // вышли из аккаунта: не оставляем ваши аллергены на устройстве
  useEffect(() => {
    if (prevUid.current && !uid) {
      synced.current = null;
      setS((cur) => ({ ...cur, filters: EMPTY }));
    }
    prevUid.current = uid;
  }, [uid]);

  const value: Ctx = {
    ...s,
    setGoal: (goal) => setS((p) => ({ ...p, goal })),
    setKcal: (kcal) => setS((p) => ({ ...p, kcal })),
    setDays: (days) => setS((p) => ({ ...p, days })),
    setFilters: (filters) => setS((p) => ({ ...p, filters })),
  };

  return <RationCtx.Provider value={value}>{children}</RationCtx.Provider>;
}