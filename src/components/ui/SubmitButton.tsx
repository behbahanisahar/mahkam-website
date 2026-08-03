"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  pendingClassName?: string;
};

export function SubmitButton({
  children,
  className,
  pendingLabel = "در حال انجام…",
  pendingClassName,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 transition disabled:cursor-wait disabled:opacity-75",
        className,
        pending && pendingClassName,
      )}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
