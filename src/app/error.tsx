"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/ErrorState";

export default function Error({
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
      code="۵۰۰"
      title="مشکلی پیش آمد"
      description="متأسفیم؛ در نمایش این صفحه خطایی رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید."
      digest={error.digest}
      statusCode={500}
      source="client"
      reset={reset}
      showRetry
      log
    />
  );
}
