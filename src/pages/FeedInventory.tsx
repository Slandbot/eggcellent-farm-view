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
  const { data: feedData, loading: feedLoading, refetch: refetchFeed } = useFeedInventory(filters)
  const { data: feedStats, loading: statsLoading } = useFeedStats()
  const { addFeedItem, loading: actionLoading } = useFeedActions()
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
    return (stock / maxCapacity) * 100
  }

  const totalValue = feedData.reduce((sum, item) => sum + (item.stock * 15), 0)

  return (
    <div className="mobile-safe bg-background flex">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground">Feed Inventory</h1>
              <p className="responsive-subtitle">Manage feed stock levels and monitor consumption</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddFeedDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Feed Item
            </Button>
          </div>

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
                  <div className="text-2xl font-bold">{feedStats?.totalItems || (feedData?.length || 0)}</div>
                  <p className="text-xs text-muted-foreground">Feed categories tracked</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedStats?.lowStockItems || (feedData?.filter(item => item.status === "Low Stock").length || 0)}</div>
                  <p className="text-xs text-muted-foreground">Need restocking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedStats?.outOfStockItems || (feedData?.filter(item => item.status === "Out of Stock").length || 0)}</div>
                  <p className="text-xs text-muted-foreground">Urgent reorder needed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${feedStats?.totalValue || (feedData?.reduce((sum, item) => sum + (item.stock * 15), 0) || 0).toLocaleString()}</div>
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
                    ) : feedData && feedData.length > 0 ? (
                      feedData.map((feed: any) => (
                        <TableRow key={feed.id} className="mobile-table-row">
                          <TableCell className="mobile-table-cell font-medium" data-label="Feed ID">{feed.id}</TableCell>
                          <TableCell className="mobile-table-cell" data-label="Name">{feed.name}</TableCell>
                          <TableCell className="mobile-table-cell" data-label="Category">{feed.category}</TableCell>
                          <TableCell className="mobile-table-cell" data-label="Stock Level">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{feed.stock} {feed.unit}</span>
                                <span className="text-muted-foreground">{feed.maxCapacity} {feed.unit}</span>
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
                          <TableCell className="mobile-table-cell" data-label="Expiry Date">{feed.expiryDate}</TableCell>
                          <TableCell className="mobile-table-cell" data-label="Actions">
                            <div className="responsive-button-group">
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">Edit</Button>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">Reorder</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No feed items found. Try adjusting your filters or add a new feed item.
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
    </div>
  )
}