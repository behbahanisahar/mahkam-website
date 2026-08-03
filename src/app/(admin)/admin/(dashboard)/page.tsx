import Link from "next/link";
import {
  Package,
  Folders,
  LineChart,
  Eye,
  Plus,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { formatNumberFa } from "@/lib/i18n/fa";
import { getAdminPopularitySummary } from "@/lib/products/popularity";

export default async function AdminDashboard() {
  const emptyPopularity = { allTime: [] as Awaited<ReturnType<typeof getAdminPopularitySummary>>["allTime"] };

  const [products, published, categories, dollarCount, popularity, totalViews, drafts] =
    await withDbTimeout(
      Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isPublished: true } }),
        prisma.category.count(),
        prisma.dollarDaily.count(),
        getAdminPopularitySummary(5),
        prisma.productView.count(),
        prisma.product.count({ where: { isPublished: false } }),
      ]),
      5_000,
      [0, 0, 0, 0, emptyPopularity, 0, 0],
    );

  const stats = [
    {
      label: "کل محصولات",
      value: products,
      href: "/admin/products",
      icon: Package,
      tone: "bg-copper/12 text-copper",
    },
    {
      label: "منتشرشده",
      value: published,
      href: "/admin/products",
      icon: Eye,
      tone: "bg-emerald-500/12 text-emerald-800",
    },
    {
      label: "پیش‌نویس",
      value: drafts,
      href: "/admin/products",
      icon: Package,
      tone: "bg-amber-500/12 text-amber-800",
    },
    {
      label: "دسته‌ها",
      value: categories,
      href: "/admin/categories",
      icon: Folders,
      tone: "bg-surface/8 text-ink",
    },
    {
      label: "روزهای دلار",
      value: dollarCount,
      href: "/admin/prices",
      icon: LineChart,
      tone: "bg-sky-500/12 text-sky-800",
    },
    {
      label: "کل تعامل",
      value: totalViews,
      href: "/admin/products",
      icon: TrendingUp,
      tone: "bg-copper/12 text-copper-deep",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-copper">خوش آمدید</p>
          <h1 className="brand-display mt-1 text-2xl font-bold sm:text-3xl">داشبورد</h1>
          <p className="mt-1 text-sm text-muted">مدیریت کاتالوگ، نرخ‌ها و تنظیمات مهکام</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-copper inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="size-4" />
          محصول جدید
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-glass-border/80 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-copper/35 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">{c.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{formatNumberFa(c.value)}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${c.tone}`}>
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-copper opacity-0 transition group-hover:opacity-100">
                مشاهده
                <ArrowLeft className="size-3.5" />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-glass-border/80 bg-white/70 p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">پربازدیدترین محصولات</h2>
            <Link href="/admin/products" className="text-xs text-copper hover:underline">
              مدیریت
            </Link>
          </div>
          {popularity.allTime.length === 0 ? (
            <p className="mt-6 text-sm text-muted">هنوز تعاملی ثبت نشده است.</p>
          ) : (
            <ul className="mt-4 divide-y divide-glass-border/70">
              {popularity.allTime.map((row, i) => (
                <li key={row.product?.id ?? i} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-copper/15 text-xs font-bold text-copper">
                      {formatNumberFa(i + 1)}
                    </span>
                    <span className="truncate font-medium">{row.product?.nameFa ?? "—"}</span>
                  </div>
                  <span className="shrink-0 text-muted">{formatNumberFa(row.views)} تعامل</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-ink p-5 text-bg shadow-md lg:col-span-2">
          <p className="text-xs font-medium text-copper">دسترسی سریع</p>
          <h2 className="mt-2 font-semibold text-bg">اقدامات پرتکرار</h2>
          <div className="mt-5 space-y-2">
            {[
              { href: "/admin/products/new", label: "افزودن محصول" },
              { href: "/admin/categories", label: "مدیریت دسته‌ها" },
              { href: "/admin/prices", label: "ثبت نرخ دلار" },
              { href: "/admin/settings", label: "تنظیمات سایت" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-bg transition hover:border-copper/40 hover:bg-copper/15"
              >
                {a.label}
                <ArrowLeft className="size-4 text-copper" />
              </Link>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-bg/65">
            قیمت فروش فقط از طریق کانال تلگرام اعلام می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
