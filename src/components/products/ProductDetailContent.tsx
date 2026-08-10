import { FileText, Layers, ListChecks, Sparkles, Wrench } from "lucide-react";
import { LtrAwareText } from "@/components/ui/LtrAwareText";

export type ProductDetailSections = {
  introduction?: string | null;
  wireStructure?: string | null;
  techSpecs?: string | null;
  applications?: string | null;
  advantages?: string | null;
  /** legacy fallback */
  body?: string | null;
  shortDesc?: string | null;
};

const SECTIONS = [
  {
    key: "introduction" as const,
    title: "معرفی محصول",
    icon: FileText,
    fallback: (p: ProductDetailSections) => p.shortDesc || p.body,
  },
  {
    key: "wireStructure" as const,
    title: "ساختار سیم",
    icon: Layers,
  },
  {
    key: "techSpecs" as const,
    title: "مشخصات فنی",
    icon: Wrench,
  },
  {
    key: "applications" as const,
    title: "کاربردها",
    icon: ListChecks,
  },
  {
    key: "advantages" as const,
    title: "مزایا",
    icon: Sparkles,
  },
] as const;

export function ProductDetailContent({ product }: { product: ProductDetailSections }) {
  const items = SECTIONS.map((s) => {
    const direct = product[s.key];
    const text =
      (direct && String(direct).trim()) ||
      ("fallback" in s && s.fallback ? s.fallback(product)?.trim() : "") ||
      "";
    return { ...s, text };
  }).filter((s) => s.text);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map(({ key, title, icon: Icon, text }) => (
        <section key={key} className="ui-card overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-glass-border bg-bg-alt/60 px-4 py-3 text-sm font-semibold text-copper-deep sm:px-5">
            <Icon className="size-4 shrink-0" aria-hidden />
            {title}
          </h2>
          <LtrAwareText
            as="div"
            text={text}
            className="px-4 py-4 text-sm leading-8 whitespace-pre-wrap text-ink sm:px-5 sm:text-[15px]"
          />
        </section>
      ))}
    </div>
  );
}
