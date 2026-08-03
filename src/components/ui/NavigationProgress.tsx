"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/** Copper top bar during in-app navigations. */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const stop = useCallback(() => {
    setActive(false);
    const t = setTimeout(() => setVisible(false), 280);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return stop();
  }, [pathname, searchParams, stop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }

      setVisible(true);
      setActive(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[220] h-[3px] overflow-hidden"
      aria-hidden
    >
      <div
        className={cn(
          "h-full origin-right bg-[linear-gradient(90deg,var(--copper-light),var(--copper),var(--copper-deep))] transition-opacity duration-300",
          active ? "w-full animate-[nav-progress_1.1s_ease-in-out_infinite]" : "w-full opacity-0",
        )}
      />
    </div>
  );
}
