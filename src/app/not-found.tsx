import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ui-card mx-auto mt-16 max-w-lg p-10 text-center">
      <h1 className="brand-display text-3xl font-bold text-ink">۴۰۴</h1>
      <p className="mt-3 text-sm text-muted">صفحه مورد نظر یافت نشد.</p>
      <Link href="/" className="btn-ink mt-6 inline-flex px-5 py-2.5 text-sm font-medium">
        بازگشت به خانه
      </Link>
    </div>
  );
}
