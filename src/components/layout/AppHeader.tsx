import { Menu, Bell, Search, User, LogOut, Settings, Users, Shield } from "lucide-react"
import { useState } from "react"
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
  const { user, logout, switchRole, hasPermission } = useUserRole()

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role)
    window.location.reload() // Refresh to update permissions
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
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search farm data..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 w-64 bg-muted/50 border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-warning text-xs">
            3
          </Badge>
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
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            
            {/* Role switching for demo purposes */}
            {hasPermission("manage_users") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Switch Role (Demo)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Admin")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Farm Manager")}>
                  <Users className="w-4 h-4 mr-2" />
                  Farm Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("Worker")}>
                  <User className="w-4 h-4 mr-2" />
                  Worker
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}