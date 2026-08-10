import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Keep Western digits / size patterns (e.g. 0.75×1, 450/750) LTR inside RTL UI.
 */
const LTR_RUN = /(\d+(?:\.\d+)?(?:\s*[×xX\/]\s*\d+(?:\.\d+)?)*)/g;

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
