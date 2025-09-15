// API Response Types

// Common Types
export type TrendType = "up" | "down" | "neutral"

// Birds API Types
export interface BirdsStats {
  totalBirds: number
  totalChange: string
  healthyBirds: number
  healthyPercentage: string
  sickBirds: number
  sickPercentage: string
  avgEggProduction: number
  healthAlerts?: number
  alertsChange?: string
  birdsChange?: string
  birdsTrend?: TrendType
  alertsTrend?: TrendType
}

export interface Bird {
  id: string
  group: string
  breed: string
  age: string
  count: number
  health: string
  production: string
  location: string
  lastCheckup: string
}

// Egg Collection API Types
export interface EggStats {
  todayCollection: number
  todayChange: string
  weeklyTotal: number
  weeklyChange: string
  monthlyTotal: number
  monthlyChange: string
  avgPerBird: number
  dailyProduction?: number
  productionChange?: string
  productionTrend?: TrendType
  avgWeight?: number
  gradeAARate?: string
}

export interface EggCollection {
  id: string
  date: string
  shift: string
  pen: string
  collected: number
  broken: number
  quality: string
  collector: string
  quantity?: number
  grade?: string
}

// Feed Inventory API Types
export interface FeedStats {
  totalStock: number
  stockChange: string
  lowStock: number
  lowStockPercentage: string
  dailyConsumption: number
  consumptionChange: string
  daysRemaining: number
  stockTrend?: TrendType
  lowStockItems?: number
  outOfStockItems?: number
  totalValue?: number
  totalItems?: number
}

export interface FeedItem {
  id: string
  name: string
  type: string
  quantity: number
  unit: string
  cost: number
  supplier: string
  expiryDate: string
  status: string
  stock?: number
}

// Medicine API Types
export interface MedicineStats {
  totalMedicines: number
  stockChange: string
  expiringSoon: number
  expiringPercentage: string
  activeTreatments: number
  treatmentChange: string
  totalValue: number
  lowStockItems?: number
}

export interface Medicine {
  id: string
  name: string
  type: string
  quantity: number
  unit: string
  expiryDate: string
  supplier: string
  cost: number
  status: string
}

// Reports API Types
export interface DashboardStats {
  totalBirds: number
  todayEggs: number
  feedStock: number
  activeTreatments: number
  revenue: number
  expenses: number
  totalReports?: number
  automatedReports?: number
  dataInsights?: number
  performanceScore?: string
}

export interface ProductionReport {
  period: string
  totalEggs: number
  avgDaily: number
  peakDay: string
  efficiency: number
}

export interface HealthReport {
  period: string
  healthyBirds: number
  sickBirds: number
  treatments: number
  mortality: number
}

export interface FeedConsumptionReport {
  period: string
  totalConsumption: number
  avgDaily: number
  costPerKg: number
  efficiency: number
}

// User Management API Types
export interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  workerUsers: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'Admin' | 'Farm Manager' | 'Worker'
  status: 'active' | 'inactive'
  lastLogin: string
  permissions: string[]
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Statistics API Types
export interface DailyStats {
  date: string
  eggCollection: number
  feedConsumption: number
  birdHealth: number
  revenue: number
  expenses: number
}

export interface WeeklyStats {
  week: string
  totalEggs: number
  avgDailyEggs: number
  totalFeedConsumption: number
  avgDailyFeed: number
  totalRevenue: number
  totalExpenses: number
  profitMargin: number
}

export interface MonthlyStats {
  month: string
  totalEggs: number
  avgDailyEggs: number
  totalFeedConsumption: number
  avgDailyFeed: number
  totalRevenue: number
  totalExpenses: number
  profitMargin: number
  growthRate: number
}

export interface TrendsData {
  period: string
  eggProduction: {
    current: number
    previous: number
    change: number
    trend: TrendType
  }
  feedEfficiency: {
    current: number
    previous: number
    change: number
    trend: TrendType
  }
  revenue: {
    current: number
    previous: number
    change: number
    trend: TrendType
  }
}

export interface GradeDistribution {
  gradeA: {
    count: number
    percentage: number
  }
  gradeB: {
    count: number
    percentage: number
  }
  cracked: {
    count: number
    percentage: number
  }
  total: number
}

export interface PenPerformance {
  penId: string
  penName: string
  birdCount: number
  eggProduction: number
  feedConsumption: number
  efficiency: number
  healthScore: number
  rank: number
}

export interface CollectorPerformance {
  collectorId: string
  collectorName: string
  totalCollections: number
  avgDailyCollection: number
  accuracy: number
  efficiency: number
  rank: number
}

