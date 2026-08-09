import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const POINTS = [
  "کیفیت ساخت و کنترل فرآیند",
  "مشخصات فنی شفاف در هر محصول",
  "پشتیبانی مستقیم سفارش",
  "استعلام قیمت از مسیر رسمی",
] as const;

type Props = {
  blurb: string;
};

export function HomeAboutSection({ blurb }: Props) {
  return (
    <section id="about" className="scroll-mt-24 bg-[#f3f2ef]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <Reveal>
          <div className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.28)]">
            <div className="grid lg:grid-cols-12">
              {/* Copy — right in RTL */}
              <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:col-span-7 lg:px-10 lg:py-12">
                <p className="text-xs font-bold tracking-[0.18em] text-copper">درباره مهکام</p>
                <h2 className="brand-display mt-2 text-2xl font-extrabold leading-[1.3] text-ink sm:text-3xl">
                  شرکت پیشرو در سیم و کابل صنعتی
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted sm:text-[15px] sm:leading-8">{blurb}</p>

                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
                  {POINTS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-medium leading-6 text-ink">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-copper text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  <Link
                    href="/contact"
                    className="btn-ink btn-modern inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
                  >
                    هماهنگی سفارش
                    <ArrowLeft className="size-4" />
                  </Link>
                  <Link href="/about" className="link-arrow px-2 py-3">
                    بیشتر بدانید
                    <ArrowLeft className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Media — left in RTL */}
              <div className="relative order-first aspect-[4/3] w-full bg-bg-alt sm:aspect-[5/4] lg:order-none lg:col-span-5 lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src="/images/section-about.jpg"
                  alt="کنترل کیفیت و مشخصات فنی در مهکام"
                  fill
                  priority
                  quality={75}
                  className="object-cover object-[50%_22%]"
                  sizes="(max-width:1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 start-4 z-10 w-[min(100%-2rem,210px)] overflow-hidden rounded-2xl border-2 border-white shadow-lg">
                  <div className="relative aspect-[5/3] w-full">
                    <Image
                      src="/images/section-cable-cross.jpg"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="210px"
                    />
                  </div>
                  <p className="bg-copper px-3 py-2 text-xs font-bold text-white">
                    استاندارد و شفافیت فنی
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
