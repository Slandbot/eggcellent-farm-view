import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  revokeToken: (userId: string) => Promise<void>
  verifyToken: () => Promise<boolean>
  userRole: UserRole | null
  redirectToSafePage: () => void
}

// ──────────────────────────────────────────────────────────────────────────────
// Permission & Page Access Configuration
// ──────────────────────────────────────────────────────────────────────────────
const rolePermissions: Record<UserRole, string[]> = {
  Admin: [
    "view_dashboard",
    "manage_birds",
    "manage_feed",
    "collect_eggs",
    "manage_medicine",
    "view_reports",
    "manage_users",
    "edit_settings",
    "delete_records",
  ],
  Manager: [
    "view_dashboard",
    "manage_birds",
    "manage_feed",
    "collect_eggs",
    "manage_medicine",
    "view_reports",
    "edit_records",
  ],
  Worker: [
    "view_dashboard",
    "collect_eggs",
    "view_birds",
    "view_feed",
    "basic_reports",
  ],
}

const pageAccess: Record<UserRole, string[]> = {
  Admin: ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports", "/users", "/settings", "/profile"],
  Manager: ["/", "/birds", "/feed", "/eggs", "/medicine", "/reports", "/users", "/profile"],
  Worker: ["/", "/eggs", "/birds", "/feed", "/profile"],
}

