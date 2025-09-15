import React, { useState } from 'react'
import {
  useDashboardStats,
  useTrends,
  useGradeDistribution,
  usePenPerformance,
  useEggProductionStats,
  useFinancialSummary,
  usePerformanceOverview,
  useExportReport,
  useReportTemplates
} from '../../hooks/useStatistics'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Loader2, TrendingUp, TrendingDown, Minus, Download, BarChart3, PieChart, LineChart } from 'lucide-react'

const StatisticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  // Statistics hooks
  const { data: dashboardStats, loading: dashboardLoading, error: dashboardError } = useDashboardStats()
  const { data: trends, loading: trendsLoading } = useTrends()
  const { data: gradeDistribution, loading: gradeLoading } = useGradeDistribution()
  const { data: penPerformance, loading: penLoading } = usePenPerformance()
  const { data: eggStats, loading: eggLoading } = useEggProductionStats()
  const { data: financialSummary, loading: financialLoading } = useFinancialSummary()
  const { data: performanceOverview, loading: performanceLoading } = usePerformanceOverview()
  const { data: reportTemplates, loading: templatesLoading } = useReportTemplates()
  const { exportReport, loading: exportLoading, success: exportSuccess, error: exportError } = useExportReport()

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

  const handleExportReport = async () => {
    if (!reportTemplates || reportTemplates.length === 0) return
    
    const reportData = {
      templateId: reportTemplates[0].id, // Use first template as example
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      format: exportFormat,
      filters: {
        pens: [],
        collectors: [],
        grades: ['A', 'B']
      }
    }
    
    await exportReport(reportData)
  }

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading statistics...</span>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error loading statistics: {dashboardError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
          <p className="text-gray-600">Comprehensive farm performance analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setExportFormat(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} disabled={exportLoading || templatesLoading}>
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Export Status */}
      {exportSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Report exported successfully!</p>
        </div>
      )}
      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Export failed: {exportError}</p>
        </div>
      )}

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalBirds?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Eggs</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.todayEggs?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats?.revenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.performanceScore || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Section */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Egg Production</span>
                  {getTrendIcon(trends.eggProduction.trend)}
                </div>
                <div className="text-2xl font-bold">{trends.eggProduction.current.toLocaleString()}</div>
                <div className="text-sm text-gray-600">
                  {trends.eggProduction.change > 0 ? '+' : ''}{trends.eggProduction.change}% from previous period
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Feed Efficiency</span>
                  {getTrendIcon(trends.feedEfficiency.trend)}
                </div>
                <div className="text-2xl font-bold">{trends.feedEfficiency.current.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {trends.feedEfficiency.change > 0 ? '+' : ''}{trends.feedEfficiency.change}% from previous period
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  {getTrendIcon(trends.revenue.trend)}
                </div>
                <div className="text-2xl font-bold">${trends.revenue.current.toLocaleString()}</div>
                <div className="text-sm text-gray-600">
                  {trends.revenue.change > 0 ? '+' : ''}{trends.revenue.change}% from previous period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {gradeDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Egg Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{gradeDistribution.gradeA.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Grade A ({gradeDistribution.gradeA.percentage}%)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{gradeDistribution.gradeB.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Grade B ({gradeDistribution.gradeB.percentage}%)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{gradeDistribution.cracked.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Cracked ({gradeDistribution.cracked.percentage}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pen Performance */}
      {penPerformance && penPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {penPerformance.slice(0, 5).map((pen) => (
                <div key={pen.penId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{pen.penName}</div>
                    <div className="text-sm text-gray-600">{pen.birdCount} birds</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{pen.eggProduction.toLocaleString()} eggs</div>
                    <div className="text-sm text-gray-600">Efficiency: {pen.efficiency}%</div>
                  </div>
                  <Badge variant={pen.rank <= 3 ? 'default' : 'secondary'}>
                    Rank #{pen.rank}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      {financialSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${financialSummary.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">${financialSummary.totalExpenses.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${financialSummary.netProfit.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{financialSummary.profitMargin.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Profit Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      {performanceOverview && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceOverview.overallScore}/100</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceOverview.productionEfficiency}%</div>
                <div className="text-sm text-gray-600">Production Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceOverview.feedEfficiency}%</div>
                <div className="text-sm text-gray-600">Feed Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceOverview.healthScore}%</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceOverview.financialHealth}%</div>
                <div className="text-sm text-gray-600">Financial Health</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StatisticsDashboard