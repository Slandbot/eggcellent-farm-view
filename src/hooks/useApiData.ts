import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'
import dataServices from '@/services/dataService'
import type {
  BirdsStats, Bird, EggStats, EggCollection, FeedStats, FeedItem,
  MedicineStats, Medicine, DashboardStats, ProductionReport,
  HealthReport, FeedConsumptionReport, UserStats, User
} from '@/types/api'

// Generic hook for API data fetching
export function useApiData<T>(serviceName: keyof typeof dataServices, method: string, params?: any) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const service = dataServices[serviceName] as any
      const result = await service[method](params)
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [serviceName, method, params, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Birds Management Hooks
export function useBirds(filters?: { status?: string; breed?: string; search?: string }) {
  return useApiData<Bird[]>('birds', 'getBirds', filters)
}

export function useBirdsStats() {
  return useApiData<BirdsStats>('birds', 'getBirdsStats')
}

export function useBirdActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const createBirdGroup = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.birds.createBirdGroup(data)
      toast({
        title: 'Success',
        description: 'Bird group created successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bird group'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateBird = async (id: string, data: any) => {
    try {
      setLoading(true)
      await dataServices.birds.updateBird(id, data)
      toast({
        title: 'Success',
        description: 'Bird updated successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bird'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteBird = async (id: string) => {
    try {
      setLoading(true)
      await dataServices.birds.deleteBird(id)
      toast({
        title: 'Success',
        description: 'Bird deleted successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bird'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return { createBirdGroup, updateBird, deleteBird, loading }
}

// Egg Collection Hooks
export function useEggCollections(filters?: { date?: string; shift?: string; pen?: string }) {
  return useApiData<EggCollection[]>('eggs', 'getEggCollections', filters)
}

export function useEggStats() {
  return useApiData<EggStats>('eggs', 'getEggStats')
}

export function useProductionChart(period: string = '7d') {
  return useApiData<any>('eggs', 'getProductionChart', period)
}

export function useEggActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const recordCollection = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.eggs.recordEggCollection(data)
      toast({
        title: 'Success',
        description: 'Egg collection recorded successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record collection'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateCollection = async (id: string, data: any) => {
    try {
      setLoading(true)
      await dataServices.eggs.updateEggCollection(id, data)
      toast({
        title: 'Success',
        description: 'Collection updated successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update collection'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return { recordCollection, updateCollection, loading }
}

// Feed Inventory Hooks
export function useFeedInventory(filters?: { type?: string; status?: string; search?: string }) {
  return useApiData<FeedItem[]>('feed', 'getFeedInventory', filters)
}

export function useFeedStats() {
  return useApiData<FeedStats>('feed', 'getFeedStats')
}

export function useFeedUsageHistory(feedId?: string) {
  return useApiData<any[]>('feed', 'getFeedUsageHistory', feedId)
}

export function useFeedActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const addFeedStock = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.feed.addFeedStock(data)
      toast({
        title: 'Success',
        description: 'Feed stock added successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add feed stock'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const recordUsage = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.feed.recordFeedUsage(data)
      toast({
        title: 'Success',
        description: 'Feed usage recorded successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record usage'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const addFeedItem = addFeedStock // Alias for backward compatibility

  return { addFeedStock, addFeedItem, recordUsage, loading }
}

// Medicine & Vaccines Hooks
export function useMedicineInventory(filters?: { type?: string; status?: string; search?: string }) {
  return useApiData<Medicine[]>('medicine', 'getMedicineInventory', filters)
}

export function useMedicineStats() {
  return useApiData<MedicineStats>('medicine', 'getMedicineStats')
}

export function useTreatmentHistory(filters?: { birdGroup?: string; medicine?: string; dateFrom?: string; dateTo?: string }) {
  return useApiData<any[]>('medicine', 'getTreatmentHistory', filters)
}

export function useMedicineActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const addMedicine = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.medicine.addMedicine(data)
      toast({
        title: 'Success',
        description: 'Medicine added successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add medicine'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const recordTreatment = async (data: any) => {
    try {
      setLoading(true)
      await dataServices.medicine.recordTreatment(data)
      toast({
        title: 'Success',
        description: 'Treatment recorded successfully'
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record treatment'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return { addMedicine, recordTreatment, loading }
}

// Dashboard & Reports Hooks
export function useDashboardStats() {
  return useApiData<DashboardStats>('reports', 'getDashboardStats')
}

export function useProductionReport(period: string = '30d') {
  return useApiData<ProductionReport>('reports', 'getProductionReport', period)
}

export function useHealthReport(period: string = '30d') {
  return useApiData<HealthReport>('reports', 'getHealthReport', period)
}

export function useFeedConsumptionReport(period: string = '30d') {
  return useApiData<FeedConsumptionReport>('reports', 'getFeedConsumptionReport', period)
}

export function useReportActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const generateReport = async (type: string, filters: any) => {
    try {
      setLoading(true)
      const result = await dataServices.reports.generateReport(type, filters)
      toast({
        title: 'Success',
        description: 'Report generated successfully'
      })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(true)
      const result = await dataServices.reports.exportReport(reportId, format)
      toast({
        title: 'Success',
        description: `Report exported as ${format.toUpperCase()}`
      })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generateReport, exportReport, loading }
}

// User Management Hooks
export function useUsers(filters?: { role?: string; status?: string; search?: string }) {
  return useApiData<User[]>('users', 'getUsers', filters)
}

export function useUserStats() {
  return useApiData<UserStats>('users', 'getUserStats')
}

export function useUserActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const addUser = async (userData: any) => {
    try {
      setLoading(true)
      const result = await dataServices.users.addUser(userData)
      toast({
        title: 'Success',
        description: 'User added successfully'
      })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, userData: any) => {
    try {
      setLoading(true)
      const result = await dataServices.users.updateUser(userId, userData)
      toast({
        title: 'Success',
        description: 'User updated successfully'
      })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true)
      await dataServices.users.deleteUser(userId)
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { addUser, updateUser, deleteUser, loading }
}