"use client";

import { useEffect, useRef } from "react";
import { trackProductInterest } from "@/lib/products/track-client";

export function ProductViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackProductInterest(slug, "PAGE");
  }, [slug]);

  return null;
}
