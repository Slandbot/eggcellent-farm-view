import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', eggs: 2400, target: 2500 },
  { day: 'Tue', eggs: 2600, target: 2500 },
  { day: 'Wed', eggs: 2200, target: 2500 },
  { day: 'Thu', eggs: 2800, target: 2500 },
  { day: 'Fri', eggs: 2500, target: 2500 },
  { day: 'Sat', eggs: 2900, target: 2500 },
  { day: 'Sun', eggs: 2700, target: 2500 },
]

export function ProductionChart() {
  return (
    <div className="chart-container w-full">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Egg Production Trend</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Last 7 days performance</p>
      </div>
      
      <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="eggs" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-muted-foreground">Actual Production</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-muted-foreground rounded-full opacity-60" style={{ borderBottom: '2px dashed' }}></div>
          <span className="text-muted-foreground">Target</span>
        </div>
      </div>
    </div>
  )
}