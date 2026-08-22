"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { getTelegramHandleLabel } from "@/lib/site";

type Props = {
  href: string;
};

/** Fixed Telegram FAB — spins 2 full turns on every page load. */
export function TelegramFab({ href }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kill any CSS animations that steal `transform`
    el.style.setProperty("animation", "none", "important");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.getAnimations().forEach((a) => a.cancel());

    const anim = el.animate(
      [
        { transform: "rotate(0deg) scale(0.55)" },
        { transform: "rotate(720deg) scale(1.12)", offset: 0.82 },
        { transform: "rotate(720deg) scale(1)" },
      ],
      {
        duration: 1400,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "forwards",
      },
    );

    return () => {
      anim.cancel();
      el.style.removeProperty("transform");
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`کانال تلگرام ${getTelegramHandleLabel()}`}
      className="telegram-fab fixed z-[70] hidden size-14 items-center justify-center rounded-full text-white transition-[background-color,box-shadow] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]/40 focus-visible:ring-offset-2 lg:bottom-8 lg:end-8 lg:flex lg:size-16"
      style={{
        backgroundColor: "#229ED9",
        boxShadow: "0 10px 28px -6px rgba(34, 158, 217, 0.55)",
        animation: "none",
      }}
    >
      <Send className="size-6 sm:size-7" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">تلگرام</span>
    </a>
  );
}
