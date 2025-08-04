'use client'

import { useState, useEffect, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { Save, Database, Settings } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGlobalTouristTableSettings } from '@/hooks/useGlobalSettings'
import HydrationBoundary from '@/components/HydrationBoundary'

function SettingsContent() {
  const [loading, setLoading] = useState(false)

  // Hooks
  const { 
    settings: columnSettings, 
    loading: columnsLoading, 
    updateSettings: saveColumnSettings 
  } = useGlobalTouristTableSettings()

  const [localSettings, setLocalSettings] = useState(columnSettings)

  useEffect(() => {
    setLocalSettings(columnSettings)
  }, [columnSettings])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await saveColumnSettings(localSettings)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleColumnToggle = (column: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const columnOptions = [
    { key: 'showName', label: 'Show Name' },
    { key: 'showTouristId', label: 'Show Tourist ID' },
    { key: 'showEmail', label: 'Show Email' },
    { key: 'showPhone', label: 'Show Phone' },
    { key: 'showDestination', label: 'Show Destination' },
    { key: 'showPassportNumber', label: 'Show Passport Number' },
    { key: 'showTourPackage', label: 'Show Tour Package' },
    { key: 'showPackagePrice', label: 'Show Package Price' },
    { key: 'showTotalAmount', label: 'Show Total Amount' },
    { key: 'showPaidAmount', label: 'Show Paid Amount' },
    { key: 'showPaymentStatus', label: 'Show Payment Status' },
    { key: 'showStatus', label: 'Show Status' },
    { key: 'showTravelDate', label: 'Show Travel Date' },
    { key: 'showAssignedGuide', label: 'Show Assigned Guide' },
    { key: 'showActions', label: 'Show Actions' }
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-6 w-6" />
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage system preferences and configuration
            </p>
          </div>

          {/* Tourist Table Columns */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tourist Table Column Visibility
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configure which columns are visible in the tourist management table.
            </p>

            {columnsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {columnOptions.map((option) => (
                  <div key={option.key} className="flex items-center">
                    <input
                      id={option.key}
                      type="checkbox"
                      checked={localSettings[option.key as keyof typeof localSettings] || false}
                      onChange={() => handleColumnToggle(option.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={option.key} className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              System Information
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">System:</span> Tourism Management System
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Purpose:</span> DBMS Final Project
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Features:</span> Tourists, Destinations, Packages, Bookings, Guides
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <HydrationBoundary>
      <Suspense fallback={
        <DashboardLayout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      }>
        <SettingsContent />
      </Suspense>
    </HydrationBoundary>
  )
}
