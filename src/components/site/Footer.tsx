import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { formatPhoneFa } from "@/lib/i18n/fa";
import { getTelegramHandleLabel } from "@/lib/site";

type FooterProps = {
  telegramUrl: string;
  phones?: string[];
  address?: string | null;
};

const NAV_LINKS = [
  { href: "/products", label: "محصولات" },
  { href: "/price-list", label: "لیست قیمت" },
  { href: "/guides", label: "راهنما" },
  { href: "/prices", label: "نرخ‌ها" },
  { href: "/faq", label: "سوالات متداول" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
] as const;

export function Footer({ telegramUrl, phones = [], address }: FooterProps) {
  const primaryPhone = phones[0];

  return (
    <footer className="relative z-10 mt-auto border-t border-white/8 bg-ink text-white">
      {/* Mobile-first compact layout */}
      <div className="mx-auto max-w-7xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-10 sm:px-6 lg:hidden">
        <div className="flex flex-col items-center text-center">
          <Logo variant="light" imageClassName="h-11 w-auto max-w-[140px]" />
          <p className="mt-3 max-w-sm text-[13px] leading-7 text-white/55">
            تولید و عرضه سیم و کابل با کیفیت پایدار و پشتیبانی حرفه‌ای
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {primaryPhone ? (
            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-copper px-3 py-3.5 text-sm font-bold text-white shadow-md shadow-copper/25 active:scale-[0.98]"
            >
              <Phone className="size-4 shrink-0" />
              تماس
            </a>
          ) : (
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-copper px-3 py-3.5 text-sm font-bold text-white shadow-md shadow-copper/25 active:scale-[0.98]"
            >
              <Phone className="size-4 shrink-0" />
              تماس
            </Link>
          )}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-3 py-3.5 text-sm font-bold text-white shadow-md shadow-[#229ED9]/30 active:scale-[0.98]"
          >
            <Send className="size-4 shrink-0" />
            تلگرام
          </a>
        </div>

        <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="دسترسی سریع">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/75 transition active:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {address ? (
          <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-start">
            <MapPin className="mt-0.5 size-4 shrink-0 text-copper" />
            <p className="text-[13px] leading-7 text-white/65">{address}</p>
          </div>
        ) : null}

        <p className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] leading-6 text-white/35">
          © تمامی حقوق برای گسترش سیم و کابل مهکام محفوظ است.
        </p>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl gap-10 px-6 py-14 lg:grid lg:grid-cols-4 lg:px-8 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo variant="light" imageClassName="h-12 w-auto max-w-[160px]" />
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
            گسترش سیم و کابل مهکام — تولید و عرضه با کیفیت پایدار و پشتیبانی حرفه‌ای.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="inline-flex items-center gap-2 rounded-full bg-copper px-4 py-2 text-xs font-bold text-white"
              >
                <Phone className="size-3.5" />
                تماس سریع
              </a>
            ) : null}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-xs font-bold text-white"
            >
              <Send className="size-3.5" />
              تلگرام
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-wide text-copper">دسترسی</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-wide text-copper">ارتباط</p>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {primaryPhone ? (
              <li>
                <a
                  href={`tel:${primaryPhone}`}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Phone className="size-4 text-copper" />
                  <span dir="ltr">{formatPhoneFa(primaryPhone)}</span>
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Send className="size-4 text-[#229ED9]" />
                <span dir="ltr">{getTelegramHandleLabel()}</span>
              </a>
            </li>
            <li>
              <Link href="/contact" className="inline-flex items-center gap-2 transition hover:text-white">
                <Mail className="size-4 text-copper" />
                فرم تماس
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-wide text-copper">آدرس</p>
          {address ? (
            <p className="mt-4 text-sm leading-7 text-white/70">{address}</p>
          ) : (
            <p className="mt-4 text-sm leading-7 text-white/70">
              تهران — برای جزئیات به صفحه تماس مراجعه کنید.
            </p>
          )}
        </div>
      </div>

      <div className="hidden border-t border-white/10 py-4 text-center text-xs text-white/40 lg:block">
        © تمامی حقوق برای شرکت گسترش سیم و کابل مهکام محفوظ است.
      </div>
    </footer>
  );
}
