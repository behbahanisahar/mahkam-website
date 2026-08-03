import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/** Compact home teaser — full FAQ lives on /faq */
export function HomeFaqTeaser() {
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-5 overflow-hidden rounded-3xl border border-ink/8 bg-white px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-copper">راهنما</p>
              <h2 className="brand-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                سوالات متداول
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-7 text-muted">
                قیمت روز، حداقل سفارش، مراجعه حضوری و تحویل — جستجو و پاسخ تعاملی.
              </p>
            </div>
            <Link
              href="/faq"
              className="btn-ink btn-modern inline-flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-bold"
            >
              مشاهده سوالات
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
