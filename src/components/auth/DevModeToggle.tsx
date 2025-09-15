import { useState } from "react"
import { Settings, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DevModeToggleProps {
  onMockLogin: (role: 'Admin' | 'Farm Manager' | 'Worker') => void
}

export function DevModeToggle({ onMockLogin }: DevModeToggleProps) {
  const [showDevMode, setShowDevMode] = useState(false)
  const [mockMode, setMockMode] = useState(false)

  const handleMockLogin = (role: 'Admin' | 'Farm Manager' | 'Worker') => {
    setMockMode(true)
    onMockLogin(role)
  }

  if (!showDevMode) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDevMode(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <Code className="w-3 h-3 mr-1" />
        Dev Mode
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Development Mode
            </CardTitle>
            <CardDescription className="text-xs">
              Test the UI without backend
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDevMode(false)}
            className="text-xs"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="mock-mode"
            checked={mockMode}
            onCheckedChange={setMockMode}
          />
          <Label htmlFor="mock-mode" className="text-sm">
            Enable Mock Authentication
          </Label>
        </div>
        
        {mockMode && (
          <>
            <Alert>
              <AlertDescription className="text-xs">
                Mock mode bypasses API calls. Use for UI testing only.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">Quick Login As:</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMockLogin('Admin')}
                  className="text-xs justify-start"
                >
                  🔑 Admin - Full Access
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMockLogin('Farm Manager')}
                  className="text-xs justify-start"
                >
                  👨‍💼 Farm Manager - Management Access
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMockLogin('Worker')}
                  className="text-xs justify-start"
                >
                  👷 Worker - Basic Access
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}