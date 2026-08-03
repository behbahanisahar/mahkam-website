import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  /** Logo image already includes company name — text hidden by default */
  showTagline?: boolean;
  /** light = white logo for dark/hero headers; default = dark logo for light headers */
  variant?: "default" | "light";
};

export function Logo({
  className,
  imageClassName,
  showTagline = false,
  variant = "default",
}: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)}>
      <Image
        src="/images/mahkam-logo.png"
        alt="گسترش سیم و کابل مهکام"
        width={568}
        height={522}
        priority
        className={cn(
          "h-10 w-auto max-w-[130px] shrink-0 object-contain sm:h-12 sm:max-w-[155px]",
          isLight ? "logo-light" : "logo-dark",
          imageClassName,
        )}
        style={isLight ? { filter: "brightness(0) invert(1)" } : { filter: "none" }}
      />
      <span
        className={cn(
          "brand-display hidden text-base font-bold leading-none sm:inline",
          isLight ? "text-white" : "text-ink",
        )}
      >
        مهکام
      </span>
      {showTagline ? (
        <span
          className={cn(
            "brand-display mr-2 text-sm font-bold leading-tight sm:text-base",
            isLight ? "text-white" : "text-ink",
          )}
        >
          مهکام
          <span
            className={cn(
              "mt-0.5 block text-[10px] font-medium sm:text-xs",
              isLight ? "text-white/70" : "text-accent",
            )}
          >
            گسترش سیم و کابل
          </span>
        </span>
      ) : null}
    </Link>
  );
}
