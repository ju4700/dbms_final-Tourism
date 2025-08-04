'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/types'

interface TouristFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  totalCount: number
  filteredCount: number
  className?: string
}

export default function TouristFilters({ 
  onFiltersChange, 
  totalCount, 
  filteredCount, 
  className = '' 
}: TouristFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    destination: '',
    status: '',
    paymentStatus: ''
  })

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      search: '',
      destination: '',
      status: '',
      paymentStatus: ''
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or tourist ID..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        {/* Destination Filter */}
        <div className="min-w-0 flex-shrink-0 lg:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destination
          </label>
          <select
            value={filters.destination || ''}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Destinations</option>
            <option value="Paris">Paris</option>
            <option value="Tokyo">Tokyo</option>
            <option value="New York">New York</option>
            <option value="London">London</option>
            <option value="Dubai">Dubai</option>
            <option value="Rome">Rome</option>
            <option value="Sydney">Sydney</option>
            <option value="Bangkok">Bangkok</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-0 flex-shrink-0 lg:w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="min-w-0 flex-shrink-0 lg:w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment
          </label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredCount} of {totalCount} tourists
        {hasActiveFilters && (
          <span className="ml-2 text-blue-600 dark:text-blue-400">
            (filtered)
          </span>
        )}
      </div>
    </div>
  )
}
