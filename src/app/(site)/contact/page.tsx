import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, Navigation, Phone } from "lucide-react";
import { ContactMap } from "@/components/site/ContactMap";
import { TelegramIcon } from "@/components/site/TelegramIcon";
import { formatPhoneFa, toPersianDigits } from "@/lib/i18n/fa";
import { getSiteSettings } from "@/lib/settings";
import { getTelegramHandleLabel } from "@/lib/site";
import { SITE_PAGE_META } from "@/lib/seo/site-pages";

export const metadata: Metadata = SITE_PAGE_META.contact;

export const revalidate = 3600;

const DEFAULT_ADDRESS =
  "تهران، خیابان لاله‌زار نو، کوچه معمار مخصوص، پاساژ چلچراغ، طبقه ۴، واحد ۱۰";
/** پاساژ چلچراغ (Balad) — exact building pin */
const DEFAULT_MAP = { lat: 35.700348, lng: 51.42455 } as const;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phones = settings.phones.length > 0 ? settings.phones : ["02166349014"];
  const primaryPhone = phones[0]!;
  const address = settings.address?.trim() || DEFAULT_ADDRESS;
  const mapLat = settings.mapLat ?? DEFAULT_MAP.lat;
  const mapLng = settings.mapLng ?? DEFAULT_MAP.lng;
  const mapQuery = address;
  const directionsHref = `https://www.google.com/maps?q=${mapLat},${mapLng}`;
  const telHref = `tel:${primaryPhone.replace(/\D/g, "")}`;

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
            <Phone className="size-3.5" />
            ارتباط با مهکام
          </p>
          <h1 className="brand-display mt-3 max-w-2xl text-3xl font-extrabold leading-[1.2] sm:text-5xl">
            تماس با ما
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/65 sm:text-base">
            برای استعلام قیمت، پیش‌فاکتور و مراجعه حضوری از تلفن، تلگرام یا آدرس دفتر فروش استفاده
            کنید.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
        <div className="space-y-5 lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]">
            <div className="border-b border-ink/6 px-5 py-4 sm:px-6">
              <p className="text-xs font-bold tracking-[0.14em] text-copper">دفتر فروش</p>
              <h2 className="brand-display mt-1 text-xl font-extrabold text-ink">آدرس و نقشه</h2>
            </div>

            <div className="flex items-start gap-3 border-b border-ink/6 px-5 py-5 sm:px-6">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-copper/10 text-copper">
                <MapPin className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-8 text-ink sm:text-base sm:leading-8">{address}</p>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper-deep"
                >
                  <Navigation className="size-3.5" />
                  مشاهده مسیر
                </a>
              </div>
            </div>

            <ContactMap
              embedded
              lat={mapLat}
              lng={mapLng}
              address={address}
              query={mapQuery}
              zoom={17}
              className="relative h-64 w-full sm:h-[380px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-ink/8 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-ink text-white">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-muted">تلفن</p>
                  <p className="text-sm font-bold text-ink">تماس مستقیم</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {phones.map((p) => (
                  <li key={p}>
                    <a
                      href={`tel:${p.replace(/\D/g, "")}`}
                      className="brand-display text-xl font-extrabold tracking-wide text-ink transition hover:text-copper sm:text-2xl"
                      dir="ltr"
                    >
                      {formatPhoneFa(p)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-ink/8 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-copper/15 text-copper">
                  <Clock3 className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-muted">ساعات کاری</p>
                  <p className="text-sm font-bold text-ink">دفتر فروش</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm leading-7 text-ink">
                <div className="flex items-center justify-between gap-4 border-b border-ink/6 pb-3">
                  <dt className="text-muted">شنبه تا چهارشنبه</dt>
                  <dd className="font-semibold" dir="ltr">
                    {toPersianDigits("9:00")} – {toPersianDigits("17:00")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">پنج‌شنبه</dt>
                  <dd className="font-semibold" dir="ltr">
                    {toPersianDigits("9:00")} – {toPersianDigits("13:00")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {settings.contactHtml ? (
            <div
              className="rounded-3xl border border-ink/8 bg-white p-5 text-sm leading-8 text-ink/85 sm:p-6"
              dangerouslySetInnerHTML={{ __html: settings.contactHtml }}
            />
          ) : null}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-bold tracking-[0.16em] text-copper">راه‌های سریع</p>
              <h2 className="brand-display mt-2 text-xl font-extrabold text-ink">همین حالا ارتباط بگیرید</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                قیمت روز محصولات فقط از کانال تلگرام اعلام می‌شود؛ برای هماهنگی سفارش با تلفن تماس
                بگیرید.
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
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:border-copper/40 hover:text-copper"
                >
                  مسیر روی نقشه
                  <ArrowLeft className="size-4" />
                </a>
              </div>
            </div>

            <Link
              href="/faq"
              className="group flex items-center justify-between rounded-3xl bg-copper px-5 py-5 text-white transition hover:bg-copper-deep"
            >
              <div>
                <p className="text-[11px] font-bold tracking-wide text-white/75">راهنما</p>
                <p className="mt-1 font-bold">سوالات متداول</p>
              </div>
              <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
            </Link>

            <Link
              href="/prices"
              className="group flex items-center justify-between rounded-3xl border border-ink/10 bg-white px-5 py-5 text-ink transition hover:border-copper/30"
            >
              <div>
                <p className="text-[11px] font-bold tracking-wide text-copper">تابلوی نرخ</p>
                <p className="mt-1 font-bold">نرخ لحظه‌ای دلار و فلزات</p>
              </div>
              <ArrowLeft className="size-5 text-copper transition group-hover:-translate-x-1" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
