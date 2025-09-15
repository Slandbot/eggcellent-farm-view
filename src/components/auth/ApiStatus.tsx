import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ApiStatusProps {
  apiUrl: string
}

export function ApiStatus({ apiUrl }: ApiStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [error, setError] = useState<string | null>(null)

  const checkApiConnection = async () => {
    setStatus('checking')
    setError(null)
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setStatus('connected')
      } else {
        setStatus('disconnected')
        setError(`API returned status: ${response.status}`)
      }
    } catch (err) {
      setStatus('disconnected')
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  useEffect(() => {
    checkApiConnection()
  }, [apiUrl])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking API connection...'
      case 'connected':
        return `Connected to API at ${apiUrl}`
      case 'disconnected':
        return `Cannot connect to API at ${apiUrl}`
    }
  }

  const getAlertVariant = () => {
    switch (status) {
      case 'connected':
        return 'default'
      case 'disconnected':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-2">
      <Alert variant={getAlertVariant()}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertDescription className="flex-1">
            {getStatusText()}
            {error && (
              <div className="text-sm mt-1 opacity-80">
                Error: {error}
              </div>
            )}
          </AlertDescription>
          {status === 'disconnected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkApiConnection}
              className="ml-2"
            >
              Retry
            </Button>
          )}
        </div>
      </Alert>
      
      {status === 'disconnected' && (
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-medium mb-2">To test the authentication:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure your backend server is running on {apiUrl.replace('/api', '')}</li>
            <li>Ensure the backend has a /api/health endpoint</li>
            <li>Check that CORS is properly configured</li>
            <li>Verify the API endpoints match the expected format</li>
          </ol>
        </div>
      )}
    </div>
  )
}