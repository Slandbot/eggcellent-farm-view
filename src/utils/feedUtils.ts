/**
 * Feed Inventory Utility Functions
 * 
 * These utilities help with feed inventory calculations and status determination.
 * Note: Status calculation should primarily be done on the backend, but these
 * functions can be used as fallbacks or for client-side calculations.
 */

import { FeedItem } from "@/types/api"

/**
 * Calculate feed item status based on stock levels
 * 
 * @param stock - Current stock quantity
 * @param maxCapacity - Maximum storage capacity (default: 100)
 * @returns Status string: "Out of Stock" | "Low Stock" | "In Stock"
 */
export function calculateFeedStatus(stock: number, maxCapacity: number = 100): "Out of Stock" | "Low Stock" | "In Stock" {
  if (stock <= 0) {
    return "Out of Stock"
  }
  
  const threshold = maxCapacity * 0.3 // 30% threshold for low stock
  if (stock < threshold) {
    return "Low Stock"
  }
  
  return "In Stock"
}

/**
 * Calculate stock percentage for progress bar display
 * 
 * @param stock - Current stock quantity
 * @param maxCapacity - Maximum storage capacity
 * @returns Percentage value (0-100)
 */
export function getStockPercentage(stock: number, maxCapacity: number): number {
  if (!maxCapacity || maxCapacity <= 0) {
    return 0
  }
  const percentage = (stock / maxCapacity) * 100
  return Math.min(Math.max(percentage, 0), 100) // Clamp between 0 and 100
}

/**
 * Ensure feed item has calculated status
 * If status is missing or invalid, calculate it from stock and maxCapacity
 * 
 * @param feedItem - Feed item object
 * @returns Feed item with valid status
 */
export function ensureFeedStatus(feedItem: FeedItem): FeedItem {
  const validStatuses = ["In Stock", "Low Stock", "Out of Stock"]
  
  // If status is missing or invalid, calculate it
  if (!feedItem.status || !validStatuses.includes(feedItem.status)) {
    const stock = feedItem.stock ?? feedItem.quantity ?? 0
    const maxCapacity = feedItem.maxCapacity ?? 100
    return {
      ...feedItem,
      status: calculateFeedStatus(stock, maxCapacity)
    }
  }
  
  return feedItem
}

/**
 * Filter feed items by search term (searches name and supplier)
 * 
 * @param feeds - Array of feed items
 * @param searchTerm - Search term (case-insensitive)
 * @returns Filtered array of feed items
 */
export function filterFeedsBySearch(feeds: FeedItem[], searchTerm: string): FeedItem[] {
  if (!searchTerm.trim()) {
    return feeds
  }
  
  const lowerSearch = searchTerm.toLowerCase()
  return feeds.filter(feed => 
    feed.name.toLowerCase().includes(lowerSearch) ||
    feed.supplier.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Filter feed items by type
 * 
 * @param feeds - Array of feed items
 * @param type - Feed type to filter by
 * @returns Filtered array of feed items
 */
export function filterFeedsByType(feeds: FeedItem[], type: string): FeedItem[] {
  if (!type) {
    return feeds
  }
  return feeds.filter(feed => feed.type === type)
}

/**
 * Filter feed items by status
 * 
 * @param feeds - Array of feed items
 * @param status - Status to filter by
 * @returns Filtered array of feed items
 */
export function filterFeedsByStatus(feeds: FeedItem[], status: string): FeedItem[] {
  if (!status) {
    return feeds
  }
  return feeds.filter(feed => feed.status === status)
}

/**
 * Filter feed items by supplier
 * 
 * @param feeds - Array of feed items
 * @param supplier - Supplier name to filter by
 * @returns Filtered array of feed items
 */
export function filterFeedsBySupplier(feeds: FeedItem[], supplier: string): FeedItem[] {
  if (!supplier) {
    return feeds
  }
  const lowerSupplier = supplier.toLowerCase()
  return feeds.filter(feed => 
    feed.supplier.toLowerCase().includes(lowerSupplier)
  )
}

/**
 * Apply multiple filters to feed items
 * 
 * @param feeds - Array of feed items
 * @param filters - Filter object with optional search, type, status, supplier
 * @returns Filtered array of feed items
 */
export function applyFeedFilters(
  feeds: FeedItem[],
  filters: {
    search?: string
    type?: string
    status?: string
    supplier?: string
  }
): FeedItem[] {
  let filtered = feeds

  if (filters.search) {
    filtered = filterFeedsBySearch(filtered, filters.search)
  }

  if (filters.type) {
    filtered = filterFeedsByType(filtered, filters.type)
  }

  if (filters.status) {
    filtered = filterFeedsByStatus(filtered, filters.status)
  }

  if (filters.supplier) {
    filtered = filterFeedsBySupplier(filtered, filters.supplier)
  }

  return filtered
}

/**
 * Get status badge color class based on status
 * Matches the color scheme used in FeedInventory component
 * 
 * @param status - Feed status
 * @returns Tailwind CSS classes for badge
 */
export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "In Stock":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Out of Stock":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

