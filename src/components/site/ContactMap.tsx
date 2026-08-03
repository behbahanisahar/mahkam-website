type ContactMapProps = {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  /** Search query when exact coordinates are not set (e.g. phone or business name) */
  query?: string | null;
  zoom?: number;
  /** Drop chrome; fill parent (for side-by-side contact layout) */
  embedded?: boolean;
  className?: string;
};

function osmEmbedSrc(lat: number, lng: number, zoom: number) {
  const span = 0.018 / Math.pow(2, Math.max(0, zoom - 14));
  const minLon = lng - span;
  const maxLon = lng + span;
  const minLat = lat - span * 0.65;
  const maxLat = lat + span * 0.65;
  const bbox = [minLon, minLat, maxLon, maxLat].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function googleEmbedSrc(q: string, zoom: number) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=fa&output=embed`;
}

export function ContactMap({
  lat,
  lng,
  address,
  query,
  zoom = 16,
  embedded = false,
  className,
}: ContactMapProps) {
  const hasPin =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const search = (query || address || "").trim();
  if (!hasPin && !search) return null;

  const embedSrc = hasPin ? osmEmbedSrc(lat!, lng!, zoom) : googleEmbedSrc(search, zoom);

  const openLinks = hasPin
    ? [
        { label: "نشان", href: `https://neshan.org/maps/@${lat},${lng},${zoom}z/pin` },
        { label: "گوگل‌مپ", href: `https://www.google.com/maps?q=${lat},${lng}` },
      ]
    : [
        {
          label: "نشان",
          href: `https://neshan.org/maps/search?term=${encodeURIComponent(search)}`,
        },
        {
          label: "گوگل‌مپ",
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`,
        },
      ];

  if (embedded) {
    return (
      <div className={className ?? "relative h-full min-h-[260px] w-full bg-accent/10"}>
        <iframe
          title={address ? `نقشه: ${address}` : "نقشه موقعیت مهکام"}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <section className="ui-card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-glass-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-ink">موقعیت روی نقشه</h2>
          {address ? <p className="mt-1 text-sm leading-7 text-muted">{address}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {openLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-glass-border bg-paper px-3 py-1.5 font-medium text-ink transition hover:border-copper/40"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <div className="relative h-52 w-full bg-bg-alt sm:h-64">
        <iframe
          title={address ? `نقشه: ${address}` : "نقشه موقعیت مهکام"}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
