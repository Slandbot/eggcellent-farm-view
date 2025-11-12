import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, Bird, Heart, AlertTriangle } from "lucide-react"
import { useBirds, useBirdsStats, useBirdActions } from "@/hooks/useApiData"

export default function BirdsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [addBirdGroupDialogOpen, setAddBirdGroupDialogOpen] = useState(false)
  const [filters, setFilters] = useState({ status: '', breed: '', search: '' })
  
  // API hooks
  const { data: birdsData, loading: birdsLoading, error: birdsError, refetch: refetchBirds } = useBirds(filters)
  const { data: birdsStats, loading: statsLoading, error: statsError } = useBirdsStats()
  const { createBirdGroup, loading: actionLoading } = useBirdActions()

  // Handle nested API response structure: { data: { data: [...] } }
  let birds: any[] = []
  if (birdsData) {
    if (Array.isArray(birdsData)) {
      birds = birdsData
    } else if (typeof birdsData === 'object') {
      // Handle nested structure: { data: [...] } or { data: { data: [...] } }
      if ('data' in birdsData) {
        const dataValue = (birdsData as any).data
        if (Array.isArray(dataValue)) {
          birds = dataValue
        } else if (dataValue && typeof dataValue === 'object' && 'data' in dataValue) {
          // Double nested: { data: { data: [...] } }
          const nestedData = dataValue.data
          if (Array.isArray(nestedData)) {
            birds = nestedData
          }
        }
      }
    }
  }
  
  // Debug: Log what we received
  if (import.meta.env.DEV) {
    console.log('[BirdsManagement] Raw birdsData:', birdsData)
    console.log('[BirdsManagement] Raw birdsData type:', typeof birdsData, 'isArray:', Array.isArray(birdsData))
    console.log('[BirdsManagement] Extracted birds count:', birds.length)
    if (birds.length > 0) {
      console.log('[BirdsManagement] First bird item:', birds[0])
    }
  }
  const [newBirdGroup, setNewBirdGroup] = useState({
    groupId: "",
    breed: "",
    count: "",
    age: "",
    pen: "",
    status: "healthy",
    acquisitionDate: "",
    notes: ""
  })

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case "healthy":
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "sick":
      case "ill":
      case "disease":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "quarantine":
      case "monitoring":
      case "treatment":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: 
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case "healthy":
      case "active":
        return <Heart className="w-4 h-4" />
      case "sick":
      case "ill":
      case "disease":
      case "quarantine":
      case "monitoring":
      case "treatment":
        return <AlertTriangle className="w-4 h-4" />
      default: 
        return null
    }
  }

  return (
    <div className="mobile-safe bg-background flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground pt-10">Birds Management</h1>
              <p className="responsive-subtitle">Monitor and manage your flock health and performance</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddBirdGroupDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Bird Group
            </Button>
          </div>

          {/* Loading State */}
          {(birdsLoading || statsLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading birds data...</span>
            </div>
          )}

          {/* Error State */}
          {(birdsError || statsError) && !birdsLoading && !statsLoading && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Unable to load birds data</h3>
                  <p className="text-sm text-muted-foreground">
                    {birdsError || statsError || 'An error occurred while loading data. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!statsLoading && birdsStats && (
            <div className="responsive-card-grid">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                  <Bird className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{birdsStats.totalBirds ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{birdsStats.totalChange ?? "No data"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Healthy Birds</CardTitle>
                  <Heart className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{birdsStats.healthyBirds ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{birdsStats.healthyPercentage ? `${birdsStats.healthyPercentage} of flock` : "No data"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sick/Quarantine</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{birdsStats.sickBirds ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{birdsStats.sickPercentage ? `${birdsStats.sickPercentage} of flock` : "No data"}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Egg Production</CardTitle>
                  <Bird className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{birdsStats.avgEggProduction ?? 0}</div>
                  <p className="text-xs text-muted-foreground">eggs per bird/year</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* No Stats Data Message */}
          {!statsLoading && !birdsStats && (
            <div className="responsive-card-grid">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">No statistics data available</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Bird Groups</CardTitle>
              <CardDescription>Manage individual bird groups and monitor their health status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="responsive-filters">
                <div className="relative responsive-search">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search birds..." 
                    className="pl-10" 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="responsive-select">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.breed || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, breed: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="responsive-select">
                    <SelectValue placeholder="Filter by breed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Breeds</SelectItem>
                    <SelectItem value="rhode">Rhode Island Red</SelectItem>
                    <SelectItem value="leghorn">Leghorn</SelectItem>
                    <SelectItem value="sussex">Sussex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table className="mobile-table">
                  <TableHeader className="mobile-table-header">
                    <TableRow>
                      <TableHead>Bird ID</TableHead>
                      <TableHead>Breed</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Eggs/Year</TableHead>
                      <TableHead>Pen Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {birdsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                            Loading birds...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : birds.length > 0 ? (
                      birds.map((bird: any) => {
                        // Map API response fields to UI fields (handle multiple possible formats)
                        // Supports: Bird interface (health, production, location) and alternative formats (status, eggs, pen)
                        const status = bird.status || bird.health || 'Unknown'
                        const production = bird.production || bird.eggs || bird.eggProduction || bird.eggProductionRate || '0'
                        const location = bird.location || bird.pen || bird.penLocation || 'N/A'
                        const groupId = bird.group || bird.groupId || bird.id || 'N/A'
                        const age = bird.age || bird.ageWeeks || bird.ageInWeeks || 'N/A'
                        const breed = bird.breed || bird.breedType || 'Unknown'
                        const count = bird.count || bird.birdCount || bird.totalBirds || ''
                        
                        return (
                          <TableRow key={bird.id || bird._id || groupId} className="mobile-table-row">
                            <TableCell className="mobile-table-cell font-medium" data-label="Bird ID">
                              {groupId}
                              {count && ` (${count})`}
                            </TableCell>
                            <TableCell className="mobile-table-cell" data-label="Breed">{breed}</TableCell>
                            <TableCell className="mobile-table-cell" data-label="Age">
                              {typeof age === 'number' ? `${age} weeks` : age}
                            </TableCell>
                            <TableCell className="mobile-table-cell" data-label="Status">
                              <Badge className={getStatusColor(status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(status)}
                                  {status}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="mobile-table-cell" data-label="Eggs/Year">
                              {typeof production === 'number' ? production.toLocaleString() : production}
                            </TableCell>
                            <TableCell className="mobile-table-cell" data-label="Pen Location">{location}</TableCell>
                            <TableCell className="mobile-table-cell" data-label="Actions">
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">Edit</Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {birdsError 
                            ? 'Error loading birds. Please try again.'
                            : 'No birds found. Try adjusting your filters or add a new bird group.'}
                          {import.meta.env.DEV && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Debug: birdsData type: {typeof birdsData}, 
                              isArray: {Array.isArray(birdsData) ? 'true' : 'false'},
                              birds length: {birds.length}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Bird Group Dialog */}
      <Dialog open={addBirdGroupDialogOpen} onOpenChange={setAddBirdGroupDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Add New Bird Group</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new bird group to your farm. Fill in all the required details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-sm font-medium">
                Group ID *
              </Label>
              <Input
                id="groupId"
                value={newBirdGroup.groupId}
                onChange={(e) => setNewBirdGroup({...newBirdGroup, groupId: e.target.value})}
                placeholder="e.g., BG006"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-sm font-medium">
                Breed *
              </Label>
              <Select value={newBirdGroup.breed} onValueChange={(value) => setNewBirdGroup({...newBirdGroup, breed: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rhode Island Red">Rhode Island Red</SelectItem>
                  <SelectItem value="Leghorn">Leghorn</SelectItem>
                  <SelectItem value="Sussex">Sussex</SelectItem>
                  <SelectItem value="Plymouth Rock">Plymouth Rock</SelectItem>
                  <SelectItem value="Australorp">Australorp</SelectItem>
                  <SelectItem value="Orpington">Orpington</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count" className="text-sm font-medium">
                  Bird Count *
                </Label>
                <Input
                  id="count"
                  type="number"
                  value={newBirdGroup.count}
                  onChange={(e) => setNewBirdGroup({...newBirdGroup, count: e.target.value})}
                  placeholder="150"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Age (weeks) *
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={newBirdGroup.age}
                  onChange={(e) => setNewBirdGroup({...newBirdGroup, age: e.target.value})}
                  placeholder="24"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pen" className="text-sm font-medium">
                Pen Assignment *
              </Label>
              <Input
                id="pen"
                value={newBirdGroup.pen}
                onChange={(e) => setNewBirdGroup({...newBirdGroup, pen: e.target.value})}
                placeholder="e.g., A1, B2, C3"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Health Status
              </Label>
              <Select value={newBirdGroup.status} onValueChange={(value) => setNewBirdGroup({...newBirdGroup, status: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisitionDate" className="text-sm font-medium">
                Acquisition Date
              </Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={newBirdGroup.acquisitionDate}
                onChange={(e) => setNewBirdGroup({...newBirdGroup, acquisitionDate: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={newBirdGroup.notes}
                onChange={(e) => setNewBirdGroup({...newBirdGroup, notes: e.target.value})}
                placeholder="Additional notes about this bird group..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setAddBirdGroupDialogOpen(false)} 
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const success = await createBirdGroup({
                  ...newBirdGroup,
                  count: parseInt(newBirdGroup.count)
                })
                if (success) {
                  setAddBirdGroupDialogOpen(false)
                  setNewBirdGroup({
                    groupId: "",
                    breed: "",
                    count: "",
                    age: "",
                    pen: "",
                    status: "healthy",
                    acquisitionDate: "",
                    notes: ""
                  })
                  refetchBirds()
                }
              }}
              disabled={actionLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {actionLoading ? "Adding..." : "Add Bird Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}