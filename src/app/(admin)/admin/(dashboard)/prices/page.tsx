import { prisma, withDbTimeout } from "@/lib/prisma";
import { manualDollarAction, syncTgjuDollarAction } from "@/lib/actions/admin";
import { formatRial, toPersianDigits } from "@/lib/i18n/fa";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminDbNotice } from "@/components/admin/AdminDbNotice";

export default async function AdminPricesPage() {
  const rows = await withDbTimeout(
    prisma.dollarDaily.findMany({
      orderBy: { date: "desc" },
      take: 15,
    }),
    3_000,
    null,
  );
  const dbError = rows === null;
  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">نرخ دلار (دستی / آرشیو)</h1>
          <p className="mt-1 text-sm text-muted">ثبت دستی یا همگام‌سازی از TGJU</p>
        </div>
        <form action={syncTgjuDollarAction}>
          <SubmitButton
            className="rounded-xl border border-glass-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-copper/40"
            pendingLabel="در حال همگام‌سازی…"
          >
            همگام‌سازی TGJU
          </SubmitButton>
        </form>
      </div>

      {dbError ? <AdminDbNotice /> : null}

      <form action={manualDollarAction} className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-4">
        <label className="text-sm sm:col-span-1">
          تاریخ میلادی
          <input
            name="date"
            type="date"
            required
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-1">
          تاریخ شمسی
          <input
            name="dateJalali"
            required
            placeholder="۱۴۰۵/۰۴/۲۲"
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-1">
          قیمت پایانی (ریال)
          <input
            name="close"
            required
            inputMode="numeric"
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton
            className="w-full rounded-xl bg-ink px-4 py-2 text-sm text-bg"
            pendingLabel="در حال ثبت…"
          >
            ثبت دستی
          </SubmitButton>
        </div>
      </form>

      {!dbError ? (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-accent/20 text-right">
              <tr>
                <th className="px-3 py-2 font-medium">تاریخ شمسی</th>
                <th className="px-3 py-2 font-medium">پایانی</th>
                <th className="px-3 py-2 font-medium">منبع</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-muted">
                    هنوز ردیفی نیست. «همگام‌سازی TGJU» یا ثبت دستی را بزنید.
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.id} className="border-t border-glass-border">
                    <td className="px-3 py-2">{toPersianDigits(r.dateJalali)}</td>
                    <td className="px-3 py-2 font-medium">{formatRial(r.close)}</td>
                    <td className="px-3 py-2 text-muted">{r.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
