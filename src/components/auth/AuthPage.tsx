import { useState } from "react"
import { Bird } from "lucide-react"
import { LoginForm } from "./LoginForm"

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Bird className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">FarmTrack</h1>
              <p className="text-sm text-muted-foreground">Poultry Management System</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Manage Your Farm
              <br />
              <span className="text-primary">Efficiently</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Track birds, monitor egg production, manage feed inventory, and ensure 
              the health of your poultry with our comprehensive farm management system.
            </p>
          </div>

          {/* <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="font-semibold text-foreground">12,547+</div>
              <div className="text-muted-foreground">Birds Tracked</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="font-semibold text-foreground">2,847</div>
              <div className="text-muted-foreground">Daily Eggs</div>
            </div>
          </div> */}
        </div>

        {/* Right side - Auth Form */}
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : null}
        </div>
      </div>
    </div>
  )
}