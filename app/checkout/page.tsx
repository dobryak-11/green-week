import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { DISCOUNT, EXCLUSIONS, GOALS, PRICE_PER_DAY, totalPrice, type Exclusion, type Goal } from "@/lib/menu";

type SP = Promise<{ goal?: string; kcal?: string; days?: string; excl?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const goal = sp.goal as Goal;
  const kcal = Number(sp.kcal);
  const days = Number(sp.days);
  if (!(goal in GOALS) || !(kcal in PRICE_PER_DAY) || !(days in DISCOUNT)) redirect("/");

  const excl = (sp.excl ?? "").split(",").filter((x): x is Exclusion => x in EXCLUSIONS);
  const price = totalPrice(kcal, days);

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <CheckoutForm goal={goal} kcal={kcal} days={days} excl={excl} {...price} />
      </div>
    </main>
  );
}