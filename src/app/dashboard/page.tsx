'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, UserCheck, Clock, DollarSign, Filter, CheckCircle, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TouristTable from '@/components/TouristTable'
import StatsCard from '@/components/StatsCard'
import SearchBar from '@/components/SearchBar'
import TouristFilters from '@/components/TouristFilters'
import { Tourist, TouristStats, SearchFilters } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [tourists, setTourists] = useState<Tourist[]>([])
  const [stats, setStats] = useState<TouristStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [searchFilters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch tourists
      const touristParams = new URLSearchParams()
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) touristParams.append(key, value.toString())
      })
      
      const touristsRes = await fetch(`/api/tourists?${touristParams}`)

      if (touristsRes.ok) {
        const touristsData = await touristsRes.json()
        setTourists(touristsData.data || [])
      }

      // Get stats
      const statsRes = await fetch('/api/tourists/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters)
  }

  const handleAddTourist = () => {
    router.push('/dashboard/tourist/add')
  }

  const handleDeleteTourist = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete tourist "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tourists/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tourist deleted successfully')
        // Remove tourist from the local state
        setTourists(prev => prev.filter(tourist => tourist._id !== id))
        // Refresh stats
        fetchData()
      } else {
        toast.error('Failed to delete tourist')
      }
    } catch (error) {
      console.error('Error deleting tourist:', error)
      toast.error('Failed to delete tourist')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Section */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <StatsCard
                title="Total Tourists"
                value={stats.total}
                icon={Users}
              />
              <StatsCard
                title="Active Tours"
                value={stats.active}
                icon={UserCheck}
              />
              <StatsCard
                title="Completed Tours"
                value={stats.completed}
                icon={CheckCircle}
              />
              <StatsCard
                title="Pending Bookings"
                value={stats.pending}
                icon={Clock}
              />
              <StatsCard
                title="Total Revenue"
                value={stats.totalRevenue}
                icon={DollarSign}
              />
              <StatsCard
                title="Pending Payments"
                value={stats.pendingPayments}
                icon={DollarSign}
              />
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <TouristFilters 
                onFiltersChange={handleSearch} 
                totalCount={stats?.total || 0}
                filteredCount={tourists.length}
              />
            </div>
          )}
        </div>        {/* Tourists Table */}
        <div className="bg-white rounded-lg shadow-sm">
          {tourists.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tourists found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first tourist booking
              </p>
              <button
                onClick={handleAddTourist}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tourist
              </button>
            </div>
          ) : (
            <TouristTable
              tourists={tourists}
              onDelete={handleDeleteTourist}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
