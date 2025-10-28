import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar.tsx"
import {SIDEBAR_ITEMS, SIDEBAR_UTIL_ITEMS, PROFESSOR_SIDEBAR_ITEMS} from "@/constants/sidebar.ts";
import { useAuth } from "@/contexts/useAuth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isProfessor = user?.role === 'PROFESSOR'
  const navItems = isProfessor ? PROFESSOR_SIDEBAR_ITEMS : SIDEBAR_ITEMS
  const utilItems = isProfessor ? [] : SIDEBAR_UTIL_ITEMS

  return (
    <SidebarProvider>
      <AppSidebar items={navItems} utilItems={utilItems} />
      <main className="flex-1 p-8">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
