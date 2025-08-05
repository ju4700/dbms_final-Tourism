'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  User, Mail, Phone, MapPin, Calendar, Package, 
  Users, Plane, FileText, Edit, Trash2, Download, CreditCard,
  Globe, Clock, UserCheck, Camera, IdCard as Passport
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tourist } from '@/types'

export default function TouristDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [tourist, setTourist] = useState<Tourist | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTourist()
    }
  }, [params.id])

  const fetchTourist = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tourists/${params.id}`)
      
      if (response.ok) {
        const result = await response.json()
        setTourist(result.data) // Changed from result.tourist to result.data
      } else {
        toast.error('Tourist not found')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching tourist:', error)
      toast.error('Failed to load tourist')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/tourist/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!tourist || !window.confirm(`Are you sure you want to delete tourist "${tourist.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tourists/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tourist deleted successfully')
        router.push('/dashboard')
      } else {
        toast.error('Failed to delete tourist')
      }
    } catch (error) {
      console.error('Error deleting tourist:', error)
      toast.error('Failed to delete tourist')
    }
  }

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `BDT ${(amount || 0).toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tourist details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!tourist) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tourist not found</h2>
            <p className="text-gray-600 mb-4">The tourist you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="max-w-7xl bg-white shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Tourist Details
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Always show admin buttons since no authentication */}
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tourist ID */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Tourist ID</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tourist.status)}`}>
                      {tourist.status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-lg font-mono font-semibold text-gray-800">{tourist.touristId}</p>
                  <p className="text-sm text-gray-600">Tourist identification number</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{tourist.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-gray-900">{tourist.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{tourist.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">{tourist.dateOfBirth ? formatDate(tourist.dateOfBirth) : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="text-gray-900">{tourist.gender ? tourist.gender.charAt(0).toUpperCase() + tourist.gender.slice(1) : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nationality</p>
                      <p className="text-gray-900">{tourist.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Building/House Number</p>
                      <p className="text-gray-900">{tourist.address?.building || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Street Address</p>
                      <p className="text-gray-900">{tourist.address?.street || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="text-gray-900">{tourist.address?.city || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">State/Province</p>
                      <p className="text-gray-900">{tourist.address?.state || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <p className="text-gray-900">{tourist.address?.country || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">ZIP/Postal Code</p>
                      <p className="text-gray-900">{tourist.address?.zipCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Document Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Passport className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passport Number</p>
                      <p className="text-gray-900">{tourist.passportNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passport Expiry Date</p>
                      <p className="text-gray-900">{tourist.passportExpiryDate ? formatDate(tourist.passportExpiryDate) : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">NID/National ID Number</p>
                      <p className="text-gray-900">{tourist.nidNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Travel Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Destination</p>
                      <p className="text-gray-900">{tourist.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tour Package</p>
                      <p className="text-gray-900">{tourist.tourPackage}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Plane className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Travel Date</p>
                      <p className="text-gray-900">{formatDate(tourist.travelDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Plane className="w-5 h-5 text-gray-400 mr-3 rotate-180" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Return Date</p>
                      <p className="text-gray-900">{formatDate(tourist.returnDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Booking Date</p>
                      <p className="text-gray-900">{formatDate(tourist.bookingDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned Guide</p>
                      <p className="text-gray-900">{tourist.assignedGuide || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {tourist.emergencyContact && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-900">{tourist.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{tourist.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Relationship</p>
                      <p className="text-gray-900">{tourist.emergencyContact.relationship}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {tourist.specialRequests && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h2>
                  <p className="text-gray-700">{tourist.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package Price</span>
                    <span className="font-medium">{formatCurrency(tourist.packagePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-medium">{formatCurrency(tourist.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid Amount</span>
                    <span className="font-medium text-green-600">{formatCurrency(tourist.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-gray-500">Outstanding</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(tourist.totalAmount - tourist.paidAmount)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(tourist.paymentStatus)}`}>
                      {tourist.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              {tourist.profilePicture && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                  <img
                    src={tourist.profilePicture}
                    alt={tourist.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Documents</h2>
                <div className="space-y-3">
                  {tourist.passportImage && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">Passport Copy</span>
                      </div>
                      <a
                        href={tourist.passportImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {tourist.visaImage && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">Visa Copy</span>
                      </div>
                      <a
                        href={tourist.visaImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {!tourist.passportImage && !tourist.visaImage && (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Download Details
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  )
}
