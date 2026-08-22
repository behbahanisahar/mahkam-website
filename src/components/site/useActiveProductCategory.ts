"use client";

import { usePathname, useSearchParams } from "next/navigation";

/** Selected `?category=` on the catalog page; empty on other routes. */
export function useActiveProductCategory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pathname !== "/products") return "";
  return (searchParams.get("category") ?? "").trim();
}
