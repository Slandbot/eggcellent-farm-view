import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { User, UserRole, AuthState } from "@/types/auth"
import { authService } from "@/services/authService"

interface UserRoleContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccess: (page: string) => boolean
  switchRole: (role: UserRole) => Promise<void>
  userRole: UserRole | null
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  "Admin": [
    "view_dashboard",
    "manage_birds", 
    "manage_feed",
    "collect_eggs",
    "manage_medicine",
    "view_reports",
    "manage_users",
    "edit_settings",
    "delete_records"
  ],
  "Farm Manager": [
    "view_dashboard",
    "manage_birds",
    "manage_feed", 
    "collect_eggs",
    "manage_medicine",
    "view_reports",
    "edit_records"
  ],
  "Worker": [
    "view_dashboard",
    "collect_eggs",
    "view_birds",
    "view_feed",
    "basic_reports"
  ]
}

// Define page access for each role
const pageAccess: Record<UserRole, string[]> = {
  "Admin": ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports", "/users"],
  "Farm Manager": ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports", "/users"], 
  "Worker": ["/", "/eggs", "/birds", "/feed"]
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.initializeAuth()
        setUser(user)
      } catch (error) {
        console.error('Authentication initialization failed:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const loggedInUser = await authService.login({ email, password })
      setUser(loggedInUser)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true)
    try {
      const newUser = await authService.register({ name, email, password, role })
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) return
    const updatedUser = await authService.updateProfile(updates)
    setUser(updatedUser)
  }

  const switchRole = async (role: UserRole): Promise<void> => {
    if (!user) return
    try {
      const updatedUser = await authService.updateProfile({ role })
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to switch role:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return rolePermissions[user.role]?.includes(permission) || false
  }

  const canAccess = (page: string): boolean => {
    if (!user) return false
    return pageAccess[user.role]?.includes(page) || false
  }

  const isAuthenticated = !!user
  const userRole = user?.role || null

  return (
    <UserRoleContext.Provider value={{ 
      user, 
      isAuthenticated,
      isLoading,
      login, 
      register,
      logout, 
      updateUser,
      hasPermission, 
      canAccess,
      switchRole,
      userRole
    }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }
  return context
}