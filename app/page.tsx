import Configurator from "@/components/Configurator";
import CountUp from "@/components/CountUp";
import Hero from "@/components/Hero";
import Packaging from "@/components/Packaging";
import Reveal from "@/components/Reveal";
import PublicReviews from "@/components/PublicReviews";

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
      <div id="about" className="scroll-mt-20">
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

        <section className="mx-auto max-w-5xl px-4 py-14">
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

        <section className="mx-auto max-w-5xl px-4 pb-16">
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
      </div>

      <Packaging />
      <Configurator />
      <PublicReviews />
    </main>
  );
}