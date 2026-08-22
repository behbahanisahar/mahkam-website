import Link from "next/link";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { formatNumberFa, toPersianDigits } from "@/lib/i18n/fa";
import {
  resolveAppErrorAction,
  resolveAllAppErrorsAction,
  deleteResolvedAppErrorsAction,
} from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";

type SearchParams = Promise<{ status?: string }>;

function formatWhen(d: Date) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default async function AdminErrorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const showResolved = sp.status === "resolved";

  const result = await withDbTimeout(
    Promise.all([
      prisma.appErrorLog.findMany({
        where: { resolved: showResolved },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.appErrorLog.count({ where: { resolved: false } }),
      prisma.appErrorLog.count({ where: { resolved: true } }),
    ]),
    4_000,
    null,
  );

  if (result === null) {
    return (
      <div className="space-y-5">
        <h1 className="brand-display text-2xl font-bold">خطاها</h1>
        <AdminDbNotice />
        <p className="text-sm leading-7 text-muted">
          اگر تازه جدول خطاها را اضافه کرده‌اید، روی VPS این را اجرا کنید:{" "}
          <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">
            docker exec mahkam-website npx prisma db push
          </code>
        </p>
      </div>
    );
  }

  const [rows, openCount, resolvedCount] = result;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="brand-display text-2xl font-bold">خطاها و قطعی‌ها</h1>
          <p className="mt-1 text-sm text-muted">
            گزارش‌های خطای سایت، Bad Gateway و خطاهای کاربر — {formatNumberFa(openCount)} باز
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/errors"
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
              !showResolved ? "bg-copper text-white" : "border border-glass-border bg-white"
            }`}
          >
            باز ({formatNumberFa(openCount)})
          </Link>
          <Link
            href="/admin/errors?status=resolved"
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
              showResolved ? "bg-copper text-white" : "border border-glass-border bg-white"
            }`}
          >
            رسیدگی‌شده ({formatNumberFa(resolvedCount)})
          </Link>
        </div>
      </div>

      {!showResolved && openCount > 0 ? (
        <form action={resolveAllAppErrorsAction}>
          <SubmitButton
            className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-white px-3 py-2 text-xs font-medium"
            pendingLabel="در حال علامت‌گذاری…"
          >
            <CheckCircle2 className="size-3.5" />
            همه را رسیدگی‌شده کن
          </SubmitButton>
        </form>
      ) : null}

      {showResolved && resolvedCount > 0 ? (
        <form action={deleteResolvedAppErrorsAction}>
          <SubmitButton
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
            pendingLabel="در حال حذف…"
          >
            <Trash2 className="size-3.5" />
            پاک کردن رسیدگی‌شده‌ها
          </SubmitButton>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-white/60 px-6 py-14 text-center">
          <AlertTriangle className="mx-auto size-8 text-copper/70" />
          <p className="mt-3 text-sm text-muted">
            {showResolved ? "خطای رسیدگی‌شده‌ای نیست." : "فعلاً خطای بازی ثبت نشده."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-glass-border/80 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-lg bg-ink/90 px-2 py-0.5 font-semibold text-white">
                    {row.statusCode ? toPersianDigits(row.statusCode) : row.level}
                  </span>
                  <span className="rounded-lg bg-copper/12 px-2 py-0.5 text-copper-deep">
                    {row.source}
                  </span>
                  <span className="text-muted">{formatWhen(row.createdAt)}</span>
                </div>
                {!row.resolved ? (
                  <form action={resolveAppErrorAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <SubmitButton
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800"
                      pendingLabel="…"
                    >
                      <CheckCircle2 className="size-3.5" />
                      رسیدگی شد
                    </SubmitButton>
                  </form>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{row.message}</p>
              <div className="mt-2 space-y-1 text-xs text-muted" dir="ltr">
                {row.path ? <p>path: {row.path}</p> : null}
                {row.digest ? <p>digest: {row.digest}</p> : null}
                {row.userAgent ? <p className="line-clamp-2">ua: {row.userAgent}</p> : null}
              </div>
              {row.stack ? (
                <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-bg-alt p-3 text-[10px] leading-4 text-ink/80" dir="ltr">
                  {row.stack}
                </pre>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
