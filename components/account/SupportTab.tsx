"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { addTicketMessage, createTicket, loadTickets, type Ticket } from "@/lib/account";
import { TG_SUPPORT_URL } from "@/lib/config";

const field =
  "mt-1 w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2.5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200";

export default function SupportTab() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () => loadTickets().then(setTickets).catch(() => setErr("Не удалось загрузить обращения.")),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  const create = async () => {
    setErr("");
    if (!user) return;
    if (subject.trim().length < 3 || body.trim().length < 5) { setErr("Укажите тему и опишите вопрос."); return; }
    setBusy(true);
    try { await createTicket(user.id, subject, body); setSubject(""); setBody(""); await refresh(); }
    catch { setErr("Не удалось отправить обращение."); }
    setBusy(false);
  };

  const send = async (id: string) => {
    if (reply.trim().length < 2) return;
    try { await addTicketMessage(id, reply); setReply(""); await refresh(); }
    catch { setErr("Не удалось отправить сообщение."); }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-[#0B1B3A] p-6 text-white">
        <h2 className="text-lg font-semibold">Быстрее всего — в Telegram</h2>
        <p className="mt-1 text-sm text-sky-100/80">Напишите нам в мессенджер, мы ответим в рабочее время.</p>
        <a href={TG_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-sky-400 px-6 py-3 font-bold text-[#0B1B3A] transition hover:bg-sky-300">
          Написать в Telegram
        </a>
      </section>

      <section className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Новое обращение</h2>
        <label className="block text-sm font-semibold">Тема
          <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="mt-3 block text-sm font-semibold">Сообщение
          <textarea className={field} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button onClick={create} disabled={busy} className="mt-3 rounded-full bg-orange-400 px-6 py-3 font-bold text-[#0B1B3A] disabled:opacity-60">
          {busy ? "Отправляем…" : "Отправить"}
        </button>
        {err && <p role="alert" className="mt-2 text-sm text-pink-700">{err}</p>}
      </section>

      {tickets && tickets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Мои обращения</h2>
          {tickets.map((t) => (
            <article key={t.id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
              <button onClick={() => setOpen(open === t.id ? null : t.id)} className="flex w-full items-center justify-between gap-3 text-left">
                <span>
                  <b>{t.subject}</b>
                  <span className="block text-xs text-[#5B6785]">{new Date(t.created_at).toLocaleDateString("ru-RU")} · {t.status}</span>
                </span>
                <span className="text-xl">{open === t.id ? "−" : "+"}</span>
              </button>
              {open === t.id && (
                <div className="mt-4 space-y-2">
                  {t.ticket_messages.map((m) => (
                    <div key={m.id} className={"max-w-[85%] rounded-2xl p-3 text-sm " + (m.from_staff ? "bg-sky-100" : "ml-auto bg-orange-100")}>
                      <div className="mb-0.5 text-xs font-bold text-[#5B6785]">{m.from_staff ? "Поддержка" : "Вы"}</div>
                      {m.body}
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input className={field} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Ваш ответ" />
                    <button onClick={() => send(t.id)} className="mt-1 min-h-11 rounded-full bg-[#0B1B3A] px-5 text-sm font-bold text-white">Отправить</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}