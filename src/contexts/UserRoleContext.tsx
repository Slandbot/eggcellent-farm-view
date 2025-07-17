import { createContext, useContext, useState, ReactNode } from "react"

export type UserRole = "Admin" | "Farm Manager" | "Worker"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface UserRoleContextType {
  user: User | null
  setUser: (user: User | null) => void
  hasPermission: (permission: string) => boolean
  canAccess: (page: string) => boolean
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
  "Admin": ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports"],
  "Farm Manager": ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports"], 
  "Worker": ["/", "/eggs", "/birds", "/feed"]
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  // Default user for demo - in real app this would come from authentication
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "John Smith", 
    email: "john@farm.com",
    role: "Farm Manager"
  })

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return rolePermissions[user.role]?.includes(permission) || false
  }

  const canAccess = (page: string): boolean => {
    if (!user) return false
    return pageAccess[user.role]?.includes(page) || false
  }

  return (
    <UserRoleContext.Provider value={{ user, setUser, hasPermission, canAccess }}>
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