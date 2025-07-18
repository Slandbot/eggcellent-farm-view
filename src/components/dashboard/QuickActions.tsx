import { Plus, Package, Egg, Syringe, ClipboardList, Calendar, Bird, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useUserRole } from "@/contexts/UserRoleContext"

export function QuickActions() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasPermission } = useUserRole()

  const showPermissionError = () => {
    toast({
      title: "Access Denied",
      description: "You don't have permission to perform this action.",
      variant: "destructive"
    })
  }

  const actions = [
    {
      label: "Add Bird Batch",
      icon: Plus,
      description: "Register new poultry batch",
      variant: "default" as const,
      onClick: () => hasPermission("manage_birds") ? navigate("/birds") : showPermissionError(),
      permission: "manage_birds"
    },
    {
      label: "Log Feed Usage",
      icon: Package,
      description: "Record feed consumption",
      variant: "secondary" as const,
      onClick: () => hasPermission("manage_feed") ? navigate("/feed") : showPermissionError(),
      permission: "manage_feed"
    },
    {
      label: "Record Eggs",
      icon: Egg,
      description: "Log daily egg collection",
      variant: "secondary" as const,
      onClick: () => hasPermission("collect_eggs") ? navigate("/eggs") : showPermissionError(),
      permission: "collect_eggs"
    },
    {
      label: "Medicine Log",
      icon: Syringe,
      description: "Track vaccinations",
      variant: "secondary" as const,
      onClick: () => hasPermission("manage_medicine") ? navigate("/medicine") : showPermissionError(),
      permission: "manage_medicine"
    }
  ]

  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common daily tasks</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          const hasAccess = hasPermission(action.permission)
          
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className={`h-auto p-3 sm:p-4 flex-col items-start text-left justify-start gap-2 hover:scale-[1.02] transition-transform ${
                !hasAccess ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={action.onClick}
              disabled={!hasAccess}
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                  action.variant === 'default' 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm sm:text-base ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'
                  }`}>
                    {action.label}
                  </div>
                  <div className={`text-xs leading-tight ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}