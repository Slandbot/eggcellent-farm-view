import { Clock, Egg, Package, Syringe, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "eggs",
    message: "Collected 2,847 eggs from Batch A-001",
    time: "2 hours ago",
    icon: Egg,
    status: "success" as const
  },
  {
    id: 2,
    type: "feed",
    message: "Fed 50kg starter feed to Batch B-002",
    time: "4 hours ago", 
    icon: Package,
    status: "success" as const
  },
  {
    id: 3,
    type: "medicine",
    message: "Administered Newcastle vaccine to Batch C-003",
    time: "6 hours ago",
    icon: Syringe,
    status: "success" as const
  },
  {
    id: 4,
    type: "alert",
    message: "Low feed stock alert: Layer Feed (12kg remaining)",
    time: "8 hours ago",
    icon: AlertTriangle,
    status: "warning" as const
  },
  {
    id: 5,
    type: "eggs",
    message: "Quality check completed for Grade A eggs",
    time: "1 day ago",
    icon: Egg,
    status: "success" as const
  }
]

export function RecentActivity() {
  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest farm operations</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                activity.status === 'success' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <Icon className={`w-4 h-4 ${
                  activity.status === 'success' ? 'text-success' : 'text-warning'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      activity.status === 'success' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <button className="text-sm text-primary hover:text-primary-glow font-medium transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  )
}