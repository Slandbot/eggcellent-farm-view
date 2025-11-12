import { useState } from "react"
import { Bird, Egg, Package, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/contexts/UserRoleContext"
import { useDashboardOverview, useDashboardActivity, useDashboardPerformance, useDashboardAlerts, useProductionChart } from "@/hooks/useApiData"

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useUserRole()
   
  // Only fetch dashboard data if user is authenticated
  const { data: overview, loading: overviewLoading, error: overviewError } = useDashboardOverview()
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useDashboardActivity()
  const { data: performance, loading: performanceLoading, error: performanceError } = useDashboardPerformance()
  const { data: alerts, loading: alertsLoading, error: alertsError } = useDashboardAlerts()
  const { data: productionChartData, loading: chartLoading, error: chartError } = useProductionChart('7d')

  // Debug logging in development
  if (import.meta.env.DEV) {
    if (overview) console.log('[Dashboard] Overview data:', overview)
    if (activities) console.log('[Dashboard] Activities data:', activities)
    if (performance) console.log('[Dashboard] Performance data:', performance)
    if (alerts) console.log('[Dashboard] Alerts data:', alerts)
    if (productionChartData) {
      console.log('[Dashboard] Production chart data:', productionChartData)
      console.log('[Dashboard] Chart data type:', typeof productionChartData)
      console.log('[Dashboard] Chart is array:', Array.isArray(productionChartData))
      if (productionChartData && typeof productionChartData === 'object') {
        console.log('[Dashboard] Chart data keys:', Object.keys(productionChartData))
        if ('labels' in productionChartData) console.log('[Dashboard] Chart has labels:', (productionChartData as any).labels)
        if ('datasets' in productionChartData) console.log('[Dashboard] Chart has datasets:', (productionChartData as any).datasets)
        if ('data' in productionChartData) console.log('[Dashboard] Chart has data field:', (productionChartData as any).data)
      }
    }
    if (chartError) console.log('[Dashboard] Chart error:', chartError)
  }

  // Loading state for any of the stats (chart loading is handled separately)
  const isLoading = overviewLoading || activitiesLoading || performanceLoading || alertsLoading
  const hasError = overviewError || activitiesError || performanceError || alertsError

  return (
    <div className="mobile-safe bg-background flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground pt-10">Farm Dashboard</h1>
              <p className="responsive-subtitle">Monitor your poultry farm operations and key metrics</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && !hasError && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
            </div>
          )}

          {/* Error State - Only show for critical errors (not chart errors) */}
          {(overviewError || activitiesError || performanceError || alertsError) && !isLoading && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Unable to load dashboard data</h3>
                  <p className="text-sm text-muted-foreground">
                    {overviewError || activitiesError || performanceError || alertsError || 'An error occurred while loading data. Please try refreshing the page.'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          {!isLoading && overview && (
            <div className="responsive-card-grid mb-8 gap-6">
              <MetricCard
                title="Total Birds"
                value={(overview.totalBirds ?? overview.activeBirds ?? 0).toLocaleString()}
                change={{ value: "+0%", trend: "up" }}
                icon={Bird}
                gradient="blue"
              />
              <MetricCard
                title="Eggs Today"
                value={(overview.todayEggCount ?? overview.todayEggs ?? 0).toLocaleString()}
                change={{ value: "+0%", trend: "up" }}
                icon={Egg}
                gradient="green"
              />
              <MetricCard
                title="Feed Stock"
                value={(overview.feedItems ?? overview.feedStock ?? 0).toLocaleString()}
                change={{ value: "+0%", trend: "up" }}
                icon={Package}
                gradient="orange"
              />
              <MetricCard
                title="Health Alerts"
                value={alerts?.length?.toString() || "0"}
                change={{ value: alerts?.length > 0 ? `${alerts.length} active` : "None", trend: alerts?.length > 0 ? "down" : "up" }}
                icon={AlertTriangle}
                gradient={alerts?.length > 0 ? "red" : "green"}
              />
            </div>
          )}

          {/* Charts and actions */}
          <div className="responsive-chart-grid gap-6 mb-8">
            <div className="chart-container">
              <div className="responsive-card-content mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Production Trends</h3>
                <p className="responsive-subtitle">Egg production over the last 7 days</p>
              </div>
              {chartLoading ? (
                <div className="rounded-xl border bg-card p-8">
                  <div className="flex flex-col items-center justify-center h-64 sm:h-80">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Loading production chart...</p>
                  </div>
                </div>
              ) : chartError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-sm font-medium text-destructive mb-1">Unable to load production chart</p>
                  <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">{chartError}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-destructive/20 hover:bg-destructive/10"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <ProductionChart 
                  data={
                    productionChartData?.labels && productionChartData?.datasets
                      ? // Transform Chart.js format to component format
                        productionChartData.labels.map((label: string, index: number) => ({
                          day: label,
                          eggs: productionChartData.datasets?.[0]?.data?.[index] || 0,
                          target: productionChartData.datasets?.[1]?.data?.[index]
                        }))
                      : Array.isArray(productionChartData)
                      ? productionChartData
                      : productionChartData && typeof productionChartData === 'object'
                      ? // Handle other object formats - try to extract data
                        (productionChartData as any).data && Array.isArray((productionChartData as any).data)
                        ? (productionChartData as any).data
                        : undefined
                      : undefined
                  } 
                />
              )}
            </div>
            <div className="chart-container">
              <div className="responsive-card-content mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Quick Actions</h3>
                <p className="responsive-subtitle">Common farm management tasks</p>
              </div>
              <QuickActions />
            </div>
          </div>

          {/* Activity feed */}
          <div className="responsive-grid md-2">
            <RecentActivity activities={activities || []} />
            
            {/* Performance overview */}
            <div className="chart-container">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Performance Overview</h3>
                <p className="text-sm text-muted-foreground">This week's summary</p>
              </div>
              
              {performanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading performance data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {performance?.productionRate && (
                  <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Production Rate</p>
                            <p className="text-xs text-muted-foreground">{performance.productionRate.efficiency || '0'}% efficiency</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${performance.productionRate.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {performance.productionRate.change >= 0 ? '+' : ''}{performance.productionRate.change}%
                          </p>
                          <p className="text-xs text-muted-foreground">vs last week</p>
                        </div>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                          style={{ width: `${Math.min((performance.productionRate.efficiency || 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {performance?.feedEfficiency && (
                  <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Feed Efficiency</p>
                            <p className="text-xs text-muted-foreground">{performance.feedEfficiency.value || '0'}kg per egg</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${performance.feedEfficiency.status === 'optimal' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {performance.feedEfficiency.status || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: {performance.feedEfficiency.target || 'N/A'}kg</p>
                        </div>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            performance.feedEfficiency.status === 'optimal' 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                              : 'bg-gradient-to-r from-orange-500 to-orange-400'
                          }`}
                          style={{ width: `${Math.min(((performance.feedEfficiency.value || 0) / (performance.feedEfficiency.target || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {performance?.mortalityRate && (
                  <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Bird className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Mortality Rate</p>
                            <p className="text-xs text-muted-foreground">{performance.mortalityRate.value || '0'}% this month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${performance.mortalityRate.status === 'low' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {performance.mortalityRate.status || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: &lt;{performance.mortalityRate.target || '1'}%</p>
                        </div>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            performance.mortalityRate.status === 'low' 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : 'bg-gradient-to-r from-orange-500 to-orange-400'
                          }`}
                          style={{ width: `${Math.min((performance.mortalityRate.value || 0) / (performance.mortalityRate.target || 1) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                  {!performance && (
                    <div className="rounded-xl border border-dashed bg-card p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">No performance data available</p>
                      <p className="text-xs text-muted-foreground">Performance metrics will appear here as data is collected</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
};

export default Index;
