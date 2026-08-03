"use client";

import Link from "next/link";
import { trackProductInterest } from "@/lib/products/track-client";

export function ProductCardLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/products/${slug}`}
      onClick={() => trackProductInterest(slug, "CARD")}
      className={className}
    >
      {children}
    </Link>
  );
}
