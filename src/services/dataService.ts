import { authService } from './authService'
import { parseApiError, withTimeout, retryWithBackoff, isRetryableError, ErrorType } from '@/utils/errorHandler'
import type {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Global abort controller per request (optional, for cancellation)
interface RequestOptions extends RequestInit {
  signal?: AbortSignal
  retryOn401?: boolean
}

/**
 * Base API service – thin wrapper around authService.makeRequest
 * All 401 handling, token refresh, queueing is in AuthService
 */
class BaseApiService {
  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryOn401 = true
  ): Promise<T> {
    try {
    // Let AuthService handle everything: token, refresh, 401 retry, queue
    // Don't set headers here - let authService.makeRequest handle Authorization header
    const response = await authService.makeRequest<any>(endpoint, {
      ...options,
      // Only pass custom headers if they exist, authService will merge them properly
      ...(options.headers && { headers: options.headers }),
    })
    
      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${endpoint}:`, {
          type: Array.isArray(response) ? 'array' : typeof response,
          keys: typeof response === 'object' && response !== null ? Object.keys(response) : null,
          preview: Array.isArray(response) 
            ? `Array(${response.length})` 
            : typeof response === 'object' && response !== null
            ? JSON.stringify(response).substring(0, 200)
            : response
        })
      }
      
      // Robust API response unwrapping - handle multiple response formats
      if (response === null || response === undefined) {
        return response as T
      }
      
      // If response is not an object, return as-is (string, number, boolean, etc.)
      if (typeof response !== 'object') {
        return response as T
      }
      
      // Handle array responses directly
      if (Array.isArray(response)) {
        return response as T
      }
      
      // Handle wrapped responses with various structures
      // Format 1: { success: true, data: T } or { success: false, data: T }
      if ('success' in response && 'data' in response) {
        const dataValue = response.data
        if (dataValue !== null && dataValue !== undefined) {
          // Handle nested structure: { success: true, data: { data: [...], pagination: {...} } }
          // If dataValue is an object with a 'data' property that's an array, extract it
          if (typeof dataValue === 'object' && !Array.isArray(dataValue) && 'data' in dataValue) {
            const nestedData = (dataValue as any).data
            // If nested data is an array, return it (for array responses like medicine inventory)
            if (Array.isArray(nestedData)) {
              return nestedData as T
            }
            // Otherwise return the whole dataValue object (for object responses like stats)
          }
          // If data is an array or object, it's likely the main payload
          if (Array.isArray(dataValue) || (typeof dataValue === 'object' && Object.keys(dataValue).length > 0)) {
            return dataValue as T
          }
          // Even if it's a primitive, return it if it's the only meaningful field
          if (typeof dataValue !== 'object') {
            return dataValue as T
          }
        }
        return response.data as T
      }
    
      // Format 2: { data: T } (with or without other fields like message, timestamp)
      if ('data' in response) {
        // Check if data is the primary payload (not just a metadata field)
        const dataValue = response.data
        if (dataValue !== null && dataValue !== undefined) {
          // Handle nested structure: { data: { data: [...], pagination: {...} } }
          // If dataValue is an object with a 'data' property that's an array, extract it
          if (typeof dataValue === 'object' && !Array.isArray(dataValue) && 'data' in dataValue) {
            const nestedData = (dataValue as any).data
            // If nested data is an array, return it (for array responses)
            if (Array.isArray(nestedData)) {
              return nestedData as T
            }
            // Otherwise return the whole dataValue object (for object responses)
          }
          // If data is an array or object, it's likely the main payload
          if (Array.isArray(dataValue) || (typeof dataValue === 'object' && Object.keys(dataValue).length > 0)) {
            return dataValue as T
          }
          // Even if it's a primitive, return it if it's the only meaningful field
          if (typeof dataValue !== 'object') {
            return dataValue as T
          }
        }
      }
      
      // Format 3: { result: T }
      if ('result' in response) {
        const resultValue = response.result
        if (resultValue !== null && resultValue !== undefined) {
          return resultValue as T
        }
      }
      
      // Format 4: { items: T[] } for array responses
      if ('items' in response && Array.isArray(response.items)) {
        return response.items as T
      }
      
      // Format 5: { results: T[] } for array responses
      if ('results' in response && Array.isArray(response.results)) {
        return response.results as T
      }
      
      // Format 6: { records: T[] } for array responses
      if ('records' in response && Array.isArray(response.records)) {
        return response.records as T
      }
    
      // If none of the above, return the response as-is (might be direct object)
      const finalResponse = response as T
      
      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log(`[API Unwrapped] ${endpoint}:`, {
          type: Array.isArray(finalResponse) ? 'array' : typeof finalResponse,
          preview: Array.isArray(finalResponse)
            ? `Array(${finalResponse.length})`
            : typeof finalResponse === 'object' && finalResponse !== null
            ? JSON.stringify(finalResponse).substring(0, 200)
            : finalResponse
        })
      }
      
      return finalResponse
    } catch (error) {
      // Enhanced error logging
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${endpoint}:`, error)
      }
      throw error
    }
  }

  // Helper: GET with query params
  protected get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint
    return this.request<T>(url)
  }

  // Helper: POST
  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Helper: PUT
  protected put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Helper: DELETE
  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Individual Services (clean, no auth logic)
