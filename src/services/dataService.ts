import { authService } from './authService'
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Base API service class
class BaseApiService {
  protected async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authService.getToken()
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Handle 401 Unauthorized errors
        if (response.status === 401) {
          console.log('Received 401 error, attempting token refresh')
          
          // Try to refresh the token
          try {
            await authService.refreshToken()
            
            // Get the new token and retry the request
            const newToken = authService.getToken()
            if (newToken) {
              const newConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${newToken}`
                }
              }
              
              const retryResponse = await fetch(url, newConfig)
              if (retryResponse.ok) {
                return await retryResponse.json()
              }
              
              // If retry still fails, handle as normal error
              const retryErrorData = await retryResponse.json().catch(() => ({ message: 'Network error after token refresh' }))
              throw new Error(retryErrorData.message || `HTTP ${retryResponse.status} after token refresh`)
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            // Dispatch auth error event
            const authErrorEvent = new CustomEvent('auth-error', {
              detail: { message: 'Authentication expired' }
            });
            window.dispatchEvent(authErrorEvent);
            
            // Force logout on token refresh failure
            await authService.logout()
            throw new Error('Authentication expired. Please log in again.')
          }
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

// Birds Management Service
export class BirdsService extends BaseApiService {
  async getBirds(filters?: { status?: string; breed?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.breed) params.append('breed', filters.breed)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    return this.makeRequest(`/birds${queryString ? `?${queryString}` : ''}`)
  }

  async getBird(id: string) {
    return this.makeRequest(`/birds/${id}`)
  }

  async createBirdGroup(data: {
    groupId: string
    breed: string
    count: number
    age: string
    pen: string
    status: string
    acquisitionDate: string
    notes?: string
  }) {
    return this.makeRequest('/birds', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateBird(id: string, data: Partial<any>) {
    return this.makeRequest(`/birds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteBird(id: string) {
    return this.makeRequest(`/birds/${id}`, {
      method: 'DELETE'
    })
  }

  async getBirdsStats() {
    return this.makeRequest('/birds/stats')
  }
}

// Egg Collection Service
export class EggService extends BaseApiService {
  async getEggCollections(filters?: { date?: string; shift?: string; pen?: string }) {
    const params = new URLSearchParams()
    if (filters?.date) params.append('date', filters.date)
    if (filters?.shift) params.append('shift', filters.shift)
    if (filters?.pen) params.append('pen', filters.pen)
    
    const queryString = params.toString()
    return this.makeRequest(`/eggs${queryString ? `?${queryString}` : ''}`)
  }

  async recordEggCollection(data: {
    date: string
    shift: string
    pen: string
    gradeA: number
    gradeB: number
    cracked: number
    collectedBy: string
    notes?: string
  }) {
    return this.makeRequest('/eggs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateEggCollection(id: string, data: Partial<any>) {
    return this.makeRequest(`/eggs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteEggCollection(id: string) {
    return this.makeRequest(`/eggs/${id}`, {
      method: 'DELETE'
    })
  }

  async getEggStats() {
    return this.makeRequest('/eggs/stats')
  }

  async getProductionChart(period: string = '7d') {
    return this.makeRequest(`/eggs/production-chart?period=${period}`)
  }
}

// Feed Inventory Service
export class FeedService extends BaseApiService {
  async getFeedInventory(filters?: { type?: string; status?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    return this.makeRequest(`/feed${queryString ? `?${queryString}` : ''}`)
  }

  async addFeedStock(data: {
    type: string
    supplier: string
    quantity: number
    unit: string
    expiryDate: string
    costPerUnit: number
    batchNumber?: string
    notes?: string
  }) {
    return this.makeRequest('/feed', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async recordFeedUsage(data: {
    feedId: string
    quantity: number
    pen: string
    usedBy: string
    date: string
    notes?: string
  }) {
    return this.makeRequest('/feed/usage', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateFeedStock(id: string, data: Partial<any>) {
    return this.makeRequest(`/feed/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteFeedStock(id: string) {
    return this.makeRequest(`/feed/${id}`, {
      method: 'DELETE'
    })
  }

  async getFeedStats() {
    return this.makeRequest('/feed/stats')
  }

  async getFeedUsageHistory(feedId?: string) {
    return this.makeRequest(`/feed/usage${feedId ? `?feedId=${feedId}` : ''}`)
  }
}

// Medicine & Vaccines Service
export class MedicineService extends BaseApiService {
  async getMedicineInventory(filters?: { type?: string; status?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    return this.makeRequest(`/medicine${queryString ? `?${queryString}` : ''}`)
  }

  async addMedicine(data: {
    name: string
    type: string
    supplier: string
    quantity: number
    unit: string
    expiryDate: string
    batchNumber?: string
    notes?: string
  }) {
    return this.makeRequest('/medicine', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async recordTreatment(data: {
    medicineId: string
    birdGroup: string
    dosage: string
    administeredBy: string
    date: string
    reason: string
    notes?: string
  }) {
    return this.makeRequest('/medicine/treatments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTreatmentHistory(filters?: { birdGroup?: string; medicine?: string; dateFrom?: string; dateTo?: string }) {
    const params = new URLSearchParams()
    if (filters?.birdGroup) params.append('birdGroup', filters.birdGroup)
    if (filters?.medicine) params.append('medicine', filters.medicine)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    
    const queryString = params.toString()
    return this.makeRequest(`/medicine/treatments${queryString ? `?${queryString}` : ''}`)
  }

  async updateMedicine(id: string, data: Partial<any>) {
    return this.makeRequest(`/medicine/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteMedicine(id: string) {
    return this.makeRequest(`/medicine/${id}`, {
      method: 'DELETE'
    })
  }

  async getMedicineStats() {
    return this.makeRequest('/medicine/stats')
  }
}

// Statistics Service
export class StatisticsService extends BaseApiService {
  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest<DashboardStats>('/stats/dashboard')
  }

  async getDailyStats(): Promise<DailyStats> {
    return this.makeRequest<DailyStats>('/stats/daily')
  }

  async getWeeklyStats(): Promise<WeeklyStats> {
    return this.makeRequest<WeeklyStats>('/stats/weekly')
  }

  async getMonthlyStats(): Promise<MonthlyStats> {
    return this.makeRequest<MonthlyStats>('/stats/monthly')
  }

  async getTrends(): Promise<TrendsData> {
    return this.makeRequest<TrendsData>('/stats/trends')
  }

  async getGradeDistribution(): Promise<GradeDistribution> {
    return this.makeRequest<GradeDistribution>('/stats/grade-distribution')
  }

  async getPenPerformance(): Promise<PenPerformance[]> {
    return this.makeRequest<PenPerformance[]>('/stats/pen-performance')
  }

  async getCollectorPerformance(): Promise<CollectorPerformance[]> {
    return this.makeRequest<CollectorPerformance[]>('/stats/collector-performance')
  }

  // Egg Production Statistics
  async getEggProductionStats(): Promise<EggProductionStats> {
    return this.makeRequest<EggProductionStats>('/stats/eggs/production')
  }

  async getProductionTrends(): Promise<ProductionTrends> {
    return this.makeRequest<ProductionTrends>('/stats/eggs/trends')
  }

  async getDailyProductionSummary(): Promise<DailyProductionSummary> {
    return this.makeRequest<DailyProductionSummary>('/stats/eggs/daily-summary')
  }

  async getMonthlyProductionSummary(): Promise<MonthlyProductionSummary> {
    return this.makeRequest<MonthlyProductionSummary>('/stats/eggs/monthly-summary')
  }

  // Financial Statistics
  async getFinancialSummary(): Promise<FinancialSummary> {
    return this.makeRequest<FinancialSummary>('/stats/financial/summary')
  }

  async getRevenueTrends(): Promise<RevenueTrends> {
    return this.makeRequest<RevenueTrends>('/stats/financial/revenue-trends')
  }

  async getCostAnalysis(): Promise<CostAnalysis> {
    return this.makeRequest<CostAnalysis>('/stats/financial/cost-analysis')
  }

  async getProfitMargins(): Promise<ProfitMargins> {
    return this.makeRequest<ProfitMargins>('/stats/financial/profit-margins')
  }

  // Performance Statistics
  async getPerformanceOverview(): Promise<PerformanceOverview> {
    return this.makeRequest<PerformanceOverview>('/stats/performance/overview')
  }

  async getEfficiencyMetrics(): Promise<EfficiencyMetrics> {
    return this.makeRequest<EfficiencyMetrics>('/stats/performance/efficiency')
  }

  async getProductivityMetrics(): Promise<ProductivityMetrics> {
    return this.makeRequest<ProductivityMetrics>('/stats/performance/productivity')
  }

  // Comparative Statistics
  async getComparativePeriod(): Promise<ComparativePeriod> {
    return this.makeRequest<ComparativePeriod>('/stats/comparative/period')
  }

  async getYearOverYearComparison(): Promise<YearOverYearComparison> {
    return this.makeRequest<YearOverYearComparison>('/stats/comparative/year-over-year')
  }

  async getBenchmarkComparison(): Promise<BenchmarkComparison> {
    return this.makeRequest<BenchmarkComparison>('/stats/comparative/benchmarks')
  }

  // Export Statistics
  async exportReport(reportData: ExportReportRequest): Promise<any> {
    return this.makeRequest('/stats/export/report', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    return this.makeRequest<ReportTemplate[]>('/stats/export/templates')
  }
}

// Reports Service
export class ReportsService extends BaseApiService {
  async getDashboardStats() {
    return this.makeRequest('/reports/dashboard')
  }

  async getProductionReport(period: string = '30d') {
    return this.makeRequest(`/reports/production?period=${period}`)
  }

  async getHealthReport(period: string = '30d') {
    return this.makeRequest(`/reports/health?period=${period}`)
  }

  async getFeedConsumptionReport(period: string = '30d') {
    return this.makeRequest(`/reports/feed-consumption?period=${period}`)
  }

  async getFinancialReport(period: string = '30d') {
    return this.makeRequest(`/reports/financial?period=${period}`)
  }

  async generateReport(type: string, filters: any) {
    return this.makeRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, filters })
    })
  }

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv') {
    return this.makeRequest(`/reports/${reportId}/export?format=${format}`, {
      method: 'GET'
    })
  }
}

// Users Service
export class UsersService extends BaseApiService {
  async getUsers(filters?: { role?: string; status?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    return this.makeRequest(`/users${queryString ? `?${queryString}` : ''}`)
  }

  async getUserStats() {
    return this.makeRequest('/users/stats')
  }

  async addUser(userData: any) {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(userId: string, userData: any) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(userId: string) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE'
    })
  }
}

// Export service instances
export const birdsService = new BirdsService()
export const eggService = new EggService()
export const feedService = new FeedService()
export const medicineService = new MedicineService()
export const statisticsService = new StatisticsService()
export const reportsService = new ReportsService()
export const usersService = new UsersService()

// Export all services as default
export default {
  birds: birdsService,
  eggs: eggService,
  feed: feedService,
  medicine: medicineService,
  statistics: statisticsService,
  reports: reportsService,
  users: usersService
}