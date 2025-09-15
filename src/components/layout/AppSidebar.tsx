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
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  User
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
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
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
          "fixed left-0 top-0 z-50 h-full transform bg-card border-r border-border transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16 lg:w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-border transition-all duration-300",
          isCollapsed ? "justify-center p-4" : "justify-between p-6"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-2"
          )}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Bird className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">FarmTrack</h1>
                <p className="text-xs text-muted-foreground">Poultry Management</p>
              </div>
            )}
          </div>
          
          {/* Mobile close button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggle}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Desktop collapse button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Collapse toggle for collapsed state */}
        {isCollapsed && (
          <div className="flex justify-center p-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "p-4 space-y-2 flex-1 overflow-y-auto",
          isCollapsed && "px-2"
        )}>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.href}
                  className={cn(
                    "sidebar-nav-item transition-all duration-200",
                    isActive && "active",
                    isCollapsed ? "justify-center p-3 mx-auto w-12 h-12" : "justify-start"
                  )}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isCollapsed ? "mr-0" : "mr-3"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User info */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 border-t border-border bg-muted/30 transition-all duration-300",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Green Valley Farm</p>
              <p className="text-xs text-muted-foreground">{user?.role}: {user?.name}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}