"use client";

import { useEffect, useState } from "react";

const KEY = "gw_cookie_consent";
type Consent = { analytics: boolean; marketing: boolean };

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [c, setC] = useState<Consent>({ analytics: false, marketing: false });

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
    const open = () => { setSettings(true); setVisible(true); };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const save = (v: Consent) => {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
    setVisible(false);
    setSettings(false);
  };

  if (!visible) return null;

  const row = (label: string, text: string, checked: boolean, disabled: boolean, onChange?: () => void) => (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" className="mt-1" checked={checked} disabled={disabled} onChange={onChange} />
      <span><b className="text-sm">{label}</b><br /><span className="text-xs text-neutral-600">{text}</span></span>
    </label>
  );

  return (
    <div role="dialog" aria-label="Настройки cookie" className="fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl">
        <p className="text-sm">
          Мы используем файлы cookie, чтобы сайт работал корректно, а также для аналитики и улучшения сервиса.
          Вы можете принять все файлы или выбрать, какие разрешить.
        </p>
        {settings && (
          <div className="mt-3 border-t border-neutral-200 pt-2">
            {row("Необходимые", "Нужны для работы сайта, отключить нельзя.", true, true)}
            {row("Аналитика", "Помогает понять, как люди пользуются сайтом.", c.analytics, false, () => setC({ ...c, analytics: !c.analytics }))}
            {row("Маркетинг", "Персональные предложения и реклама.", c.marketing, false, () => setC({ ...c, marketing: !c.marketing }))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => save({ analytics: true, marketing: true })} className="min-h-11 rounded-xl bg-sky-700 px-5 font-semibold text-white">
            Принять все
          </button>
          {settings ? (
            <button onClick={() => save(c)} className="min-h-11 rounded-xl border border-neutral-300 px-5 font-semibold">
              Сохранить выбор
            </button>
          ) : (
            <button onClick={() => setSettings(true)} className="min-h-11 rounded-xl border border-neutral-300 px-5 font-semibold">
              Настроить
            </button>
          )}
          <button onClick={() => save({ analytics: false, marketing: false })} className="min-h-11 px-3 text-sm underline">
            Только необходимые
          </button>
        </div>
      </div>
    </div>
  );
}
