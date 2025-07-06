import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface CustomerTableColumns {
  showName: boolean
  showCustomerId: boolean
  showEmail: boolean
  showPhone: boolean
  showZone: boolean
  showNidNumber: boolean
  showIpAddress: boolean
  showPppoePassword: boolean
  showPackage: boolean
  showMonthlyFee: boolean
  showStatus: boolean
  showJoiningDate: boolean
  showActions: boolean
}

export const defaultColumns: CustomerTableColumns = {
  showName: true,
  showCustomerId: true,
  showEmail: true,
  showPhone: true,
  showZone: true,
  showNidNumber: true,
  showIpAddress: false,
  showPppoePassword: false,
  showPackage: true,
  showMonthlyFee: true,
  showStatus: true,
  showJoiningDate: true,
  showActions: true
}

export function useGlobalCustomerTableSettings() {
  const [settings, setSettings] = useState<CustomerTableColumns>(defaultColumns)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/global-settings')
      if (response.ok) {
        const data = await response.json()
        // If the API returns { customerTableColumns: {...} }, use that
        if (data && typeof data === 'object' && 'showName' in data) {
          setSettings(data)
        } else if (data && typeof data === 'object' && 'customerTableColumns' in data) {
          setSettings(data.customerTableColumns)
        }
      }
    } catch (error) {
      console.error('Error fetching global settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<CustomerTableColumns>) => {
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
