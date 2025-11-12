import { useState, useEffect } from "react"
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUserRole } from "@/contexts/UserRoleContext"
import { getUserFriendlyMessage, parseApiError, ErrorType } from "@/utils/errorHandler"

interface LoginFormProps {
  onToggleMode: () => void
}

interface FieldErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  
  const { login, isLoading } = useUserRole()
 
  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.email && email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
    if (errors.password && password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
    if (errors.general && (email || password)) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }, [email, password, errors])

  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue.trim()) {
      return "Email address is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue.trim())) {
      return "Please enter a valid email address (e.g., user@example.com)"
    }
    return undefined
  }

  const validatePassword = (passwordValue: string): string | undefined => {
    if (!passwordValue.trim()) {
      return "Password is required"
    }
    if (passwordValue.length < 1) {
      return "Password cannot be empty"
    }
    return undefined
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    if (field === 'email') {
      const emailError = validateEmail(email)
      setErrors(prev => ({ ...prev, email: emailError }))
    } else if (field === 'password') {
      const passwordError = validatePassword(password)
      setErrors(prev => ({ ...prev, password: passwordError }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setTouched({ email: true, password: true })
    
    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: undefined
      })
      return
    }

    // Clear previous errors
    setErrors({})

    // Prevent double submission
    if (isSubmitting || isLoading) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      // Success - user will be redirected by context
    } catch (err) {
      const appError = parseApiError(err)
      const errorMessage = getUserFriendlyMessage(err)
      
      // Determine which field the error relates to
      const errorLower = errorMessage.toLowerCase()
      let fieldErrors: FieldErrors = { general: errorMessage }
      
      if (errorLower.includes('email') || errorLower.includes('account') || errorLower.includes('user not found')) {
        fieldErrors = { email: errorMessage, general: undefined }
      } else if (errorLower.includes('password') || errorLower.includes('credentials') || errorLower.includes('incorrect')) {
        fieldErrors = { password: errorMessage, general: undefined }
      } else if (appError.type === ErrorType.NETWORK) {
        fieldErrors = { general: errorMessage }
      } else {
        fieldErrors = { general: errorMessage }
      }
      
      setErrors(fieldErrors)
      
      // Log technical details for debugging
      if (import.meta.env.DEV) {
        console.error('Login error:', {
          error: err,
          parsedError: appError,
          originalMessage: (err instanceof Error && (err as any).originalMessage) || err
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }





  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your farm dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate method="post" action="#">
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
              Email
            </Label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                errors.email ? "text-destructive" : "text-muted-foreground"
              }`} />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`pl-10 ${errors.email && touched.email ? "pr-10" : ""} ${
                  errors.email && touched.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={isLoading || isSubmitting}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && touched.email && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {errors.email && touched.email && (
              <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
              Password
            </Label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                errors.password ? "text-destructive" : "text-muted-foreground"
              }`} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`pl-10 ${errors.password && touched.password ? "pr-20" : "pr-10"} ${
                  errors.password && touched.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={isLoading || isSubmitting}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent ${
                  errors.password && touched.password ? "right-10" : "right-2"
                }`}
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
              {errors.password && touched.password && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {errors.password && touched.password && (
              <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {errors.general && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to Sign In</AlertTitle>
              <AlertDescription className="mt-1">
                {errors.general}
                {errors.general.includes('temporarily unavailable') && (
                  <span className="block mt-2 text-xs">
                    Please check your internet connection and try again in a few moments.
                  </span>
                )}
                {errors.general.includes('No account found') && (
                  <span className="block mt-2 text-xs">
                    If you don't have an account, please contact your administrator to create one.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

      </CardContent>
    </Card>
  )
}