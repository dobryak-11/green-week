import Configurator from "@/components/Configurator";

const features = [
  { t: "Сбалансированное КБЖУ", d: "Каждый приём пищи рассчитан по белкам, жирам и углеводам под вашу цель." },
  { t: "Свежие продукты", d: "Готовим в день доставки из свежих ингредиентов, без лишнего сахара." },
  { t: "Доставка к утру", d: "Привозим рацион вечером накануне или рано утром, в удобное вам время." },
  { t: "Гибкая подписка", d: "Можно пропустить день или поставить заказ на паузу." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 text-neutral-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="text-lg font-bold text-green-800">Зелёная неделя</div>
        <nav className="flex gap-5 text-sm font-medium">
          <a href="#about">О нас</a>
          <a href="#calc">Расчёт</a>
          <a href="#menu">Меню</a>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Здоровое питание на неделю, с доставкой к утру
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-700">
          Рассчитайте норму калорий, выберите рацион и получайте готовую еду без списков покупок и готовки.
        </p>
        <a href="#calc" className="mt-6 inline-block rounded-xl bg-pink-700 px-6 py-3 font-semibold text-white">
          Подобрать рацион
        </a>
      </section>

      <section id="about" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-10">
        <h2 className="mb-2 text-2xl font-bold">О нас</h2>
        <p className="mb-6 max-w-2xl text-neutral-700">
          Мы готовим сбалансированные рационы из свежих продуктов и привозим их к вашей двери.
          Меню составляет нутрициолог, а за вкус отвечает шеф-повар.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-2xl border border-green-200 bg-white p-5">
              <div className="font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-neutral-700">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <Configurator />
    </main>
  );
}