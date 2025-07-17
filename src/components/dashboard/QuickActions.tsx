import { Plus, Package, Egg, Syringe, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
  {
    label: "Add Bird Batch",
    icon: Plus,
    description: "Register new poultry batch",
    variant: "default" as const
  },
  {
    label: "Log Feed Usage",
    icon: Package,
    description: "Record feed consumption",
    variant: "secondary" as const
  },
  {
    label: "Record Eggs",
    icon: Egg,
    description: "Log daily egg collection",
    variant: "secondary" as const
  },
  {
    label: "Medicine Log",
    icon: Syringe,
    description: "Track vaccinations",
    variant: "secondary" as const
  }
]

export function QuickActions() {
  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common daily tasks</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto p-4 flex-col items-start text-left justify-start gap-2 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  action.variant === 'default' 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'
                  }`}>
                    {action.label}
                  </div>
                  <div className={`text-xs ${
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