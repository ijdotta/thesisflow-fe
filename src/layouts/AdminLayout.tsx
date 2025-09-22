import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar.tsx"
import {SIDEBAR_ITEMS} from "@/constants/sidebar.ts";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar items={SIDEBAR_ITEMS} />
      <main className="flex-1 p-8">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}