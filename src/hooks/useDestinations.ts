import { useState, useEffect } from 'react'

export const useDestinations = () => {
  const [destinations, setDestinations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/destinations')
      if (response.ok) {
        const data = await response.json()
        // Extract destination names from the full destination objects
        const destinationNames = data.destinations?.map((dest: any) => dest.name) || []
        setDestinations(destinationNames)
      } else {
        setError('Failed to fetch destinations')
      }
    } catch (err) {
      setError('Failed to fetch destinations')
    } finally {
      setLoading(false)
    }
  }

  const addDestination = async (name: string, country: string, description?: string, popularAttractions?: string[], bestTimeToVisit?: string, averageCost?: number) => {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          country, 
          description, 
          popularAttractions, 
          bestTimeToVisit, 
          averageCost 
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations)
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  const deleteDestination = async (name: string) => {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations)
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  return {
    destinations,
    loading,
    error,
    addDestination,
    deleteDestination,
    refetch: fetchDestinations,
  }
}
