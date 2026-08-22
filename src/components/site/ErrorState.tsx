"use client";

import Link from "next/link";
import { Home, RefreshCw, Package, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

export type ErrorStateProps = {
  code?: string;
  title: string;
  description: string;
  digest?: string;
  /** HTTP-ish code for logging (502, 500, 404…) */
  statusCode?: number;
  source?: "client" | "server" | "gateway" | "unknown";
  reset?: () => void;
  showRetry?: boolean;
  /** When true, report once to /api/errors */
  log?: boolean;
  path?: string;
};

export function ErrorState({
  code = "خطا",
  title,
  description,
  digest,
  statusCode,
  source = "client",
  reset,
  showRetry = true,
  log = true,
  path,
}: ErrorStateProps) {
  const logged = useRef(false);

  useEffect(() => {
    if (!log || logged.current) return;
    logged.current = true;
    const payload = {
      level: statusCode === 502 || statusCode === 503 ? "offline" : "error",
      source,
      statusCode,
      message: `${title}: ${description}`,
      digest,
      path: path || (typeof window !== "undefined" ? window.location.pathname : undefined),
      meta: { code },
    };
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [log, title, description, digest, statusCode, source, code, path]);

  return (
    <div
      dir="rtl"
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(184,149,42,0.12),_transparent_55%),linear-gradient(180deg,#f7f6f4_0%,#eef0f3_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,19,24,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,19,24,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-glass-border bg-white/90 shadow-[0_20px_50px_-28px_rgba(17,19,24,0.45)] backdrop-blur-sm">
          <div className="border-b border-glass-border bg-chrome px-5 py-4 text-white sm:px-7">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-copper-light uppercase">
              مهکام · MAHKAM
            </p>
            <p className="mt-1 text-sm text-white/70">گسترش سیم و کابل</p>
          </div>

          <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
            <p className="brand-display text-5xl font-extrabold tracking-tight text-copper sm:text-6xl">
              {code}
            </p>
            <h1 className="brand-display mt-4 text-xl font-bold text-ink sm:text-2xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted sm:text-[15px]">
              {description}
            </p>
            {digest ? (
              <p className="mt-4 font-mono text-[10px] text-muted/80" dir="ltr">
                ref: {digest}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              {showRetry && reset ? (
                <button
                  type="button"
                  onClick={reset}
                  className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  <RefreshCw className="size-4" />
                  تلاش دوباره
                </button>
              ) : null}
              <Link
                href="/"
                className="btn-ink inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                <Home className="size-4" />
                صفحه اصلی
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted">
              <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-copper">
                <Package className="size-3.5" />
                محصولات
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-1.5 hover:text-copper">
                <Phone className="size-3.5" />
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
