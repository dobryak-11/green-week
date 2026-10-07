"use client";

const DOCS: [string, string][] = [
  ["Публичная оферта", "#"],
  ["Программа лояльности", "#"],
  ["Согласие на обработку персональных данных", "#"],
  ["Согласие на получение рассылки и рекламных материалов", "#"],
  ["Согласие на распространение персональных данных в связи с публикацией отзыва", "#"],
  ["Согласие на обработку данных в мессенджерах", "#"],
  ["Политика защиты и обработки персональных данных", "#"],
];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 px-4 py-10 text-sm text-neutral-300">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div>
          <div className="font-semibold text-white">ООО «[Название компании]»</div>
          <p className="mt-1">ИНН: [ИНН]</p>
          <p>КПП: [КПП]</p>
          <p>ОГРН: [ОГРН]</p>
          <p className="mt-4">
            Контактный телефон: <a href="tel:+78000000000" className="underline">[8-800-000-00-00]</a>
          </p>
          <p>
            Почта для сотрудничества: <a href="mailto:info@example.com" className="underline">[info@example.com]</a>
          </p>
        </div>
        <ul className="space-y-2">
          {DOCS.map(([label, href]) => (
            <li key={label}><a href={href} className="underline-offset-2 hover:underline">{label}</a></li>
          ))}
          <li>
            <button onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))} className="underline-offset-2 hover:underline">
              Настройки cookie
            </button>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-8 max-w-5xl border-t border-neutral-700 pt-4 text-xs text-neutral-400">
        © «[Название бренда]». Все права защищены.
      </p>
    </footer>
  );
}