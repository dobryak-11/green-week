import Link from "next/link";
import CountUp from "@/components/CountUp";
import Hero from "@/components/Hero";
import PublicReviews from "@/components/PublicReviews";
import Reveal from "@/components/Reveal";

const stats = [
  { n: 4, t: "приёма пищи в день", bg: "bg-orange-200" },
  { n: 28, t: "блюд в меню", bg: "bg-amber-200" },
  { n: 10, t: "аллергенов в фильтре", bg: "bg-lime-200" },
  { n: 7, t: "дней — максимум в неделе", bg: "bg-sky-200" },
];

const features = [
  { t: "Сбалансированное КБЖУ", d: "Каждый приём пищи рассчитан по белкам, жирам и углеводам под вашу цель.", c: "bg-orange-400" },
  { t: "Свежие продукты", d: "Готовим в день доставки из свежих ингредиентов, без лишнего сахара.", c: "bg-amber-300" },
  { t: "Учёт аллергенов", d: "Фильтр меню по веганскому питанию и 10 популярным аллергенам.", c: "bg-lime-300" },
  { t: "Гибкая подписка", d: "Можно пропустить день или поставить заказ на паузу.", c: "bg-sky-300" },
];

const WORDS = ["Белок", "Энергия", "Свежесть", "Баланс", "Без аллергенов", "Доставка к утру"];

export default function Home() {
  return (
    <main>
      <Hero />

      <div className="overflow-hidden bg-[#0B1B3A] py-4 text-white" aria-hidden="true">
        <div className="marquee-track font-display text-lg font-bold uppercase tracking-wide">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {WORDS.map((w) => (
                <span key={w + k} className="flex items-center">
                  <span className="px-6">{w}</span>
                  <span className="text-orange-400">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.t} delay={i * 100}>
              <div className={`rounded-3xl p-5 text-center ${s.bg}`}>
                <div className="font-display text-4xl font-bold text-[#0B1B3A]">
                  <CountUp to={s.n} />
                </div>
                <div className="mt-1 text-sm text-[#0B1B3A]/70">{s.t}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <Reveal>
          <h2 className="text-3xl font-bold md:text-4xl">Почему ВАКУУМ</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.t} delay={i * 110}>
              <div className="card-lift h-full rounded-3xl border-2 border-[#F0E4D3] bg-white p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-display font-bold text-[#0B1B3A] ${f.c}`}>
                  {i + 1}
                </div>
                <div className="mt-4 font-semibold">{f.t}</div>
                <p className="mt-2 text-sm text-[#5B6785]">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <Reveal>
          <Link href="/packaging" className="card-lift flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-orange-200 to-amber-200 p-6 md:p-8">
            <span>
              <span className="block font-display text-2xl font-bold">Наша упаковка</span>
              <span className="mt-1 block text-sm text-[#0B1B3A]/70">Посмотрите, в чём мы привозим ваш рацион</span>
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B1B3A] text-xl text-white" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </section>

      <PublicReviews />

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <Reveal>
          <div className="rounded-3xl bg-[#0B1B3A] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">Готовы подобрать рацион?</h2>
            <p className="mx-auto mt-3 max-w-md text-sky-100/80">Это займёт пару минут: посчитаем калории и соберём меню на неделю.</p>
            <Link href="/calc" className="mt-6 inline-block rounded-full bg-orange-400 px-8 py-3.5 font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/40 transition hover:-translate-y-0.5 hover:bg-orange-300">
              Начать
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}