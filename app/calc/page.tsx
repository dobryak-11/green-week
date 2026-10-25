"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Calculator from "@/components/Calculator";
import { useRation } from "@/components/RationProvider";

export default function CalcPage() {
  const router = useRouter();
  const { goal, setGoal, setKcal } = useRation();

  return (
    <main className="min-h-[75svh] bg-[#FFF1DC]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <span className="inline-block rounded-full bg-orange-400 px-4 py-1 text-sm font-bold text-[#0B1B3A]">Шаг 1 из 2</span>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Рассчитайте свою норму калорий</h1>
        <p className="mb-8 mt-3 max-w-xl text-[#44506f]">
          Введите данные, и мы подберём подходящий рацион. Его можно изменить на следующем шаге.
        </p>
        <Calculator
          goal={goal}
          setGoal={setGoal}
          onApply={(k) => {
            setKcal(k);
            router.push("/menu");
          }}
        />
        <p className="mt-6 text-center text-sm">
          <Link href="/menu" className="font-semibold underline">Пропустить и выбрать рацион вручную</Link>
        </p>
      </div>
    </main>
  );
}