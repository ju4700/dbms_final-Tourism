import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useZones() {
  const [zones, setZones] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/zones')
      if (response.ok) {
        const data = await response.json()
        setZones(data)
      } else {
        toast.error('Failed to load zones')
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
      toast.error('Failed to load zones')
    } finally {
      setLoading(false)
    }
  }

  const addZone = async (zoneName: string) => {
    try {
      const response = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ zoneName })
      })

      if (response.ok) {
        const data = await response.json()
        setZones(data.zones)
        toast.success('Zone added successfully')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add zone')
        return false
      }
    } catch (error) {
      console.error('Error adding zone:', error)
      toast.error('Failed to add zone')
      return false
    }
  }

  const deleteZone = async (zoneName: string) => {
    try {
      const response = await fetch('/api/admin/zones', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ zoneName })
      })

      if (response.ok) {
        const data = await response.json()
        setZones(data.zones)
        toast.success('Zone deleted successfully')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete zone')
        return false
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      toast.error('Failed to delete zone')
      return false
    }
  }

  // Edit zone name
  const editZone = async (oldName: string, newName: string) => {
    try {
      const response = await fetch('/api/admin/zones/patch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName })
      })
      if (response.ok) {
        const data = await response.json()
        setZones(data.zones)
        toast.success('Zone renamed successfully')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to rename zone')
        return false
      }
    } catch (error) {
      console.error('Error renaming zone:', error)
      toast.error('Failed to rename zone')
      return false
    }
  }

  // Merge zones
  const mergeZones = async (selectedZones: string[], targetZone: string) => {
    try {
      const response = await fetch('/api/admin/zones/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedZones, targetZone })
      })
      if (response.ok) {
        const data = await response.json()
        setZones(data.zones)
        toast.success('Zones merged successfully')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to merge zones')
        return false
      }
    } catch (error) {
      console.error('Error merging zones:', error)
      toast.error('Failed to merge zones')
      return false
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  return {
    zones,
    loading,
    addZone,
    deleteZone,
    editZone,
    mergeZones,
    refreshZones: fetchZones
  }
}
