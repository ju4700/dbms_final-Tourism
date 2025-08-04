'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function StaffManagementPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Staff Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Staff management is not required for this basic tourism management system.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Feature Not Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This tourism management system focuses on core functionality: 
              Tourists, Destinations, Packages, Bookings, and Guides.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
