
"use client"

import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Package,
  Users,
  ClipboardList,
  LogOut,
  Settings
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const menuItems = [
  { icon: LayoutDashboard, label: "Painel Geral", href: "/" },
  { icon: UtensilsCrossed, label: "Mesas e Pedidos", href: "/mesas" },
  { icon: ChefHat, label: "Cozinha", href: "/cozinha" },
  { icon: ClipboardList, label: "Cardápio Digital", href: "/menu" },
  { icon: Package, label: "Estoque", href: "/estoque" },
  { icon: Users, label: "Funcionários", href: "/funcionarios" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">ChefPro</h1>
            <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-4 opacity-50" />
      <SidebarContent className="px-4 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={`flex gap-3 py-6 px-4 rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                }`}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-base">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => logout()}
              className="flex gap-3 py-6 px-4 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-base">{user ? "Sair" : "Fazer Login"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
