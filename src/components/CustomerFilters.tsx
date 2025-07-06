'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/types'
import { useZones } from '@/hooks/useZones'

interface CustomerFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export default function CustomerFilters({ 
  onFiltersChange, 
  initialFilters = {} 
}: CustomerFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const { zones, loading: zonesLoading } = useZones()

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '')

  return (
    <div className="card-mobile">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-mobile"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone
          </label>
          <select
            value={filters.zone || ''}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            disabled={zonesLoading}
            className="input-mobile"
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Package Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package
          </label>
          <select
            value={filters.package || ''}
            onChange={(e) => handleFilterChange('package', e.target.value)}
            className="input-mobile"
          >
            <option value="">All Packages</option>
            <option value="Basic">Basic - 5 Mbps (৳500)</option>
            <option value="Bronze">Bronze - 10 Mbps (৳600)</option>
            <option value="Silver">Silver - 15 Mbps (৳700)</option>
            <option value="Gold">Gold - 20 Mbps (৳800)</option>
            <option value="Platinum">Platinum - 25 Mbps (৳900)</option>
            <option value="Platinum Plus">Platinum Plus - 30 Mbps (৳1000)</option>
            <option value="Diamond">Diamond - 35 Mbps (৳1200)</option>
            <option value="Titanium">Titanium - 40 Mbps (৳1500)</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="input-mobile"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="input-mobile"
          />
        </div>
      </div>
    </div>
  )
}
