"use client";

import { useEffect, useState } from "react";

/** Colored copper reading progress along the top edge while scrolling. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      setProgress(next);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[210] h-[3px] overflow-hidden bg-ink/5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="پیشرفت اسکرول صفحه"
    >
      <div
        className="h-full origin-right bg-[linear-gradient(90deg,var(--copper-light),var(--copper),var(--copper-deep))] transition-[transform] duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
