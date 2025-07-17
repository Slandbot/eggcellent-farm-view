import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon: LucideIcon
  className?: string
}

export function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  return (
    <div className={cn("metric-card", className)}>
      <div className="metric-card-header">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              change.trend === "up" && "text-success",
              change.trend === "down" && "text-destructive",
              change.trend === "neutral" && "text-muted-foreground"
            )}
          >
            {change.trend === "up" && "↗"} 
            {change.trend === "down" && "↘"} 
            {change.value}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  )
}