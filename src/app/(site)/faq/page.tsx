import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Phone } from "lucide-react";
import { FaqAccordion, FaqJsonLd } from "@/components/site/FaqAccordion";
import { TelegramIcon } from "@/components/site/TelegramIcon";
import { SITE_FAQS } from "@/lib/content/faq";
import { formatNumberFa } from "@/lib/i18n/fa";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description:
    "پاسخ پرسش‌های رایج درباره قیمت روز، حداقل سفارش، مراجعه حضوری، تحویل و مشخصات فنی محصولات مهکام.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const settings = await getSiteSettings();
  const phone = settings.phones[0] ?? "02166349014";
  const telHref = `tel:${phone.replace(/\D/g, "")}`;

  return (
    <>
      <FaqJsonLd />

      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 80% at 85% 20%, color-mix(in srgb, var(--copper) 40%, transparent), transparent 55%),
              radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in srgb, #229ED9 18%, transparent), transparent 50%)
            `,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-copper-light">
            <HelpCircle className="size-3.5" />
            راهنما
          </p>
          <h1 className="brand-display mt-3 max-w-2xl text-3xl font-extrabold leading-[1.2] sm:text-5xl">
            سوالات متداول
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/65 sm:text-base">
            پاسخ سریع به {formatNumberFa(SITE_FAQS.length)} پرسش پرتکرار درباره قیمت، سفارش و مراجعه.
            جستجو کنید یا یکی را باز کنید.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
        <div className="lg:col-span-8">
          <FaqAccordion />
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-bold tracking-[0.16em] text-copper">هنوز سوال دارید؟</p>
              <h2 className="brand-display mt-2 text-xl font-extrabold text-ink">با فروش مهکام صحبت کنید</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                برای استعلام قیمت روز، پیش‌فاکتور و هماهنگی سفارش از تلگرام یا تلفن استفاده کنید.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1b8fc7]"
                >
                  <TelegramIcon className="size-4" />
                  کانال تلگرام
                </a>
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink-soft"
                >
                  <Phone className="size-4" />
                  تماس تلفنی
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:border-copper/40 hover:text-copper"
                >
                  صفحه تماس
                  <ArrowLeft className="size-4" />
                </Link>
              </div>
            </div>

            <Link
              href="/prices"
              className="group flex items-center justify-between rounded-3xl bg-copper px-5 py-5 text-white transition hover:bg-copper-deep"
            >
              <div>
                <p className="text-[11px] font-bold tracking-wide text-white/75">تابلوی نرخ</p>
                <p className="mt-1 font-bold">نرخ لحظه‌ای دلار و فلزات</p>
              </div>
              <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
