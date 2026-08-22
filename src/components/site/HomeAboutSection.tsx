import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  blurb: string;
};

/** About band — SHINING trade-services style under the diagonal hero. */
export function HomeAboutSection({ blurb }: Props) {
  return (
    <section id="about" className="shining-about relative z-[2] scroll-mt-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pb-24 lg:pt-4">
        <Reveal>
          <div className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <span
              className="pointer-events-none absolute left-0 top-1/2 hidden size-[28rem] -translate-y-1/2 rounded-full border border-ink/[0.06] lg:block"
              aria-hidden
            />

            {/* متن — سمت راست در RTL */}
            <div className="relative z-[1] order-2 lg:order-1 lg:col-span-7 lg:ps-4">
              <h2 className="brand-display text-2xl font-black leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.5rem]">
                خدمات تخصصی سیم و کابل مهکام
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-ink/60 sm:text-[15px] sm:leading-8">
                {blurb}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] transition hover:text-[#e85a00]"
                >
                  <ArrowLeft className="size-4" />
                  بیشتر بدانید
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 transition hover:text-[#ff6b00]"
                >
                  هماهنگی سفارش
                </Link>
              </div>
            </div>

            {/* عکس — سمت چپ تا روی «درباره ما» هیرو نیاید */}
            <div className="relative z-[1] order-1 lg:order-2 lg:col-span-5">
              <div className="shining-about-frame relative mx-auto w-full max-w-sm lg:ms-0 lg:me-auto lg:max-w-none">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-200 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.45)]">
                  <Image
                    src="/images/section-about.webp"
                    alt="کنترل کیفیت و مشخصات فنی در مهکام"
                    fill
                    loading="lazy"
                    quality={75}
                    className="object-cover object-[50%_20%]"
                    sizes="(max-width:1024px) 90vw, 38vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
