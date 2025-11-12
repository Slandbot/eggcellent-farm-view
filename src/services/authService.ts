import { User, LoginCredentials, RegisterData, UserRole } from "@/types/auth"
import { parseApiError, storage, withTimeout, retryWithBackoff, isRetryableError, ErrorType } from "@/utils/errorHandler"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = "auth"
const TOKEN_STORAGE_KEY = "token"
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token"
const REQUEST_TIMEOUT = 30000 // 30 seconds

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      id?: string
      email?: string
      name: string
      role: string
      farmId?: string
      isActive?: boolean
      createdAt?: any
      updatedAt?: any
    }
    token: string
    refreshToken?: string
    refresh_token?: string
    expiresIn?: number
  }
  timestamp: string
}

type AuthEvent = 'login' | 'logout' | 'token_refresh' | 'session_expired' | 'permission_denied'

class AuthService {
  private refreshTimeout?: NodeJS.Timeout
  private isRefreshing = false
  private failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = []
  private initializing = false
  private initPromise?: Promise<User | null>
  private listeners: Map<AuthEvent, (() => void)[]> = new Map()
  private lastLoginTime: number = 0
  private readonly LOGIN_GRACE_PERIOD = 5000 // 5 seconds grace period after login

  constructor() {
    this.setupTokenRefresh()
  }

  // === Event System ===
  on(event: AuthEvent, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
    return () => this.off(event, callback)
  }

