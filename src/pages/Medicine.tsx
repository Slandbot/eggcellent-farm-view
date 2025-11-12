import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Syringe, Shield, AlertTriangle, Calendar } from "lucide-react"
import { useMedicineInventory, useMedicineStats, useMedicineActions, useTreatmentHistory } from "@/hooks/useApiData"

export default function Medicine() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({ type: '', status: '', search: '' })
  
  // API hooks
  const { data: medicineData, loading: medicineLoading, error: medicineError, refetch: refetchMedicine } = useMedicineInventory(filters)
  const { data: medicineStats, loading: statsLoading, error: statsError } = useMedicineStats()
  const { addMedicine, loading: actionLoading } = useMedicineActions()
  const { data: treatmentHistory, loading: treatmentLoading, error: treatmentError, refetch: refetchTreatments } = useTreatmentHistory()
  
  // Handle nested API response structure for medicine data
  // API response: {success: true, data: {data: [], total: 0, pagination: {...}}}
  let medicines: any[] = []
  if (medicineData) {
    if (Array.isArray(medicineData)) {
      medicines = medicineData
    } else if (typeof medicineData === 'object') {
      // Check if it's the nested structure: {data: [], total: 0, pagination: {...}}
      if ('data' in medicineData && Array.isArray((medicineData as any).data)) {
        medicines = (medicineData as any).data
      } else if ('data' in medicineData) {
        const dataValue = (medicineData as any).data
        if (Array.isArray(dataValue)) {
          medicines = dataValue
        } else if (dataValue && typeof dataValue === 'object' && 'data' in dataValue) {
          const nestedData = dataValue.data
          if (Array.isArray(nestedData)) {
            medicines = nestedData
          }
        }
      }
    }
  }
  
  // Handle nested API response structure for treatment history
  let treatments: any[] = []
  if (treatmentHistory) {
    if (Array.isArray(treatmentHistory)) {
      treatments = treatmentHistory
    } else if (typeof treatmentHistory === 'object') {
      if ('data' in treatmentHistory) {
        const dataValue = (treatmentHistory as any).data
        if (Array.isArray(dataValue)) {
          treatments = dataValue
        } else if (dataValue && typeof dataValue === 'object' && 'data' in dataValue) {
          const nestedData = dataValue.data
          if (Array.isArray(nestedData)) {
            treatments = nestedData
          }
        }
      }
    }
  }
  
  // Debug logging
  if (import.meta.env.DEV) {
    console.log('[Medicine] Raw medicineData:', medicineData)
    console.log('[Medicine] Extracted medicines count:', medicines.length)
    console.log('[Medicine] Raw medicineStats:', medicineStats)
    console.log('[Medicine] Raw treatmentHistory:', treatmentHistory)
    console.log('[Medicine] Extracted treatments count:', treatments.length)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Low Stock": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Out of Stock": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Vaccine": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Antibiotic": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Vitamin": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Treatment": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Medicine & Vaccines</h1>
              <p className="text-muted-foreground">Manage medical inventory and treatment records</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Treatment
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {(medicineLoading || statsLoading || treatmentLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading medicine data...</span>
            </div>
          )}

          {/* Error State - Only show for critical errors (medicine inventory or stats) */}
          {(medicineError || statsError) && !medicineLoading && !statsLoading && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Unable to load medicine data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {medicineError || statsError || 'An error occurred while loading data. Please try again.'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (medicineError) refetchMedicine()
                      // Stats will auto-refetch on component remount
                      if (statsError) window.location.reload()
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                  <Syringe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicineStats?.totalMedicines ?? medicines.length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Different medicines tracked</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicineStats?.lowStockItems ?? medicines.filter((item: any) => item.status === "Low Stock").length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Need restocking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
                  <Shield className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicineStats?.activeTreatments ?? treatments.length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Ongoing treatments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Calendar className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {medicineStats?.expiringSoon ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Within 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Medicine Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Track medicine stock levels and expiry dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search medicines..." 
                    className="pl-10" 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={filters.type || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === "all" ? "" : value }))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vaccine">Vaccines</SelectItem>
                    <SelectItem value="antibiotic">Antibiotics</SelectItem>
                    <SelectItem value="vitamin">Vitamins</SelectItem>
                    <SelectItem value="treatment">Treatments</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicineLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                          Loading medicines...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : medicines.length > 0 ? (
                    medicines.map((medicine: any) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.id}</TableCell>
                        <TableCell>{medicine.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(medicine.type)}>
                            {medicine.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{medicine.stock} {medicine.unit}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(medicine.status)}>
                            {medicine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{medicine.expiryDate}</TableCell>
                        <TableCell>{medicine.usage}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Use</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {medicineError 
                          ? 'Error loading medicines. Please try again.'
                          : 'No medicines found. Try adjusting your filters or add a new medicine.'}
                        {import.meta.env.DEV && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Debug: medicineData type: {typeof medicineData}, 
                            isArray: {Array.isArray(medicineData) ? 'true' : 'false'},
                            medicines length: {medicines.length}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Treatment Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Treatment Records</CardTitle>
              <CardDescription>Track administered treatments and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treatment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bird Group</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Administered By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatmentLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                          Loading treatment records...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : treatments.length > 0 ? (
                    treatments.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.date}</TableCell>
                        <TableCell>{record.birdGroup || record.birdGroupId}</TableCell>
                        <TableCell>{record.treatment || record.medicineName}</TableCell>
                      <TableCell>{record.dosage}</TableCell>
                        <TableCell>{record.administeredBy || record.usedBy || record.adminBy}</TableCell>
                      <TableCell>{record.reason}</TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {treatmentError ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">Error loading treatment records</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-md">
                              {treatmentError.includes('server') || treatmentError.includes('500')
                                ? 'The server encountered an error while loading treatment records. This may be a temporary issue.'
                                : treatmentError}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => refetchTreatments()}
                              className="mt-2"
                            >
                              Retry
                            </Button>
                            {import.meta.env.DEV && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Debug: {treatmentError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            <p>No treatment records found.</p>
                            <p className="text-xs mt-1">Treatment records will appear here once treatments are administered.</p>
                          </div>
                        )}
                        {import.meta.env.DEV && !treatmentError && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Debug: treatmentHistory type: {typeof treatmentHistory}, 
                            isArray: {Array.isArray(treatmentHistory) ? 'true' : 'false'},
                            treatments length: {treatments.length}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}