import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { normalizeCableTitle } from "@/lib/products/cable-title";

/**
 * Product / catalog titles in RTL UI:
 * - Persian words flow right-to-left
 * - Cable sizes like 1×0.75 stay left-to-right (never flip to 0.75×1)
 * - Word-stored section×1 is normalized to cores×section for display
 */
const DIGIT = "[0-9۰-۹]";
const SIZE_PATTERN = new RegExp(
  `((?:${DIGIT}+(?:\\.${DIGIT}+)?)\\s*[×xX]\\s*(?:${DIGIT}+(?:\\.${DIGIT}+)?))`,
  "g",
);

const LRI = "\u2066";
const PDI = "\u2069";

function LtrSize({ children }: { children: string }) {
  return (
    <span dir="ltr" className="cable-size">
      {LRI}
      {children}
      {PDI}
    </span>
  );
}

export function LtrAwareText({
  text,
  className,
  as: Comp = "span",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const normalized = normalizeCableTitle(text);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(SIZE_PATTERN.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`t-${lastIndex}`}>{normalized.slice(lastIndex, match.index)}</span>,
      );
    }
    nodes.push(<LtrSize key={`n-${match.index}`}>{match[0]}</LtrSize>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    nodes.push(<span key={`t-${lastIndex}`}>{normalized.slice(lastIndex)}</span>);
  }

  return (
    <Comp className={cn(className)} dir="rtl">
      {nodes.length > 0 ? nodes : normalized}
    </Comp>
  );
}
