import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/card'

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

interface FinancialChartProps {
  data?: FinancialSummary
}

export function FinancialChart({ data }: FinancialChartProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <p>No financial data available</p>
        </div>
      </Card>
    )
  }

  const chartData = [
    { name: 'Revenue', value: data.totalRevenue, color: '#22c55e' },
    { name: 'Expenses', value: data.totalExpenses, color: '#ef4444' },
    { name: 'Profit', value: data.netProfit, color: '#3b82f6' },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₵{data.value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">Financial Overview</h3>
        <p className="text-sm text-muted-foreground">Revenue, expenses, and profit breakdown</p>
      </div>
      
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `₵${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">₵{data.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">₵{data.totalExpenses.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Expenses</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">₵{data.netProfit.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Net Profit</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">{data.profitMargin.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Profit Margin</div>
        </div>
      </div>
    </Card>
  )
}

