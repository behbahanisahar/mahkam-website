"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn, shouldBypassImageOptimizer } from "@/lib/utils";

type Props = Omit<ImageProps, "onLoad"> & {
  wrapperClassName?: string;
  skeletonClassName?: string;
};

/**
 * Image with skeleton shimmer + fade-in. Uses native lazy loading so the
 * browser can start the request before hydration (no IntersectionObserver gate).
 */
export function LazyImage({
  className,
  wrapperClassName,
  skeletonClassName,
  alt,
  priority,
  unoptimized,
  src,
  loading,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const bypass =
    Boolean(unoptimized) ||
    (typeof src === "string" && shouldBypassImageOptimizer(src));

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded ? (
        <div
          className={cn("skeleton-shimmer absolute inset-0 z-[1]", skeletonClassName)}
          aria-hidden
        />
      ) : null}
      <Image
        {...props}
        src={src}
        alt={alt}
        priority={priority}
        loading={priority ? undefined : (loading ?? "lazy")}
        unoptimized={bypass}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
