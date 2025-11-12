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
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, AlertTriangle } from "lucide-react"
import { useProductionReport, useHealthReport, useFeedConsumptionReport, useDashboardStats } from "@/hooks/useApiData"

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({ type: '', period: '', status: '' })
  
  // API hooks
  const { data: productionData, loading: productionLoading, error: productionError } = useProductionReport(filters.period || '30d')
  const { data: healthData, loading: healthLoading, error: healthError } = useHealthReport(filters.period || '30d')
  const { data: feedData, loading: feedLoading, error: feedError } = useFeedConsumptionReport(filters.period || '30d')
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useDashboardStats()

  // Extract nested data from API responses
  const productionReport = productionData && typeof productionData === 'object' && 'data' in productionData 
    ? (productionData as any).data 
    : productionData
  const healthReport = healthData && typeof healthData === 'object' && 'data' in healthData 
    ? (healthData as any).data 
    : healthData
  const feedReport = feedData && typeof feedData === 'object' && 'data' in feedData 
    ? (feedData as any).data 
    : feedData
  const stats = dashboardStats && typeof dashboardStats === 'object' && 'data' in dashboardStats
    ? (dashboardStats as any).data
    : dashboardStats

  // Transform production dailyData for ProductionChart
  const productionChartData = productionReport?.dailyData 
    ? productionReport.dailyData.map((item: any) => ({
        day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : item.date,
        eggs: item.quantity || 0,
        target: undefined // API doesn't provide target, can be added later
      }))
    : undefined

  // Debug logging in development
  if (import.meta.env.DEV) {
    if (productionData) console.log('[Reports] Production data:', productionData, 'Extracted:', productionReport)
    if (healthData) console.log('[Reports] Health data:', healthData, 'Extracted:', healthReport)
    if (feedData) console.log('[Reports] Feed data:', feedData, 'Extracted:', feedReport)
    if (dashboardStats) console.log('[Reports] Dashboard stats:', dashboardStats, 'Extracted:', stats)
  }

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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground pt-10">Reports & Analytics</h1>
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

          {/* Error State */}
          {(productionError || healthError || feedError || statsError) && !productionLoading && !healthLoading && !feedLoading && !statsLoading && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Unable to load reports data</h3>
                  <p className="text-sm text-muted-foreground">
                    {productionError || healthError || feedError || statsError || 'An error occurred while loading data. Please try again.'}
                  </p>
                </div>
              </div>
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
                  <div className="text-2xl font-bold">{stats?.totalReports ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Generated this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automated Reports</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.automatedReports ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Insights</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.dataInsights ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Key metrics tracked</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                  <PieChart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.performanceScore ?? 'N/A'}</div>
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
                  <ProductionChart data={productionChartData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Manage automated report generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No report templates available. Report templates will be displayed here when configured.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="production" className="responsive-spacing">
              {productionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading production data...</span>
                </div>
              ) : productionError ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <p>{productionError}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="responsive-chart-grid">
                  <Card>
                    <CardHeader className="responsive-card-content">
                      <CardTitle className="text-lg sm:text-xl">Egg Production Analysis</CardTitle>
                      <CardDescription className="responsive-subtitle">
                        {productionReport?.period ? `Production trends for ${productionReport.period}` : 'Weekly production trends and forecasts'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="responsive-card-content">
                      <ProductionChart data={productionChartData} />
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="responsive-card-content">
                        <CardTitle className="text-lg sm:text-xl">Production Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="responsive-card-content space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Production</p>
                            <p className="text-2xl font-bold">{productionReport?.totalProduction?.toLocaleString() ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Average Daily</p>
                            <p className="text-2xl font-bold">{productionReport?.averageDaily?.toLocaleString() ?? 0}</p>
                          </div>
                        </div>
                        {productionReport?.peakDay && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Peak Day</p>
                            <p className="font-medium">
                              {new Date(productionReport.peakDay.date).toLocaleDateString()}: {productionReport.peakDay.quantity?.toLocaleString()} eggs
                            </p>
                          </div>
                        )}
                        {productionReport?.trends && (
                          <div className="pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <TrendingUp className={`h-4 w-4 ${productionReport.trends.direction === 'up' ? 'text-green-500' : productionReport.trends.direction === 'down' ? 'text-red-500' : 'text-muted-foreground'}`} />
                              <p className="text-sm">
                                {productionReport.trends.change > 0 ? '+' : ''}{productionReport.trends.change}% 
                                <span className="text-muted-foreground ml-1">({productionReport.trends.direction})</span>
                              </p>
                            </div>
                          </div>
                        )}
                        {productionReport?.gradeDistribution && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Grade Distribution</p>
                            <div className="grid grid-cols-4 gap-2">
                              {Object.entries(productionReport.gradeDistribution).map(([grade, count]: [string, any]) => (
                                <div key={grade} className="text-center">
                                  <p className="text-xs text-muted-foreground">Grade {grade}</p>
                                  <p className="font-semibold">{count?.toLocaleString() ?? 0}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              {healthLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading health data...</span>
                </div>
              ) : healthError ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <p>{healthError}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Health & Treatment Summary</CardTitle>
                      <CardDescription>
                        {healthReport?.period ? `Health metrics for ${healthReport.period}` : 'Monitor flock health and medication usage'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Treatments</p>
                          <p className="text-2xl font-bold">{healthReport?.totalTreatments?.toLocaleString() ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Treatments</p>
                          <p className="text-2xl font-bold">{healthReport?.activeTreatments?.toLocaleString() ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mortality Rate</p>
                          <p className="text-2xl font-bold">{healthReport?.mortalityRate?.toFixed(2) ?? 0}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Health Score</p>
                          <p className="text-2xl font-bold">{healthReport?.healthScore?.toLocaleString() ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {healthReport?.commonIssues && healthReport.commonIssues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Common Health Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {healthReport.commonIssues.map((issue: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm">{issue.name || issue}</span>
                              {issue.count && <Badge variant="secondary">{issue.count}</Badge>}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {healthReport?.treatmentHistory && healthReport.treatmentHistory.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Treatment History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {healthReport.treatmentHistory.slice(0, 5).map((treatment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <div>
                                <p className="text-sm font-medium">{treatment.medicine || treatment.type || 'Treatment'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {treatment.date ? new Date(treatment.date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              {treatment.quantity && (
                                <Badge variant="outline">{treatment.quantity}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {healthReport?.vaccinationSchedule && healthReport.vaccinationSchedule.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Vaccination Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {healthReport.vaccinationSchedule.map((vaccine: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <div>
                                <p className="text-sm font-medium">{vaccine.name || vaccine.type || 'Vaccination'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {vaccine.date ? new Date(vaccine.date).toLocaleDateString() : vaccine.schedule || 'N/A'}
                                </p>
                              </div>
                              {vaccine.status && (
                                <Badge className={vaccine.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {vaccine.status}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(healthReport?.commonIssues?.length === 0 && healthReport?.treatmentHistory?.length === 0 && healthReport?.vaccinationSchedule?.length === 0) && (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <p>No health data available for this period.</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              {feedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading feed consumption data...</span>
                </div>
              ) : feedError ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <p>{feedError}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Feed Consumption Analysis</CardTitle>
                      <CardDescription>
                        {feedReport?.period ? `Feed consumption for ${feedReport.period}` : 'Cost analysis and feed efficiency tracking'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Consumption</p>
                          <p className="text-2xl font-bold">{feedReport?.totalConsumption?.toLocaleString() ?? 0} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Average Daily</p>
                          <p className="text-2xl font-bold">{feedReport?.averageDaily?.toLocaleString() ?? 0} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Feed Efficiency</p>
                          <p className="text-2xl font-bold">{feedReport?.feedEfficiency?.toFixed(2) ?? 0}</p>
                        </div>
                      </div>

                      {feedReport?.costAnalysis && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3">Cost Analysis</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Cost</p>
                              <p className="text-xl font-bold">₵{feedReport.costAnalysis.totalCost?.toLocaleString() ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Cost Per Egg</p>
                              <p className="text-xl font-bold">₵{feedReport.costAnalysis.costPerEgg?.toFixed(2) ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Cost Per Bird</p>
                              <p className="text-xl font-bold">₵{feedReport.costAnalysis.costPerBird?.toFixed(2) ?? 0}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {feedReport?.byFeedType && feedReport.byFeedType.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Consumption by Feed Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {feedReport.byFeedType.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm font-medium">{item.type || item.name || 'Unknown'}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">{item.consumption || item.quantity || 0} kg</span>
                                {item.cost && (
                                  <span className="text-sm font-semibold">₵{item.cost.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {feedReport?.dailyConsumption && feedReport.dailyConsumption.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Consumption Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {feedReport.dailyConsumption.slice(0, 10).map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm">
                                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="text-sm font-semibold">{item.consumption || item.quantity || 0} kg</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(!feedReport || (feedReport?.byFeedType?.length === 0 && feedReport?.dailyConsumption?.length === 0)) && (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <p>No feed consumption data available for this period.</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent reports available. Generated reports will be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}