export interface EggProductionStats {
  totalProduction: number
  dailyAverage: number
  weeklyAverage: number
  monthlyAverage: number
  peakProduction: {
    date: string
    amount: number
  }
  lowProduction: {
    date: string
    amount: number
  }
  gradeDistribution: GradeDistribution
}

export interface ProductionTrends {
  daily: Array<{
    date: string
    production: number
    target: number
  }>
  weekly: Array<{
    week: string
    production: number
    target: number
  }>
  monthly: Array<{
    month: string
    production: number
    target: number
  }>
}

export interface DailyProductionSummary {
  date: string
  totalEggs: number
  gradeA: number
  gradeB: number
  cracked: number
  shifts: Array<{
    shift: string
    eggs: number
    collector: string
  }>
  pens: Array<{
    penId: string
    eggs: number
  }>
}

export interface MonthlyProductionSummary {
  month: string
  totalEggs: number
  dailyAverage: number
  bestDay: {
    date: string
    production: number
  }
  worstDay: {
    date: string
    production: number
  }
  gradeDistribution: GradeDistribution
  trends: {
    growth: number
    consistency: number
  }
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  revenueBreakdown: {
    eggSales: number
    otherSales: number
  }
  expenseBreakdown: {
    feed: number
    medicine: number
    labor: number
    utilities: number
    other: number
  }
}

export interface RevenueTrends {
  daily: Array<{
    date: string
    revenue: number
    target: number
  }>
  weekly: Array<{
    week: string
    revenue: number
    target: number
  }>
  monthly: Array<{
    month: string
    revenue: number
    target: number
  }>
}

export interface CostAnalysis {
  totalCosts: number
  costPerEgg: number
  costPerBird: number
  costBreakdown: {
    feed: {
      amount: number
      percentage: number
    }
    medicine: {
      amount: number
      percentage: number
    }
    labor: {
      amount: number
      percentage: number
    }
    utilities: {
      amount: number
      percentage: number
    }
    other: {
      amount: number
      percentage: number
    }
  }
  trends: {
    current: number
    previous: number
    change: number
  }
}

export interface ProfitMargins {
  gross: {
    amount: number
    percentage: number
  }
  net: {
    amount: number
    percentage: number
  }
  operating: {
    amount: number
    percentage: number
  }
  trends: {
    gross: TrendType
    net: TrendType
    operating: TrendType
  }
}

export interface PerformanceOverview {
  overallScore: number
  productionEfficiency: number
  feedEfficiency: number
  healthScore: number
  financialHealth: number
  benchmarks: {
    industry: number
    target: number
    previous: number
  }
}

export interface EfficiencyMetrics {
  feedConversionRatio: number
  eggProductionRate: number
  laborEfficiency: number
  resourceUtilization: number
  wasteReduction: number
  energyEfficiency: number
}

export interface ProductivityMetrics {
  eggsPerBird: number
  eggsPerDay: number
  eggsPerWorker: number
  revenuePerBird: number
  profitPerBird: number
  utilizationRate: number
}

export interface ComparativePeriod {
  current: {
    period: string
    production: number
    revenue: number
    costs: number
    profit: number
  }
  previous: {
    period: string
    production: number
    revenue: number
    costs: number
    profit: number
  }
  comparison: {
    productionChange: number
    revenueChange: number
    costChange: number
    profitChange: number
  }
}

export interface YearOverYearComparison {
  currentYear: {
    year: number
    production: number
    revenue: number
    costs: number
    profit: number
  }
  previousYear: {
    year: number
    production: number
    revenue: number
    costs: number
    profit: number
  }
  growth: {
    production: number
    revenue: number
    costs: number
    profit: number
  }
}

export interface BenchmarkComparison {
  current: {
    production: number
    efficiency: number
    profitability: number
  }
  industry: {
    production: number
    efficiency: number
    profitability: number
  }
  target: {
    production: number
    efficiency: number
    profitability: number
  }
  performance: {
    vsIndustry: number
    vsTarget: number
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'dashboard' | 'production' | 'financial' | 'performance' | 'comparative'
  fields: string[]
  format: 'pdf' | 'excel' | 'csv'
  schedule?: 'daily' | 'weekly' | 'monthly'
}

export interface ExportReportRequest {
  templateId: string
  dateRange: {
    start: string
    end: string
  }
  format: 'pdf' | 'excel' | 'csv'
  filters?: {
    pens?: string[]
    collectors?: string[]
    grades?: string[]
  }
}

// API Error Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}