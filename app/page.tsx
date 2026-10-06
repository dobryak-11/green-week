import Configurator from "@/components/Configurator";

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 p-4 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="my-6 text-3xl font-bold md:text-4xl">
          Здоровое питание на неделю, с доставкой к утру
        </h1>
        <Configurator />
      </div>
    </main>
  );
}