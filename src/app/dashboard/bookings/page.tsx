'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Calendar, User, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Booking {
  _id: string
  tourist: {
    _id: string
    name: string
    email: string
    phone: string
  }
  package?: {
    _id: string
    name: string
    price: number
    destination: string
  }
  destination?: {
    _id: string
    name: string
    description: string
  }
  guide?: {
    _id: string
    name: string
    phone: string
  }
  bookingDate: string
  startDate: string
  endDate: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: number
  paymentStatus: 'pending' | 'partial' | 'completed'
  paidAmount: number
  numberOfPeople: number
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingBooking, setEditingBooking] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 15

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, statusFilter, currentPage])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      
      const response = await fetch(`/api/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.data || [])
        setTotalCount(data.pagination?.total || 0)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        toast.error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setUpdatingStatus(bookingId)
    try {
      const response = await fetch(`/api/bookings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: bookingId, status }),
      })

      if (response.ok) {
        toast.success('Booking status updated successfully')
        fetchBookings() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const updatePaymentStatus = async (bookingId: string, paymentStatus: string, paidAmount?: number) => {
    setUpdatingStatus(bookingId)
    try {
      const updateData: any = { _id: bookingId, paymentStatus }
      if (paidAmount !== undefined) {
        updateData.paidAmount = paidAmount
      }

      const response = await fetch(`/api/bookings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success('Payment status updated successfully')
        fetchBookings() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Failed to update payment status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>

      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by tourist name, email, package, or destination..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => router.push('/dashboard/bookings/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Bookings ({totalCount})
            </h3>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter ? 'Try adjusting your search criteria.' : 'Get started by creating a new booking.'}
              </p>
              {!searchTerm && !statusFilter && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/dashboard/tourist/add')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Booking
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tourist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package/Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.tourist?.name || 'Unknown Tourist'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.tourist?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.package ? booking.package.name : booking.destination ? booking.destination.name : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {booking.package ? booking.package.destination : booking.destination ? 'Direct Destination' : 'N/A'}
                        </div>
                        {booking.guide && (
                          <div className="text-xs text-blue-600">
                            Guide: {booking.guide.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(booking.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {updatingStatus === booking._id ? (
                          <div className="animate-pulse">
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </div>
                        ) : (
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(booking.status)}`}
                            disabled={updatingStatus === booking._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {updatingStatus === booking._id ? (
                          <div className="animate-pulse">
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </div>
                        ) : (
                          <select
                            value={booking.paymentStatus}
                            onChange={(e) => updatePaymentStatus(booking._id, e.target.value)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getPaymentStatusColor(booking.paymentStatus)}`}
                            disabled={updatingStatus === booking._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          BDT {booking.totalAmount.toLocaleString()}
                        </div>
                        {booking.paymentStatus === 'partial' && (
                          <div className="text-xs text-gray-500">
                            Paid: BDT {booking.paidAmount.toLocaleString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && bookings.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg mt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalCount)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalCount}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 2) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && array[index - 1] < page - 1;
                        return (
                          <div key={page} className="flex">
                            {showEllipsis && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
