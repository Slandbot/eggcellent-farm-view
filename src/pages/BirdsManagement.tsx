import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Bird, Heart, AlertTriangle } from "lucide-react"

const birdsData = [
  { id: "B001", breed: "Rhode Island Red", age: "24 weeks", status: "Healthy", eggs: 285, pen: "A1" },
  { id: "B002", breed: "Leghorn", age: "18 weeks", status: "Sick", eggs: 195, pen: "A2" },
  { id: "B003", breed: "Sussex", age: "32 weeks", status: "Healthy", eggs: 310, pen: "B1" },
  { id: "B004", breed: "Plymouth Rock", age: "28 weeks", status: "Quarantine", eggs: 267, pen: "C1" },
]

export default function BirdsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Sick": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Quarantine": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Healthy": return <Heart className="w-4 h-4" />
      case "Sick": return <AlertTriangle className="w-4 h-4" />
      case "Quarantine": return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Birds Management</h1>
              <p className="text-muted-foreground">Monitor and manage your flock health and performance</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Bird Group
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                <Bird className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,450</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Healthy Birds</CardTitle>
                <Heart className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,380</div>
                <p className="text-xs text-muted-foreground">97.1% of flock</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sick/Quarantine</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">70</div>
                <p className="text-xs text-muted-foreground">2.9% of flock</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Egg Production</CardTitle>
                <Bird className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">264</div>
                <p className="text-xs text-muted-foreground">eggs per bird/year</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Bird Groups</CardTitle>
              <CardDescription>Manage individual bird groups and monitor their health status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search birds..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
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

              <Table>
                <TableHeader>
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
                  {birdsData.map((bird) => (
                    <TableRow key={bird.id}>
                      <TableCell className="font-medium">{bird.id}</TableCell>
                      <TableCell>{bird.breed}</TableCell>
                      <TableCell>{bird.age}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bird.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(bird.status)}
                            {bird.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{bird.eggs}</TableCell>
                      <TableCell>{bird.pen}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
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