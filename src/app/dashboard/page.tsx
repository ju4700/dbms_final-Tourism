'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock, Plus, Search, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerTable from '@/components/CustomerTable'
import StatsCard from '@/components/StatsCard'
import SearchBar from '@/components/SearchBar'
import CustomerFilters from '@/components/CustomerFilters'
import { Customer, CustomerStats, SearchFilters } from '@/types'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router, searchFilters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch customers
      const customerParams = new URLSearchParams()
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) customerParams.append(key, value.toString())
      })
      
      const customersRes = await fetch(`/api/customers?${customerParams}`)

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.data || [])
      }

      // Only admin can view stats
      if (session?.user?.role === 'admin') {
        const statsRes = await fetch('/api/customers/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data)
        }
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

  const handleAddCustomer = () => {
    router.push('/dashboard/customer/add')
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    // Only admin can delete customers
    if (session?.user?.role !== 'admin') {
      toast.error('Access denied. Only admins can delete customers.')
      return
    }

    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Customer deleted successfully')
        // Remove customer from the local state
        setCustomers(prev => prev.filter(customer => customer._id !== id))
        // Refresh stats
        fetchData()
      } else {
        toast.error('Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Loading skeleton for stats - Only for admin */}
          {session?.user?.role === 'admin' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-mobile">
                  <div className="loading-skeleton h-4 w-20 mb-2"></div>
                  <div className="loading-skeleton h-8 w-16"></div>
                </div>
              ))}
            </div>
          )}
          
          {/* Loading skeleton for customers */}
          <div className="grid-mobile">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-mobile">
                <div className="loading-skeleton h-20 w-20 rounded-full mb-4"></div>
                <div className="loading-skeleton h-4 w-32 mb-2"></div>
                <div className="loading-skeleton h-3 w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customer Dashboard
            </h1>
            <p className="text-mobile text-gray-600 mt-1">
              Manage all your customers in one place
            </p>
          </div>
        </div>

        {/* Stats Cards - Only visible to admin */}
        {stats && session?.user?.role === 'admin' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Customers"
              value={stats.total}
              icon={Users}
            />
            <StatsCard
              title="Active"
              value={stats.active}
              icon={UserCheck}
            />
            <StatsCard
              title="Inactive"
              value={stats.inactive}
              icon={UserX}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={Clock}
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="button-mobile bg-gray-100 hover:bg-gray-200 text-gray-700 touch-target flex items-center justify-center sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <CustomerFilters
              onFiltersChange={handleSearch}
              initialFilters={searchFilters}
            />
          )}
        </div>

        {/* Customers Section */}
        <div>
          {customers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first customer
              </p>
              <button
                onClick={handleAddCustomer}
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </button>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              onDelete={handleDeleteCustomer}
              isDeleting={false}
              userRole={session?.user?.role}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
