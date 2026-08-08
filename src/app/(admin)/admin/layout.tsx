import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminFlashToasts } from "@/components/admin/AdminFlashToasts";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-muted text-ink">
      <Suspense fallback={null}>
        <AdminFlashToasts />
      </Suspense>
      {children}
    </div>
  );
}
