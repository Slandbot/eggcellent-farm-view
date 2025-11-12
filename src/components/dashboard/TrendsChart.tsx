import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendsData {
  eggProduction: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
  feedEfficiency: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
  revenue: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
}

interface TrendsChartProps {
  data?: TrendsData
}

const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />
    default:
      return <Minus className="h-4 w-4 text-gray-500" />
  }
}

export function TrendsChart({ data }: TrendsChartProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>No trends data available</p>
        </div>
      </Card>
    )
  }

  // Create chart data with current and previous period values
  const chartData = [
    {
      period: 'Previous',
      eggs: data.eggProduction.previous,
      feed: data.feedEfficiency.previous,
      revenue: data.revenue.previous,
    },
    {
      period: 'Current',
      eggs: data.eggProduction.current,
      feed: data.feedEfficiency.current,
      revenue: data.revenue.current,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.period} Period</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-muted-foreground" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span>{' '}
                {entry.name === 'Revenue' 
                  ? `₵${entry.value.toLocaleString()}`
                  : entry.name === 'Feed Efficiency'
                  ? entry.value.toFixed(2)
                  : entry.value.toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">Performance Trends</h3>
        <p className="text-sm text-muted-foreground">Comparison with previous period</p>
      </div>
      
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorFeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="eggs" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorEggs)"
              name="Egg Production"
            />
            <Area 
              type="monotone" 
              dataKey="feed" 
              stroke="#22c55e" 
              fillOpacity={1} 
              fill="url(#colorFeed)"
              name="Feed Efficiency"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Egg Production</span>
            {getTrendIcon(data.eggProduction.trend)}
          </div>
          <div className="text-2xl font-bold text-foreground">{data.eggProduction.current.toLocaleString()}</div>
          <div className={`text-sm ${data.eggProduction.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.eggProduction.change > 0 ? '+' : ''}{data.eggProduction.change}% from previous period
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Feed Efficiency</span>
            {getTrendIcon(data.feedEfficiency.trend)}
          </div>
          <div className="text-2xl font-bold text-foreground">{data.feedEfficiency.current.toFixed(2)}</div>
          <div className={`text-sm ${data.feedEfficiency.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.feedEfficiency.change > 0 ? '+' : ''}{data.feedEfficiency.change}% from previous period
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Revenue</span>
            {getTrendIcon(data.revenue.trend)}
          </div>
          <div className="text-2xl font-bold text-foreground">₵{data.revenue.current.toLocaleString()}</div>
          <div className={`text-sm ${data.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.revenue.change > 0 ? '+' : ''}{data.revenue.change}% from previous period
          </div>
        </div>
      </div>
    </Card>
  )
}

