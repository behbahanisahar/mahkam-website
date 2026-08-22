import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { TelegramIcon } from "@/components/site/TelegramIcon";
import { formatNumberFa, toPersianDigits } from "@/lib/i18n/fa";
import { getSiteSettings } from "@/lib/settings";
import { getTelegramHandleLabel } from "@/lib/site";
import { SITE_PAGE_META } from "@/lib/seo/site-pages";

export const metadata: Metadata = SITE_PAGE_META.about;

/** Marketing page — long ISR; settings via unstable_cache. */
export const revalidate = 3600;

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "کیفیت ساخت",
    body: "کنترل فرآیند تولید و توجه به استانداردهای ملی و بین‌المللی در هر محصول.",
  },
  {
    icon: ClipboardList,
    title: "شفافیت فنی",
    body: "جزئیات مقطع، هادی، ولتاژ و کاربرد در صفحه هر محصول، بدون ابهام.",
  },
  {
    icon: Building2,
    title: "پشتیبانی مستقیم",
    body: "استعلام قیمت و سفارش از کانال رسمی تلگرام، سریع و شفاف.",
  },
] as const;

const FOCUS = [
  { title: "سیم افشان و ساختمانی", desc: "مناسب تأسیسات ساختمانی و پروژه‌های روزمره" },
  { title: "کابل قدرت", desc: "انتقال مطمئن جریان در شبکه‌های صنعتی و ساختمانی" },
  { title: "کنترل و مخابراتی", desc: "سیگنال‌رسانی دقیق برای سیستم‌های کنترل و ارتباط" },
] as const;

const STEPS = [
  { n: 1, t: "مشاهده کاتالوگ", d: "مشخصات فنی را در وب‌سایت بررسی کنید." },
  { n: 2, t: "استعلام قیمت", d: "قیمت روز فقط از کانال تلگرام اعلام می‌شود." },
  { n: 3, t: "سفارش", d: "با پشتیبانی مهکام هماهنگی تحویل را نهایی کنید." },
] as const;

const DEFAULT_ABOUT_HTML = `
  <p>شرکت <strong>گسترش سیم و کابل مهکام</strong> فعالیت خود را با هدف تولید و عرضه محصولات باکیفیت در حوزه سیم و کابل برق آغاز کرده است. تمرکز ما بر استانداردهای فنی، شفافیت مشخصات و ارتباط مستقیم با مشتریان است.</p>
  <p class="mt-4">در مهکام باور داریم خرید سیم و کابل نباید با حدس و گمان همراه باشد؛ به همین دلیل مشخصات هر محصول را کامل منتشر می‌کنیم و قیمت روز را فقط از مسیر رسمی تلگرام اعلام می‌نماییم.</p>
`;

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const phone = settings.phones[0] ?? "02166349014";
  const telHref = `tel:${phone.replace(/\D/g, "")}`;
  const blurb =
    settings.companyBlurb ??
    "تولید و عرضه سیم و کابل با کیفیت پایدار، مشخصات فنی شفاف و پشتیبانی مستقیم.";

  return (
    <>
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
            <Building2 className="size-3.5" />
            درباره مهکام
          </p>
          <h1 className="brand-display mt-3 max-w-2xl text-3xl font-extrabold leading-[1.2] sm:text-5xl">
            درباره ما
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/65 sm:text-base">{blurb}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
        <div className="space-y-5 lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)] sm:p-8">
            <p className="text-xs font-bold tracking-[0.14em] text-copper">داستان ما</p>
            <h2 className="brand-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">چرا مهکام؟</h2>
            <div
              className="mt-5 space-y-4 text-sm leading-8 text-ink/85 sm:text-[15px]"
              dangerouslySetInnerHTML={{
                __html: settings.aboutHtml ?? DEFAULT_ABOUT_HTML,
              }}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]">
            <div className="border-b border-ink/6 px-5 py-4 sm:px-6">
              <p className="text-xs font-bold tracking-[0.14em] text-copper">تعهدات</p>
              <h2 className="brand-display mt-1 text-xl font-extrabold text-ink">سه ستون کار ما</h2>
            </div>
            <ul className="divide-y divide-ink/6">
              {PILLARS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex items-start gap-4 px-5 py-5 sm:gap-5 sm:px-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-copper">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-copper">
                        {toPersianDigits(String(i + 1).padStart(2, "0"))}
                      </span>
                      <h3 className="text-base font-bold text-ink sm:text-lg">{title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-7 text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
            <p className="text-xs font-bold tracking-[0.14em] text-copper-light">حوزه فعالیت</p>
            <h2 className="brand-display mt-2 text-2xl font-extrabold sm:text-3xl">طیف محصولات</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
              از سیم افشان ساختمانی تا کابل‌های قدرت، کنترل و مخابراتی — کاتالوگ مهکام برای نیازهای
              متنوع پروژه.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
              {FOCUS.map((item, i) => (
                <div
                  key={item.title}
                  className={
                    i > 0
                      ? "border-t border-white/10 pt-5 sm:border-t-0 sm:border-s sm:border-white/10 sm:ps-6 sm:pt-0"
                      : ""
                  }
                >
                  <p className="text-xs font-bold text-copper-light">
                    {toPersianDigits(String(i + 1).padStart(2, "0"))}
                  </p>
                  <h3 className="mt-2 font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.14em] text-copper">مسیر همکاری</p>
            <h2 className="brand-display mt-2 text-xl font-extrabold text-ink sm:text-2xl">
              از کاتالوگ تا سفارش
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="rounded-2xl border border-ink/8 bg-bg/60 px-4 py-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-copper text-sm font-bold text-white">
                    {formatNumberFa(step.n)}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-ink">{step.t}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-muted">{step.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-bold tracking-[0.16em] text-copper">همکاری با مهکام</p>
              <h2 className="brand-display mt-2 text-xl font-extrabold text-ink">آماده شروع هستید؟</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                کاتالوگ را ببینید، نرخ مرجع را چک کنید، یا برای قیمت روز محصولات به تلگرام سر بزنید.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1b8fc7]"
                >
                  <TelegramIcon className="size-4" />
                  <span dir="ltr">{getTelegramHandleLabel()}</span>
                </a>
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink-soft"
                >
                  <Phone className="size-4" />
                  تماس تلفنی
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:border-copper/40 hover:text-copper"
                >
                  کاتالوگ محصولات
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

            <Link
              href="/contact"
              className="group flex items-center justify-between rounded-3xl border border-ink/10 bg-white px-5 py-5 text-ink transition hover:border-copper/30"
            >
              <div>
                <p className="text-[11px] font-bold tracking-wide text-copper">ارتباط</p>
                <p className="mt-1 font-bold">تماس با ما</p>
              </div>
              <ArrowLeft className="size-5 text-copper transition group-hover:-translate-x-1" />
            </Link>

            <Link
              href="/faq"
              className="group flex items-center justify-between rounded-3xl border border-ink/10 bg-white px-5 py-5 text-ink transition hover:border-copper/30"
            >
              <div>
                <p className="text-[11px] font-bold tracking-wide text-copper">راهنما</p>
                <p className="mt-1 font-bold">سوالات متداول</p>
              </div>
              <ArrowLeft className="size-5 text-copper transition group-hover:-translate-x-1" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
