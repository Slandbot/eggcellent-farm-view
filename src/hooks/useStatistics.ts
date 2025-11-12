import { useState, useEffect } from 'react'
import { useToast } from './use-toast'
import { statisticsService } from '../services/dataService'
import { getUserFriendlyMessage, parseApiError, ErrorType } from '@/utils/errorHandler'
import {
  DashboardStats,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  TrendsData,
  GradeDistribution,
  PenPerformance,
  CollectorPerformance,
  EggProductionStats,
  ProductionTrends,
  DailyProductionSummary,
  MonthlyProductionSummary,
  FinancialSummary,
  RevenueTrends,
  CostAnalysis,
  ProfitMargins,
  PerformanceOverview,
  EfficiencyMetrics,
  ProductivityMetrics,
  ComparativePeriod,
  YearOverYearComparison,
  BenchmarkComparison,
  ReportTemplate,
  ExportReportRequest
} from '../types/api'

// Generic hook for statistics data
function useStatisticsData<T>(fetchFunction: () => Promise<T>, dependencies: any[] = [], showToast: boolean = false) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      const appError = parseApiError(err)
      const errorMessage = getUserFriendlyMessage(err)
      setError(errorMessage)
      
      // Show toast if requested and not an authentication error
      if (showToast && appError.type !== ErrorType.AUTHENTICATION) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
          duration: appError.type === ErrorType.NETWORK ? 5000 : 3000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

// Dashboard Statistics Hooks
export const useDashboardStats = () => {
  return useStatisticsData<DashboardStats>(() => statisticsService.getDashboardStats())
}

export const useDailyStats = () => {
  return useStatisticsData<DailyStats>(() => statisticsService.getDailyStats())
}

export const useWeeklyStats = () => {
  return useStatisticsData<WeeklyStats>(() => statisticsService.getWeeklyStats())
}

export const useMonthlyStats = () => {
  return useStatisticsData<MonthlyStats>(() => statisticsService.getMonthlyStats())
}

export const useTrends = () => {
  return useStatisticsData<TrendsData>(() => statisticsService.getTrends())
}

export const useGradeDistribution = () => {
  return useStatisticsData<GradeDistribution>(() => statisticsService.getGradeDistribution())
}

export const usePenPerformance = () => {
  return useStatisticsData<PenPerformance[]>(() => statisticsService.getPenPerformance())
}

export const useCollectorPerformance = () => {
  return useStatisticsData<CollectorPerformance[]>(() => statisticsService.getCollectorPerformance())
}

// Egg Production Statistics Hooks
export const useEggProductionStats = () => {
  return useStatisticsData<EggProductionStats>(() => statisticsService.getEggProductionStats())
}

export const useProductionTrends = () => {
  return useStatisticsData<ProductionTrends>(() => statisticsService.getProductionTrends())
}

export const useDailyProductionSummary = () => {
  return useStatisticsData<DailyProductionSummary>(() => statisticsService.getDailyProductionSummary())
}

export const useMonthlyProductionSummary = () => {
  return useStatisticsData<MonthlyProductionSummary>(() => statisticsService.getMonthlyProductionSummary())
}

// Financial Statistics Hooks
export const useFinancialSummary = () => {
  return useStatisticsData<FinancialSummary>(() => statisticsService.getFinancialSummary())
}

export const useRevenueTrends = () => {
  return useStatisticsData<RevenueTrends>(() => statisticsService.getRevenueTrends())
}

export const useCostAnalysis = () => {
  return useStatisticsData<CostAnalysis>(() => statisticsService.getCostAnalysis())
}

export const useProfitMargins = () => {
  return useStatisticsData<ProfitMargins>(() => statisticsService.getProfitMargins())
}

// Performance Statistics Hooks
export const usePerformanceOverview = () => {
  return useStatisticsData<PerformanceOverview>(() => statisticsService.getPerformanceOverview())
}

export const useEfficiencyMetrics = () => {
  return useStatisticsData<EfficiencyMetrics>(() => statisticsService.getEfficiencyMetrics())
}

export const useProductivityMetrics = () => {
  return useStatisticsData<ProductivityMetrics>(() => statisticsService.getProductivityMetrics())
}

// Comparative Statistics Hooks
export const useComparativePeriod = () => {
  return useStatisticsData<ComparativePeriod>(() => statisticsService.getComparativePeriod())
}

export const useYearOverYearComparison = () => {
  return useStatisticsData<YearOverYearComparison>(() => statisticsService.getYearOverYearComparison())
}

export const useBenchmarkComparison = () => {
  return useStatisticsData<BenchmarkComparison>(() => statisticsService.getBenchmarkComparison())
}

// Export Statistics Hooks
export const useReportTemplates = () => {
  return useStatisticsData<ReportTemplate[]>(() => statisticsService.getReportTemplates())
}

// Export Report Hook with manual trigger
export const useExportReport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const exportReport = async (reportData: ExportReportRequest) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      await statisticsService.exportReport(reportData)
      setSuccess(true)
      toast({
        title: 'Success',
        description: 'Report exported successfully',
      })
    } catch (err) {
      const errorMessage = getUserFriendlyMessage(err)
      setError(errorMessage)
      const appError = parseApiError(err)
      if (appError.type !== ErrorType.AUTHENTICATION) {
        toast({
          title: 'Export Failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return { exportReport, loading, error, success }
}

// Combined hook for dashboard overview
export const useDashboardOverview = () => {
  const dashboardStats = useDashboardStats()
  const trends = useTrends()
  const gradeDistribution = useGradeDistribution()
  const penPerformance = usePenPerformance()

  return {
    dashboardStats,
    trends,
    gradeDistribution,
    penPerformance,
    loading: dashboardStats.loading || trends.loading || gradeDistribution.loading || penPerformance.loading,
    error: dashboardStats.error || trends.error || gradeDistribution.error || penPerformance.error
  }
}

// Combined hook for production overview
export const useProductionOverview = () => {
  const productionStats = useEggProductionStats()
  const productionTrends = useProductionTrends()
  const dailySummary = useDailyProductionSummary()
  const monthlySummary = useMonthlyProductionSummary()

  return {
    productionStats,
    productionTrends,
    dailySummary,
    monthlySummary,
    loading: productionStats.loading || productionTrends.loading || dailySummary.loading || monthlySummary.loading,
    error: productionStats.error || productionTrends.error || dailySummary.error || monthlySummary.error
  }
}

// Combined hook for financial overview
export const useFinancialOverview = () => {
  const financialSummary = useFinancialSummary()
  const revenueTrends = useRevenueTrends()
  const costAnalysis = useCostAnalysis()
  const profitMargins = useProfitMargins()

  return {
    financialSummary,
    revenueTrends,
    costAnalysis,
    profitMargins,
    loading: financialSummary.loading || revenueTrends.loading || costAnalysis.loading || profitMargins.loading,
    error: financialSummary.error || revenueTrends.error || costAnalysis.error || profitMargins.error
  }
}