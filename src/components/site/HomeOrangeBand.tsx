import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { LazyImage } from "@/components/ui/LazyImage";

type Props = {
  telegramUrl: string;
};

export function HomeOrangeBand({ telegramUrl }: Props) {
  return (
    <section className="grid lg:grid-cols-2">
      <Reveal className="relative min-h-[320px] overflow-hidden lg:min-h-[480px]" variant="scale">
        <LazyImage
          src="/images/section-infra.jpg"
          alt="زیرساخت و نصب کابل صنعتی"
          fill
          quality={75}
          wrapperClassName="absolute inset-0"
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </Reveal>

      <div className="relative flex flex-col justify-center overflow-hidden bg-copper px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <Leaf
          className="pointer-events-none absolute -left-8 bottom-4 size-56 text-white/10 sm:size-72"
          strokeWidth={1}
          aria-hidden
        />
        <Reveal delay={80} variant="up">
          <p className="relative text-xs font-bold tracking-[0.18em] text-white/80">تعهد و مسئولیت</p>
          <h2 className="brand-display relative mt-3 max-w-md text-3xl font-extrabold leading-[1.2] sm:text-4xl">
            کیفیت پایدار، شفافیت در مشخصات و قیمت
          </h2>
          <p className="relative mt-5 max-w-md text-sm leading-8 text-white/85 sm:text-[15px]">
            در مهکام باور داریم خرید سیم و کابل نباید با حدس و گمان باشد. مشخصات هر محصول را کامل منتشر
            می‌کنیم و نرخ روز را فقط از کانال رسمی تلگرام اعلام می‌نماییم.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-modern inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink-soft"
            >
              کانال تلگرام
              <ArrowLeft className="size-4 text-copper-light" />
            </a>
            <Link
              href="/contact"
              className="btn-modern inline-flex items-center gap-2 border border-white/80 px-5 py-3 text-sm font-bold text-white hover:bg-white hover:text-copper"
            >
              تماس با ما
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
