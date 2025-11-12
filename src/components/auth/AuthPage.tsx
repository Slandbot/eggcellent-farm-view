import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Bird, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useUserRole } from "@/contexts/UserRoleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ──────────────────────────────────────────────────────────────────────────────
// Validation Schema
// ──────────────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

// ──────────────────────────────────────────────────────────────────────────────
// Login Form Component
// ──────────────────────────────────────────────────────────────────────────────
function LoginForm({ isRedirecting = false }: { isRedirecting?: boolean }) {
  const { login, isLoading } = useUserRole()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // Show loading state if redirecting or submitting
  const isProcessing = isLoading || isRedirecting

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@farm.com"
            disabled={isProcessing}
            {...register("email")}
            className="h-11"
          />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={isProcessing}
            {...register("password")}
            className="h-11 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isRedirecting ? "Redirecting..." : "Signing in..."}
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Auth Page
// ──────────────────────────────────────────────────────────────────────────────
export function AuthPage() {
  const { isAuthenticated, isLoading } = useUserRole()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason')
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect to home if already authenticated, but keep login screen visible during transition
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Set redirecting state to keep login screen visible
      setIsRedirecting(true)
      // Small delay to ensure smooth transition and keep loading state visible
      const timer = setTimeout(() => {
        navigate("/", { replace: true })
      }, 300) // 300ms delay to keep login screen visible
      
      return () => clearTimeout(timer)
    } else {
      // Reset redirecting state if not authenticated
      setIsRedirecting(false)
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Bird className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">The Poultry Project</h1>
              <p className="text-sm text-muted-foreground">Smart Poultry Management</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Run Your Farm
              <br />
              <span className="text-primary">Like Clockwork</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Track every egg, manage feed, monitor health, and grow your business with real-time insights and automated workflows.
            </p>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your farm dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reason === 'expired' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>
              )}
              <LoginForm isRedirecting={isRedirecting} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}