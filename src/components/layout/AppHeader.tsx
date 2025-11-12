import { Menu, Bell, Search, User, LogOut, Settings, Users, Shield } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserRole } from "@/contexts/UserRoleContext"
import { UserRole } from "@/types/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  onMenuToggle: () => void
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState("")
  const navigate = useNavigate()
  const { user, logout, switchRole, hasPermission } = useUserRole()

  const handleLogout = async () => {
    try {
      await logout()
      // Navigate to home - AppContent will show AuthPage if not authenticated
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, clear local state and redirect
      // Navigate to home - AppContent will show AuthPage if not authenticated
      navigate('/')
    }
  }

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      await switchRole(role)
      window.location.reload() // Refresh to update permissions
    } catch (error) {
      console.error('Role switch failed:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch role. Please try again.'
      alert(errorMessage) // Could be replaced with toast notification
    }
  }

  return (
    <header className="page-header lg:pl-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 w-48 lg:w-64 bg-background/50 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="relative md:hidden">
          <Search className="w-5 h-5" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            
            {/* Role switching for demo purposes
            {hasPermission("manage_users") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Switch Role (Demo)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Admin")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Manager")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Worker")}>
                  <User className="w-4 h-4 mr-2" />
                  Worker
                </DropdownMenuItem>
              </>
            )} */}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}