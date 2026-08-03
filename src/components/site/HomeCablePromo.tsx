import Link from "next/link";
import { ArrowLeft, Cable, Factory, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { LazyImage } from "@/components/ui/LazyImage";

const LINES = [
  {
    title: "سیم افشان و ساختمانی",
    desc: "انعطاف بالا برای تأسیسات ساختمانی و سیم‌کشی روزمره",
    href: "/products?q=افشان",
    image: "/images/section-conduit.jpg",
    icon: Cable,
  },
  {
    title: "کابل قدرت",
    desc: "انتقال مطمئن جریان در پروژه‌های صنعتی و ساختمانی",
    href: "/products?q=قدرت",
    image: "/images/section-cable-cross.jpg",
    icon: Zap,
  },
  {
    title: "کنترل و سیگنال",
    desc: "دقت سیگنال برای سیستم‌های کنترل و اتوماسیون",
    href: "/products?q=کنترل",
    image: "/images/cable-conduit-wires.jpg",
    icon: ShieldCheck,
  },
] as const;

export function HomeCablePromo() {
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.18em] text-copper">محصولات مهکام</p>
              <h2 className="brand-display mt-2 text-3xl font-extrabold leading-[1.2] text-ink sm:text-4xl">
                سیم و کابل برای هر پروژه
              </h2>
              <p className="mt-3 text-sm leading-8 text-muted sm:text-[15px]">
                از سیم افشان ساختمانی تا کابل قدرت صنعتی — مشخصات فنی شفاف، کیفیت پایدار و استعلام
                قیمت از مسیر رسمی تلگرام.
              </p>
            </div>
            <Link href="/products" className="link-arrow shrink-0">
              مشاهده کاتالوگ کامل
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {LINES.map((line, i) => {
            const Icon = line.icon;
            return (
              <Reveal key={line.title} delay={i * 80} variant="scale">
                <Link
                  href={line.href}
                  className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl sm:min-h-[320px]"
                >
                  <LazyImage
                    src={line.image}
                    alt={line.title}
                    fill
                    wrapperClassName="absolute inset-0"
                    className="object-cover transition duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
                  <div className="relative p-6 sm:p-7">
                    <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-copper text-white">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="brand-display text-xl font-extrabold text-white sm:text-2xl">
                      {line.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/70">{line.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-copper-light">
                      مشاهده محصولات
                      <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="mt-6 flex flex-col gap-4 overflow-hidden rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-copper">
                <Factory className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="brand-display text-lg font-extrabold sm:text-xl">
                  تولید و عرضه با استاندارد صنعتی
                </p>
                <p className="mt-1 max-w-xl text-sm leading-7 text-white/60">
                  مهکام برای پروژه‌های ساختمانی، کارخانه‌ای و تأسیساتی، کابل مناسب را با مشخصات واضح
                  در اختیارتان می‌گذارد.
                </p>
              </div>
            </div>
            <Link
              href="/about"
              className="btn-modern inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-copper hover:text-white"
            >
              درباره مهکام
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
