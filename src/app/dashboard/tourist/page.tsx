'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, User, Phone, Mail, Calendar, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Header from '@/components/layout/Header'
import AdvancedSearch from '@/components/AdvancedSearch'

interface Tourist {
  _id: string
  name: string
  email: string
  phone: string
  nationality: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  passportNumber?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  status: 'active' | 'inactive'
  totalBookings?: number
  totalSpent?: number
  lastBooking?: string
  createdAt: string
}

export default function TouristsPage() {
  const router = useRouter()
  const [tourists, setTourists] = useState<Tourist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState<any>({})

  useEffect(() => {
    fetchTourists()
  }, [searchFilters])

  const searchFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      placeholder: 'Search by name'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text' as const,
      placeholder: 'Search by email'
    },
    {
      name: 'nationality',
      label: 'Nationality',
      type: 'text' as const,
      placeholder: 'Search by nationality'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select' as const,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'minAge',
      label: 'Min Age',
      type: 'number' as const,
      placeholder: 'Minimum age'
    },
    {
      name: 'maxAge',
      label: 'Max Age',
      type: 'number' as const,
      placeholder: 'Maximum age'
    },
    {
      name: 'fromDate',
      label: 'Registered From',
      type: 'date' as const
    },
    {
      name: 'toDate',
      label: 'Registered To',
      type: 'date' as const
    }
  ]

  const fetchTourists = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      
      const response = await fetch(`/api/tourists?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTourists(data.data || [])
      } else {
        toast.error('Failed to fetch tourists')
      }
    } catch (error) {
      console.error('Error fetching tourists:', error)
      toast.error('Failed to load tourists')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (filters: any) => {
    setSearchFilters(filters)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete tourist "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tourists/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tourist deleted successfully')
        setTourists(prev => prev.filter(tourist => tourist._id !== id))
      } else {
        toast.error('Failed to delete tourist')
      }
    } catch (error) {
      console.error('Error deleting tourist:', error)
      toast.error('Failed to delete tourist')
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tourists...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Header
        title="Tourist Management"
        subtitle="Manage tourist records and information"
      />

      <div className="space-y-6">
        {/* Advanced Search */}
        <AdvancedSearch
          searchFields={searchFields}
          onSearch={handleSearch}
          initialFilters={searchFilters}
        />

        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {tourists.length} tourist{tourists.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => router.push('/dashboard/tourist/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Tourist
          </button>
        </div>

        {/* Tourists List */}
        <div className="bg-white rounded-lg shadow-sm">
          {tourists.length === 0 ? (
            <div className="p-12 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tourists found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.keys(searchFilters).length > 0 
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by adding a new tourist.'}
              </p>
              {Object.keys(searchFilters).length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/dashboard/tourist/add')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Tourist
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
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tourists.map((tourist) => (
                    <tr key={tourist._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tourist.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {tourist.nationality}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {tourist.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {tourist.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Age: {calculateAge(tourist.dateOfBirth)}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {tourist.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tourist.status)}`}>
                          {tourist.status.charAt(0).toUpperCase() + tourist.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Total: {tourist.totalBookings || 0}</div>
                        <div className="text-gray-500">
                          Spent: ${tourist.totalSpent?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/tourist/${tourist._id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/tourist/${tourist._id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tourist._id, tourist.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
