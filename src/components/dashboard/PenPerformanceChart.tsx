import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PenPerformance {
  penId: string
  penName: string
  birdCount: number
  eggProduction: number
  efficiency: number
  rank: number
}

interface PenPerformanceChartProps {
  data?: PenPerformance[]
}

const getRankColor = (rank: number) => {
  if (rank === 1) return '#22c55e' // green
  if (rank === 2) return '#3b82f6' // blue
  if (rank === 3) return '#f59e0b' // amber
  return '#94a3b8' // gray
}

export function PenPerformanceChart({ data }: PenPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>No pen performance data available</p>
        </div>
      </Card>
    )
  }

  const chartData = data.slice(0, 10).map(pen => ({
    name: pen.penName,
    eggs: pen.eggProduction,
    efficiency: pen.efficiency,
    birds: pen.birdCount,
    rank: pen.rank,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium">Eggs:</span> {data.eggs.toLocaleString()}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Birds:</span> {data.birds.toLocaleString()}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Efficiency:</span> {data.efficiency}%
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Rank:</span> #{data.rank}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">Top Performing Pens</h3>
        <p className="text-sm text-muted-foreground">Egg production by pen</p>
      </div>
      
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="eggs" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRankColor(entry.rank)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2 pt-4 border-t border-border">
        {data.slice(0, 5).map((pen) => (
          <div key={pen.penId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge 
                variant={pen.rank <= 3 ? 'default' : 'secondary'}
                className={pen.rank === 1 ? 'bg-green-500' : pen.rank === 2 ? 'bg-blue-500' : pen.rank === 3 ? 'bg-amber-500' : ''}
              >
                #{pen.rank}
              </Badge>
              <div>
                <div className="font-medium text-foreground">{pen.penName}</div>
                <div className="text-xs text-muted-foreground">{pen.birdCount} birds</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">{pen.eggProduction.toLocaleString()} eggs</div>
              <div className="text-xs text-muted-foreground">Efficiency: {pen.efficiency}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

