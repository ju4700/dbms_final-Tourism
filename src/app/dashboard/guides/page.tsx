'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Edit, UserCheck, Phone, Mail, MapPin, Star, DollarSign } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Guide } from '@/types'

export default function GuidesPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    languages: '',
    specializations: '',
    experience: '',
    dailyRate: '',
    isAvailable: true,
    bio: '',
    certifications: '',
  })

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        setGuides(data.guides || [])
      } else {
        toast.error('Failed to fetch guides')
      }
    } catch (error) {
      console.error('Error fetching guides:', error)
      toast.error('Error fetching guides')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required')
      return
    }

    try {
      const url = editingGuide 
        ? `/api/guides/${editingGuide.guideId}`
        : '/api/guides'
      
      const method = editingGuide ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
          specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
          certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
          experience: formData.experience ? parseInt(formData.experience) : undefined,
          dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(editingGuide ? 'Guide updated!' : 'Guide added!')
        setGuides(data.guides || [])
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save guide')
      }
    } catch (error) {
      console.error('Error saving guide:', error)
      toast.error('Error saving guide')
    }
  }

  const handleEdit = (guide: Guide) => {
    setEditingGuide(guide)
    setFormData({
      name: guide.name,
      email: guide.email || '',
      phone: guide.phone,
      languages: guide.languages?.join(', ') || '',
      specializations: guide.specializations?.join(', ') || '',
      experience: guide.experience?.toString() || '',
      dailyRate: guide.dailyRate?.toString() || '',
      isAvailable: guide.isAvailable !== false,
      bio: guide.bio || '',
      certifications: guide.certifications?.join(', ') || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (guideId: string) => {
    if (!window.confirm(`Are you sure you want to delete this guide?`)) {
      return
    }

    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Guide deleted!')
        setGuides(data.guides || [])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete guide')
      }
    } catch (error) {
      console.error('Error deleting guide:', error)
      toast.error('Error deleting guide')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      languages: '',
      specializations: '',
      experience: '',
      dailyRate: '',
      isAvailable: true,
      bio: '',
      certifications: '',
    })
    setEditingGuide(null)
    setShowAddForm(false)
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
                <h2 className="text-lg font-semibold text-gray-900">Guide Management</h2>
                <p className="text-sm text-gray-600">Create and manage tour guide profiles</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Guide
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingGuide ? 'Edit Guide' : 'Add New Guide'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Languages (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="English, Spanish, French"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specializations (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.specializations}
                      onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="History, Wildlife, Adventure"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description about the guide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Licensed Guide, First Aid, Wilderness Survival"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                    Available for assignments
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
                    {editingGuide ? 'Update' : 'Add'} Guide
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Guides List */}
          <div className="divide-y divide-gray-200">
            {guides.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No guides found. Add your first guide!</p>
              </div>
            ) : (
              guides.map((guide) => (
                <div key={guide.guideId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <UserCheck className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{guide.name}</h3>
                        {!guide.isAvailable && (
                          <span className="ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Unavailable
                          </span>
                        )}
                        {guide.rating && (
                          <div className="ml-3 flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-600">{guide.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      {guide.bio && (
                        <p className="mt-2 text-gray-600">{guide.bio}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {guide.phone}
                        </div>
                        {guide.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {guide.email}
                          </div>
                        )}
                        {guide.experience && (
                          <div className="flex items-center">
                            <span className="font-medium">{guide.experience} years experience</span>
                          </div>
                        )}
                        {guide.dailyRate && (
                          <div className="flex items-center font-semibold text-indigo-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${guide.dailyRate}/day
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {guide.languages && guide.languages.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Languages: </span>
                            <span className="text-sm text-gray-600">{guide.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {guide.specializations && guide.specializations.length > 0 && (
                        <div className="mt-1">
                          <span className="text-sm font-medium text-gray-700">Specializations: </span>
                          <span className="text-sm text-gray-600">{guide.specializations.join(', ')}</span>
                        </div>
                      )}

                      {guide.certifications && guide.certifications.length > 0 && (
                        <div className="mt-1">
                          <span className="text-sm font-medium text-gray-700">Certifications: </span>
                          <span className="text-sm text-gray-600">{guide.certifications.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(guide)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(guide.guideId)}
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
