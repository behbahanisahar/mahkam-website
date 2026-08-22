"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/ErrorState";

export default function AdminError({
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
      title="خطا در پنل مدیریت"
      description="نمایش این بخش ممکن نشد. دوباره تلاش کنید یا به داشبورد برگردید."
      digest={error.digest}
      statusCode={500}
      source="client"
      reset={reset}
      showRetry
      log
    />
  );
}
