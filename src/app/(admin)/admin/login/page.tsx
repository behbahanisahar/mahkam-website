import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loginAction } from "@/lib/actions/admin";
import { Logo } from "@/components/site/Logo";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/admin");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-copper/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 size-64 rounded-full bg-surface/10 blur-3xl" />

      <Logo
        className="relative justify-center"
        imageClassName="h-20 w-auto max-w-[220px] sm:h-24 sm:max-w-[260px]"
      />

      <form
        action={loginAction}
        className="relative w-full max-w-md rounded-3xl border border-glass-border/80 bg-white/80 p-6 shadow-lg backdrop-blur sm:p-8"
      >
        <p className="text-xs font-medium text-copper">پنل مدیریت</p>
        <h1 className="brand-display mt-2 text-2xl font-bold">ورود مدیران</h1>
        <p className="mt-2 text-sm text-muted">گسترش سیم و کابل مهکام</p>
        <label className="mt-6 block text-sm font-medium">
          ایمیل
          <input
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-xl border border-glass-border bg-white px-3 py-3 text-sm outline-none ring-copper/30 focus:ring-2"
            autoComplete="username"
            placeholder="email@example.com"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          رمز عبور
          <input
            name="password"
            type="password"
            required
            className="mt-1.5 w-full rounded-xl border border-glass-border bg-white px-3 py-3 text-sm outline-none ring-copper/30 focus:ring-2"
            autoComplete="current-password"
          />
        </label>
        <p className="mt-4 text-xs leading-5 text-muted">
          پس از ورود، نشست شما تا ۳۰ روز فعال می‌ماند مگر اینکه خارج شوید.
        </p>
        <SubmitButton
          className="btn-copper mt-5 w-full rounded-xl py-3.5 text-sm font-semibold"
          pendingLabel="در حال ورود…"
        >
          ورود به پنل
        </SubmitButton>
      </form>
    </div>
  );
}
