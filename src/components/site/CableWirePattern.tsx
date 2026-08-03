type Props = {
  className?: string;
  variant?: "grid" | "coils";
};

/** Decorative wire/cable motifs for hero and section backgrounds */
export function CableWirePattern({ className = "", variant = "grid" }: Props) {
  if (variant === "coils") {
    return (
      <svg
        className={className}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx="200"
            cy="200"
            r={40 + i * 28}
            stroke="currentColor"
            strokeWidth={i === 0 ? 3 : 1.5}
            strokeOpacity={0.15 + i * 0.04}
            fill="none"
          />
        ))}
        <circle cx="200" cy="200" r="18" fill="currentColor" fillOpacity="0.25" />
        <path
          d="M60 80 Q120 120 80 180 T60 280"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.2"
          fill="none"
        />
        <path
          d="M340 120 Q280 160 320 220 T340 320"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.2"
          fill="none"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h-${i}`}
            x1="20"
            y1={60 + i * 55}
            x2="380"
            y2={60 + i * 55}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.06"
            strokeDasharray="8 12"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="wireGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M0 24h48M24 0v48"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.08"
          />
          <circle cx="24" cy="24" r="1.5" fill="currentColor" fillOpacity="0.12" />
        </pattern>
        <pattern id="cableBundle" width="120" height="80" patternUnits="userSpaceOnUse">
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={i}
              cx={20 + i * 22}
              cy="40"
              rx="8"
              ry="28"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.1"
              fill="none"
              transform={`rotate(-15 ${20 + i * 22} 40)`}
            />
          ))}
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#wireGrid)" />
      <rect width="800" height="600" fill="url(#cableBundle)" opacity="0.7" />
      <path
        d="M0 420 C180 380 320 460 520 400 S800 350 800 420"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.12"
        fill="none"
      />
      <path
        d="M0 480 C200 440 400 520 600 460 S800 400 800 480"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.08"
        fill="none"
      />
    </svg>
  );
}
