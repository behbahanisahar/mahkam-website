import Link from "next/link";

export function AdminDbNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
      <p className="font-medium">ارتباط با دیتابیس برقرار نشد.</p>
      <p className="mt-1 text-amber-900/80">
        مطمئن شوید Postgres محلی روشن است یا{" "}
        <code className="rounded bg-white/70 px-1" dir="ltr">
          DATABASE_URL
        </code>{" "}
        به Railway / سرور درست اشاره می‌کند، سپس صفحه را تازه کنید.
      </p>
      <Link href="." className="mt-2 inline-flex text-xs font-medium text-copper underline">
        تلاش مجدد
      </Link>
    </div>
  );
}
