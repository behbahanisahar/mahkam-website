/** Soft industrial canvas — warm-cool wash + faint copper light, no busy pattern */
export function IndustrialBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-bg" />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 100% 0%, color-mix(in srgb, #b8952a 9%, transparent), transparent 55%),
            radial-gradient(ellipse 70% 50% at 0% 100%, color-mix(in srgb, #111318 5%, transparent), transparent 50%),
            linear-gradient(180deg, #f7f6f4 0%, #f3f4f6 45%, #eef0f3 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(17,19,24,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17,19,24,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
