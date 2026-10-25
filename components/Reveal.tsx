"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    setMode("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMode("shown");
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = mode === "hidden" ? "reveal" : mode === "shown" ? "reveal reveal-in" : "";
  return (
    <div ref={ref} className={`${cls} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}