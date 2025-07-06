'use client'

import { Customer } from '@/types'
import { Eye, Edit, Trash2, MapPin, Phone, Mail, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'
import { useGlobalCustomerTableSettings } from '@/hooks/useGlobalSettings'
import { useSession } from 'next-auth/react'

interface CustomerTableProps {
  customers: Customer[]
  onDelete?: (id: string, name: string) => void
  isDeleting?: boolean
  userRole?: string
}

export default function CustomerTable({ customers, onDelete, isDeleting, userRole }: CustomerTableProps) {
  const { data: session } = useSession()
  const { settings: globalSettings } = useGlobalCustomerTableSettings()

  // Use per-staff settings if present, otherwise admin global
  let activeSettings = globalSettings
  if (session?.user?.role === 'staff' && (session.user as any).customerTableView) {
    activeSettings = (session.user as any).customerTableView
  } else if (session?.user?.role === 'staff') {
    // If staff and no per-staff settings, show all columns by default
    activeSettings = {
      showName: true,
      showCustomerId: true,
      showEmail: true,
      showPhone: true,
      showZone: true,
      showNidNumber: true,
      showIpAddress: true,
      showPppoePassword: true,
      showPackage: true,
      showMonthlyFee: true,
      showStatus: true,
      showJoiningDate: true,
      showActions: true
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
          <Link
            href="/dashboard/customer/add"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add First Customer
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Customers ({customers.length})
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            {/* Admin can customize table columns */}
            {userRole === 'admin' && (
              <Link
                href="/dashboard/settings?tab=customer-view"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                title="Customize table columns"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Customize</span>
              </Link>
            )}
            <Link
              href="/dashboard/customer/add"
              className="inline-flex items-center px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      {/* Table View - Horizontally scrollable to accommodate all columns */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
          <thead className="bg-gray-50">
            <tr>
              {/* Customer Name - Always shown */}
              {activeSettings.showName && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
              )}
              
              {/* Contact (Email/Phone) */}
              {(activeSettings.showEmail || activeSettings.showPhone) && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              )}
              
              {/* Zone */}
              {activeSettings.showZone && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
              )}
              
              {/* NID Number */}
              {activeSettings.showNidNumber && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NID Number
                </th>
              )}
              
              {/* Network Info (IP & PPPoE) */}
              {(activeSettings.showIpAddress || activeSettings.showPppoePassword) && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Network
                </th>
              )}
              
              {/* Package */}
              {(activeSettings.showPackage || activeSettings.showMonthlyFee) && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
              )}
              
              {/* Status */}
              {activeSettings.showStatus && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
              
              {/* Joining Date */}
              {activeSettings.showJoiningDate && (
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              )}
              
              {/* Actions - Always shown */}
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50">
                {/* Customer Name */}
                {activeSettings.showName && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {customer.name}
                        </div>
                        {activeSettings.showCustomerId && (
                          <div className="text-xs text-gray-500">
                            ID: {customer.customerId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                )}

                {/* Contact Info */}
                {(activeSettings.showEmail || activeSettings.showPhone) && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {activeSettings.showPhone && customer.phone && (
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-3 h-3 mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                      {activeSettings.showEmail && customer.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                )}

                {/* Zone */}
                {activeSettings.showZone && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{customer.zone}</div>
                    {customer.address && (customer.address.thana || customer.address.district) && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {[customer.address.thana, customer.address.district].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </td>
                )}

                {/* NID Number */}
                {activeSettings.showNidNumber && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{customer.nidNumber || 'N/A'}</div>
                  </td>
                )}

                {/* Network Info (IP & PPPoE) */}
                {(activeSettings.showIpAddress || activeSettings.showPppoePassword) && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      {activeSettings.showIpAddress && (
                        <div className="text-sm text-gray-900 font-mono">{customer.ipAddress || 'N/A'}</div>
                      )}
                      {activeSettings.showPppoePassword && (
                        <div className="text-sm text-gray-500">PPPoE: {customer.pppoePassword || 'Not set'}</div>
                      )}
                    </div>
                  </td>
                )}

                {/* Package */}
                {(activeSettings.showPackage || activeSettings.showMonthlyFee) && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      {activeSettings.showPackage && (
                        <div className="text-sm font-medium text-gray-900">{customer.package}</div>
                      )}
                      {activeSettings.showMonthlyFee && (
                        <div className="text-sm text-gray-500">৳{customer.monthlyFee}/month</div>
                      )}
                    </div>
                  </td>
                )}

                {/* Status */}
                {activeSettings.showStatus && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`${getStatusBadge(customer.status)} text-xs`}>
                      {customer.status}
                    </span>
                  </td>
                )}

                {/* Joining Date */}
                {activeSettings.showJoiningDate && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                      {formatDate(customer.joiningDate)}
                    </div>
                  </td>
                )}

                {/* Actions */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Link
                      href={`/dashboard/customer/${customer._id}`}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View customer"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                    {/* Only admin can edit and delete */}
                    {userRole === 'admin' && (
                      <>
                        <Link
                          href={`/dashboard/customer/${customer._id}/edit`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit customer"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                        <button
                          onClick={() => onDelete?.(customer._id, customer.name)}
                          disabled={isDeleting}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete customer"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </>
                    )}
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