// ──────────────────────────────────────────────────────────────────────────────

export class BirdsService extends BaseApiService {
  getBirds(filters?: { status?: string; breed?: string; search?: string }) {
    return this.get('/birds', filters)
  }

  getBird(id: string) {
    return this.get(`/birds/${id}`)
  }

  createBirdGroup(data: {
    groupId: string
    breed: string
    count: number
    age: string
    pen: string
    status: string
    acquisitionDate: string
    notes?: string
  }) {
    return this.post('/birds', data)
  }

  updateBird(id: string, data: Partial<any>) {
    return this.put(`/birds/${id}`, data)
  }

  deleteBird(id: string) {
    return this.delete(`/birds/${id}`)
  }

  getBirdsStats() {
    return this.get('/birds/stats')
  }
}

export class EggService extends BaseApiService {
  getEggCollections(filters?: { date?: string; shift?: string; pen?: string }) {
    return this.get('/eggs', filters)
  }

  recordEggCollection(data: {
    date: string
    shift: string
    pen: string
    gradeA: number
    gradeB: number
    cracked: number
    collectedBy: string
    notes?: string
  }) {
    return this.post('/eggs', data)
  }

  updateEggCollection(id: string, data: Partial<any>) {
    return this.put(`/eggs/${id}`, data)
  }

  deleteEggCollection(id: string) {
    return this.delete(`/eggs/${id}`)
  }

  getEggStats() {
    return this.get('/eggs/stats')
  }

  getProductionChart(period: string = '7d') {
    return this.get(`/eggs/production-chart`, { period })
  }
}

export class FeedService extends BaseApiService {
  getFeedInventory(filters?: { type?: string; status?: string; search?: string }) {
    return this.get('/feed', filters)
  }

  addFeedStock(data: {
    name: string
    type: string
    supplier: string
    quantity: number
    unit: string
    expiryDate?: string
    costPerUnit?: number
    location?: string
    maxCapacity?: number
    batchNumber?: string
    notes?: string
  }) {
    return this.post('/feed', data)
  }

  recordFeedUsage(data: {
    feedId: string
    quantity: number
    pen: string
    usedBy: string
    date: string
    notes?: string
  }) {
    return this.post('/feed/usage', data)
  }

  updateFeedStock(id: string, data: Partial<any>) {
    return this.put(`/feed/${id}`, data)
  }

  deleteFeedStock(id: string) {
    return this.delete(`/feed/${id}`)
  }

  getFeedStats() {
    return this.get('/feed/stats')
  }

  getFeedUsageHistory(feedId?: string) {
    return this.get('/feed/usage', feedId ? { feedId } : undefined)
  }
}

export class MedicineService extends BaseApiService {
  getMedicineInventory(filters?: { type?: string; status?: string; search?: string }) {
    return this.get('/medicine', filters)
  }

  addMedicine(data: {
    name: string
    type: string
    supplier: string
    quantity: number
    unit: string
    expiryDate: string
    batchNumber?: string
    notes?: string
  }) {
    return this.post('/medicine', data)
  }

  recordTreatment(data: {
    medicineId: string
    birdGroup: string
    dosage: string
    administeredBy: string
    date: string
    reason: string
    notes?: string
  }) {
    return this.post('/medicine/treatments', data)
  }

  getTreatmentHistory(filters?: { birdGroup?: string; medicine?: string; dateFrom?: string; dateTo?: string }) {
    return this.get('/medicine/treatments', filters)
  }

  updateMedicine(id: string, data: Partial<any>) {
    return this.put(`/medicine/${id}`, data)
  }

  deleteMedicine(id: string) {
    return this.delete(`/medicine/${id}`)
  }

  getMedicineStats() {
    return this.get('/medicine/stats')
  }
}

export class StatisticsService extends BaseApiService {
  getDashboardStats(): Promise<DashboardStats> {
    return this.get('/stats/dashboard')
  }

  getDailyStats(): Promise<DailyStats> {
    return this.get('/stats/daily')
  }

  getWeeklyStats(): Promise<WeeklyStats> {
    return this.get('/stats/weekly')
  }

  getMonthlyStats(): Promise<MonthlyStats> {
    return this.get('/stats/monthly')
  }

