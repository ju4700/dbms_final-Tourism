'use client'

import { useState } from 'react'
import { useCustomerViewSettings } from '@/hooks/useUserPreferences'
import { Eye, EyeOff, Settings, Monitor, Smartphone } from 'lucide-react'

export default function PreferencesSyncDemo() {
  const [customerViewSettings, updateCustomerViewSettings] = useCustomerViewSettings()
  const [showDemo, setShowDemo] = useState(false)

  const toggleSetting = (key: keyof typeof customerViewSettings) => {
    updateCustomerViewSettings({
      [key]: !customerViewSettings[key]
    })
  }

  const visibleColumnsCount = Object.values(customerViewSettings).filter(Boolean).length
  const totalColumns = Object.keys(customerViewSettings).length

  if (!showDemo) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Monitor className="w-5 h-5 text-blue-600" />
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Cross-Device Sync Active
              </h3>
              <p className="text-xs text-blue-700">
                Your table settings sync across all devices. {visibleColumnsCount}/{totalColumns} columns visible.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDemo(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Test Sync
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Cross-Device Sync Test
          </h3>
        </div>
        <button
          onClick={() => setShowDemo(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Toggle these settings and check the customer table below. These changes will sync to all your devices instantly.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(customerViewSettings).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={() => toggleSetting(key as keyof typeof customerViewSettings)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Show ', '')}
              </span>
              {value ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center space-x-2 text-sm">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Desktop:</span>
            <span className="font-medium">{visibleColumnsCount} columns visible</span>
          </div>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Mobile:</span>
            <span className="font-medium">Same {visibleColumnsCount} columns (synced)</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          💡 <strong>Tip:</strong> Open this page on another device or browser tab to see real-time synchronization.
        </div>
      </div>
    </div>
  )
}
