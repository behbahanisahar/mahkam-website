import Image from "next/image";
import Link from "next/link";

export const HERO_IMAGES = {
  factoryDesk: "/images/hero-shining-night-1920.webp",
  /** Lighter master for future art-direction; homepage uses the 1920 via Next sizes. */
  factoryMobile: "/images/hero-shining-night-1080.webp",
  crossSection: "/images/section-cable-cross.jpg",
  conduit: "/images/section-conduit.jpg",
  cool: "/images/section-infra.jpg",
} as const;

type Props = {
  telegramUrl: string;
};

/** SHINING-style full-bleed industrial hero (matched to reference layout). */
export function HeroSection({ telegramUrl: _telegramUrl }: Props) {
  return (
    <section className="shining-hero relative z-[1] overflow-hidden bg-[#0b1220] text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGES.factoryDesk}
          alt="تأسیسات صنعتی سیم و کابل مهکام"
          fill
          priority
          fetchPriority="high"
          quality={75}
          className="object-cover object-[62%_45%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-black/40" />
      </div>

      {/* برچسب عمودی چپ */}
      <p className="pointer-events-none absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 text-[11px] font-semibold tracking-[0.35em] text-white/55 [writing-mode:vertical-rl] rotate-180 lg:left-6 lg:block xl:left-10">
        کیفیت پایدار
      </p>

      {/* درباره ما — فارسی، وسط ارتفاع تا زیر عکس درباره نرود */}
      <Link
        href="#about"
        className="group absolute top-[42%] right-4 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:right-8 lg:flex xl:right-12"
        aria-label="درباره مهکام"
      >
        <span className="flex size-[4.25rem] items-center justify-center rounded-full border-[1.5px] border-[#ff6b00] text-base font-semibold text-[#ff6b00] transition group-hover:bg-[#ff6b00] group-hover:text-white">
          ۰۱
        </span>
        <span className="text-[11px] font-bold tracking-[0.22em] text-white/80 [writing-mode:vertical-rl]">
          درباره ما
        </span>
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen min-h-[100lvh] max-w-4xl flex-col items-center justify-center px-5 pb-44 pt-28 text-center sm:px-8 sm:pb-48 lg:pb-56">
        <h1 className="brand-display animate-fade-up text-[clamp(2.4rem,7vw,4.75rem)] font-black tracking-[0.14em] text-white">
          مهکام
        </h1>

        <p className="animate-fade-up mt-4 max-w-3xl text-[clamp(1.35rem,3.6vw,2.35rem)] font-light leading-[1.35] tracking-wide text-white/95 sm:mt-5">
          سیم و کابل با{" "}
          <span className="font-black tracking-tight text-white">کیفیت پایدار</span>
        </p>

        <p className="animate-fade-up-delay mt-5 max-w-md text-[13px] leading-7 text-white/75 sm:mt-6 sm:text-sm sm:leading-8">
          گسترش سیم و کابل مهکام — تأمین و عرضه سیم و کابل صنعتی با مشخصات فنی شفاف
          و مسیر رسمی استعلام قیمت.
        </p>
      </div>
    </section>
  );
}
