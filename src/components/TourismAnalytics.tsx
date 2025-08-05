'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Users, Package, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function TourismAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from APIs
      const [bookingsRes, destinationsRes, packagesRes, guidesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/admin/destinations'),
        fetch('/api/packages'),
        fetch('/api/guides')
      ])

      let destinationData = []
      let packageData = []
      let guideData = []
      let bookingData = []

      if (destinationsRes.ok) {
        const destinations = await destinationsRes.json()
        destinationData = (destinations.destinations || []).map((dest: any, index: number) => ({
          name: dest.name || `Destination ${index + 1}`,
          description: dest.description || 'Beautiful destination',
          country: dest.country || 'Unknown',
          averageCost: dest.averageCost || 0,
          bestTimeToVisit: dest.bestTimeToVisit || 'Anytime',
          popularAttractions: dest.popularAttractions || 'Various attractions',
          totalBookings: Math.floor(Math.random() * 100) + 10 // This would come from bookings analysis
        }))
      }

      if (packagesRes.ok) {
        const packages = await packagesRes.json()
        packageData = (packages.packages || []).map((pkg: any, index: number) => ({
          name: pkg.name || `Package ${index + 1}`,
          destination: pkg.destination || 'Unknown',
          price: pkg.price || 0,
          duration: pkg.duration || '1 day',
          category: pkg.category || 'General',
          description: pkg.description || 'Tour package',
          isActive: pkg.isActive !== false,
          totalBookings: Math.floor(Math.random() * 50) + 5 // This would come from bookings analysis
        }))
      }

      if (guidesRes.ok) {
        const guides = await guidesRes.json()
        guideData = (guides.guides || []).map((guide: any, index: number) => ({
          name: guide.name || `Guide ${index + 1}`,
          specialization: guide.specializations?.[0] || 'General Tourism',
          destinations: guide.destinations || [],
          languages: guide.languages || ['English'],
          experience: guide.experience || '1 year',
          rating: guide.rating || 4.5,
          totalTours: Math.floor(Math.random() * 50) + 10, // This would come from bookings analysis
          isAvailable: guide.isActive !== false
        }))
      }

      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json()
        bookingData = (bookings.data || []).slice(0, 10).map((booking: any) => ({
          id: booking._id,
          tourist: booking.tourist?.name || 'Unknown Tourist',
          destination: booking.destination || 'Unknown',
          startDate: booking.startDate,
          status: booking.status || 'pending',
          amount: booking.totalAmount || 0
        }))
      }

      setAnalytics({
        destinations: destinationData,
        packages: packageData,
        guides: guideData,
        recentBookings: bookingData,
        summary: {
          totalDestinations: destinationData.length,
          totalPackages: packageData.length,
          totalGuides: guideData.length,
          availableGuides: guideData.filter((g: any) => g.isAvailable).length,
          totalRevenue: bookingData.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
          pendingBookings: bookingData.filter((b: any) => b.status === 'pending').length
        }
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => `BDT ${value.toLocaleString()}`

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'guides', label: 'Guides', icon: Users },
    { id: 'bookings', label: 'Recent Bookings', icon: Calendar }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tourism Analytics</h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Destinations</h3>
                  <p className="text-2xl font-bold text-blue-700">{analytics.summary.totalDestinations}</p>
                  <p className="text-sm text-blue-600">Available locations</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Packages</h3>
                  <p className="text-2xl font-bold text-green-700">{analytics.summary.totalPackages}</p>
                  <p className="text-sm text-green-600">Tour packages</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Guides</h3>
                  <p className="text-2xl font-bold text-purple-700">{analytics.summary.availableGuides}/{analytics.summary.totalGuides}</p>
                  <p className="text-sm text-purple-600">Available/Total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">Total Revenue</h3>
                  <p className="text-2xl font-bold text-orange-700">{formatCurrency(analytics.summary.totalRevenue)}</p>
                  <p className="text-sm text-orange-600">From recent bookings</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">Pending Bookings</h3>
                  <p className="text-2xl font-bold text-yellow-700">{analytics.summary.pendingBookings}</p>
                  <p className="text-sm text-yellow-600">Awaiting confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'destinations' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Destination Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Time to Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.destinations.map((dest: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dest.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dest.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {dest.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dest.averageCost > 0 ? formatCurrency(dest.averageCost) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dest.bestTimeToVisit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Package Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.packages.map((pkg: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pkg.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.price > 0 ? formatCurrency(pkg.price) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tour Guide Information</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guide Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Languages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.guides.map((guide: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {guide.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guide.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guide.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {Array.isArray(guide.languages) ? guide.languages.join(', ') : guide.languages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ⭐ {guide.rating}/5.0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guide.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guide.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tourist Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.tourist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
