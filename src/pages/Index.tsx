import { useState } from "react"
import { Bird, Egg, Package, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-padding space-y-4 sm:space-y-6">
          {/* Page title */}
          <div>
            <h1 className="responsive-heading font-bold text-foreground">Farm Dashboard</h1>
            <p className="text-muted-foreground mt-1 responsive-text">
              Monitor your poultry farm operations and key metrics
            </p>
          </div>

          {/* Metrics grid */}
          <div className="responsive-grid lg-4">
            <MetricCard
              title="Total Birds"
              value="12,547"
              change={{ value: "+5.2%", trend: "up" }}
              icon={Bird}
            />
            <MetricCard
              title="Eggs Today"
              value="2,847"
              change={{ value: "+12.5%", trend: "up" }}
              icon={Egg}
            />
            <MetricCard
              title="Feed Stock"
              value="2.5 tons"
              change={{ value: "-8.1%", trend: "down" }}
              icon={Package}
            />
            <MetricCard
              title="Health Alerts"
              value="3"
              change={{ value: "-2", trend: "down" }}
              icon={AlertTriangle}
            />
          </div>

          {/* Charts and actions */}
          <div className="responsive-grid lg-3 lg:gap-6">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <ProductionChart />
            </div>
            <div className="order-1 lg:order-2">
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
