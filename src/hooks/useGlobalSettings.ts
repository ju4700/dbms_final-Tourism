import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface TouristTableColumns {
  showName: boolean
  showTouristId: boolean
  showEmail: boolean
  showPhone: boolean
  showDestination: boolean
  showPassportNumber: boolean
  showTourPackage: boolean
  showPackagePrice: boolean
  showTotalAmount: boolean
  showPaidAmount: boolean
  showPaymentStatus: boolean
  showStatus: boolean
  showTravelDate: boolean
  showAssignedGuide: boolean
  showActions: boolean
}

export const defaultColumns: TouristTableColumns = {
  showName: true,
  showTouristId: true,
  showEmail: true,
  showPhone: true,
  showDestination: true,
  showPassportNumber: false,
  showTourPackage: true,
  showPackagePrice: true,
  showTotalAmount: true,
  showPaidAmount: true,
  showPaymentStatus: true,
  showStatus: true,
  showTravelDate: true,
  showAssignedGuide: false,
  showActions: true
}

export function useGlobalTouristTableSettings() {
  const [settings, setSettings] = useState<TouristTableColumns>(defaultColumns)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/global-settings')
      if (response.ok) {
        const data = await response.json()
        // If the API returns { touristTableColumns: {...} }, use that
        if (data && typeof data === 'object' && 'showName' in data) {
          setSettings(data)
        } else if (data && typeof data === 'object' && 'touristTableColumns' in data) {
          setSettings(data.touristTableColumns)
        }
      }
    } catch (error) {
      console.error('Error fetching global settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<TouristTableColumns>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      const response = await fetch('/api/admin/global-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      })
      if (response.ok) {
        setSettings(updatedSettings)
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    updateSettings,
    loading,
    refreshSettings: fetchSettings
  }
}
