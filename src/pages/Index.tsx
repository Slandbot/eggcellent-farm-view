import { useState } from "react"
import { Bird, Egg, Package, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { useDashboardStats, useBirdsStats, useEggStats, useFeedStats } from "@/hooks/useApiData"

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Fetch dashboard data from API
  const { data: dashboardStats, loading: dashboardLoading } = useDashboardStats()
  const { data: birdsStats, loading: birdsLoading } = useBirdsStats()
  const { data: eggStats, loading: eggLoading } = useEggStats()
  const { data: feedStats, loading: feedLoading } = useFeedStats()

  // Loading state for any of the stats
  const isLoading = dashboardLoading || birdsLoading || eggLoading || feedLoading

  return (
    <div className="mobile-safe bg-background flex">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground">Farm Dashboard</h1>
              <p className="responsive-subtitle">Monitor your poultry farm operations and key metrics</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
            </div>
          )}

          {/* Metric Cards */}
          {!isLoading && (
            <div className="responsive-card-grid mb-8">
              <MetricCard
                title="Total Birds"
                value={birdsStats?.totalBirds?.toString() || "12,547"}
                change={{ value: birdsStats?.birdsChange || "+5.2%", trend: birdsStats?.birdsTrend || "up" }}
                icon={Bird}
              />
              <MetricCard
                title="Eggs Today"
                value={eggStats?.dailyProduction?.toString() || "2,847"}
                change={{ value: eggStats?.productionChange || "+12.5%", trend: eggStats?.productionTrend || "up" }}
                icon={Egg}
              />
              <MetricCard
                title="Feed Stock"
                value={feedStats?.totalStock || "2.5 tons"}
                change={{ value: feedStats?.stockChange || "-8.1%", trend: feedStats?.stockTrend || "down" }}
                icon={Package}
              />
              <MetricCard
                title="Health Alerts"
                value={birdsStats?.healthAlerts?.toString() || "3"}
                change={{ value: birdsStats?.alertsChange || "-2", trend: birdsStats?.alertsTrend || "down" }}
                icon={AlertTriangle}
              />
            </div>
          )}

          {/* Charts and actions */}
          <div className="responsive-chart-grid">
            <div className="chart-container">
              <div className="responsive-card-content mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Production Trends</h3>
                <p className="responsive-subtitle">Egg production over the last 7 days</p>
              </div>
              <ProductionChart />
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
            <RecentActivity />
            
            {/* Performance overview */}
            <div className="chart-container">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
                <p className="text-sm text-muted-foreground">This week's summary</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">Production Rate</p>
                      <p className="text-sm text-muted-foreground">89.2% efficiency</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">+4.2%</p>
                    <p className="text-xs text-muted-foreground">vs last week</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Feed Efficiency</p>
                      <p className="text-sm text-muted-foreground">1.8kg per egg</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">Optimal</p>
                    <p className="text-xs text-muted-foreground">Target: 1.9kg</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bird className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-foreground">Mortality Rate</p>
                      <p className="text-sm text-muted-foreground">0.8% this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">Low</p>
                    <p className="text-xs text-muted-foreground">Target: &lt;1%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
};

export default Index;
