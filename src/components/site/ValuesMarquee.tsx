const ITEMS = ["کیفیت", "اعتماد", "دقت", "استاندارد", "پشتیبانی", "شفافیت"] as const;

export function ValuesMarquee() {
  const loop = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="marquee overflow-hidden border-y border-ink/6 bg-bg-alt/60 py-4" aria-hidden>
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center text-sm font-bold tracking-wide text-ink/55"
          >
            <span className="text-copper">{item}</span>
            <span className="mx-3 text-copper/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
