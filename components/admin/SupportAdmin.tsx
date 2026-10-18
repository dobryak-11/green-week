"use client";

import { useState } from "react";
import { TICKET_STATUSES, setTicketStatus, staffReply, type AdminTicket, type Customer } from "@/lib/admin";

export default function SupportAdmin({
  tickets, customers, onChanged,
}: { tickets: AdminTicket[]; customers: Customer[]; onChanged: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [err, setErr] = useState("");
  const who = new Map(customers.map((c) => [c.user_id, c]));

  const run = async (fn: () => Promise<void>) => {
    setErr("");
    try { await fn(); onChanged(); } catch { setErr("Не получилось, попробуйте ещё раз."); }
  };

  if (tickets.length === 0) return <p className="text-[#5B6785]">Обращений нет.</p>;

  return (
    <div className="space-y-3">
      {err && <p role="alert" className="text-sm text-pink-700">{err}</p>}
      {tickets.map((t) => {
        const c = who.get(t.user_id);
        return (
          <article key={t.id} className="rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
            <button onClick={() => { setOpen(open === t.id ? null : t.id); setReply(""); }} className="flex w-full items-center justify-between gap-3 text-left">
              <span>
                <b>{t.subject}</b>
                <span className="block text-xs text-[#5B6785]">
                  {c ? `${c.name} · ${c.email}` : `Клиент ${t.user_id.slice(0, 6)}`} · {new Date(t.created_at).toLocaleDateString("ru-RU")} · {t.status}
                </span>
              </span>
              <span className="text-xl">{open === t.id ? "−" : "+"}</span>
            </button>
            {open === t.id && (
              <div className="mt-4 space-y-2">
                {t.ticket_messages.map((m) => (
                  <div key={m.id} className={"max-w-[85%] rounded-2xl p-3 text-sm " + (m.from_staff ? "ml-auto bg-sky-100" : "bg-orange-100")}>
                    <div className="mb-0.5 text-xs font-bold text-[#5B6785]">{m.from_staff ? "Вы" : "Клиент"}</div>
                    {m.body}
                  </div>
                ))}
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  placeholder="Ваш ответ клиенту"
                  className="w-full rounded-xl border-2 border-[#F0E4D3] bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { if (reply.trim().length > 1) run(async () => { await staffReply(t.id, reply); setReply(""); }); }}
                    className="min-h-11 rounded-full bg-orange-400 px-6 font-bold text-[#0B1B3A]"
                  >
                    Отправить
                  </button>
                  <select
                    value={t.status}
                    onChange={(e) => run(() => setTicketStatus(t.id, e.target.value))}
                    aria-label="Статус обращения"
                    className="min-h-11 rounded-full border-2 border-[#F0E4D3] bg-white px-4 text-sm font-semibold"
                  >
                    {TICKET_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}