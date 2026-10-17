"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const field = "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2 text-base outline-none focus:border-orange-400";

export default function DevLogin({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const login = async () => {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError("Не получилось войти: " + error.message);
      return;
    }
    onDone?.();
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); login(); }}
      className="mt-6 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-4"
    >
      <div className="text-sm font-bold">Вход для проверки (только на вашем компьютере)</div>
      <label className="mt-3 block text-sm font-semibold">Почта
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="mt-3 block text-sm font-semibold">Пароль
        <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button disabled={busy} className="mt-3 w-full rounded-full bg-[#0B1B3A] py-3 font-bold text-white disabled:opacity-60">
        {busy ? "Входим…" : "Войти по паролю"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-pink-700">{error}</p>}
    </form>
  );
}