import { getSiteSettings } from "@/lib/settings";
import { getTelegramHandleLabel, getTelegramUrl } from "@/lib/site";
import { changePasswordAction, updateSettingsAction } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تنظیمات سایت</h1>

      <form action={updateSettingsAction} className="glass space-y-4 rounded-2xl p-5">
        <label className="block text-sm">
          لینک تلگرام
          <input
            name="telegramUrl"
            required
            defaultValue={settings.telegramUrl}
            placeholder={getTelegramUrl()}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
            dir="ltr"
          />
          <span className="mt-1 block text-xs text-muted" dir="ltr">
            کانال رسمی: {getTelegramHandleLabel()} — {getTelegramUrl()}
          </span>
        </label>
        <label className="block text-sm">
          تلفن‌ها (هر خط یک شماره)
          <textarea
            name="phones"
            rows={3}
            defaultValue={settings.phones.join("\n")}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          آدرس
          <textarea
            name="address"
            rows={2}
            defaultValue={settings.address ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
            placeholder="تهران، خیابان لاله‌زار نو، …"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            عرض جغرافیایی (lat)
            <input
              name="mapLat"
              type="text"
              inputMode="decimal"
              placeholder="35.700348"
              defaultValue={settings.mapLat ?? ""}
              className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
              dir="ltr"
            />
          </label>
          <label className="block text-sm">
            طول جغرافیایی (lng)
            <input
              name="mapLng"
              type="text"
              inputMode="decimal"
              placeholder="51.42455"
              defaultValue={settings.mapLng ?? ""}
              className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
              dir="ltr"
            />
          </label>
        </div>
        <p className="text-xs leading-6 text-muted">
          پین نقشه روی مختصات بالا است. پیش‌فرض: پاساژ چلچراغ (۳۵٫۷۰۰۳۴۸، ۵۱٫۴۲۴۵۵).
        </p>
        <label className="block text-sm">
          معرفی کوتاه شرکت
          <textarea
            name="companyBlurb"
            rows={3}
            defaultValue={settings.companyBlurb ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          محتوای درباره ما (HTML)
          <textarea
            name="aboutHtml"
            rows={5}
            defaultValue={settings.aboutHtml ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          محتوای تماس (HTML)
          <textarea
            name="contactHtml"
            rows={3}
            defaultValue={settings.contactHtml ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <SubmitButton
          className="rounded-xl bg-ink px-5 py-2.5 text-sm text-bg"
          pendingLabel="در حال ذخیره…"
        >
          ذخیره تنظیمات
        </SubmitButton>
      </form>

      <form action={changePasswordAction} className="glass space-y-3 rounded-2xl p-5">
        <h2 className="font-semibold">تغییر رمز عبور</h2>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="رمز جدید"
          className="w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
        />
        <SubmitButton
          className="rounded-xl bg-ink px-4 py-2 text-sm text-bg"
          pendingLabel="در حال به‌روزرسانی…"
        >
          به‌روزرسانی رمز
        </SubmitButton>
      </form>
    </div>
  );
}