// ──────────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────────
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // ──────────────────────────────────────────────────────────────────────
  // Auth Event Handlers
  // ──────────────────────────────────────────────────────────────────────
  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser)
    setIsLoading(false)
    navigate("/", { replace: true })
  }, [navigate])

  const handleLogout = useCallback(() => {
    setUser(null)
    setIsLoading(false)
    navigate("/login", { replace: true })
  }, [navigate])

  const handleSessionExpired = useCallback(() => {
    setUser(null)
    setIsLoading(false)
    navigate("/login?reason=expired", { replace: true })
  }, [navigate])

  const handleTokenRefresh = useCallback(() => {
    // Optionally refresh user profile
    authService.getProfile().then(setUser).catch(() => {})
  }, [])

  // Redirect to a safe page (profile or dashboard) when user doesn't have permission
  // Defined early so it can be used in event handlers
  // Use ref to store navigate function to avoid dependency on navigate
  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  const redirectToSafePage = useCallback(() => {
    const currentUser = user
    if (!currentUser) {
      navigateRef.current("/", { replace: true })
      return
    }
    
    // Try to redirect to profile first, then dashboard
    // Profile is accessible to all authenticated users
    // Check if user can access profile (all authenticated users should be able to)
    const canAccessProfile = currentUser.role === 'Admin' || (pageAccess[currentUser.role]?.includes("/profile") ?? false)
    if (canAccessProfile) {
      navigateRef.current("/profile", { replace: true })
    } else {
      // Fallback to dashboard (home) - all authenticated users can access dashboard
      navigateRef.current("/", { replace: true })
    }
  }, [user])

  // Use refs for callbacks used in event handlers to avoid re-subscriptions
  const redirectToSafePageRef = useRef(redirectToSafePage)
  useEffect(() => {
    redirectToSafePageRef.current = redirectToSafePage
  }, [redirectToSafePage])

  const handlePermissionDenied = useCallback(() => {
    // Redirect to safe page when permission is denied
    redirectToSafePageRef.current()
  }, [])

  // ──────────────────────────────────────────────────────────────────────
  // Initialize Auth + Subscribe to Events
  // ──────────────────────────────────────────────────────────────────────
  const hasLoggedInRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      // Don't initialize if user just logged in
      if (hasLoggedInRef.current) {
        return
      }

      // Always check for stored user first - use as fallback
      const storedUser = authService.getCurrentUser()
      if (storedUser) {
        // Set stored user immediately so app can render
        setUser(storedUser)
        setIsLoading(false)
        
        // Try to refresh/validate in background, but don't block on it
        // Only update if we get a fresh user, don't clear on error
        try {
          const freshUser = await authService.initializeAuth()
          if (isMounted && !hasLoggedInRef.current && freshUser) {
            setUser(freshUser)
          }
        } catch (error) {
          // Keep using stored user even if refresh fails
          // Only log error, don't clear user
          console.warn('Failed to refresh auth, using stored user:', error)
        }
        return
      }

      // No stored user - try to initialize from token
      try {
        const freshUser = await authService.initializeAuth()
        if (isMounted && !hasLoggedInRef.current) {
          setUser(freshUser)
        }
      } catch (error) {
        // Only clear user if we have no stored user AND auth fails
        if (isMounted && !hasLoggedInRef.current) {
          const msg = error instanceof Error ? error.message : String(error)
          // Only clear on actual auth errors, not network issues
          if (msg.includes("expired") || msg.includes("invalid") || msg.includes("unauthorized")) {
            setUser(null)
          }
        }
      } finally {
        if (isMounted && !hasLoggedInRef.current) {
          setIsLoading(false)
        }
      }
    }

    init()

    // Subscribe to auth events
    const unsubLogin = authService.on("login", () => {
      hasLoggedInRef.current = true // Prevent re-initialization after login
      const user = authService.getCurrentUser()
      if (user) {
        setUser(user)
        setIsLoading(false)
        handleLogin(user)
      }
    })

    const unsubLogout = authService.on("logout", () => {
      hasLoggedInRef.current = false // Reset on logout
      handleLogout()
    })
    const unsubExpired = authService.on("session_expired", () => {
      hasLoggedInRef.current = false // Reset on session expired
      handleSessionExpired()
    })
    const unsubRefresh = authService.on("token_refresh", handleTokenRefresh)
    const unsubPermissionDenied = authService.on("permission_denied", handlePermissionDenied)

    return () => {
      isMounted = false
      unsubLogin()
      unsubLogout()
      unsubExpired()
      unsubRefresh()
      unsubPermissionDenied()
    }
  }, [handleLogin, handleLogout, handleSessionExpired, handleTokenRefresh, handlePermissionDenied])

  // ──────────────────────────────────────────────────────────────────────
  // Auth Actions - Memoized to prevent context value recreation
  // ──────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.login({ email, password })
      // Event will trigger handleLogin
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.register({ name, email, password, role })
      // Event will trigger login flow
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
      // Event will trigger handleLogout
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!user) return
    setIsLoading(true)
    try {
      const updated = await authService.updateProfile(updates)
      setUser(updated)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const switchRole = useCallback(async (role: UserRole): Promise<void> => {
    if (!user || user.role === role) return
    setIsLoading(true)
    try {
      const updated = await authService.updateProfile({ role })
      setUser(updated)
    } catch (error) {
      console.error("Role switch failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const revokeToken = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.revokeToken(userId)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = useCallback(async (): Promise<boolean> => {
    return authService.verifyToken()
  }, [])

  // ──────────────────────────────────────────────────────────────────────
  // Permission Helpers
  // ──────────────────────────────────────────────────────────────────────
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    // Admin has all permissions
    if (user.role === 'Admin') return true
    return rolePermissions[user.role]?.includes(permission) ?? false
  }, [user])

  const canAccess = useCallback((page: string): boolean => {
    if (!user) return false
    // Normalize page path (ensure it starts with /)
    const normalizedPage = page.startsWith('/') ? page : `/${page}`
    // All authenticated users can access home page
    if (normalizedPage === '/' || normalizedPage === '/profile') return true
    // Admin has access to all pages
    if (user.role === 'Admin') return true
    return pageAccess[user.role as UserRole]?.includes(normalizedPage) ?? false
  }, [user])

  const isAuthenticated = !!user
  const userRole = user?.role || null

  // ──────────────────────────────────────────────────────────────────────
  // Context Value - Memoized to prevent unnecessary re-renders
  // ──────────────────────────────────────────────────────────────────────
  const value: UserRoleContextType = useMemo(() => ({
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
    changePassword,
    revokeToken,
    verifyToken,
    userRole,
    redirectToSafePage,
  }), [
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
    changePassword,
    revokeToken,
    verifyToken,
    userRole,
    redirectToSafePage,
  ])

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────
export function useUserRole(): UserRoleContextType {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error("useUserRole must be used within UserRoleProvider")
  }
  return context
}