import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'
import { TrendingUp, TrendingDown, Minus, Egg } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ProductionChartProps {
  data?: Array<{ day: string; eggs: number; target?: number }>
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const actualValue = payload.find((p: any) => p.dataKey === 'eggs')?.value || 0
    const targetValue = payload.find((p: any) => p.dataKey === 'target')?.value
    
    // Format date label
    let formattedLabel = label
    try {
      if (label && typeof label === 'string') {
        const date = parseISO(label)
        if (isValid(date)) {
          formattedLabel = format(date, 'MMM dd, yyyy')
        } else {
          formattedLabel = label
        }
      }
    } catch {
      formattedLabel = label
    }

    const difference = targetValue ? actualValue - targetValue : null
    const percentageDiffNum = targetValue && targetValue > 0 && difference !== null
      ? (difference / targetValue) * 100
      : null
    const percentageDiff = percentageDiffNum !== null ? percentageDiffNum.toFixed(1) : null

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
        <p className="text-sm font-semibold text-foreground mb-2">{formattedLabel}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs text-muted-foreground">Actual</span>
            </div>
            <span className="text-sm font-bold text-foreground">{actualValue.toLocaleString()} eggs</span>
          </div>
          {targetValue !== undefined && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-muted-foreground opacity-60" style={{ borderBottom: '2px dashed' }}></div>
                  <span className="text-xs text-muted-foreground">Target</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{targetValue.toLocaleString()} eggs</span>
              </div>
              {difference !== null && (
                <div className="pt-1.5 mt-1.5 border-t border-border">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Difference</span>
                    <div className="flex items-center gap-1">
                      {difference >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs font-semibold ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {difference >= 0 ? '+' : ''}{difference.toLocaleString()} 
                        {percentageDiff && percentageDiffNum !== null && ` (${percentageDiffNum >= 0 ? '+' : ''}${percentageDiff}%)`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
  return null
}

// Custom label formatter for X-axis
const formatXAxisLabel = (tickItem: string) => {
  try {
    const date = parseISO(tickItem)
    if (isValid(date)) {
      return format(date, 'MMM dd')
    }
  } catch {
    // If not a valid date, try to format as day name
    const dayNames: Record<string, string> = {
      'Mon': 'Mon', 'Tue': 'Tue', 'Wed': 'Wed', 'Thu': 'Thu', 
      'Fri': 'Fri', 'Sat': 'Sat', 'Sun': 'Sun'
    }
    return dayNames[tickItem] || tickItem
  }
  return tickItem
}

export function ProductionChart({ data }: ProductionChartProps) {
  // Use only real API data - no mock data
  const chartData = data || []

  // Calculate statistics only if we have data
  const totalEggs = chartData.length > 0 ? chartData.reduce((sum, item) => sum + (item.eggs || 0), 0) : 0
  const avgEggs = chartData.length > 0 ? Math.round(totalEggs / chartData.length) : 0
  const maxEggs = chartData.length > 0 ? Math.max(...chartData.map(item => item.eggs || 0), 0) : 0
  const minEggs = chartData.length > 0 ? Math.min(...chartData.filter(item => item.eggs > 0).map(item => item.eggs || 0), maxEggs) : 0
  
  // Calculate trend (comparing last 3 days vs previous 3 days if available)
  let trend: 'up' | 'down' | 'neutral' = 'neutral'
  if (chartData.length >= 6) {
    const recent = chartData.slice(-3).reduce((sum, item) => sum + (item.eggs || 0), 0)
    const previous = chartData.slice(-6, -3).reduce((sum, item) => sum + (item.eggs || 0), 0)
    if (recent > previous) trend = 'up'
    else if (recent < previous) trend = 'down'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'

  // Show empty state if no data
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-4 sm:p-6 border-dashed">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Egg Production Trend</h3>
          <p className="text-sm text-muted-foreground">Last 7 days performance overview</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Egg className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">No production data available</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Production data will appear here once eggs are collected. Start recording your daily egg collections to see trends.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Gradient definitions for area fill
  const gradientId = 'productionGradient'
  const gradientId2 = 'targetGradient'

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Egg Production Trend</h3>
            <p className="text-sm text-muted-foreground">Last 7 days performance overview</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Average Daily</p>
              <p className="text-lg font-bold text-foreground">{avgEggs.toLocaleString()}</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Period</p>
              <p className="text-lg font-bold text-foreground">{totalEggs.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`font-medium ${trendColor}`}>
            {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'} production trend
          </span>
        </div>
      </div>
      
      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <defs>
              {/* Gradient for actual production area */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              {/* Gradient for target area */}
              <linearGradient id={gradientId2} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.5}
              vertical={false}
            />
            
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatXAxisLabel}
              style={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value) => value.toLocaleString()}
              style={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target line (if available) */}
            {chartData.some(item => item.target !== undefined && item.target !== null) && (
              <>
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  fill={`url(#${gradientId2})`}
                  fillOpacity={0.3}
                  dot={false}
                  activeDot={{ r: 4, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 4, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                />
              </>
            )}
            
            {/* Actual production area */}
            <Area
              type="monotone"
              dataKey="eggs"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              fillOpacity={0.4}
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 2, 
                r: 4,
                stroke: 'hsl(var(--card))'
              }}
              activeDot={{ 
                r: 7, 
                stroke: 'hsl(var(--primary))', 
                strokeWidth: 3,
                fill: 'hsl(var(--card))',
                style: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }
              }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            
            {/* Reference line for average */}
            {avgEggs > 0 && (
              <ReferenceLine 
                y={avgEggs} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="2 2"
                strokeOpacity={0.5}
                label={{ 
                  value: `Avg: ${avgEggs}`, 
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Enhanced legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-primary/40 border-2 border-primary"></div>
            <span className="text-muted-foreground font-medium">Actual Production</span>
          </div>
          {chartData.some(item => item.target !== undefined && item.target !== null) && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-muted-foreground opacity-60" style={{ borderBottom: '2px dashed' }}></div>
              <span className="text-muted-foreground font-medium">Target</span>
            </div>
          )}
          {avgEggs > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-px bg-primary opacity-50" style={{ borderBottom: '1px dashed' }}></div>
              <span className="text-muted-foreground font-medium">Average</span>
            </div>
          )}
        </div>
        
        {/* Stats summary */}
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div className="text-right">
            <p className="text-muted-foreground">Peak</p>
            <p className="font-semibold text-foreground">{maxEggs.toLocaleString()}</p>
          </div>
          {minEggs < maxEggs && (
            <>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-right">
                <p className="text-muted-foreground">Low</p>
                <p className="font-semibold text-foreground">{minEggs.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
