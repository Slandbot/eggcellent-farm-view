import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'

interface GradeDistributionChartProps {
  data?: {
    gradeA: { count: number; percentage: number }
    gradeB: { count: number; percentage: number }
    cracked: { count: number; percentage: number }
  }
}

const COLORS = {
  gradeA: '#22c55e', // green
  gradeB: '#f59e0b', // orange/amber
  cracked: '#ef4444', // red
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>No grade distribution data available</p>
        </div>
      </Card>
    )
  }

  const chartData = [
    { name: 'Grade A', value: data.gradeA.count, percentage: data.gradeA.percentage, color: COLORS.gradeA },
    { name: 'Grade B', value: data.gradeB.count, percentage: data.gradeB.percentage, color: COLORS.gradeB },
    { name: 'Cracked', value: data.cracked.count, percentage: data.cracked.percentage, color: COLORS.cracked },
  ].filter(item => item.value > 0)

  const total = data.gradeA.count + data.gradeB.count + data.cracked.count

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} eggs ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">Egg Grade Distribution</h3>
        <p className="text-sm text-muted-foreground">Total: {total.toLocaleString()} eggs</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value}: {entry.payload.percentage}%
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.gradeA.count.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Grade A ({data.gradeA.percentage}%)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{data.gradeB.count.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Grade B ({data.gradeB.percentage}%)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.cracked.count.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Cracked ({data.cracked.percentage}%)</div>
        </div>
      </div>
    </Card>
  )
}

