import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TelegramIcon } from "@/components/site/TelegramIcon";

export const HERO_IMAGES = {
  factoryDesk: "/images/hero-rooftop-hq.webp",
  factoryMobile: "/images/hero-rooftop-hq-mobile.webp",
  crossSection: "/images/section-cable-cross.jpg",
  conduit: "/images/section-conduit.jpg",
  cool: "/images/section-infra.jpg",
} as const;

type Props = {
  telegramUrl: string;
};

/**
 * Compact first-viewport hero.
 * Brand + headline on the image (RTL start = right).
 * Support copy + CTAs in the white L-cut pocket.
 */
export function HeroSection({ telegramUrl }: Props) {
  return (
    <section className="bg-[#f3f2ef] pt-4 pb-5 sm:pt-5 sm:pb-6 lg:pt-6 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-nilsson">
          <div className="hero-nilsson-media">
            <Image
              src={HERO_IMAGES.factoryDesk}
              alt="تأسیسات برق و کابل صنعتی مهکام"
              fill
              priority
              fetchPriority="high"
              quality={92}
              className="hidden object-cover object-[55%_38%] lg:block"
              sizes="100vw"
            />
            <Image
              src={HERO_IMAGES.factoryMobile}
              alt="تأسیسات برق و کابل صنعتی مهکام"
              fill
              priority
              fetchPriority="high"
              quality={90}
              className="object-cover object-[48%_36%] lg:hidden"
              sizes="100vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent via-black/10 to-black/55 lg:block" />
          </div>

          {/* RTL: titles on the right (inline-start), outside mask */}
          <div className="hero-nilsson-title">
            <p className="hero-title-shadow animate-fade-up text-[11px] font-bold tracking-[0.14em] text-copper-light sm:text-xs">
              گسترش سیم و کابل مهکام
            </p>
            <h1 className="brand-display hero-title-shadow animate-fade-up mt-1.5 text-[1.55rem] font-extrabold leading-[1.15] text-white sm:text-[2rem] lg:text-[2.35rem] xl:text-[2.55rem]">
              سیم و کابل با کیفیت پایدار
            </h1>
          </div>

          <div className="hero-nilsson-copy">
            <p className="animate-fade-up-delay text-[13px] leading-6 text-neutral-600 sm:text-sm sm:leading-7">
              افشان، قدرت و کنترل — مشخصات فنی شفاف و استعلام قیمت روز از کانال رسمی تلگرام مهکام.
            </p>
            <div className="animate-fade-up-delay-2 mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/products"
                className="btn-copper btn-modern inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-bold"
              >
                کاتالوگ محصولات
                <ArrowLeft className="size-4 shrink-0" />
              </Link>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modern inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#229ED9] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1b8fc7]"
              >
                <TelegramIcon className="size-4 shrink-0" />
                قیمت در تلگرام
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
