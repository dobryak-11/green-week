import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { DISCOUNT, GOALS, PRICE_PER_DAY, hasGap, parseFilters, totalPrice, type Goal } from "@/lib/menu";

type SP = Promise<{ goal?: string; kcal?: string; days?: string; diet?: string; allergens?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const goal = sp.goal as Goal;
  const kcal = Number(sp.kcal);
  const days = Number(sp.days);
  if (!(goal in GOALS) || !(kcal in PRICE_PER_DAY) || !(days in DISCOUNT)) redirect("/");

  const filters = parseFilters(sp.diet, sp.allergens);
  if (hasGap(filters)) redirect("/#menu");
  const price = totalPrice(kcal, days);

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <CheckoutForm goal={goal} kcal={kcal} days={days} diet={filters.diet} allergens={filters.allergens} {...price} />
      </div>
    </main>
  );
}