import { User, LoginCredentials, RegisterData, UserRole } from "@/types/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
const AUTH_STORAGE_KEY = "auth"
const TOKEN_STORAGE_KEY = "token"
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token"

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      email: string
      name: string
      role: string
      farmId: string
      isActive: boolean
      createdAt: any
      updatedAt: any
    }
    token: string
    refreshToken?: string
  }
  timestamp: string
}

interface ApiError {
  message: string
  status: number
}

class AuthService {
  constructor() {
    // Enable automatic token refresh
    this.setupTokenRefresh()
    console.log('AuthService - Automatic token refresh enabled')
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  // Check if a JWT token is expired
  private isTokenExpired(token: string): boolean {
    try {
      // Split the token and get the payload
      const payload = token.split('.')[1];
      if (!payload) return true;
      
      // Decode the base64 payload
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check if the token has an expiration time
      if (!decodedPayload.exp) return false;
      
      // Compare expiration time with current time
      const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if there's an error
    }
  }

  private setupTokenRefresh(): void {
    // Check token immediately on startup
    this.checkAndRefreshToken();
    
    // Auto-refresh token when it's about to expire (every 5 minutes)
    setInterval(() => this.checkAndRefreshToken(), 5 * 60 * 1000);
  }
  
  private async checkAndRefreshToken(): Promise<void> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    
    console.log('TokenRefresh - Checking tokens:', { hasToken: !!token, hasRefreshToken: !!refreshToken });
    
    if (!token || !refreshToken) {
      console.log('TokenRefresh - Missing tokens, skipping refresh');
      return;
    }
    
    // Check if token is expired or about to expire (within 10 minutes)
    const isExpired = this.isTokenExpired(token);
    
    if (isExpired) {
      console.log('TokenRefresh - Token is expired, attempting refresh');
      try {
        await this.refreshToken();
        console.log('TokenRefresh - Token refreshed successfully');
      } catch (error) {
        console.error('TokenRefresh - Failed:', error);
        // Only logout if we're sure the refresh token is invalid
        // Don't logout on network errors or temporary issues
        if (error instanceof Error && error.message.includes('refresh token')) {
          console.log('TokenRefresh - Invalid refresh token, logging out');
          this.logout().catch(err => console.error('Logout failed:', err));
        } else {
          console.log('TokenRefresh - Network/temporary error, keeping user logged in');
        }
      }
    } else {
      console.log('TokenRefresh - Token is still valid, no refresh needed');
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      // Transform backend user data to frontend User format
      const user: User = {
        id: response.data.user.farmId,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role === 'SUPER_ADMIN' ? 'Admin' : response.data.user.role as UserRole,
        createdAt: new Date(response.data.user.createdAt._seconds ? response.data.user.createdAt._seconds * 1000 : Date.now()).toISOString(),
        lastLogin: new Date().toISOString()
      }

      // Store tokens and user data
      this.setTokens(response.data.token, response.data.refreshToken || '')
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      
      return user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Transform backend user data to frontend User format
      const user: User = {
        id: response.data.user.farmId,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role === 'SUPER_ADMIN' ? 'Admin' : response.data.user.role as UserRole,
        createdAt: new Date(response.data.user.createdAt._seconds ? response.data.user.createdAt._seconds * 1000 : Date.now()).toISOString(),
        lastLogin: new Date().toISOString()
      }

      // Store tokens and user data
      this.setTokens(response.data.token, response.data.refreshToken || '')
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      
      return user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEY)
    return userJson ? JSON.parse(userJson) : null
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    console.log('RefreshToken - Has refresh token:', !!refreshToken)
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      console.log('RefreshToken - Making request to /auth/refresh-token')
      const response = await this.makeRequest<AuthResponse>('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })

      console.log('RefreshToken - Response received, updating tokens')
      
      // Transform backend user data to frontend User format
      const user: User = {
        id: response.data.user.farmId,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role === 'SUPER_ADMIN' ? 'Admin' : response.data.user.role as UserRole,
        createdAt: new Date(response.data.user.createdAt._seconds ? response.data.user.createdAt._seconds * 1000 : Date.now()).toISOString(),
        lastLogin: new Date().toISOString()
      }

      this.setTokens(response.data.token, response.data.refreshToken || '')
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      console.log('RefreshToken - Tokens updated successfully')
    } catch (error) {
      console.log('RefreshToken - Error occurred:', error)
      this.clearTokens()
      throw new Error('Token refresh failed')
    }
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getToken()
    
    if (!token) {
      return false
    }
    
    try {
      await this.makeRequest('/auth/verify-token')
      return true
    } catch (error) {
      // Token verification failed - likely expired or invalid
      return false
    }
  }

  async getProfile(): Promise<User> {
    try {
      const user = await this.makeRequest<User>('/auth/profile')
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return user
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get profile')
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.makeRequest<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.makeRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to change password')
    }
  }

  async revokeToken(userId: string): Promise<void> {
    try {
      await this.makeRequest('/auth/revoke-token', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to revoke token')
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Helper method to check if user has specific role
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.hasRole('Admin')
  }

  // Initialize authentication state on app start
  async initializeAuth(): Promise<User | null> {
    const token = this.getToken()
    
    if (!token) {
      console.log('No authentication token found - user needs to log in')
      return null
    }

    // Check if this is an old mock token and clear it
    if (token.startsWith('dev_mode_token_') || token.startsWith('mock_')) {
      console.log('Clearing old mock authentication token')
      this.clearTokens()
      return null
    }

    try {
      // First try to verify the token
      const isValid = await this.verifyToken()
      
      if (!isValid) {
        console.log('Token is invalid, attempting to refresh')
        // Try to refresh the token if verification fails
        try {
          await this.refreshToken()
          console.log('Token refreshed successfully')
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError)
          this.clearTokens()
          return null
        }
      }
      
      // Get user profile with the current token (original or refreshed)
      const profile = await this.getProfile()
      console.log('User authenticated successfully:', profile.email)
      return profile
    } catch (error) {
      console.log('Authentication verification failed:', error)
      this.clearTokens()
      return null
    }
  }
}

export const authService = new AuthService()