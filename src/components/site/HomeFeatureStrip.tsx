import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CategoryTileData } from "@/components/site/CategoryTiles";
import { resolveMediaUrl } from "@/lib/utils";

const FALLBACKS = [
  "/images/section-conduit.jpg",
  "/images/section-cable-cross.jpg",
  "/images/section-infra.jpg",
] as const;

const DEFAULT_PANELS = [
  {
    slug: "power",
    title: "کابل قدرت و انتقال",
    href: "/products",
    image: FALLBACKS[0],
    tone: "photo" as const,
  },
  {
    slug: "quality",
    title: "کیفیت و استاندارد صنعتی",
    href: "/about",
    image: null,
    tone: "orange" as const,
  },
  {
    slug: "building",
    title: "سیم افشان و ساختمانی",
    href: "/products",
    image: FALLBACKS[2],
    tone: "photo" as const,
  },
];

type Props = {
  categories?: CategoryTileData[];
};

export function HomeFeatureStrip({ categories = [] }: Props) {
  const fromCats = categories.slice(0, 3).map((c, i) => ({
    slug: c.slug,
    title: c.nameFa,
    href: `/products?category=${c.slug}`,
    image: resolveMediaUrl(c.imageUrl, FALLBACKS[i % FALLBACKS.length]),
    tone: (i === 1 ? "orange" : "photo") as "orange" | "photo",
  }));

  const panels = fromCats.length >= 3 ? fromCats : DEFAULT_PANELS;

  return (
    <section className="grid md:grid-cols-3">
      {panels.map((panel) => {
        if (panel.tone === "orange") {
          return (
            <Link
              key={panel.slug}
              href={panel.href}
              className="group relative flex min-h-[280px] flex-col justify-end bg-copper p-7 text-white sm:min-h-[320px] sm:p-8"
            >
              <div
                className="pointer-events-none absolute inset-6 border border-white/25 opacity-60"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-10 grid grid-cols-2 gap-px opacity-30"
                aria-hidden
              >
                <div className="border border-white/40" />
                <div className="border border-white/40" />
                <div className="border border-white/40" />
                <div className="border border-white/40" />
              </div>
              <h3 className="brand-display relative text-xl font-extrabold leading-9 sm:text-2xl">
                {panel.title}
              </h3>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:text-white">
                بیشتر بدانید
                <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={panel.slug}
            href={panel.href}
            className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden sm:min-h-[320px]"
          >
            <Image
              src={panel.image ?? FALLBACKS[0]}
              alt={panel.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
            <div className="relative p-7 sm:p-8">
              <h3 className="brand-display text-xl font-extrabold leading-9 text-white sm:text-2xl">
                {panel.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:text-copper-light">
                بیشتر بدانید
                <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
