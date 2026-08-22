import type { Metadata } from "next";
import { ErrorState } from "@/components/site/ErrorState";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "صفحه پیدا نشد",
  description: "آدرس واردشده در سایت مهکام وجود ندارد یا جابه‌جا شده است.",
  path: "/",
  index: false,
  follow: true,
});

export default function NotFound() {
  return (
    <ErrorState
      code="۴۰۴"
      title="صفحه پیدا نشد"
      description="آدرس واردشده وجود ندارد یا جابه‌جا شده است. از منو یا جستجو محصول موردنظر را پیدا کنید."
      statusCode={404}
      source="client"
      showRetry={false}
      log={false}
    />
  );
}
