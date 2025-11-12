import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { Plus, Search, Egg, TrendingUp, Calendar, Scale, AlertTriangle } from "lucide-react"
import { useEggCollections, useEggStats, useEggActions } from "@/hooks/useApiData"

export default function EggCollection() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recordCollectionDialogOpen, setRecordCollectionDialogOpen] = useState(false)
  const [filters, setFilters] = useState({ pen: '', grade: '', date: '', search: '' })
  
  // API hooks
  const { data: collectionData, loading: collectionLoading, error: collectionError, refetch: refetchCollections } = useEggCollections(filters)
  const { data: eggStats, loading: statsLoading, error: statsError } = useEggStats()
  const { recordCollection, loading: actionLoading } = useEggActions()
  const [newCollection, setNewCollection] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: "",
    pen: "",
    quantity: "",
    grade: "",
    avgWeight: "",
    collector: "",
    notes: ""
  })

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "AA": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "A": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "B": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Handle nested API response structure: { data: { data: [...] } }
  let collections: any[] = []
  if (collectionData) {
    if (Array.isArray(collectionData)) {
      collections = collectionData
    } else if (typeof collectionData === 'object') {
      // Handle nested structure: { data: [...] } or { data: { data: [...] } }
      if ('data' in collectionData) {
        const dataValue = (collectionData as any).data
        if (Array.isArray(dataValue)) {
          collections = dataValue
        } else if (dataValue && typeof dataValue === 'object' && 'data' in dataValue) {
          // Double nested: { data: { data: [...] } }
          const nestedData = dataValue.data
          if (Array.isArray(nestedData)) {
            collections = nestedData
          }
        }
      }
    }
  }
  
  // Debug: Log what we received
  if (import.meta.env.DEV) {
    console.log('[EggCollection] Raw collectionData:', collectionData)
    console.log('[EggCollection] Raw collectionData type:', typeof collectionData, 'isArray:', Array.isArray(collectionData))
    console.log('[EggCollection] Extracted collections count:', collections.length)
    if (collections.length > 0) {
      console.log('[EggCollection] First collection item:', collections[0])
    }
  }
  
  // Normalize collection items - handle different field names from API
  const normalizedCollections = collections.map((item: any) => ({
    id: item.id || '',
    date: item.date || '',
    shift: item.shift || '',
    pen: item.pen || '',
    quantity: item.quantity ?? item.collected ?? 0,
    grade: item.grade || item.quality || 'A',
    avgWeight: item.avgWeight || item.weight || '',
    collector: item.collector || item.collectedBy || '',
    notes: item.notes || '',
    broken: item.broken || 0,
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || ''
  }))

  // Calculate today's date for daily total
  const today = new Date().toISOString().split('T')[0]
  const totalDaily = normalizedCollections
    .filter(item => item.date === today)
    .reduce((sum, item) => sum + (item.quantity || 0), 0)

  // Calculate grade AA rate from normalized data
  const gradeAACount = normalizedCollections.filter(item => item.grade === "AA").length
  const gradeAARate = normalizedCollections.length > 0 
    ? `${((gradeAACount / normalizedCollections.length) * 100).toFixed(0)}%`
    : "0%"

  return (
    <div className="mobile-safe bg-background flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 mobile-content overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-10">Egg Collection</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track daily egg collection and quality grading</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => setRecordCollectionDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Record Collection
            </Button>
          </div>

          {/* Loading State */}
          {(collectionLoading || statsLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading egg collection data...</span>
            </div>
          )}

          {/* Error State */}
          {(collectionError || statsError) && !collectionLoading && !statsLoading && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Unable to load egg collection data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {collectionError || statsError || 'An error occurred while loading data. Please try again.'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      refetchCollections()
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!statsLoading && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
                  <Egg className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{eggStats?.todayCollection ?? totalDaily}</div>
                  <p className="text-xs text-muted-foreground">{eggStats?.todayChange || "+0% from yesterday"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Week Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{eggStats?.weeklyTotal?.toLocaleString() ?? "0"}</div>
                  <p className="text-xs text-muted-foreground">{eggStats?.weeklyChange || "+0% from last week"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{eggStats?.avgWeight || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">Standard grade A</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Grade AA Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{eggStats?.gradeAARate ?? gradeAARate}</div>
                  <p className="text-xs text-muted-foreground">Premium quality</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Production Chart */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Weekly Production Trend</CardTitle>
              <CardDescription className="text-sm">Daily egg collection over the past week</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="w-full overflow-x-auto">
                <ProductionChart />
              </div>
            </CardContent>
          </Card>

          {/* Collection Records */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Collection Records</CardTitle>
              <CardDescription className="text-sm">Recent egg collection data with quality grades</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search collections..." 
                    className="pl-10" 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Select value={filters.grade || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="AA">Grade AA</SelectItem>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="date" 
                    className="w-40" 
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Button variant="outline" className="flex-1 sm:flex-none text-sm">Export Report</Button>
                </div>
              </div>

              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Collection ID</TableHead>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Shift</TableHead>
                        <TableHead className="whitespace-nowrap">Pen</TableHead>
                        <TableHead className="whitespace-nowrap">Quantity</TableHead>
                        <TableHead className="whitespace-nowrap">Grade</TableHead>
                        <TableHead className="whitespace-nowrap">Avg Weight</TableHead>
                        <TableHead className="whitespace-nowrap">Collector</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              Loading collections...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : normalizedCollections.length > 0 ? (
                        normalizedCollections.map((record: any) => (
                          <TableRow key={record.id || Math.random()}>
                            <TableCell className="font-medium whitespace-nowrap">{record.id || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{record.shift || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">{record.pen || 'N/A'}</TableCell>
                            <TableCell className="font-medium whitespace-nowrap">{record.quantity?.toLocaleString() || 0}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge className={getGradeColor(record.grade)}>
                                Grade {record.grade || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{record.avgWeight || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">{record.collector || 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {collectionError || statsError 
                              ? 'Error loading collections. Please try again.'
                              : 'No egg collections found. Try adjusting your filters or record a new collection.'}
                            {import.meta.env.DEV && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Debug: collectionData type: {typeof collectionData}, 
                                isArray: {Array.isArray(collectionData) ? 'true' : 'false'},
                                collections length: {collections.length}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Record Collection Dialog */}
      <Dialog open={recordCollectionDialogOpen} onOpenChange={setRecordCollectionDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Record Egg Collection</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Record a new egg collection entry. Fill in all the required details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Collection Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newCollection.date}
                  onChange={(e) => setNewCollection({...newCollection, date: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift" className="text-sm font-medium">
                  Shift *
                </Label>
                <Select value={newCollection.shift} onValueChange={(value) => setNewCollection({...newCollection, shift: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pen" className="text-sm font-medium">
                  Pen Location *
                </Label>
                <Input
                  id="pen"
                  value={newCollection.pen}
                  onChange={(e) => setNewCollection({...newCollection, pen: e.target.value})}
                  placeholder="e.g., A1, B2, C3"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newCollection.quantity}
                  onChange={(e) => setNewCollection({...newCollection, quantity: e.target.value})}
                  placeholder="150"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-medium">
                  Egg Grade *
                </Label>
                <Select value={newCollection.grade} onValueChange={(value) => setNewCollection({...newCollection, grade: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AA">Grade AA</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgWeight" className="text-sm font-medium">
                  Avg Weight
                </Label>
                <Input
                  id="avgWeight"
                  value={newCollection.avgWeight}
                  onChange={(e) => setNewCollection({...newCollection, avgWeight: e.target.value})}
                  placeholder="e.g., 58g avg"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collector" className="text-sm font-medium">
                Collector Name
              </Label>
              <Input
                id="collector"
                value={newCollection.collector}
                onChange={(e) => setNewCollection({...newCollection, collector: e.target.value})}
                placeholder="e.g., John Doe"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Input
                id="notes"
                value={newCollection.notes}
                onChange={(e) => setNewCollection({...newCollection, notes: e.target.value})}
                placeholder="Additional notes (optional)"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setRecordCollectionDialogOpen(false)} 
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const success = await recordCollection({
                  ...newCollection,
                  quantity: parseInt(newCollection.quantity)
                })
                if (success) {
                  setRecordCollectionDialogOpen(false)
                  setNewCollection({
                    date: new Date().toISOString().split('T')[0],
                    shift: "",
                    pen: "",
                    quantity: "",
                    grade: "",
                    avgWeight: "",
                    collector: "",
                    notes: ""
                  })
                  refetchCollections()
                }
              }}
              disabled={actionLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {actionLoading ? "Recording..." : "Record Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}