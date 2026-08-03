"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumberFa } from "@/lib/i18n/fa";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
  durationMs?: number;
  /** Prefix/suffix around the number */
  suffix?: string;
  prefix?: string;
};

/** Counts up when scrolled into view. */
export function AnimatedCounter({
  value,
  className,
  durationMs = 1100,
  suffix = "",
  prefix = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const from = 0;
    const to = value;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, durationMs]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatNumberFa(display)}
      {suffix}
    </span>
  );
}
