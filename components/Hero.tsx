"use client";

import { useRef, useState } from "react";

function Pack({ src, rot, depth, className }: { src: string; rot: number; depth: number; className: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div className={`pack ${className}`} style={{ "--d": depth } as React.CSSProperties}>
      <div style={{ transform: `rotate(${rot}deg)` }}>
        <div className="float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" onError={() => setOk(false)} className="w-full drop-shadow-[0_28px_30px_rgba(11,27,58,0.28)]" />
        </div>
      </div>
    </div>
  );
}

function Chip({ text, color, depth, className }: { text: string; color: string; depth: number; className: string }) {
  return (
    <div className={`pack ${className}`} style={{ "--d": depth } as React.CSSProperties}>
      <div className="float" style={{ animationDelay: `${depth / 40}s` }}>
        <span className={`block rounded-full px-4 py-2 text-sm font-bold text-[#0B1B3A] shadow-lg ${color}`}>{text}</span>
      </div>
    </div>
  );
}

const WORDS = ["Рацион", "под", "вашу", "цель", "на", "всю", "неделю"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
  };

  return (
    <section ref={ref} onMouseMove={onMove} className="relative overflow-hidden bg-gradient-to-b from-[#FFEBD0] to-[#FFFAF3]">
      <div className="blob" aria-hidden="true" style={{ width: 380, height: 380, left: "-6%", top: "-10%", background: "#FF8A3D" }} />
      <div className="blob blob2" aria-hidden="true" style={{ width: 340, height: 340, right: "-5%", top: "10%", background: "#FFD24D" }} />
      <div className="blob" aria-hidden="true" style={{ width: 300, height: 300, left: "35%", bottom: "-12%", background: "#5BC0FF" }} />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div>
          <div className="hero-word inline-flex items-center gap-2 rounded-full bg-[#0B1B3A] px-4 py-1.5 text-sm font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-lime-300" />
            ВАКУУМ · О нас
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.12] md:text-5xl">
            {WORDS.map((w, i) => (
              <span
                key={w + i}
                className={`hero-word mr-3 inline-block ${w === "цель" ? "mark" : ""}`}
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                {w}
              </span>
            ))}
          </h1>

          <p className="hero-word mt-6 max-w-md text-lg text-[#44506f]" style={{ animationDelay: "0.95s" }}>
            Мы готовим сбалансированные рационы из свежих продуктов и привозим их к вашей двери.
            Меню составляет нутрициолог, а за вкус отвечает шеф-повар.
          </p>

          <div className="hero-word mt-8 flex flex-wrap gap-3" style={{ animationDelay: "1.1s" }}>
            <a href="#calc" className="rounded-full bg-orange-400 px-7 py-3.5 font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/60 transition hover:-translate-y-0.5 hover:bg-orange-300">
              Подобрать рацион
            </a>
            <a href="#packaging" className="rounded-full border-2 border-[#0B1B3A] px-7 py-3.5 font-bold text-[#0B1B3A] transition hover:bg-[#0B1B3A] hover:text-white">
              Наша упаковка
            </a>
          </div>
        </div>

        <div className="relative mx-auto h-[340px] w-full max-w-md md:h-[460px]">
          <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-orange-300 to-amber-200" aria-hidden="true" />
          <Pack src="/packaging/1.png" rot={-8} depth={50} className="left-[2%] top-[6%] w-[56%]" />
          <Pack src="/packaging/2.png" rot={9} depth={80} className="bottom-[2%] right-0 w-[50%]" />
          <Chip text="Считаем КБЖУ" color="bg-amber-300" depth={110} className="left-0 top-[2%]" />
          <Chip text="Фильтр аллергенов" color="bg-lime-300" depth={70} className="right-0 top-[40%]" />
          <Chip text="Доставка к утру" color="bg-sky-300" depth={95} className="bottom-[4%] left-[4%]" />
        </div>
      </div>
    </section>
  );
}