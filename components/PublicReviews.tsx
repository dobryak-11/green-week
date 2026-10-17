"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import { loadApprovedReviews, type Review } from "@/lib/account";

export default function PublicReviews() {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => { loadApprovedReviews(6).then(setList).catch(() => setList([])); }, []);
  if (list.length === 0) return null;
  return (
    <section id="reviews" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
      <Reveal>
        <h2 className="text-3xl font-bold md:text-4xl">Отзывы наших клиентов</h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r, i) => (
          <Reveal key={r.id} delay={i * 90}>
            <article className="card-lift h-full rounded-3xl border-2 border-[#F0E4D3] bg-white p-5">
              <div className="text-amber-400">{"★".repeat(r.rating)}<span className="text-[#E6DDD0]">{"★".repeat(5 - r.rating)}</span></div>
              <div className="mt-2 font-semibold">{r.dish_name}</div>
              {r.text && <p className="mt-1 text-sm text-[#44506f]">{r.text}</p>}
              <div className="mt-3 text-xs text-[#5B6785]">{r.author ?? "Клиент"}</div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}