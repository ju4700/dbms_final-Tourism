'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Edit, MapPin, Globe, DollarSign, Calendar } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Destination } from '@/types'

export default function DestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    popularAttractions: '',
    bestTimeToVisit: '',
    averageCost: '',
  })

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/destinations')
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations || [])
      } else {
        toast.error('Failed to fetch destinations')
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
      toast.error('Error fetching destinations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error('Name and country are required')
      return
    }

    try {
      const url = editingDestination 
        ? `/api/admin/destinations/${editingDestination.name}`
        : '/api/admin/destinations'
      
      const method = editingDestination ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          popularAttractions: formData.popularAttractions.split(',').map(s => s.trim()).filter(Boolean),
          averageCost: formData.averageCost ? parseFloat(formData.averageCost) : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(editingDestination ? 'Destination updated!' : 'Destination added!')
        setDestinations(data.destinations || [])
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save destination')
      }
    } catch (error) {
      console.error('Error saving destination:', error)
      toast.error('Error saving destination')
    }
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description || '',
      popularAttractions: destination.popularAttractions?.join(', ') || '',
      bestTimeToVisit: destination.bestTimeToVisit || '',
      averageCost: destination.averageCost?.toString() || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete destination "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/destinations/${name}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Destination deleted!')
        setDestinations(data.destinations || [])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete destination')
      }
    } catch (error) {
      console.error('Error deleting destination:', error)
      toast.error('Error deleting destination')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      description: '',
      popularAttractions: '',
      bestTimeToVisit: '',
      averageCost: '',
    })
    setEditingDestination(null)
    setShowAddForm(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Destination Management</h2>
                <p className="text-gray-600">Manage tourist destinations</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Popular Attractions (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.popularAttractions}
                      onChange={(e) => setFormData({ ...formData, popularAttractions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Beach, Museums, Historic Sites"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      value={formData.bestTimeToVisit}
                      onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="March to May"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Cost (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.averageCost}
                    onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1000"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingDestination ? 'Update' : 'Add'} Destination
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Destinations List */}
          <div className="divide-y divide-gray-200">
            {destinations.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No destinations found. Add your first destination!</p>
              </div>
            ) : (
              destinations.map((destination) => (
                <div key={destination.name} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{destination.name}</h3>
                        <span className="ml-2 text-sm text-gray-500">({destination.country})</span>
                      </div>
                      
                      {destination.description && (
                        <p className="mt-2 text-gray-600">{destination.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        {destination.popularAttractions && destination.popularAttractions.length > 0 && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {destination.popularAttractions.join(', ')}
                          </div>
                        )}
                        {destination.bestTimeToVisit && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {destination.bestTimeToVisit}
                          </div>
                        )}
                        {destination.averageCost && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${destination.averageCost}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(destination)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(destination.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
