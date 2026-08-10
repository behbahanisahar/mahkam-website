import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Keep size / voltage patterns LTR inside RTL UI.
 * Supports Western and Persian digits, e.g. 1×0.75 or ۱×۰.۷۵
 * (cores × cross-section — same order as written, not reversed).
 */
const DIGIT = "[0-9۰-۹]";
const LTR_RUN = new RegExp(
  `((?:${DIGIT}+(?:\\.${DIGIT}+)?)(?:\\s*[×xX\\/]\\s*(?:${DIGIT}+(?:\\.${DIGIT}+)?))+)`,
  "g",
);

export function LtrAwareText({
  text,
  className,
  as: Comp = "span",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(LTR_RUN.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>,
      );
    }
    nodes.push(
      <bdi key={`n-${match.index}`} dir="ltr" className="inline-block whitespace-nowrap">
        {match[0]}
      </bdi>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <Comp className={cn(className)}>{nodes.length > 0 ? nodes : text}</Comp>;
}
