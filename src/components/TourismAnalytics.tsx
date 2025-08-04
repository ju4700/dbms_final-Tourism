'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, MapPin, TrendingUp, Users, DollarSign } from 'lucide-react'

interface TourismAnalyticsProps {
  stats?: any
}

export default function TourismAnalytics({ stats }: TourismAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API calls
      // For now, using mock data for demonstration
      const mockAnalytics = {
        destinationData: [
          { destination: 'Paris', bookings: 45, revenue: 67500 },
          { destination: 'Tokyo', bookings: 32, revenue: 48000 },
          { destination: 'New York', bookings: 28, revenue: 42000 },
          { destination: 'London', bookings: 35, revenue: 52500 },
          { destination: 'Rome', bookings: 22, revenue: 33000 },
        ],
        monthlyBookings: [
          { month: 'Jan', bookings: 25, revenue: 37500 },
          { month: 'Feb', bookings: 30, revenue: 45000 },
          { month: 'Mar', bookings: 35, revenue: 52500 },
          { month: 'Apr', bookings: 42, revenue: 63000 },
          { month: 'May', bookings: 38, revenue: 57000 },
          { month: 'Jun', bookings: 45, revenue: 67500 },
        ],
        packageDistribution: [
          { name: 'Budget', value: 35, color: '#10B981' },
          { name: 'Standard', value: 40, color: '#3B82F6' },
          { name: 'Premium', value: 20, color: '#8B5CF6' },
          { name: 'Luxury', value: 5, color: '#F59E0B' },
        ],
        topGuides: [
          { name: 'Marie Dubois', tours: 24, rating: 4.9 },
          { name: 'John Smith', tours: 18, rating: 4.8 },
          { name: 'Carlos Rodriguez', tours: 15, rating: 4.7 },
        ]
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Destinations</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.destinationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="destination" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'bookings' ? value : `$${value.toLocaleString()}`,
                name === 'bookings' ? 'Bookings' : 'Revenue'
              ]} />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Package Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Package Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.packageDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              >
                {analytics.packageDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Bookings</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Guides Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-teal-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Guides</h3>
          </div>
          <div className="space-y-4">
            {analytics.topGuides.map((guide: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {guide.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{guide.name}</p>
                    <p className="text-sm text-gray-600">{guide.tours} tours completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 font-medium">{guide.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Destination</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.destinationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="destination" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
