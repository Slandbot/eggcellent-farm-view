import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { Plus, Search, Egg, TrendingUp, Calendar, Scale } from "lucide-react"

const collectionData = [
  { id: "EC001", date: "2024-01-15", shift: "Morning", pen: "A1", quantity: 145, grade: "A", weight: "58g avg", collector: "John Doe" },
  { id: "EC002", date: "2024-01-15", shift: "Evening", pen: "A1", quantity: 132, grade: "A", weight: "57g avg", collector: "Jane Smith" },
  { id: "EC003", date: "2024-01-15", shift: "Morning", pen: "B1", quantity: 168, grade: "AA", weight: "61g avg", collector: "John Doe" },
  { id: "EC004", date: "2024-01-15", shift: "Evening", pen: "B1", quantity: 155, grade: "A", weight: "59g avg", collector: "Mike Johnson" },
  { id: "EC005", date: "2024-01-14", shift: "Morning", pen: "C1", quantity: 198, grade: "AA", weight: "62g avg", collector: "Sarah Lee" },
]

export default function EggCollection() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "AA": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "A": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "B": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const totalDaily = collectionData
    .filter(item => item.date === "2024-01-15")
    .reduce((sum, item) => sum + item.quantity, 0)

  const avgWeight = "59g"
  const gradeAA = collectionData.filter(item => item.grade === "AA").length
  const weeklyTotal = 4850

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Egg Collection</h1>
              <p className="text-muted-foreground">Track daily egg collection and quality grading</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Collection
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
                <Egg className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDaily}</div>
                <p className="text-xs text-muted-foreground">+5% from yesterday</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Week Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyTotal.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgWeight}</div>
                <p className="text-xs text-muted-foreground">Standard grade A</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grade AA Rate</CardTitle>
                <Calendar className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">Premium quality</p>
              </CardContent>
            </Card>
          </div>

          {/* Production Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Production Trend</CardTitle>
              <CardDescription>Daily egg collection over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductionChart />
            </CardContent>
          </Card>

          {/* Collection Records */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Records</CardTitle>
              <CardDescription>Recent egg collection data with quality grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search collections..." className="pl-10" />
                </div>
                <Button variant="outline">Filter by Date</Button>
                <Button variant="outline">Export Report</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Pen</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Avg Weight</TableHead>
                    <TableHead>Collector</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.shift}</TableCell>
                      <TableCell>{record.pen}</TableCell>
                      <TableCell className="font-medium">{record.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(record.grade)}>
                          Grade {record.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.weight}</TableCell>
                      <TableCell>{record.collector}</TableCell>
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