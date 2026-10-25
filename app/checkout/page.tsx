import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CheckoutForm from "@/components/CheckoutForm";
import { GOALS, hasGap, parseFilters, totalPrice, type Goal } from "@/lib/menu";
import { fetchMenu } from "@/lib/menu-db";

export const dynamic = "force-dynamic";

type SP = Promise<{ goal?: string; kcal?: string; days?: string; diet?: string; allergens?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const goal = sp.goal as Goal;
  const kcal = Number(sp.kcal);
  const days = Number(sp.days);

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const menu = await fetchMenu(db);

  if (!(goal in GOALS) || !(kcal in menu.prices) || !(days in menu.discounts)) redirect("/");

  const filters = parseFilters(sp.diet, sp.allergens);
  if (hasGap(menu, filters)) redirect("/menu");
  const price = totalPrice(menu, kcal, days);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <CheckoutForm goal={goal} kcal={kcal} days={days} diet={filters.diet} allergens={filters.allergens} {...price} />
      </div>
    </main>
  );
}