"use client";

const VISITOR_KEY = "mahkam_visitor_key";

export type ProductViewSource = "PAGE" | "CARD";

export function getVisitorKey() {
  try {
    const existing = sessionStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const key = crypto.randomUUID();
    sessionStorage.setItem(VISITOR_KEY, key);
    return key;
  } catch {
    return crypto.randomUUID();
  }
}

/** Fire-and-forget interest event (page view or catalog card click). */
export function trackProductInterest(slug: string, source: ProductViewSource) {
  fetch(`/api/products/${encodeURIComponent(slug)}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorKey: getVisitorKey(), source }),
    keepalive: true,
  }).catch(() => {});
}
