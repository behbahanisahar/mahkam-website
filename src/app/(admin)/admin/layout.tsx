import { Suspense } from "react";
import { AdminFlashToasts } from "@/components/admin/AdminFlashToasts";

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
