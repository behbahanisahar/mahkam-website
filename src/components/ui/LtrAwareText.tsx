import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CABLE_LTR_TOKEN_RE,
  normalizeCableTitle,
} from "@/lib/products/cable-title";

/**
 * Persian copy stays RTL. Cable numbers (cores×section, +neutral, voltages)
 * are isolated left-to-right so 1×0.75 and 3×25+16 never flip.
 */
const LRE = "\u202A";
const PDF = "\u202C";

function LtrSize({ children }: { children: string }) {
  return (
    <bdi dir="ltr" className="cable-size">
      {LRE}
      {children}
      {PDF}
    </bdi>
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
  const re = new RegExp(CABLE_LTR_TOKEN_RE.source, "g");
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
