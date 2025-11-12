import { Card } from '@/components/ui/card'

interface PerformanceOverview {
  overallScore: number
  productionEfficiency: number
  feedEfficiency: number
  healthScore: number
  financialHealth: number
}

interface PerformanceMetricsChartProps {
  data?: PerformanceOverview
}

const getScoreColor = (score: number, max: number = 100) => {
  const percentage = (score / max) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-blue-600'
  if (percentage >= 40) return 'text-amber-600'
  return 'text-red-600'
}

const getProgressColor = (score: number, max: number = 100) => {
  const percentage = (score / max) * 100
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function PerformanceMetricsChart({ data }: PerformanceMetricsChartProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>No performance metrics available</p>
        </div>
      </Card>
    )
  }

  const metrics = [
    { label: 'Overall Score', value: data.overallScore, max: 100 },
    { label: 'Production Efficiency', value: data.productionEfficiency, max: 100 },
    { label: 'Feed Efficiency', value: data.feedEfficiency, max: 100 },
    { label: 'Health Score', value: data.healthScore, max: 100 },
    { label: 'Financial Health', value: data.financialHealth, max: 100 },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Performance Metrics</h3>
        <p className="text-sm text-muted-foreground">Key performance indicators</p>
      </div>
      
      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = Math.min((metric.value / metric.max) * 100, 100)
          const displayValue = metric.label === 'Overall Score' 
            ? `${metric.value}/${metric.max}`
            : `${metric.value}%`
          const progressColor = getProgressColor(metric.value, metric.max)
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{metric.label}</span>
                <span className={`text-lg font-bold ${getScoreColor(metric.value, metric.max)}`}>
                  {displayValue}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full transition-all"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: progressColor === 'bg-green-500' ? '#22c55e' : 
                                    progressColor === 'bg-blue-500' ? '#3b82f6' :
                                    progressColor === 'bg-amber-500' ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

