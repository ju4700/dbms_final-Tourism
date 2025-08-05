'use client'

import { useEffect, useState } from 'react'
import { 
  Users, MapPin, Package, Building2, UserCheck, 
  TrendingUp, Calendar, Clock, CheckCircle, AlertCircle,
  Eye, Plus, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TourismAnalytics from '@/components/TourismAnalytics'

interface DashboardStats {
  tourists: {
    total: number
    active: number
    completed: number
    pending: number
    newThisMonth: number
    growthRate: number
  }
  bookings: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    todaysBookings: number
    upcomingBookings: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
    pendingPayments: number
    paidAmount: number
  }
  destinations: {
    total: number
    mostPopular: string
    averageCost: number
  }
  packages: {
    total: number
    mostBooked: string
    averagePrice: number
  }
  guides: {
    total: number
    available: number
    averageRating: number
  }
  hotels: {
    total: number
    available: number
    averageRating: number
  }
}

interface RecentActivity {
  id: string
  type: 'booking' | 'tourist' | 'payment'
  description: string
  timestamp: string
  amount?: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch comprehensive stats from multiple endpoints
      const [touristsRes, bookingsRes, packagesRes, guidesRes, destinationsRes] = await Promise.all([
        fetch('/api/tourists/stats'),
        fetch('/api/bookings'),
        fetch('/api/packages'),
        fetch('/api/guides'),
        fetch('/api/admin/destinations')
      ])

      // Process tourist stats
      let touristStats = { total: 0, active: 0, completed: 0, pending: 0, newThisMonth: 0, growthRate: 0 }
      if (touristsRes.ok) {
        const touristData = await touristsRes.json()
        touristStats = touristData.data || touristStats
      }

      // Process bookings data
      let bookingStats = { total: 0, confirmed: 0, pending: 0, cancelled: 0, todaysBookings: 0, upcomingBookings: 0 }
      let revenueStats = { total: 0, thisMonth: 0, lastMonth: 0, growthRate: 0, pendingPayments: 0, paidAmount: 0 }
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const bookings = bookingsData.data || []
        
        bookingStats.total = bookings.length
        bookingStats.confirmed = bookings.filter((b: any) => b.status === 'confirmed').length
        bookingStats.pending = bookings.filter((b: any) => b.status === 'pending').length
        bookingStats.cancelled = bookings.filter((b: any) => b.status === 'cancelled').length
        
        // Today's bookings
        const today = new Date().toDateString()
        bookingStats.todaysBookings = bookings.filter((b: any) => 
          new Date(b.createdAt).toDateString() === today
        ).length
        
