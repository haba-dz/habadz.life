"use client";

import { useEffect, useRef, useState } from "react";
import { formatQuantity } from "@/lib/constants";

/**
 * عدّاد يتحرك تصاعديًا عند ظهوره في الشاشة.
 * القيمة النهائية هي الحالة الابتدائية، فيُصيّرها الخادم بشكل صحيح
 * وتبقى ظاهرة لمن عطّل الجافاسكربت أو فعّل تقليل الحركة.
 */
export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;

        const duration = 900;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {formatQuantity(display)}
    </span>
  );
}
