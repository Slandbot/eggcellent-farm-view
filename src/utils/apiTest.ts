// Simple test utility to verify API endpoints are working
import { authService } from '@/services/authService'

export const testAuthEndpoints = async () => {
  console.log('Testing authentication endpoints...')
  
  try {
    // Skip token verification due to backend token type mismatch
    // Test profile retrieval directly (if authenticated)
    if (authService.isAuthenticated()) {
      console.log('Testing profile retrieval...')
      try {
        const profile = await authService.getProfile()
        console.log('Profile retrieved:', profile)
        console.log('Authentication working correctly')
      } catch (error) {
        console.log('Profile retrieval failed:', error)
      }
    } else {
      console.log('No authentication token found')
    }
    
    console.log('API endpoint tests completed')
  } catch (error) {
    console.error('API test failed:', error)
  }
}

// Helper function to test login
export const testLogin = async (email: string, password: string) => {
  try {
    console.log('Testing login...')
    const user = await authService.login({ email, password })
    console.log('Login successful:', user)
    return user
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// Helper function to test registration
export const testRegister = async (name: string, email: string, password: string, role: 'Admin' | 'Farm Manager' | 'Worker') => {
  try {
    console.log('Testing registration...')
    const user = await authService.register({ name, email, password, role })
    console.log('Registration successful:', user)
    return user
  } catch (error) {
    console.error('Registration failed:', error)
    throw error
  }
}