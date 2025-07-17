import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Package, AlertTriangle, TrendingDown } from "lucide-react"

const feedData = [
  { id: "F001", name: "Layer Mash Premium", category: "Layer Feed", stock: 850, maxCapacity: 1000, unit: "kg", status: "In Stock", expiryDate: "2024-12-15" },
  { id: "F002", name: "Broiler Starter", category: "Broiler Feed", stock: 120, maxCapacity: 500, unit: "kg", status: "Low Stock", expiryDate: "2024-11-20" },
  { id: "F003", name: "Calcium Supplement", category: "Supplements", stock: 45, maxCapacity: 100, unit: "kg", status: "Low Stock", expiryDate: "2025-03-10" },
  { id: "F004", name: "Organic Corn Feed", category: "Grain", stock: 0, maxCapacity: 800, unit: "kg", status: "Out of Stock", expiryDate: "2024-10-30" },
  { id: "F005", name: "Vitamin Mix", category: "Supplements", stock: 75, maxCapacity: 100, unit: "kg", status: "In Stock", expiryDate: "2025-01-15" },
]

export default function FeedInventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const totalValue = feedData.reduce((sum, item) => sum + (item.stock * 2.5), 0) // Assuming avg cost of $2.5/kg

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Feed Inventory</h1>
              <p className="text-muted-foreground">Manage feed stock levels and monitor consumption</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Feed Item
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedData.length}</div>
                <p className="text-xs text-muted-foreground">Feed categories tracked</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedData.filter(item => item.status === "Low Stock").length}</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedData.filter(item => item.status === "Out of Stock").length}</div>
                <p className="text-xs text-muted-foreground">Urgent reorder needed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </CardContent>
            </Card>
          </div>

          {/* Feed Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feed Stock Levels</CardTitle>
              <CardDescription>Monitor current stock levels and manage feed inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search feed items..." className="pl-10" />
                </div>
                <Button variant="outline">Export Report</Button>
              </div>

              <Table>
                <TableHeader>
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
                  {feedData.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell className="font-medium">{feed.id}</TableCell>
                      <TableCell>{feed.name}</TableCell>
                      <TableCell>{feed.category}</TableCell>
                      <TableCell>
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
                      <TableCell>
                        <Badge className={getStatusColor(feed.status)}>
                          {feed.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{feed.expiryDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Reorder</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}