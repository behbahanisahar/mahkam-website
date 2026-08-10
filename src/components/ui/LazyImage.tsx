"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn, shouldBypassImageOptimizer } from "@/lib/utils";

type Props = Omit<ImageProps, "onLoad"> & {
  wrapperClassName?: string;
  skeletonClassName?: string;
};

/**
 * Lazy image: waits until near viewport, shows skeleton shimmer,
 * then fades/scales in when the asset is ready.
 */
export function LazyImage({
  className,
  wrapperClassName,
  skeletonClassName,
  alt,
  priority,
  unoptimized,
  src,
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(Boolean(priority));
  const [loaded, setLoaded] = useState(false);
  const bypass =
    Boolean(unoptimized) ||
    (typeof src === "string" && shouldBypassImageOptimizer(src));

  useEffect(() => {
    if (priority) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded ? (
        <div
          className={cn("skeleton-shimmer absolute inset-0 z-[1]", skeletonClassName)}
          aria-hidden
        />
      ) : null}
      {inView ? (
        <Image
          {...props}
          src={src}
          alt={alt}
          priority={priority}
          unoptimized={bypass}
          onLoad={() => setLoaded(true)}
          className={cn(
            "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            loaded ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
            className,
          )}
        />
      ) : null}
    </div>
  );
}
