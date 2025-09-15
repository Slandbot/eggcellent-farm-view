import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { useProductionReport, useHealthReport, useFeedConsumptionReport, useDashboardStats } from "@/hooks/useApiData"

const reportTemplates = [
  { id: "R001", name: "Daily Production Report", type: "Production", frequency: "Daily", lastGenerated: "2024-01-15", status: "Active" },
  { id: "R002", name: "Weekly Health Summary", type: "Health", frequency: "Weekly", lastGenerated: "2024-01-14", status: "Active" },
  { id: "R003", name: "Monthly Feed Consumption", type: "Feed", frequency: "Monthly", lastGenerated: "2024-01-01", status: "Active" },
  { id: "R004", name: "Quarterly Financial Report", type: "Financial", frequency: "Quarterly", lastGenerated: "2023-12-31", status: "Pending" },
]

const recentReports = [
  { name: "Production Report - Jan 15", type: "Production", date: "2024-01-15", size: "2.3 MB", format: "PDF" },
  { name: "Health Summary - Week 2", type: "Health", date: "2024-01-14", size: "1.8 MB", format: "Excel" },
  { name: "Feed Inventory - Jan 15", type: "Inventory", date: "2024-01-15", size: "1.2 MB", format: "PDF" },
  { name: "Monthly Overview - Dec 2023", type: "Overview", date: "2024-01-01", size: "4.1 MB", format: "PDF" },
]

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({ type: '', period: '', status: '' })
  
  // API hooks
  const { data: productionData, loading: productionLoading } = useProductionReport(filters.period || '30d')
  const { data: healthData, loading: healthLoading } = useHealthReport(filters.period || '30d')
  const { data: feedData, loading: feedLoading } = useFeedConsumptionReport(filters.period || '30d')
  const { data: dashboardStats, loading: statsLoading } = useDashboardStats()

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Production": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Health": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Feed": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Financial": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Inventory": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Overview": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground">Reports & Analytics</h1>
              <p className="responsive-subtitle">Generate insights and track farm performance</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>

          {/* Loading State */}
          {(productionLoading || healthLoading || feedLoading || statsLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading reports data...</span>
            </div>
          )}

          {/* Stats Cards */}
          {!statsLoading && (
            <div className="responsive-card-grid">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalReports || "47"}</div>
                  <p className="text-xs text-muted-foreground">Generated this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automated Reports</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.automatedReports || reportTemplates.filter(r => r.status === "Active").length}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Insights</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.dataInsights || "12"}</div>
                  <p className="text-xs text-muted-foreground">Key metrics tracked</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                  <PieChart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.performanceScore || "94%"}</div>
                  <p className="text-xs text-muted-foreground">Farm efficiency</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Tabs */}
          <Tabs defaultValue="overview" className="responsive-spacing">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="production" className="text-xs sm:text-sm">Production</TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm">Health & Medicine</TabsTrigger>
              <TabsTrigger value="financial" className="text-xs sm:text-sm">Financial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Farm Performance Overview</CardTitle>
                  <CardDescription>Key metrics and trends for overall farm performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductionChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Manage automated report generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <div className="flex gap-2">
                            <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                            <Badge className={getStatusColor(template.status)}>{template.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {template.frequency} • Last: {template.lastGenerated}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Generate</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="production" className="responsive-spacing">
              <div className="responsive-chart-grid">
                <Card>
                  <CardHeader className="responsive-card-content">
                    <CardTitle className="text-lg sm:text-xl">Egg Production Analysis</CardTitle>
                    <CardDescription className="responsive-subtitle">Weekly production trends and forecasts</CardDescription>
                  </CardHeader>
                  <CardContent className="responsive-card-content">
                    <ProductionChart />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="responsive-card-content">
                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                    <CardDescription className="responsive-subtitle">Generate production reports</CardDescription>
                  </CardHeader>
                  <CardContent className="responsive-card-content responsive-spacing">
                    <Button className="w-full justify-start gap-2">
                      <FileText className="w-4 h-4" />
                      Daily Production Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Weekly Performance Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Monthly Trend Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health & Treatment Reports</CardTitle>
                  <CardDescription>Monitor flock health and medication usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <FileText className="w-6 h-6" />
                      Health Summary
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Medicine Usage
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Calendar className="w-6 h-6" />
                      Vaccination Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Cost analysis and revenue tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button className="h-24 flex-col gap-2">
                      <FileText className="w-8 h-8" />
                      <span>Monthly P&L Statement</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2">
                      <BarChart3 className="w-8 h-8" />
                      <span>Cost Breakdown Analysis</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Download or view recently generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.date} • {report.size} • {report.format}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}