  private off(event: AuthEvent, callback: () => void): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
  }

  private emit(event: AuthEvent): void {
    this.listeners.get(event)?.forEach(cb => cb())
  }

  // === Token Management ===
  private getToken(): string | null {
    return storage.getItem(TOKEN_STORAGE_KEY)
  }
  
  // Public method to check if token exists
  hasToken(): boolean {
    return !!this.getToken()
  }

  private getRefreshToken(): string | null {
    return storage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    const tokenStored = storage.setItem(TOKEN_STORAGE_KEY, accessToken)
    const refreshTokenStored = storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    
    if (!tokenStored || !refreshTokenStored) {
      console.error('Failed to store tokens in localStorage')
      throw new Error('Failed to store authentication tokens')
    }
    
    // Verify tokens were actually stored
    const verifyToken = storage.getItem(TOKEN_STORAGE_KEY)
    if (verifyToken !== accessToken) {
      console.error('Token storage verification failed')
      throw new Error('Token storage verification failed')
    }
    
    this.scheduleTokenRefresh()
  }

  private clearTokens(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = undefined
    }
    storage.removeItem(TOKEN_STORAGE_KEY)
    storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    storage.removeItem(AUTH_STORAGE_KEY)
    this.emit('logout')
  }

  // === JWT Utils ===
  private decodeJwtPayload(token: string): any {
    try {
      const payload = token.split('.')[1]
      if (!payload) return {}
      return JSON.parse(atob(payload))
    } catch {
      return {}
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token)
      if (!payload.exp) return false
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }

  // === Proactive Refresh Scheduling ===
  private scheduleTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    const token = this.getToken()
    if (!token) return

    try {
      const payload = this.decodeJwtPayload(token)
      const expiresAt = payload.exp * 1000
      const refreshAt = expiresAt - 5 * 60 * 1000 // 5 min before expiry
      const delay = Math.max(0, refreshAt - Date.now())

      this.refreshTimeout = setTimeout(() => {
        this.checkAndRefreshToken().catch(() => {
          this.clearTokens()
          this.emit('session_expired')
        }).finally(() => {
          this.scheduleTokenRefresh()
        })
      }, delay)
    } catch {
      this.clearTokens()
    }
  }

  private setupTokenRefresh(): void {
    this.scheduleTokenRefresh()
  }

  // === Core Request Handler ===
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const token = this.getToken()
    const url = `${API_BASE_URL}${endpoint}`

    // For auth endpoints (login, register, refresh), don't require token
    const isAuthEndpoint = endpoint.startsWith('/auth/login') || 
                           endpoint.startsWith('/auth/register') || 
                           endpoint.startsWith('/auth/refresh-token')

    // For non-auth endpoints, we must have a token
    let finalToken = token
    if (!isAuthEndpoint && !token) {
      console.error('No token available for authenticated endpoint:', endpoint)
      // Try to get token one more time
      finalToken = this.getToken()
      if (!finalToken) {
        this.clearTokens()
        this.emit('session_expired')
        throw new Error('Authentication required. Please log in again.')
      }
    }

    // Debug: Log token status for non-auth endpoints
    if (!isAuthEndpoint) {
      console.log('API Request:', {
        endpoint,
        hasToken: !!finalToken,
        tokenLength: finalToken?.length || 0,
        tokenPreview: finalToken ? `${finalToken.substring(0, 20)}...` : 'none'
      })
    }

    // Build headers object, ensuring Authorization is set if we have a token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add Authorization header if we have a token
    if (finalToken) {
      headers['Authorization'] = `Bearer ${finalToken}`
    }
    
    // Merge with any existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        // Convert Headers object to plain object
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(options.headers)) {
        // Convert array of [key, value] pairs to object
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        // Plain object
        Object.assign(headers, options.headers)
      }
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    }
    
    // Debug: Verify Authorization header is set
    if (!isAuthEndpoint) {
      const authHeader = (config.headers as Record<string, string>)?.['Authorization']
      console.log('Request headers:', {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader ? `${authHeader.substring(0, 30)}...` : 'none'
      })
    }

    try {
      const fetchPromise = fetch(url, config)
      const response = await withTimeout(fetchPromise, REQUEST_TIMEOUT)

      if (!response.ok) {
        let errorData: any = { message: `HTTP ${response.status}` }
        try {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            errorData = await response.json()
          } else {
            errorData.message = response.statusText || errorData.message
          }
        } catch {
          errorData.message = response.statusText || `HTTP ${response.status}`
        }

        const errorMessage = errorData.message || errorData.error?.message || errorData.error || `HTTP ${response.status}`

        // Handle 401 with auto-refresh (once per request)
        if (response.status === 401 && token && !endpoint.includes('/auth/') && !isRetry) {
          try {
            await this.processQueue()
            await this.refreshToken()
            return this.makeRequest<T>(endpoint, options, true)
          } catch (refreshError) {
            // Don't clear tokens immediately after login - might be backend issue
            const timeSinceLogin = Date.now() - this.lastLoginTime
            if (timeSinceLogin < this.LOGIN_GRACE_PERIOD) {
              // Within grace period - don't clear, just throw error
              const error = new Error('Authentication failed. Please try again.')
              ;(error as any).status = 401
              throw error
            }
            // Outside grace period - clear tokens
            this.clearTokens()
            this.emit('session_expired')
            const error = new Error('Session expired. Please log in again.')
            ;(error as any).status = 401
            throw error
          }
        }

        // Server errors (5xx)
        if (response.status >= 500) {
          console.error('Server error:', { endpoint, status: response.status, error: errorData })
          
          // Check for GCP permission errors
          const errorMessageStr = JSON.stringify(errorData).toLowerCase()
          const isGcpPermissionError = errorMessageStr.includes('permission denied') ||
                                       errorMessageStr.includes('serviceusage') ||
                                       errorMessageStr.includes('identitytoolkit') ||
                                       errorMessageStr.includes('caller does not have required permission')
          
          let userMsg: string
          if (isGcpPermissionError) {
            userMsg = 'The authentication service is experiencing a configuration issue. Please contact your administrator. This is a server-side permission problem that needs to be fixed by the backend team.'
          } else if (endpoint.includes('/auth/login')) {
            userMsg = 'Authentication service unavailable. Try again later.'
          } else if (endpoint.includes('/auth/profile')) {
            userMsg = 'Unable to update profile. The server encountered an error. Please try again later or contact support if the problem persists.'
          } else {
            userMsg = 'The server encountered an error. Please try again later.'
          }
          
          const error = new Error(userMsg)
          ;(error as any).status = response.status
          ;(error as any).originalError = errorData
          throw error
        }

        // Auth-specific errors
        const isAuthEndpoint = endpoint.includes('/auth/')
        const isInvalidCredentials = /invalid|incorrect|wrong|password/i.test(errorMessage)
        const isUserNotFound = /not found|does not exist/i.test(errorMessage)

        if (isAuthEndpoint && (response.status === 401 || response.status === 404 || isInvalidCredentials || isUserNotFound)) {
          let msg = 'Invalid email or password.'
          if (isUserNotFound) msg = 'No account found with this email.'
          const error = new Error(msg)
          ;(error as any).status = response.status
          throw error
        }

        // 403 Forbidden - Permission denied
        if (response.status === 403) {
          // Emit permission denied event for redirect handling
          this.emit('permission_denied')
          const error = new Error('You do not have permission to perform this action.')
          ;(error as any).status = 403
          throw error
        }

        // 404
        if (response.status === 404) {
          const error = new Error('Resource not found.')
          ;(error as any).status = 404
          throw error
        }

        // 429 Rate Limit
        if (response.status === 429) {
          // Try to extract retry-after header if available
          const retryAfter = response.headers.get('retry-after')
          let rateLimitMessage = 'Too many login attempts. Please wait a moment and try again.'
          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10)
            if (seconds < 60) {
              rateLimitMessage = `Too many login attempts. Please wait ${seconds} seconds and try again.`
            } else {
              const minutes = Math.ceil(seconds / 60)
              rateLimitMessage = `Too many login attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and try again.`
            }
          }
          const error = new Error(rateLimitMessage)
          ;(error as any).status = 429
          ;(error as any).retryAfter = retryAfter
          throw error
        }

        // 400
        if (response.status === 400) {
          const error = new Error(errorMessage || 'Invalid request.')
          ;(error as any).status = 400
          throw error
        }

        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        throw error
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      const text = await response.text()
      return text as unknown as T
    } catch (error) {
      const appError = parseApiError(error)
      throw new Error(appError.message)
    }
  }

  // === Token Refresh with Queue ===
  private processQueue(error?: any, token?: string) {
    this.failedQueue.forEach(prom => {
      if (error) prom.reject(error)
      else prom.resolve(token)
    })
    this.failedQueue = []
  }

  private async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      this.processQueue(new Error('No refresh token'))
      this.isRefreshing = false
      throw new Error('No refresh token')
    }

    try {
      const response = await retryWithBackoff(
        () => {
          // Use fetch directly for refresh to avoid infinite loop
          const url = `${API_BASE_URL}/auth/refresh-token`
          return fetch(url, {
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          body: JSON.stringify({ refreshToken }),
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ message: 'Refresh failed' }))
              throw new Error(errorData.message || errorData.error?.message || 'Token refresh failed')
            }
            return res.json() as Promise<AuthResponse>
          })
        },
        1, // Only retry once for refresh
        1000
      )

      const oldRefreshToken = this.getRefreshToken()
      const newRefreshToken = response.data.refreshToken || response.data.refresh_token || oldRefreshToken

      // Update tokens
      this.setTokens(response.data.token, newRefreshToken)

      // Update user
      const user = this.transformUserResponse(response)
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))

      this.processQueue(null, response.data.token)
      this.emit('token_refresh')
    } catch (error) {
      this.processQueue(error)
      // Don't clear tokens here - let the caller decide based on grace period
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  private async checkAndRefreshToken(): Promise<void> {
    const token = this.getToken()
    const refreshToken = this.getRefreshToken()

    if (!token || !refreshToken || !this.isTokenExpired(token)) {
      return
    }

    try {
      await this.refreshToken()
    } catch (error) {
      const appError = parseApiError(error)
      if (appError.type === ErrorType.AUTHENTICATION || appError.type === ErrorType.AUTHORIZATION) {
        this.clearTokens()
        this.emit('session_expired')
      }
      throw error
    }
  }

  // === User Transformation ===
  private transformUserResponse(response: AuthResponse): User {
    const userData = response.data.user
    const token = response.data.token

    // Extract ID
    const id = userData.id || userData.farmId || 'unknown'

    // Normalize role
    const backendRole = (userData.role || '').toUpperCase().replace(/\s+/g, '_')
    let role: UserRole = 'Worker'
    if (backendRole.includes('ADMIN')) role = 'Admin'
    else if (backendRole.includes('MANAGER') || backendRole.includes('FARM')) role = 'Manager'

    // Extract email
    let email = userData.email
    if (!email && token) {
      try {
        email = this.decodeJwtPayload(token).email
      } catch {}
    }

    // Handle createdAt
    let createdAt = new Date().toISOString()
    if (userData.createdAt) {
      if (userData.createdAt._seconds) {
        createdAt = new Date(userData.createdAt._seconds * 1000).toISOString()
      } else if (typeof userData.createdAt === 'number') {
        createdAt = new Date(userData.createdAt * 1000).toISOString()
      } else if (typeof userData.createdAt === 'string') {
        createdAt = new Date(userData.createdAt).toISOString()
      }
    }

    return {
      id,
      name: userData.name,
      email: email || '',
      role,
      createdAt,
      lastLogin: new Date().toISOString()
    }
  }

  // === Public API ===
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      const user = this.transformUserResponse(response)
      const refreshToken = response.data.refreshToken || response.data.refresh_token || ''
      
      // Verify token exists before storing
      if (!response.data.token) {
        console.error('Login response missing token')
        throw new Error('Login failed: No token received from server')
      }
      
      this.setTokens(response.data.token, refreshToken)
      
      // Verify token was stored
      const storedToken = this.getToken()
      if (!storedToken) {
        console.error('Failed to store token after login')
        throw new Error('Failed to store authentication token')
      }
      
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      this.lastLoginTime = Date.now() // Track login time for grace period
      this.emit('login')

      return user
    } catch (error) {
      console.error('Login failed:', { email: credentials.email.split('@')[0] + '@...' })
      throw error
    }
  }

  async register(data: RegisterData): Promise<User> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    const user = this.transformUserResponse(response)
    this.setTokens(response.data.token, response.data.refreshToken || '')
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    this.emit('login')

    return user
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  private normalizeRole(role: string | undefined): UserRole {
    if (!role) return 'Worker'
    const normalized = role.toUpperCase().trim()
    if (normalized.includes('ADMIN')) return 'Admin'
    if (normalized.includes('MANAGER') || normalized.includes('FARM')) return 'Manager'
    return 'Worker'
  }

  getCurrentUser(): (User & { phone?: string; address?: string; dateOfBirth?: string; bio?: string; department?: string }) | null {
    // Always try to get user from storage first - use as fallback
    try {
      const userJson = storage.getItem(AUTH_STORAGE_KEY)
      if (userJson) {
        const user = JSON.parse(userJson)
        // Normalize role if it's not already normalized
        if (user.role && typeof user.role === 'string') {
          user.role = this.normalizeRole(user.role)
        }
        // Ensure required fields exist with proper defaults
        if (!user.id) {
          user.id = 'unknown'
        }
        if (!user.name) {
          // Try to extract name from email if name is missing
          user.name = user.email?.split('@')[0] || 'User'
        }
        if (!user.email) {
          user.email = ''
        }
        if (!user.createdAt) {
          user.createdAt = new Date().toISOString()
        }
        if (!user.lastLogin) {
          user.lastLogin = new Date().toISOString()
        }
        // If we have a token, check if it's expired (but still return user)
        // The token refresh will handle expired tokens
        const token = this.getToken()
        if (token) {
    const payload = this.decodeJwtPayload(token)
          // If token is expired, we'll still return the user
          // initializeAuth will try to refresh it
    if (payload.exp && this.isTokenExpired(token)) {
            // Token expired but we have user data - return it anyway
            // The refresh logic will handle token renewal
            return user as User
          }
        }
        return user as User
      }
    } catch {
      // If parsing fails, remove corrupted data
      storage.removeItem(AUTH_STORAGE_KEY)
    }
    
    // No stored user - check if we have a token (might be first time)
    const token = this.getToken()
    if (!token) {
      return null
    }
    
    return null
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false
    try {
      await this.makeRequest('/auth/verify-token')
      return true
    } catch {
      return false
    }
  }

  private normalizeTimestamp(timestamp: any): string {
    if (!timestamp) {
      return new Date().toISOString()
    }
    
    // Handle Firebase timestamp format { _seconds: number, _nanoseconds: number }
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000).toISOString()
    }
    
    // Handle Unix timestamp in seconds
    if (typeof timestamp === 'number') {
      // If timestamp is less than year 2000 in milliseconds, assume it's in seconds
      if (timestamp < 946684800000) {
        return new Date(timestamp * 1000).toISOString()
      }
      return new Date(timestamp).toISOString()
    }
    
    // Handle ISO string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString()
    }
    
    return new Date().toISOString()
  }

  private transformProfileData(profileData: any): User {
    // Normalize role
    const role = this.normalizeRole(profileData.role || 'Worker')
    
    // Normalize timestamps
    const createdAt = this.normalizeTimestamp(profileData.createdAt)
    const lastLogin = this.normalizeTimestamp(profileData.lastLogin)
    
    return {
      id: profileData.id || profileData.farmId || 'unknown',
      name: profileData.name || profileData.email?.split('@')[0] || 'User',
      email: profileData.email || '',
      role,
      avatar: profileData.avatar,
      createdAt,
      lastLogin,
    }
  }

  async getProfile(): Promise<User & { phone?: string; address?: string; dateOfBirth?: string; bio?: string; department?: string; avatar?: string }> {
    try {
      const response = await this.makeRequest<any>('/auth/profile')
      
      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log('[getProfile] Raw API response:', response)
      }
      
      // Handle different response formats
      let profileData: any
      if (response && typeof response === 'object') {
        // If response has data field, use it
        if ('data' in response && response.data) {
          profileData = response.data
        } else {
          // Otherwise use response directly
          profileData = response
        }
      } else {
        profileData = response
      }
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('[getProfile] Extracted profileData:', profileData)
        console.log('[getProfile] Avatar value:', profileData.avatar)
      }
      
      // Transform and normalize the profile data (core User fields)
      const user = this.transformProfileData(profileData)
      
      // Preserve additional fields that aren't in User type
      const extendedUser = {
        ...user,
        // Explicitly preserve avatar - check multiple possible locations
        avatar: profileData.avatar || profileData.avatarUrl || profileData.profilePicture || user.avatar || undefined,
        phone: profileData.phone || undefined,
        address: profileData.address || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
        bio: profileData.bio || undefined,
        department: profileData.department || undefined,
        farmId: profileData.farmId || undefined,
        isActive: profileData.isActive,
      }
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('[getProfile] Final extendedUser:', extendedUser)
        console.log('[getProfile] Final avatar:', extendedUser.avatar)
      }
      
      // Store the extended user data (including additional fields)
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(extendedUser))
      
      return extendedUser
    } catch (error) {
      // If profile fetch fails, check if we have a stored user
      const storedUser = this.getCurrentUser()
      if (storedUser) {
        // Return stored user instead of throwing - might be a network issue
        return storedUser as any
      }
      throw error
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.makeRequest<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    
    // Handle different response formats
    let profileData: any
    if (response && typeof response === 'object') {
      // If response has data field, use it
      if ('data' in response && response.data) {
        profileData = response.data
      } else {
        // Otherwise use response directly
        profileData = response
      }
    } else {
      profileData = response
    }
    
    // Transform and normalize the profile data
    const updatedUser = this.transformProfileData(profileData)
    
    // Store normalized user
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    return updatedUser
  }

  async uploadAvatar(formData: FormData): Promise<{ avatar: string }> {
    const token = this.getToken()
    if (!token) {
      throw new Error('Authentication required')
    }

    const url = `${API_BASE_URL}/auth/profile/avatar`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || error.error?.message || 'Failed to upload avatar')
    }

    const result = await response.json()
    
    // Handle different response formats
    let avatarUrl: string
    if (result && typeof result === 'object') {
      if ('data' in result && result.data) {
        // Handle { success: true, data: { avatar: "..." } }
        avatarUrl = result.data.avatar || result.data
      } else if ('avatar' in result) {
        // Handle { avatar: "..." }
        avatarUrl = result.avatar
      } else {
        // Handle direct string or other formats
        avatarUrl = typeof result === 'string' ? result : result.url || ''
      }
    } else {
      avatarUrl = result || ''
    }
    
    // Update stored user with new avatar
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: avatarUrl }
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    }
    
    return { avatar: avatarUrl }
  }

  async deleteAvatar(): Promise<void> {
    const token = this.getToken()
    if (!token) {
      throw new Error('Authentication required')
    }

    const url = `${API_BASE_URL}/auth/profile/avatar`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }))
      throw new Error(error.message || error.error?.message || 'Failed to delete avatar')
    }

    // Update stored user to remove avatar
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: undefined }
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    }
  }

  async updateSecuritySettings(settings: { [key: string]: boolean }): Promise<void> {
    await this.makeRequest('/auth/profile/security-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // If currentPassword is empty, user doesn't have a password yet (setting initial password)
    const payload: { currentPassword?: string; newPassword: string } = { newPassword }
    if (currentPassword) {
      payload.currentPassword = currentPassword
    }
    
    await this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async revokeToken(userId: string): Promise<void> {
    await this.makeRequest('/auth/revoke-token', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!(token && !this.isTokenExpired(token) && this.getCurrentUser())
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role
  }

  isAdmin(): boolean {
    return this.hasRole('Admin')
  }

  // === App Initialization ===
  async initializeAuth(): Promise<User | null> {
    // If we already have a valid user, don't re-initialize
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      return currentUser
    }

    if (this.initPromise) return this.initPromise

    if (this.initializing) {
      return new Promise(resolve => setTimeout(() => resolve(this.initializeAuth()), 100))
    }

    this.initializing = true
    this.initPromise = this.performInit()
    const result = await this.initPromise
    this.initializing = false
    this.initPromise = undefined
    return result
  }

  private async performInit(): Promise<User | null> {
    const token = this.getToken()
    const storedUser = this.getCurrentUser()

    if (!token) {
      this.clearTokens()
      return null
    }

    // Check if token has exp field before checking expiration
    const payload = this.decodeJwtPayload(token)
    const hasExp = payload.exp !== undefined
    const isExpired = hasExp && this.isTokenExpired(token)

    if (isExpired) {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        this.clearTokens()
        return null
      }
      try {
        await this.refreshToken()
      } catch {
        this.clearTokens()
        return null
      }
    }

    try {
      const profile = await this.getProfile()
      this.scheduleTokenRefresh()
      return profile
    } catch (error) {
      const appError = parseApiError(error)
      // If profile fetch fails but we have a stored user and token is valid, keep the stored user
      if (storedUser && (!hasExp || !isExpired)) {
        // Token seems valid, return stored user instead of clearing
        return storedUser
      }
      
      if (appError.type === ErrorType.AUTHENTICATION && !isExpired) {
        try {
          await this.refreshToken()
          const profile = await this.getProfile()
          return profile
        } catch {
          // Only clear if refresh also fails
          this.clearTokens()
          return null
        }
      }
      
      // If we have a stored user and token exists, don't clear - might be a network issue
      if (storedUser) {
        return storedUser
      }
      
      this.clearTokens()
      return null
    }
  }
}

export const authService = new AuthService()