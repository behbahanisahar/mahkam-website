import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Keep cable sizes / voltages LTR inside RTL UI.
 * e.g. "سیم افشان 0.75×1" must read 0.75×1 (not 1×0.75).
 */
const DIGIT = "[0-9۰-۹]";
const SIZE_OR_VOLTAGE = new RegExp(
  `((?:${DIGIT}+(?:\\.${DIGIT}+)?)(?:\\s*[×xX\\/]\\s*(?:${DIGIT}+(?:\\.${DIGIT}+)?))+|${DIGIT}+(?:\\.${DIGIT}+)?\\s*(?:mm²|mm2|م²)?)`,
  "g",
);

/** Unicode LRI / PDI — strongest isolation for mixed RTL/LTR */
const LRI = "\u2066";
const PDI = "\u2069";

function LtrRun({ children }: { children: string }) {
  return (
    <span
      dir="ltr"
      className="cable-size inline-block whitespace-nowrap"
      style={{ unicodeBidi: "isolate" }}
    >
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
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(SIZE_OR_VOLTAGE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>,
      );
    }
    nodes.push(<LtrRun key={`n-${match.index}`}>{match[0]}</LtrRun>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <Comp className={cn(className)}>{nodes.length > 0 ? nodes : text}</Comp>;
}
