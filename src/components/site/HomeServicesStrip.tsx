import Link from "next/link";
import { ArrowLeft, Cable, Factory, Gauge, Layers3, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const ICONS = [
  { icon: Zap, label: "برق و قدرت", value: 120 },
  { icon: Cable, label: "سیم افشان", value: 85 },
  { icon: Layers3, label: "کنترل و سیگنال", value: 64 },
  { icon: Gauge, label: "مشخصات فنی", value: 40 },
  { icon: Factory, label: "پروژه صنعتی", value: 28 },
] as const;

export function HomeServicesStrip() {
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="brand-display text-3xl font-extrabold leading-[1.2] text-ink sm:text-4xl">
                استفاده از استانداردهای روز در تولید و عرضه
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-xl text-sm leading-8 text-muted sm:text-[15px]">
                از انتخاب مقطع و نوع هادی تا استعلام قیمت و هماهنگی تحویل — مسیر همکاری با مهکام ساده و
                شفاف است.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/about"
                  className="btn-ink btn-modern inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
                >
                  چطور کار می‌کند؟
                  <ArrowLeft className="size-4" />
                </Link>
                <Link href="/products" className="link-arrow">
                  مشاهده همه محصولات
                  <ArrowLeft className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-ink/10 pt-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {ICONS.map(({ icon: Icon, label, value }, i) => (
            <Reveal key={label} delay={i * 80} variant="scale">
              <div className="group flex flex-col items-center gap-2 text-center">
                <span className="flex size-14 items-center justify-center rounded-full border border-ink/8 bg-white transition duration-300 group-hover:border-copper/40 group-hover:bg-copper/10">
                  <Icon
                    className="size-7 text-ink/35 transition group-hover:text-copper sm:size-8"
                    strokeWidth={1.25}
                  />
                </span>
                <p className="brand-display text-2xl font-extrabold text-ink">
                  <AnimatedCounter value={value} suffix="+" />
                </p>
                <p className="text-xs font-semibold text-ink/65 sm:text-sm">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
