import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { SiteContainer } from "@/components/site/SiteContainer";

type Cta = { href: string; label: string; external?: boolean };

export function SeoLandingShell({
  eyebrow,
  title,
  lead,
  children,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}) {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 80% at 85% 20%, color-mix(in srgb, var(--copper) 40%, transparent), transparent 55%),
              radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in srgb, #229ED9 18%, transparent), transparent 50%)
            `,
          }}
          aria-hidden
        />
        <SiteContainer className="relative py-14 sm:py-16 lg:py-20">
          <p className="text-xs font-bold tracking-[0.18em] text-copper-light">{eyebrow}</p>
          <h1 className="brand-display mt-3 max-w-3xl text-3xl font-extrabold leading-[1.2] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCta ? (
              primaryCta.external ? (
                <a
                  href={primaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 text-sm font-bold text-white"
                >
                  <Send className="size-4" />
                  {primaryCta.label}
                </a>
              ) : (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-copper px-5 py-3 text-sm font-bold text-white"
                >
                  {primaryCta.label}
                  <ArrowLeft className="size-4" />
                </Link>
              )
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="space-y-8 py-12 sm:py-14 lg:py-16">{children}</SiteContainer>
    </div>
  );
}
