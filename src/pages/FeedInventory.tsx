import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, TrendingDown, Truck } from "lucide-react"
import { useFeedInventory, useFeedStats, useFeedActions } from "@/hooks/useApiData"

export default function FeedInventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [addFeedDialogOpen, setAddFeedDialogOpen] = useState(false)
  const [filters, setFilters] = useState({ type: '', status: '', supplier: '', search: '' })
  
  // API hooks
  const { data: feedData, loading: feedLoading, error: feedError, refetch: refetchFeed } = useFeedInventory(filters)
  const { data: feedStats, loading: statsLoading, error: statsError } = useFeedStats()
  const { addFeedItem, updateFeedStock, loading: actionLoading } = useFeedActions()
  
  // Edit dialog state
  const [editFeedDialogOpen, setEditFeedDialogOpen] = useState(false)
  const [editingFeed, setEditingFeed] = useState<any>(null) 
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('[FeedInventory] feedData:', feedData)
    console.log('[FeedInventory] feedLoading:', feedLoading)
    console.log('[FeedInventory] feedError:', feedError)
    console.log('[FeedInventory] feedStats:', feedStats)
  }
  const [newFeedItem, setNewFeedItem] = useState({
    name: "",
    type: "",
    supplier: "",
    quantity: "",
    unit: "kg",
    costPerUnit: "",
    expiryDate: "",
    location: ""
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Low Stock": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Out of Stock": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStockPercentage = (stock: number, maxCapacity: number) => {
    if (!maxCapacity || maxCapacity <= 0) return 0
    const percentage = (stock / maxCapacity) * 100
    return Math.min(Math.max(percentage, 0), 100) // Clamp between 0 and 100
  }

  // Handle nested API response structure: { data: { data: [...] } }
  let feeds: any[] = []
  if (feedData) {
    if (Array.isArray(feedData)) {
      feeds = feedData
    } else if (typeof feedData === 'object') {
      // Handle nested structure: { data: [...] } or { data: { data: [...] } }
      if ('data' in feedData) {
        const dataValue = (feedData as any).data
        if (Array.isArray(dataValue)) {
          feeds = dataValue
        } else if (dataValue && typeof dataValue === 'object' && 'data' in dataValue) {
          // Double nested: { data: { data: [...] } }
          const nestedData = dataValue.data
          if (Array.isArray(nestedData)) {
            feeds = nestedData
          }
        }
      }
    }
  }
  
  // Debug: Log what we received
  if (import.meta.env.DEV) {
    console.log('[FeedInventory] Raw feedData:', feedData)
    console.log('[FeedInventory] Raw feedData type:', typeof feedData, 'isArray:', Array.isArray(feedData))
    console.log('[FeedInventory] Extracted feeds count:', feeds.length)
    if (feeds.length > 0) {
      console.log('[FeedInventory] First feed item:', feeds[0])
    }
  }
  
  // Normalize feed items - handle different field names from API
  const normalizedFeeds = feeds.map((item: any) => ({
    id: item.id || '',
    name: item.name || '',
    type: item.type || '',
    category: item.category || item.type || '',
    stock: item.stock ?? item.quantity ?? 0,
    maxCapacity: item.maxCapacity || item.capacity || 100, // Default to 100 if not provided
    unit: item.unit || 'kg',
    status: item.status || 'In Stock',
    expiryDate: item.expiryDate || item.expiry || '',
    supplier: item.supplier || '',
    cost: item.cost,
    costPerUnit: item.costPerUnit ?? item.cost ?? 0,
    location: item.location || '',
    batchNumber: item.batchNumber || '',
    notes: item.notes || '',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || ''
  }))
  
  // Calculate total value using actual costPerUnit from items
  const totalValue = normalizedFeeds.reduce((sum, item) => {
    const stock = item.stock || 0
    const costPerUnit = item.costPerUnit || 0
    return sum + (stock * costPerUnit)
  }, 0)

  return (
    <div className="mobile-safe bg-background flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground pt-10">Feed Inventory</h1>
              <p className="responsive-subtitle">Manage feed stock levels and monitor consumption</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddFeedDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Feed Item
            </Button>
          </div>

          {/* Error State */}
          {(feedError || statsError) && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">Error loading feed data</p>
              <p className="text-xs text-muted-foreground">
                {feedError || statsError}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  refetchFeed()
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {(feedLoading || statsLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading feed inventory data...</span>
            </div>
          )}

          {/* Stats Cards */}
          {!statsLoading && (
            <div className="responsive-card-grid">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedStats?.totalItems ?? normalizedFeeds.length}</div>
                  <p className="text-xs text-muted-foreground">Feed categories tracked</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {feedStats?.lowStockItems ?? normalizedFeeds.filter(item => item.status === "Low Stock").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need restocking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {feedStats?.outOfStockItems ?? normalizedFeeds.filter(item => item.status === "Out of Stock").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Urgent reorder needed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₵{feedStats?.totalValue ? feedStats.totalValue.toLocaleString() : totalValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Current inventory value</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feed Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feed Stock Levels</CardTitle>
              <CardDescription>Monitor current stock levels and manage feed inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="responsive-filters">
                <div className="relative responsive-search">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search feed items..." 
                    className="pl-10" 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">Export Report</Button>
              </div>

              <div className="overflow-x-auto">
                <Table className="mobile-table">
                  <TableHeader className="mobile-table-header">
                    <TableRow>
                      <TableHead>Feed ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                            Loading feed inventory...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !feedLoading && normalizedFeeds.length > 0 ? (
                      normalizedFeeds.map((feed) => (
                        <TableRow key={feed.id} className="mobile-table-row">
                          <TableCell className="mobile-table-cell font-medium" data-label="Feed ID">
                            {feed.id || 'N/A'}
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Name">
                            {feed.name || 'Unnamed'}
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Category">
                            {feed.category || feed.type || 'N/A'}
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Stock Level">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{feed.stock.toLocaleString()} {feed.unit}</span>
                                <span className="text-muted-foreground">
                                  {feed.maxCapacity.toLocaleString()} {feed.unit}
                                </span>
                              </div>
                              <Progress 
                                value={getStockPercentage(feed.stock, feed.maxCapacity)} 
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Status">
                            <Badge className={getStatusColor(feed.status)}>
                              {feed.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Expiry Date">
                            {feed.expiryDate ? new Date(feed.expiryDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="mobile-table-cell" data-label="Actions">
                            <div className="responsive-button-group">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full sm:w-auto"
                                onClick={() => {
                                  setEditingFeed(feed)
                                  setEditFeedDialogOpen(true)
                                }}
                              >
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">Reorder</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : !feedLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">No feed items found.</p>
                            {feedError ? (
                              <p className="text-xs text-destructive">Error: {feedError}</p>
                            ) : (
                              <>
                                <p className="text-xs text-muted-foreground">Try adjusting your filters or add a new feed item.</p>
                                {import.meta.env.DEV && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Debug: feedData = {feedData === null ? 'null' : feedData === undefined ? 'undefined' : Array.isArray(feedData) ? `Array(${feedData.length})` : typeof feedData}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Feed Item Dialog */}
      <Dialog open={addFeedDialogOpen} onOpenChange={setAddFeedDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Add New Feed Item</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new feed item to your inventory. Fill in all the required details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={newFeedItem.name}
                onChange={(e) => setNewFeedItem({...newFeedItem, name: e.target.value})}
                placeholder="e.g., Premium Layer Feed"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type *
              </Label>
              <Select value={newFeedItem.type} onValueChange={(value) => setNewFeedItem({...newFeedItem, type: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select feed type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="layer">Layer Feed</SelectItem>
                  <SelectItem value="starter">Starter Feed</SelectItem>
                  <SelectItem value="grower">Grower Feed</SelectItem>
                  <SelectItem value="finisher">Finisher Feed</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Supplier *
              </Label>
              <Input
                id="supplier"
                value={newFeedItem.supplier}
                onChange={(e) => setNewFeedItem({...newFeedItem, supplier: e.target.value})}
                placeholder="e.g., AgriCorp Ltd"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  value={newFeedItem.quantity}
                  onChange={(e) => setNewFeedItem({...newFeedItem, quantity: e.target.value})}
                  placeholder="1000"
                  className="flex-1 min-w-0"
                />
                <Select value={newFeedItem.unit} onValueChange={(value) => setNewFeedItem({...newFeedItem, unit: value})}>
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-sm font-medium">
                Cost per Unit
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={newFeedItem.costPerUnit}
                onChange={(e) => setNewFeedItem({...newFeedItem, costPerUnit: e.target.value})}
                placeholder="25.50"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                type="date"
                value={newFeedItem.expiryDate}
                onChange={(e) => setNewFeedItem({...newFeedItem, expiryDate: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Storage Location
              </Label>
              <Input
                id="location"
                value={newFeedItem.location}
                onChange={(e) => setNewFeedItem({...newFeedItem, location: e.target.value})}
                placeholder="e.g., Warehouse A, Section 2"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setAddFeedDialogOpen(false)} 
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const success = await addFeedItem({
                  ...newFeedItem,
                  quantity: parseInt(newFeedItem.quantity),
                  costPerUnit: parseFloat(newFeedItem.costPerUnit)
                })
                if (success) {
                  setAddFeedDialogOpen(false)
                  setNewFeedItem({
                    name: "",
                    type: "",
                    supplier: "",
                    quantity: "",
                    unit: "kg",
                    costPerUnit: "",
                    expiryDate: "",
                    location: ""
                  })
                  refetchFeed()
                }
              }}
              disabled={actionLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {actionLoading ? "Adding..." : "Add Feed Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feed Item Dialog */}
      <Dialog open={editFeedDialogOpen} onOpenChange={setEditFeedDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Edit Feed Item</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update feed item details. Modify the fields you want to change.
            </DialogDescription>
          </DialogHeader>
          {editingFeed && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editingFeed.name}
                  onChange={(e) => setEditingFeed({...editingFeed, name: e.target.value})}
                  placeholder="e.g., Premium Layer Feed"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type" className="text-sm font-medium">
                  Type *
                </Label>
                <Select value={editingFeed.type} onValueChange={(value) => setEditingFeed({...editingFeed, type: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="layer">Layer Feed</SelectItem>
                    <SelectItem value="starter">Starter Feed</SelectItem>
                    <SelectItem value="grower">Grower Feed</SelectItem>
                    <SelectItem value="finisher">Finisher Feed</SelectItem>
                    <SelectItem value="supplement">Supplement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier" className="text-sm font-medium">
                  Supplier *
                </Label>
                <Input
                  id="edit-supplier"
                  value={editingFeed.supplier}
                  onChange={(e) => setEditingFeed({...editingFeed, supplier: e.target.value})}
                  placeholder="e.g., AgriCorp Ltd"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock" className="text-sm font-medium">
                  Stock Quantity *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingFeed.stock}
                    onChange={(e) => setEditingFeed({...editingFeed, stock: parseInt(e.target.value) || 0})}
                    placeholder="1000"
                    className="flex-1 min-w-0"
                  />
                  <Select value={editingFeed.unit} onValueChange={(value) => setEditingFeed({...editingFeed, unit: value})}>
                    <SelectTrigger className="w-16 sm:w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="tons">tons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxCapacity" className="text-sm font-medium">
                  Max Capacity
                </Label>
                <Input
                  id="edit-maxCapacity"
                  type="number"
                  value={editingFeed.maxCapacity || ''}
                  onChange={(e) => setEditingFeed({...editingFeed, maxCapacity: parseInt(e.target.value) || 100})}
                  placeholder="1000"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost" className="text-sm font-medium">
                  Cost per Unit
                </Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={editingFeed.costPerUnit || ''}
                  onChange={(e) => setEditingFeed({...editingFeed, costPerUnit: parseFloat(e.target.value) || 0})}
                  placeholder="25.50"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expiry" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="edit-expiry"
                  type="date"
                  value={editingFeed.expiryDate ? new Date(editingFeed.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingFeed({...editingFeed, expiryDate: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-sm font-medium">
                  Storage Location
                </Label>
                <Input
                  id="edit-location"
                  value={editingFeed.location || ''}
                  onChange={(e) => setEditingFeed({...editingFeed, location: e.target.value})}
                  placeholder="e.g., Warehouse A, Section 2"
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditFeedDialogOpen(false)
                setEditingFeed(null)
              }} 
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!editingFeed || !editingFeed.id) return
                
                const updateData = {
                  name: editingFeed.name,
                  type: editingFeed.type,
                  supplier: editingFeed.supplier,
                  stock: editingFeed.stock,
                  maxCapacity: editingFeed.maxCapacity,
                  unit: editingFeed.unit,
                  costPerUnit: editingFeed.costPerUnit,
                  expiryDate: editingFeed.expiryDate,
                  location: editingFeed.location,
                }
                
                const success = await updateFeedStock(editingFeed.id, updateData)
                if (success) {
                  setEditFeedDialogOpen(false)
                  setEditingFeed(null)
                  refetchFeed()
                }
              }}
              disabled={actionLoading || !editingFeed}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {actionLoading ? "Updating..." : "Update Feed Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}