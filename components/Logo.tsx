"use client";

import { useEffect, useRef, useState } from "react";

export const BRAND = "ВАКУУМ";

export default function Logo({ className = "h-10", dark = false }: { className?: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img ref={ref} src="/logo.png" alt={BRAND} className={`w-auto ${className}`} onError={() => setFailed(true)} />
    );
  }

  return (
    <span className="flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${dark ? "bg-white text-sky-950" : "bg-sky-700 text-white"}`}>
        {BRAND[0]}
      </span>
      <span className={`text-lg font-bold tracking-wide ${dark ? "text-white" : "text-sky-900"}`}>{BRAND}</span>
    </span>
  );
}