import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import StatisticsDashboard from "@/components/statistics/StatisticsDashboard"

export default function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="mobile-safe bg-background flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col mobile-content overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing mobile-content overflow-y-auto">
          <StatisticsDashboard />
        </main>
      </div>
    </div>
  )
}