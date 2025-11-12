import { useEffect, useCallback } from "react"

interface ApiStatusProps {
  apiUrl: string
}

export function ApiStatus({ apiUrl = '/api' }: ApiStatusProps) {
  const checkApiConnection = useCallback(async () => {
    console.log('🔍 Checking API connection to:', apiUrl)
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('✅ API connection successful:', apiUrl)
      } else {
        console.error('❌ API connection failed:', {
          url: apiUrl,
          status: response.status,
          statusText: response.statusText
        })
        console.log('🔧 Troubleshooting steps:')
        console.log('1. Make sure your backend server is running on', apiUrl.replace('/api', ''))
        console.log('2. Ensure the backend has a /api/health endpoint')
        console.log('3. Check that CORS is properly configured')
        console.log('4. Verify the API endpoints match the expected format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      console.error('❌ Cannot connect to API at', apiUrl)
      console.error('Error:', errorMessage)
      console.log('🔧 Troubleshooting steps:')
      console.log('1. Make sure your backend server is running on', apiUrl.replace('/api', ''))
      console.log('2. Ensure the backend has a /api/health endpoint')
      console.log('3. Check that CORS is properly configured')
      console.log('4. Verify the API endpoints match the expected format')
    }
  }, [apiUrl])

  useEffect(() => {
    checkApiConnection()
  }, [checkApiConnection])

  // Return null since we're only logging to console
  return null
}