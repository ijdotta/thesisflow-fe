import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-1 p-8">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}