'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Edit, Building, MapPin, Phone, Mail, Star, DollarSign, Wifi, Car, Utensils } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Hotel } from '@/types'

export default function HotelsPage() {
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    starRating: '',
    pricePerNight: '',
    amenities: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hotels')
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels || [])
      } else {
        toast.error('Failed to fetch hotels')
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
      toast.error('Error fetching hotels')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim()) {
      toast.error('Name, city, and country are required')
      return
    }

    try {
      const url = editingHotel 
        ? `/api/hotels/${editingHotel.hotelId}`
        : '/api/hotels'
      
      const method = editingHotel ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          starRating: formData.starRating ? parseInt(formData.starRating) : undefined,
          pricePerNight: formData.pricePerNight ? parseFloat(formData.pricePerNight) : undefined,
          amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(editingHotel ? 'Hotel updated!' : 'Hotel added!')
        setHotels(data.hotels || [])
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save hotel')
      }
    } catch (error) {
      console.error('Error saving hotel:', error)
      toast.error('Error saving hotel')
    }
  }

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setFormData({
      name: hotel.name,
      address: `${hotel.address?.street || ''} ${hotel.address?.city || ''} ${hotel.address?.state || ''} ${hotel.address?.country || ''}`.trim(),
      city: hotel.address?.city || '',
      country: hotel.address?.country || '',
      phone: hotel.contactInfo?.phone || '',
      email: hotel.contactInfo?.email || '',
      website: hotel.contactInfo?.website || '',
      starRating: hotel.starRating?.toString() || '',
      pricePerNight: hotel.roomTypes?.[0]?.pricePerNight?.toString() || '',
      amenities: hotel.amenities?.join(', ') || '',
      description: hotel.description || '',
      isActive: hotel.isActive !== false,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (hotelId: string) => {
    if (!window.confirm(`Are you sure you want to delete this hotel?`)) {
      return
    }

    try {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Hotel deleted!')
        setHotels(data.hotels || [])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete hotel')
      }
    } catch (error) {
      console.error('Error deleting hotel:', error)
      toast.error('Error deleting hotel')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      starRating: '',
      pricePerNight: '',
      amenities: '',
      description: '',
      isActive: true,
    })
    setEditingHotel(null)
    setShowAddForm(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase()
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) {
      return <Wifi className="w-4 h-4" />
    }
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage')) {
      return <Car className="w-4 h-4" />
    }
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining') || lowerAmenity.includes('breakfast')) {
      return <Utensils className="w-4 h-4" />
    }
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
                <h2 className="text-lg font-semibold text-gray-900">Hotel Management</h2>
                <p className="text-sm text-gray-600">Manage hotel partnerships and accommodations</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name *
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
                      Star Rating
                    </label>
                    <select
                      value={formData.starRating}
                      onChange={(e) => setFormData({ ...formData, starRating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                      Price per Night (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="WiFi, Pool, Restaurant, Parking, Gym"
                  />
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
                    placeholder="Brief description of the hotel"
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
                    Active (available for bookings)
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
                    {editingHotel ? 'Update' : 'Add'} Hotel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Hotels List */}
          <div className="divide-y divide-gray-200">
            {hotels.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hotels found. Add your first hotel!</p>
              </div>
            ) : (
              hotels.map((hotel) => (
                <div key={hotel.hotelId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        {hotel.starRating && (
                          <div className="ml-3 flex items-center">
                            {renderStars(hotel.starRating)}
                          </div>
                        )}
                        {!hotel.isActive && (
                          <span className="ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      {hotel.description && (
                        <p className="mt-2 text-gray-600">{hotel.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(', ')}
                        </div>
                        {hotel.contactInfo?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {hotel.contactInfo.phone}
                          </div>
                        )}
                        {hotel.contactInfo?.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {hotel.contactInfo.email}
                          </div>
                        )}
                        {hotel.roomTypes?.[0]?.pricePerNight && (
                          <div className="flex items-center font-semibold text-indigo-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${hotel.roomTypes[0].pricePerNight}/night
                          </div>
                        )}
                      </div>

                      {hotel.address && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Address: </span>
                          {`${hotel.address.street || ''} ${hotel.address.city || ''} ${hotel.address.state || ''} ${hotel.address.country || ''}`.trim()}
                        </div>
                      )}

                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Amenities: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {hotel.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                              >
                                {getAmenityIcon(amenity) && (
                                  <span className="mr-1">{getAmenityIcon(amenity)}</span>
                                )}
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {hotel.contactInfo?.website && (
                        <div className="mt-2">
                          <a
                            href={hotel.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-500 text-sm"
                          >
                            Visit Website →
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel.hotelId)}
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
