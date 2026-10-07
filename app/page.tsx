import Link from "next/link";
import Configurator from "@/components/Configurator";
import Faq from "@/components/Faq";
import Logo from "@/components/Logo";

const features = [
  { t: "Сбалансированное КБЖУ", d: "Каждый приём пищи рассчитан по белкам, жирам и углеводам под вашу цель." },
  { t: "Свежие продукты", d: "Готовим в день доставки из свежих ингредиентов, без лишнего сахара." },
  { t: "Учёт аллергенов", d: "Фильтр меню по веганскому питанию и 10 популярным аллергенам." },
  { t: "Гибкая подписка", d: "Можно пропустить день или поставить заказ на паузу." },
];

export default function Home() {
  return (
    <main className="bg-white text-neutral-900">
      <div style={{ background: "linear-gradient(to bottom, #bae6fd 0%, #e0f2fe 60%, #ffffff 100%)" }}>
        <section id="about" className="mx-auto max-w-5xl px-4 pb-8 pt-12 md:pt-16">
          <h1 className="text-4xl font-bold text-sky-950 md:text-5xl">О нас<Logo className="mb-4 h-16" /></h1>
          <p className="mt-4 max-w-2xl text-lg text-sky-900">
            Мы готовим сбалансированные рационы из свежих продуктов и привозим их к вашей двери.
            Меню составляет нутрициолог, а за вкус отвечает шеф-повар.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.t} className="rounded-2xl border border-sky-200 bg-white/80 p-5">
                <div className="font-semibold text-sky-950">{f.t}</div>
                <p className="mt-2 text-sm text-neutral-700">{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Configurator />
      <Faq />
    </main>
  );
}
