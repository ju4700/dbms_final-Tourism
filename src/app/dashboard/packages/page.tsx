'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Edit, Package, DollarSign, Clock, Users, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { TourPackage } from '@/types'

export default function PackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    duration: '',
    maxGroupSize: '',
    price: '',
    inclusions: '',
    exclusions: '',
    itinerary: '',
    difficulty: 'easy' as 'easy' | 'moderate' | 'difficult',
    isActive: true,
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      } else {
        toast.error('Failed to fetch packages')
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Error fetching packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.destination.trim() || !formData.price) {
      toast.error('Name, destination, and price are required')
      return
    }

    try {
      const url = editingPackage 
        ? `/api/packages/${editingPackage.packageId}`
        : '/api/packages'
      
      const method = editingPackage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration) || 1,
          maxGroupSize: parseInt(formData.maxGroupSize) || 10,
          price: parseFloat(formData.price),
          inclusions: formData.inclusions.split(',').map(s => s.trim()).filter(Boolean),
          exclusions: formData.exclusions.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(editingPackage ? 'Package updated!' : 'Package added!')
        setPackages(data.packages || [])
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save package')
      }
    } catch (error) {
      console.error('Error saving package:', error)
      toast.error('Error saving package')
    }
  }

  const handleEdit = (tourPackage: TourPackage) => {
    setEditingPackage(tourPackage)
    setFormData({
      name: tourPackage.name,
      description: tourPackage.description || '',
      destination: tourPackage.destination,
      duration: tourPackage.duration?.toString() || '',
      maxGroupSize: tourPackage.maxGroupSize?.toString() || '',
      price: tourPackage.price.toString(),
      inclusions: tourPackage.inclusions?.join(', ') || '',
      exclusions: tourPackage.exclusions?.join(', ') || '',
      itinerary: tourPackage.itinerary ? JSON.stringify(tourPackage.itinerary, null, 2) : '',
      difficulty: tourPackage.difficulty || 'easy',
      isActive: tourPackage.isActive !== false,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (packageId: string) => {
    if (!window.confirm(`Are you sure you want to delete this package?`)) {
      return
    }

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Package deleted!')
        setPackages(data.packages || [])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('Error deleting package')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      destination: '',
      duration: '',
      maxGroupSize: '',
      price: '',
      inclusions: '',
      exclusions: '',
      itinerary: '',
      difficulty: 'easy',
      isActive: true,
    })
    setEditingPackage(null)
    setShowAddForm(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'difficult':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
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
                <h2 className="text-lg font-semibold text-gray-900">Package Management</h2>
                <p className="text-sm text-gray-600">Create and manage tour packages</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Name *
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
                      Destination *
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Group Size
                    </label>
                    <input
                      type="number"
                      value={formData.maxGroupSize}
                      onChange={(e) => setFormData({ ...formData, maxGroupSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inclusions (comma-separated)
                    </label>
                    <textarea
                      value={formData.inclusions}
                      onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Hotel, Meals, Transportation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exclusions (comma-separated)
                    </label>
                    <textarea
                      value={formData.exclusions}
                      onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Flights, Personal expenses, Tips"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Itinerary
                  </label>
                  <textarea
                    value={formData.itinerary}
                    onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Day 1: Arrival and check-in..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (available for booking)
                  </label>
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
                    {editingPackage ? 'Update' : 'Add'} Package
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Packages List */}
          <div className="divide-y divide-gray-200">
            {packages.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No packages found. Add your first package!</p>
              </div>
            ) : (
              packages.map((tourPackage) => (
                <div key={tourPackage.packageId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{tourPackage.name}</h3>
                        <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(tourPackage.difficulty || 'easy')}`}>
                          {tourPackage.difficulty || 'easy'}
                        </span>
                        {!tourPackage.isActive && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      {tourPackage.description && (
                        <p className="mt-2 text-gray-600">{tourPackage.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {tourPackage.destination}
                        </div>
                        {tourPackage.duration && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {tourPackage.duration} days
                          </div>
                        )}
                        {tourPackage.maxGroupSize && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Max {tourPackage.maxGroupSize} people
                          </div>
                        )}
                        <div className="flex items-center font-semibold text-indigo-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${tourPackage.price}
                        </div>
                      </div>

                      {tourPackage.inclusions && tourPackage.inclusions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Includes: </span>
                          <span className="text-sm text-gray-600">{tourPackage.inclusions.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(tourPackage)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tourPackage.packageId)}
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
