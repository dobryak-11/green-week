"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const input = "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";

export default function LoginForm({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Проверьте адрес почты");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError("Не удалось отправить код. Подождите минуту и попробуйте снова.");
      return;
    }
    setStep("code");
    setWait(60);
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError("Неверный или просроченный код.");
      return;
    }
    onDone?.();
  };

  return (
    <div className="max-w-sm">
      {step === "email" ? (
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <label className="block text-sm font-semibold">Ваша почта
            <input className={input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button disabled={busy} className="mt-3 w-full rounded-xl bg-sky-700 py-3 font-semibold text-white disabled:opacity-60">
            {busy ? "Отправляем…" : "Получить код"}
          </button>
          <p className="mt-2 text-xs text-neutral-600">Мы отправим на почту код для входа. Пароль не нужен.</p>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <p className="mb-2 text-sm">Код отправлен на <b>{email}</b>. Проверьте также папку «Спам».</p>
          <label className="block text-sm font-semibold">Код из письма
            <input
              className={input}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          <button disabled={busy || code.length < 6} className="mt-3 w-full rounded-xl bg-sky-700 py-3 font-semibold text-white disabled:opacity-60">
            {busy ? "Проверяем…" : "Войти"}
          </button>
          <div className="mt-2 flex justify-between text-sm">
            <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} className="underline">
              Другая почта
            </button>
            <button type="button" disabled={wait > 0 || busy} onClick={send} className="underline disabled:no-underline disabled:opacity-60">
              {wait > 0 ? `Отправить снова (${wait} с)` : "Отправить снова"}
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-pink-700">{error}</p>}
    </div>
  );
}