"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "up" | "left" | "right" | "scale" | "fade";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  variant?: Variant;
};

/** Scroll-triggered entrance — stronger motion so it’s clearly visible. */
export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  variant = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    // If already on screen at mount (above fold), reveal immediately after paint
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      const t = window.setTimeout(() => setVisible(true), 40 + delay);
      return () => window.clearTimeout(t);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, delay]);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      className={cn("motion-reveal", `motion-${variant}`, visible && "motion-in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
