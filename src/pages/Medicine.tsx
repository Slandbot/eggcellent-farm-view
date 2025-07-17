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

const medicineData = [
  { id: "M001", name: "Antibiotic XL", type: "Antibiotic", stock: 25, unit: "bottles", status: "In Stock", expiryDate: "2025-06-15", usage: "Respiratory infections" },
  { id: "M002", name: "Vitamin B Complex", type: "Vitamin", stock: 5, unit: "packets", status: "Low Stock", expiryDate: "2024-12-20", usage: "General health" },
  { id: "M003", name: "Newcastle Vaccine", type: "Vaccine", stock: 0, unit: "doses", status: "Out of Stock", expiryDate: "2024-11-30", usage: "Disease prevention" },
  { id: "M004", name: "Coccidiosis Treatment", type: "Treatment", stock: 15, unit: "bottles", status: "In Stock", expiryDate: "2025-03-10", usage: "Parasitic treatment" },
]

const treatmentRecords = [
  { id: "T001", date: "2024-01-15", birdGroup: "A1", treatment: "Antibiotic XL", dosage: "5ml per bird", adminBy: "Dr. Smith", reason: "Respiratory infection" },
  { id: "T002", date: "2024-01-14", birdGroup: "B1", treatment: "Vitamin B Complex", dosage: "2g per 100 birds", adminBy: "Jane Doe", reason: "Health boost" },
  { id: "T003", date: "2024-01-13", birdGroup: "C1", treatment: "Coccidiosis Treatment", dosage: "10ml per bird", adminBy: "Dr. Smith", reason: "Preventive treatment" },
]

export default function Medicine() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 space-y-6">
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

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                <Syringe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medicineData.length}</div>
                <p className="text-xs text-muted-foreground">Different medicines tracked</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medicineData.filter(item => item.status === "Low Stock").length}</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
                <Shield className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Ongoing treatments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Calendar className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Within 30 days</p>
              </CardContent>
            </Card>
          </div>

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
                  <Input placeholder="Search medicines..." className="pl-10" />
                </div>
                <Select>
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
                  {medicineData.map((medicine) => (
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
                  ))}
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
                  {treatmentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.birdGroup}</TableCell>
                      <TableCell>{record.treatment}</TableCell>
                      <TableCell>{record.dosage}</TableCell>
                      <TableCell>{record.adminBy}</TableCell>
                      <TableCell>{record.reason}</TableCell>
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