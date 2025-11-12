import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useUserRole } from "@/contexts/UserRoleContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredPage?: string
}

/**
 * ProtectedRoute component that checks user permissions and redirects to a safe page
 * if the user doesn't have access.
 */
export function ProtectedRoute({ 
  children, 
  requiredPermission,
  requiredPage 
}: ProtectedRouteProps) {
  const { canAccess, hasPermission, redirectToSafePage, isLoading, isAuthenticated, user } = useUserRole()
  const location = useLocation()
  const hasRedirected = useRef(false)
  const redirectingRef = useRef(false)

  // Check access directly without memoization to avoid dependency issues
  const checkAccess = () => {
    if (isLoading || !isAuthenticated || !user) {
      return { hasAccess: true, hasRequiredPermission: true }
    }

    let hasPageAccess = true
    if (requiredPage) {
      const page = requiredPage.startsWith("/") ? requiredPage : `/${requiredPage}`
      hasPageAccess = canAccess(page)
    } else {
      hasPageAccess = canAccess(location.pathname)
    }

    const hasRequiredPerm = requiredPermission ? hasPermission(requiredPermission) : true

    return {
      hasAccess: hasPageAccess,
      hasRequiredPermission: hasRequiredPerm
    }
  }

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return
    
    // If not authenticated, the App component will handle redirect to login
    if (!isAuthenticated) return

    // Don't redirect if we're already on profile or dashboard (safe pages)
    const currentPath = location.pathname
    if (currentPath === "/profile" || currentPath === "/") {
      hasRedirected.current = false
      redirectingRef.current = false
      return
    }

    // Prevent multiple redirects - check both flags
    if (hasRedirected.current || redirectingRef.current) {
      return
    }

    // Check if user has access
    const accessCheck = checkAccess()
    if (!accessCheck.hasAccess || !accessCheck.hasRequiredPermission) {
      // Set flags before redirecting
      hasRedirected.current = true
      redirectingRef.current = true
      
      // Use requestAnimationFrame to ensure this happens after render
      requestAnimationFrame(() => {
        redirectToSafePage()
        // Reset redirecting flag after navigation completes
        setTimeout(() => {
          redirectingRef.current = false
        }, 500)
      })
    } else {
      // User has access, reset redirect flag
      hasRedirected.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user?.id, user?.role, location.pathname, requiredPage, requiredPermission])

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (App will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  // Check access before rendering
  const hasPageAccess = requiredPage 
    ? canAccess(requiredPage.startsWith("/") ? requiredPage : `/${requiredPage}`)
    : canAccess(location.pathname)
  
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true

  if (!hasPageAccess || !hasRequiredPermission) {
    // Redirect will happen in useEffect, show loading state while redirecting
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

