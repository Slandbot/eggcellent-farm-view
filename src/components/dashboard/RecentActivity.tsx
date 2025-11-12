import { Clock, Egg, Package, Syringe, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string | number
  type: "eggs" | "feed" | "medicine" | "alert" | string
  message: string
  time: string
  status: "success" | "warning" | "error"
}

interface RecentActivityProps {
  activities?: Activity[]
}

const iconMap: Record<string, typeof Egg> = {
  eggs: Egg,
  feed: Package,
  medicine: Syringe,
  alert: AlertTriangle,
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Ensure activities is always an array, never null or undefined
  const activityList = Array.isArray(activities) ? activities : []
  
  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest farm operations</p>
      </div>
      
      <div className="space-y-3">
        {activityList.length > 0 ? (
          activityList.map((activity) => {
            const Icon = iconMap[activity.type] || AlertTriangle
            
            return (
              <div 
                key={activity.id} 
                className="group relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                  activity.status === 'success' 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : activity.status === 'error' 
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                    : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed mb-2">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-medium ${
                        activity.status === 'success' 
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                          : activity.status === 'error'
                          ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                          : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">Activity will appear here as operations are performed</p>
          </div>
        )}
      </div>
      
      {activityList.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
            View all activity
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}
    </div>
  )
}