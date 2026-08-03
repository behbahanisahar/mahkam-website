import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");

  return (
    <AdminShell email={session.user.email} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
