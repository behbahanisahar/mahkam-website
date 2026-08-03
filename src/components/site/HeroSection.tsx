import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TelegramIcon } from "@/components/site/TelegramIcon";

export const HERO_IMAGES = {
  factoryDesk: "/images/section-hero.jpg",
  factoryMobile: "/images/section-hero.jpg",
  crossSection: "/images/section-cable-cross.jpg",
  conduit: "/images/section-conduit.jpg",
  cool: "/images/section-infra.jpg",
} as const;

type Props = {
  telegramUrl: string;
};

export function HeroSection({ telegramUrl }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGES.factoryDesk}
          alt="تولید سیم و کابل صنعتی مهکام"
          fill
          priority
          fetchPriority="high"
          className="hero-kenburns object-cover object-[50%_40%]"
          sizes="100vw"
        />
        {/* Soft dark scrim only — no white fade; photo stays vivid */}
        <div className="absolute inset-0 bg-gradient-to-l from-ink/80 via-ink/45 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/25" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[480px] max-w-7xl flex-col justify-center px-4 pb-12 pt-28 sm:min-h-[540px] sm:px-6 sm:pb-14 sm:pt-32 lg:min-h-[600px] lg:px-8 lg:pb-16 lg:pt-36">
        <p className="animate-fade-up text-xs font-bold text-copper-light sm:text-[13px]">
          گسترش سیم و کابل مهکام
        </p>

        <h1 className="brand-display animate-fade-up mt-3 whitespace-nowrap text-[1.65rem] font-extrabold leading-none text-white sm:text-4xl lg:text-5xl">
          سیم و کابل با کیفیت پایدار
        </h1>

        <div className="animate-hero-rule mt-4 h-[3px] w-14 bg-copper sm:w-16" aria-hidden />

        <p className="animate-fade-up-delay mt-4 max-w-md text-sm leading-7 text-white/75 sm:text-[15px] sm:leading-8">
          افشان، قدرت و کنترل — قیمت روز از تلگرام مهکام.
        </p>

        <div className="animate-fade-up-delay-2 mt-7 flex flex-wrap items-center gap-2.5">
          <Link
            href="/products"
            className="btn-copper btn-modern inline-flex items-center gap-2 whitespace-nowrap px-5 py-3 text-sm font-bold"
          >
            کاتالوگ محصولات
            <ArrowLeft className="size-4 shrink-0" />
          </Link>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-modern inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#229ED9] px-5 py-3 text-sm font-bold text-white hover:bg-[#1b8fc7]"
          >
            <TelegramIcon className="size-4 shrink-0" />
            قیمت در تلگرام
          </a>
        </div>
      </div>
    </section>
  );
}
