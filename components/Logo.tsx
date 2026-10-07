"use client";

import { useEffect, useRef, useState } from "react";

export const BRAND = "Зелёная неделя"; // поменяйте на своё название

export default function Logo({ className = "h-10" }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src="/logo.png"
        alt={BRAND}
        className={`w-auto ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-lg font-bold text-white">
        {BRAND[0]}
      </span>
      <span className="text-lg font-bold text-sky-900">{BRAND}</span>
    </span>
  );
}
