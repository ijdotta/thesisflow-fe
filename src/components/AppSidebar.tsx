import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import type {SidebarItem} from "@/constants/sidebar.ts";
import { useAuth } from "@/contexts/useAuth"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface AppSidebarProps { items: SidebarItem[]; utilItems?: SidebarItem[] }
export function AppSidebar({ items = [], utilItems = [] }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explorar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {utilItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {utilItems.map(item => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-700">
              <div>
                <div className="font-medium">{user?.role || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.userId.substring(0, 8)}...</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1 hover:bg-gray-200 rounded"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}