"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Folders,
  LineChart,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/SubmitButton";

const nav = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته‌ها", icon: Folders },
  { href: "/admin/prices", label: "نرخ‌ها", icon: LineChart },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  email,
  logoutAction,
  children,
}: {
  email?: string | null;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((n) => {
        const active = isActive(pathname, n.href, n.exact);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-copper text-white shadow-md shadow-copper/25"
                : "text-ink/80 hover:bg-accent/10 hover:text-ink",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {n.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface/5"
      >
        <ExternalLink className="size-[18px] shrink-0" />
        مشاهده سایت
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg-muted text-ink">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-glass-border/70 bg-bg/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo imageClassName="h-9 w-auto max-w-[110px]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">پنل مهکام</p>
              <p className="truncate text-[11px] text-muted">{email}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl bg-surface/5 p-2.5 text-ink"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-glass-border/60 px-3 py-3">
            <NavLinks onNavigate={() => setOpen(false)} />
            <form action={logoutAction} className="mt-3">
              <SubmitButton
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm text-bg"
                pendingLabel="خروج…"
              >
                <LogOut className="size-4" />
                خروج
              </SubmitButton>
            </form>
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        {/* Desktop sidebar */}
        <aside className="m-4 hidden w-60 shrink-0 flex-col rounded-3xl border border-glass-border/80 bg-white/70 p-4 shadow-sm backdrop-blur md:flex">
          <Logo imageClassName="h-11 w-auto max-w-[140px]" />
          <p className="brand-display mt-3 text-sm font-bold">پنل مهکام</p>
          <p className="mt-1 truncate text-xs text-muted">{email}</p>
          <div className="mt-5 flex-1">
            <NavLinks />
          </div>
          <form action={logoutAction} className="mt-4">
            <SubmitButton
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm text-bg transition hover:bg-ink/90"
              pendingLabel="خروج…"
            >
              <LogOut className="size-4" />
              خروج
            </SubmitButton>
          </form>
        </aside>

        <main className="flex-1 px-4 pb-28 pt-4 md:px-6 md:pb-8 md:pt-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-glass-border/80 bg-bg/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
          {nav.map((n) => {
            const active = isActive(pathname, n.href, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium",
                  active ? "text-copper" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    active ? "bg-accent/15" : "bg-transparent",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
