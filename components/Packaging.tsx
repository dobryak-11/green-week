"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const ITEMS = [
  { src: "/packaging/1.png", bg: "bg-orange-100", title: "[Название упаковки 1]", text: "[Короткое описание: чем она удобна и необычна]" },
  { src: "/packaging/2.png", bg: "bg-amber-100", title: "[Название упаковки 2]", text: "[Короткое описание]" },
  { src: "/packaging/3.png", bg: "bg-sky-100", title: "[Название упаковки 3]", text: "[Короткое описание]" },
];

function Photo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="text-sm font-medium text-[#5B6785]">Здесь будет фото упаковки</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain drop-shadow-[0_20px_20px_rgba(11,27,58,0.25)] transition duration-500 group-hover:-rotate-3 group-hover:scale-110"
    />
  );
}

export default function Packaging() {
  return (
    <section id="packaging" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20">
      <Reveal>
        <span className="inline-block rounded-full bg-lime-300 px-4 py-1 text-sm font-bold text-[#0B1B3A]">Упаковка</span>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Наша упаковка</h2>
        <p className="mt-3 max-w-2xl text-[#44506f]">
          [Расскажите, чем особенная ваша упаковка: сохранность блюд, удобство, материалы.]
        </p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {ITEMS.map((it, i) => (
          <Reveal key={it.src} delay={i * 120}>
            <article className="group card-lift overflow-hidden rounded-3xl border-2 border-[#F0E4D3] bg-white">
              <div className={`flex h-64 items-center justify-center p-5 ${it.bg}`}>
                <Photo src={it.src} alt={it.title} />
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{it.title}</h3>
                <p className="mt-1 text-sm text-[#5B6785]">{it.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}