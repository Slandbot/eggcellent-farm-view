import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  Bird, 
  Egg, 
  Package, 
  Syringe, 
  FileText,
  Home,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/contexts/UserRoleContext"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Birds Management", href: "/birds", icon: Bird },
  { name: "Feed Inventory", href: "/feed", icon: Package },
  { name: "Egg Collection", href: "/eggs", icon: Egg },
  { name: "Medicine & Vaccines", href: "/medicine", icon: Syringe },
  { name: "Reports", href: "/reports", icon: FileText },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation()
  const { user, canAccess } = useUserRole()

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => canAccess(item.href))

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Bird className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">FarmTrack</h1>
              <p className="text-xs text-muted-foreground">Poultry Management</p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "sidebar-nav-item",
                  isActive && "active"
                )}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) {
                    onToggle()
                  }
                }}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/30">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Green Valley Farm</p>
            <p className="text-xs text-muted-foreground">{user?.role}: {user?.name}</p>
          </div>
        </div>
      </div>
    </>
  )
}