"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/ErrorState";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="خطا"
      title="نمایش این بخش ممکن نشد"
      description="لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، از صفحه اصلی یا فهرست محصولات وارد شوید."
      digest={error.digest}
      statusCode={500}
      source="client"
      reset={reset}
      showRetry
      log
    />
  );
}
