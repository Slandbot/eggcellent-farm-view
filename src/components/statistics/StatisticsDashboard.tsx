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
import { TrendsChart } from '../dashboard/TrendsChart'
import { GradeDistributionChart } from '../dashboard/GradeDistributionChart'
import { PenPerformanceChart } from '../dashboard/PenPerformanceChart'
import { FinancialChart } from '../dashboard/FinancialChart'
import { PerformanceMetricsChart } from '../dashboard/PerformanceMetricsChart'

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
          <h1 className="text-3xl font-bold pt-10">Statistics Dashboard</h1>
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
            <div className="text-2xl font-bold">₵{dashboardStats?.revenue?.toLocaleString() || 0}</div>
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
      <TrendsChart data={trends} />

      {/* Grade Distribution */}
      <GradeDistributionChart data={gradeDistribution} />

      {/* Pen Performance */}
      <PenPerformanceChart data={penPerformance} />

      {/* Financial Summary */}
      <FinancialChart data={financialSummary} />

      {/* Performance Overview */}
      <PerformanceMetricsChart data={performanceOverview} />
    </div>
  )
}

export default StatisticsDashboard