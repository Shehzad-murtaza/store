import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fix height to screen */}
      <AdminSidebar email={user.email ?? "Administrator"} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        
        {/* Topline Header - Fixed alignment with no top margin */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#333] px-6 py-4 sticky top-0 bg-white dark:bg-[#111] z-10">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Store administration
          </span>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Pakistan · PKR</span>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Page Content Wrapper */}
        <div className="flex-1 p-6 md:p-8">
          <ToastProvider>{children}</ToastProvider>
        </div>
        
      </div>
    </div>
  );
}