        // Upcoming bookings (next 7 days)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        bookingStats.upcomingBookings = bookings.filter((b: any) => {
          const startDate = new Date(b.startDate)
          return startDate >= new Date() && startDate <= nextWeek
        }).length

        // Revenue calculations
        revenueStats.total = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
        revenueStats.paidAmount = bookings.reduce((sum: number, b: any) => sum + (b.paidAmount || 0), 0)
        revenueStats.pendingPayments = revenueStats.total - revenueStats.paidAmount
        
        const currentMonth = new Date().getMonth()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        
        revenueStats.thisMonth = bookings
          .filter((b: any) => new Date(b.createdAt).getMonth() === currentMonth)
          .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
          
        revenueStats.lastMonth = bookings
          .filter((b: any) => new Date(b.createdAt).getMonth() === lastMonth)
          .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
          
        revenueStats.growthRate = revenueStats.lastMonth > 0 
          ? ((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth) * 100 
          : 0

        // Generate recent activity
        const activities: RecentActivity[] = bookings
          .slice(0, 5)
          .map((b: any) => ({
            id: b._id,
            type: 'booking' as const,
            description: `New booking for ${b.tourist?.name || 'Unknown'} - ${b.package?.name || b.destination || 'Tour'}`,
            timestamp: b.createdAt,
            amount: b.totalAmount
          }))
        setRecentActivity(activities)
      }

      // Process packages data
      let packageStats = { total: 0, mostBooked: 'N/A', averagePrice: 0 }
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        const packages = packagesData.packages || []
        packageStats.total = packages.length
        packageStats.averagePrice = packages.length > 0 
          ? packages.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / packages.length 
          : 0
        packageStats.mostBooked = packages[0]?.name || 'N/A'
      }

      // Process guides data
      let guideStats = { total: 0, available: 0, averageRating: 0 }
      if (guidesRes.ok) {
        const guidesData = await guidesRes.json()
        const guides = guidesData.guides || []
        guideStats.total = guides.length
        guideStats.available = guides.filter((g: any) => g.isAvailable).length
        guideStats.averageRating = guides.length > 0 
          ? guides.reduce((sum: number, g: any) => sum + (g.rating || 4.5), 0) / guides.length 
          : 0
      }

      // Process destinations data
      let destinationStats = { total: 0, mostPopular: 'N/A', averageCost: 0 }
      if (destinationsRes.ok) {
        const destinationsData = await destinationsRes.json()
        const destinations = destinationsData.destinations || []
        destinationStats.total = destinations.length
        destinationStats.averageCost = destinations.length > 0 
          ? destinations.reduce((sum: number, d: any) => sum + (d.averageCost || 0), 0) / destinations.length 
          : 0
        destinationStats.mostPopular = destinations[0]?.name || 'N/A'
      }

      const hotelStats = { total: 0, available: 0, averageRating: 0 }

      setStats({
        tourists: touristStats,
        bookings: bookingStats,
        revenue: revenueStats,
        destinations: destinationStats,
        packages: packageStats,
        guides: guideStats,
        hotels: hotelStats
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `BDT ${amount.toLocaleString()}`
  }

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(rate).toFixed(1)}%
      </div>
    )
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

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tourists</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tourists.total}</p>
                  <p className="text-xs text-gray-500">New this month: {stats.tourists.newThisMonth}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
                  <div className="text-xs">{formatGrowthRate(stats.revenue.growthRate)}</div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bookings.confirmed}</p>
                  <p className="text-xs text-gray-500">Pending: {stats.bookings.pending}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Guides</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.guides.available}</p>
                  <p className="text-xs text-gray-500">Total: {stats.guides.total}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Bookings</span>
                  <span className="font-medium">{stats.bookings.todaysBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming Tours</span>
                  <span className="font-medium">{stats.bookings.upcomingBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Tourists</span>
                  <span className="font-medium">{stats.tourists.active}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium">{formatCurrency(stats.revenue.thisMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.revenue.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="font-medium text-orange-600">{formatCurrency(stats.revenue.pendingPayments)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Destinations</span>
                  <span className="font-medium">{stats.destinations.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tour Packages</span>
                  <span className="font-medium">{stats.packages.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Package Price</span>
                  <span className="font-medium">{formatCurrency(stats.packages.averagePrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-indigo-600 mr-3" />
                  <span>Add New Tourist</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-indigo-600 mr-3" />
                  <span>Create Booking</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-indigo-600 mr-3" />
                  <span>Manage Destinations</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-indigo-600 mr-3" />
                  <span>View Packages</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3">
                        {activity.type === 'booking' && <Calendar className="w-4 h-4 text-indigo-600" />}
                        {activity.type === 'tourist' && <Users className="w-4 h-4 text-indigo-600" />}
                        {activity.type === 'payment' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.bookings.pending > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Pending Bookings</h4>
                    <p className="text-sm text-yellow-700">{stats.bookings.pending} bookings need confirmation</p>
                  </div>
                </div>
              </div>
            )}

            {stats.revenue.pendingPayments > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Pending Payments</h4>
                    <p className="text-sm text-red-700">{formatCurrency(stats.revenue.pendingPayments)} outstanding</p>
                  </div>
                </div>
              </div>
            )}

            {stats.bookings.upcomingBookings > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Upcoming Tours</h4>
                    <p className="text-sm text-blue-700">{stats.bookings.upcomingBookings} tours starting soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
