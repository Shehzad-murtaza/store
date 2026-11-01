import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return <div className="admin-shell">
    <AdminSidebar email={user.email ?? "Administrator"} />
    <div className="admin-main">
      <div className="admin-topline"><span>Store administration</span><div className="flex items-center gap-4"><span>Pakistan · PKR</span><ThemeToggle /></div></div>
      <ToastProvider>{children}</ToastProvider>
    </div>
  </div>;
}
