import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon: LucideIcon
  className?: string
  gradient?: "blue" | "green" | "orange" | "purple" | "red"
}

export function MetricCard({ title, value, change, icon: Icon, className, gradient = "blue" }: MetricCardProps) {
  const gradientClasses = {
    blue: "from-blue-500/20 via-blue-400/10 to-transparent",
    green: "from-green-500/20 via-green-400/10 to-transparent",
    orange: "from-orange-500/20 via-orange-400/10 to-transparent",
    purple: "from-purple-500/20 via-purple-400/10 to-transparent",
    red: "from-red-500/20 via-red-400/10 to-transparent",
  }

  const iconBgClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  }

  const TrendIcon = change?.trend === "up" ? TrendingUp : change?.trend === "down" ? TrendingDown : Minus

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
      className
    )}>
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-70",
        gradientClasses[gradient]
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          </div>
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110",
            iconBgClasses[gradient]
          )}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        
        {change && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              change.trend === "up" && "text-green-600 dark:text-green-400",
              change.trend === "down" && "text-red-600 dark:text-red-400",
              change.trend === "neutral" && "text-muted-foreground"
            )}>
              <TrendIcon className={cn(
                "w-4 h-4",
                change.trend === "up" && "text-green-600 dark:text-green-400",
                change.trend === "down" && "text-red-600 dark:text-red-400"
              )} />
              {change.value}
            </div>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
    </div>
  )
}