  getTrends(): Promise<TrendsData> {
    return this.get('/stats/trends')
  }

  getGradeDistribution(): Promise<GradeDistribution> {
    return this.get('/stats/grade-distribution')
  }

  getPenPerformance(): Promise<PenPerformance[]> {
    return this.get('/stats/pen-performance')
  }

  getCollectorPerformance(): Promise<CollectorPerformance[]> {
    return this.get('/stats/collector-performance')
  }

  getEggProductionStats(): Promise<EggProductionStats> {
    return this.get('/stats/eggs/production')
  }

  getProductionTrends(): Promise<ProductionTrends> {
    return this.get('/stats/eggs/trends')
  }

  getDailyProductionSummary(): Promise<DailyProductionSummary> {
    return this.get('/stats/eggs/daily-summary')
  }

  getMonthlyProductionSummary(): Promise<MonthlyProductionSummary> {
    return this.get('/stats/eggs/monthly-summary')
  }

  getFinancialSummary(): Promise<FinancialSummary> {
    return this.get('/stats/financial/summary')
  }

  getRevenueTrends(): Promise<RevenueTrends> {
    return this.get('/stats/financial/revenue-trends')
  }

  getCostAnalysis(): Promise<CostAnalysis> {
    return this.get('/stats/financial/cost-analysis')
  }

  getProfitMargins(): Promise<ProfitMargins> {
    return this.get('/stats/financial/profit-margins')
  }

  getPerformanceOverview(): Promise<PerformanceOverview> {
    return this.get('/stats/performance/overview')
  }

  getEfficiencyMetrics(): Promise<EfficiencyMetrics> {
    return this.get('/stats/performance/efficiency')
  }

  getProductivityMetrics(): Promise<ProductivityMetrics> {
    return this.get('/stats/performance/productivity')
  }

  getComparativePeriod(): Promise<ComparativePeriod> {
    return this.get('/stats/comparative/period')
  }

  getYearOverYearComparison(): Promise<YearOverYearComparison> {
    return this.get('/stats/comparative/year-over-year')
  }

  getBenchmarkComparison(): Promise<BenchmarkComparison> {
    return this.get('/stats/comparative/benchmarks')
  }

  exportReport(reportData: ExportReportRequest): Promise<any> {
    return this.post('/stats/export/report', reportData)
  }

  getReportTemplates(): Promise<ReportTemplate[]> {
    return this.get('/stats/export/templates')
  }
}

export class ReportsService extends BaseApiService {
  getDashboardStats() {
    return this.get('/reports/dashboard')
  }

  getProductionReport(period: string = '30d') {
    return this.get('/reports/production', { period })
  }

  getHealthReport(period: string = '30d') {
    return this.get('/reports/health', { period })
  }

  getFeedConsumptionReport(period: string = '30d') {
    return this.get('/reports/feed-consumption', { period })
  }

  getFinancialReport(period: string = '30d') {
    return this.get('/reports/financial', { period })
  }

  generateReport(type: string, filters: any) {
    return this.post('/reports/generate', { type, filters })
  }

  exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv') {
    return this.get(`/reports/${reportId}/export`, { format })
  }
}

export class UsersService extends BaseApiService {
  getUsers(filters?: { role?: string; status?: string; search?: string }) {
    return this.get('/users', filters)
  }

  getUser(userId: string) {
    return this.get(`/users/${userId}`)
  }

  getUserStats() {
    return this.get('/users/stats')
  }

  addUser(userData: any) {
    return this.post('/users', userData)
  }

  updateUser(userId: string, userData: any) {
    return this.put(`/users/${userId}`, userData)
  }

  deleteUser(userId: string) {
    return this.delete(`/users/${userId}`)
  }
}

export class DashboardService extends BaseApiService {
  getOverview(): Promise<DashboardStats> {
    return this.get('/dashboard/overview')
  }

  getActivity(): Promise<any[]> {
    return this.get('/dashboard/activity')
  }

  getPerformance(): Promise<any> {
    return this.get('/dashboard/performance')
  }

  getAlerts(): Promise<any[]> {
    return this.get('/dashboard/alerts')
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Export Instances
// ──────────────────────────────────────────────────────────────────────────────

export const birdsService = new BirdsService()
export const eggService = new EggService()
export const feedService = new FeedService()
export const medicineService = new MedicineService()
export const statisticsService = new StatisticsService()
export const reportsService = new ReportsService()
export const usersService = new UsersService()
export const dashboardService = new DashboardService()

// Default export
export default {
  birds: birdsService,
  eggs: eggService,
  feed: feedService,
  medicine: medicineService,
  statistics: statisticsService,
  reports: reportsService,
  users: usersService,
  dashboard: dashboardService,
}