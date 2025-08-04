'use client'

import { Tourist } from '@/types'
import { Eye, Edit, Trash2, MapPin, Phone, Mail, Calendar, Settings, CreditCard, Users } from 'lucide-react'
import Link from 'next/link'
import { useGlobalTouristTableSettings } from '@/hooks/useGlobalSettings'

interface TouristTableProps {
  tourists: Tourist[]
  onDelete?: (id: string, name: string) => void
  isDeleting?: boolean
}

export default function TouristTable({ tourists, onDelete, isDeleting }: TouristTableProps) {
  const { settings: globalSettings } = useGlobalTouristTableSettings()

  // Use global settings - show all columns by default
  const activeSettings = globalSettings || {
    showName: true,
    showTouristId: true,
    showEmail: true,
    showPhone: true,
    showDestination: true,
    showPassportNumber: true,
    showTourPackage: true,
    showPackagePrice: true,
    showTotalAmount: true,
    showPaidAmount: true,
    showPaymentStatus: true,
    showStatus: true,
    showTravelDate: true,
    showAssignedGuide: true,
    showActions: true
  }

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
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

  if (tourists.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tourists found</h3>
        <p className="text-gray-600">No tourists match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeSettings?.showTouristId && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tourist ID
                </th>
              )}
              {activeSettings?.showName && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              )}
              {activeSettings?.showEmail && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              )}
              {activeSettings?.showPhone && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
              )}
              {activeSettings?.showDestination && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
              )}
              {activeSettings?.showTourPackage && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour Package
                </th>
              )}
              {activeSettings?.showTotalAmount && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              )}
              {activeSettings?.showPaidAmount && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
              )}
              {activeSettings?.showPaymentStatus && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
              )}
              {activeSettings?.showStatus && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
              {activeSettings?.showTravelDate && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Date
                </th>
              )}
              {activeSettings?.showAssignedGuide && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Guide
                </th>
              )}
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tourists.map((tourist) => (
              <tr key={tourist._id} className="hover:bg-gray-50">
                {activeSettings?.showTouristId && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tourist.touristId}
                  </td>
                )}
                {activeSettings?.showName && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {tourist.profilePicture ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={tourist.profilePicture}
                            alt={tourist.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {tourist.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tourist.name}
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                {activeSettings?.showEmail && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tourist.email || 'N/A'}
                  </td>
                )}
                {activeSettings?.showPhone && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tourist.phone}
                  </td>
                )}
                {activeSettings?.showDestination && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {tourist.destination}
                    </div>
                  </td>
                )}
                {activeSettings?.showTourPackage && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tourist.tourPackage}
                  </td>
                )}
                {activeSettings?.showTotalAmount && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(tourist.totalAmount)}
                  </td>
                )}
                {activeSettings?.showPaidAmount && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(tourist.paidAmount)}
                  </td>
                )}
                {activeSettings?.showPaymentStatus && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(tourist.paymentStatus)}`}>
                      {tourist.paymentStatus}
                    </span>
                  </td>
                )}
                {activeSettings?.showStatus && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tourist.status)}`}>
                      {tourist.status}
                    </span>
                  </td>
                )}
                {activeSettings?.showTravelDate && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(tourist.travelDate)}
                  </td>
                )}
                {activeSettings?.showAssignedGuide && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tourist.assignedGuide || 'Not assigned'}
                  </td>
                )}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Link
                      href={`/dashboard/tourist/${tourist._id}`}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View tourist"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                    {/* Edit and delete available to all users */}
                    <Link
                      href={`/dashboard/tourist/${tourist._id}/edit`}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit tourist"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete?.(tourist._id, tourist.name)}
                          disabled={isDeleting}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      title="Delete tourist"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
