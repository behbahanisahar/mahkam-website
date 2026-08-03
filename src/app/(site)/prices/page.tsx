import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { LivePricesStrip } from "@/components/prices/LivePricesStrip";
import { DollarHistoryLookup } from "@/components/prices/DollarHistoryLookup";
import { SiteContainer } from "@/components/site/SiteContainer";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { formatNumberFa, formatRial, toPersianDigits } from "@/lib/i18n/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "نرخ دلار، مس و آلومینیوم",
  description:
    "مشاهده نرخ لحظه‌ای دلار، مس و آلومینیوم از لایودیتا و جستجوی قیمت تاریخی دلار بر اساس تاریخ شمسی.",
  alternates: { canonical: "/prices" },
};

export const revalidate = 300;

async function RecentDollarArchive() {
  let recent: Awaited<ReturnType<typeof prisma.dollarDaily.findMany>> = [];
  let dbError = false;

  try {
    recent = await withDbTimeout(
      prisma.dollarDaily.findMany({
        orderBy: { date: "desc" },
        take: 10,
      }),
      2_500,
      [],
    );
  } catch {
    dbError = true;
  }
  return (
    <section className="ui-card overflow-hidden">
      <div className="border-b border-glass-border px-5 py-4">
        <h2 className="font-semibold text-ink">آخرین روزهای ثبت‌شده دلار</h2>
      </div>
      {dbError ? (
        <p className="p-5 text-sm leading-7 text-muted">
          ارتباط با پایگاه داده برقرار نشد. نرخ‌های لحظه‌ای بالا همچنان از لایودیتا در دسترس است.
        </p>
      ) : recent.length === 0 ? (
        <p className="p-5 text-sm text-muted">
          هنوز آرشیوی همگام نشده است یا دیتابیس پاسخ نداد. همگام‌سازی ادمین را اجرا کنید.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-bg-alt text-right">
              <tr>
                <th className="px-4 py-3 font-medium">تاریخ شمسی</th>
                <th className="px-4 py-3 font-medium">پایانی</th>
                <th className="px-4 py-3 font-medium">کمینه</th>
                <th className="px-4 py-3 font-medium">بیشینه</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-glass-border">
                  <td className="px-4 py-3">{toPersianDigits(r.dateJalali)}</td>
                  <td className="px-4 py-3 font-medium">{formatRial(r.close)}</td>
                  <td className="px-4 py-3 text-muted">
                    {r.low != null ? formatNumberFa(r.low) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.high != null ? formatNumberFa(r.high) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function PricesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-0">
      <LivePricesStrip showDetailsLink={false} />

      <SiteContainer className="space-y-8 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-4 rounded-3xl border border-ink/8 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-copper">قیمت محصول</p>
            <h2 className="brand-display mt-2 text-xl font-extrabold text-ink sm:text-2xl">
              نرخ سیم و کابل فقط از تلگرام
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
              تابلوی بالا نرخ مرجع بازار است؛ لیست قیمت محصولات مهکام هر روز در کانال رسمی اعلام
              می‌شود.
            </p>
          </div>
          <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b8fc7]"
          >
            <Send className="size-4" />
            کانال تلگرام
            <ArrowLeft className="size-4" />
          </a>
        </div>

        <DollarHistoryLookup />

        <Suspense
          fallback={
            <div className="ui-card p-5">
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>
          }
        >
          <RecentDollarArchive />
        </Suspense>

        <p className="text-center text-sm text-muted">
          سوال دارید؟{" "}
          <Link href="/faq" className="font-semibold text-copper hover:underline">
            سوالات متداول
          </Link>
        </p>
      </SiteContainer>
    </div>
  );
}
