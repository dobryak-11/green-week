"use client";

import { useState } from "react";

const ITEMS = [
  { src: "/packaging/1.jpg", title: "[Название упаковки 1]", text: "[Короткое описание: чем она удобна и необычна]" },
  { src: "/packaging/2.jpg", title: "[Название упаковки 2]", text: "[Короткое описание]" },
  { src: "/packaging/3.jpg", title: "[Название упаковки 3]", text: "[Короткое описание]" },
];

function Photo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-56 items-center justify-center bg-gradient-to-br from-sky-100 to-sky-300 text-sm font-medium text-sky-900">
        Здесь будет фото упаковки
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-56 w-full object-cover" />
  );
}

export default function Packaging() {
  return (
    <section id="packaging" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <h2 className="mb-2 text-2xl font-bold">Наша упаковка</h2>
      <p className="mb-6 max-w-2xl text-neutral-700">
        [Расскажите, чем особенная ваша упаковка: сохранность блюд, удобство, материалы.]
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {ITEMS.map((it) => (
          <article key={it.src} className="overflow-hidden rounded-2xl border border-sky-200 bg-white">
            <Photo src={it.src} alt={it.title} />
            <div className="p-4">
              <h3 className="font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-neutral-700">{it.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}