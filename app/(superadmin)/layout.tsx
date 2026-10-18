import { AdminHeader, AdminShell, AdminSidebar } from "@/components/superadmin";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell header={<AdminHeader />} sidebar={<AdminSidebar />}>
      {children}
    </AdminShell>
  );
}
