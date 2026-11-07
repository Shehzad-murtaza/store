import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AdminBackButton } from "@/components/admin/AdminBackButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="admin-layout-shell flex h-dvh min-w-0 w-full flex-col overflow-hidden">
      {/* Sidebar - Fix height to screen */}
      <AdminSidebar email={user.email ?? "Administrator"} />
      
      {/* Main Content Area */}
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto md:h-full">
        
        {/* Topline Header - Fixed alignment with no top margin */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-[#333] dark:bg-[#111] sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <AdminBackButton />
            <span className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Store administration</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:gap-4 sm:text-sm">
            <span className="hidden sm:inline">Pakistan · PKR</span>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Page Content Wrapper */}
        <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
          <ToastProvider>{children}</ToastProvider>
        </div>
        
      </div>
    </div>
  );
}
