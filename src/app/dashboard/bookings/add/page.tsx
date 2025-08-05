'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, User, Calendar, MapPin, Users, FileText } from 'lucide-react'

const bookingSchema = z.object({
  tourist: z.string().min(1, 'Tourist is required'),
  bookingType: z.enum(['package', 'destination']),
  package: z.string().optional(),
  destination: z.string().optional(),
  guide: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  numberOfPeople: z.number().min(1, 'Number of people must be at least 1'),
  accommodationType: z.enum(['hotel', 'resort', 'hostel', 'vacation-rental', 'other']).optional(),
  specialRequests: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
}).refine((data) => {
  if (data.bookingType === 'package' && !data.package) {
    return false
  }
  if (data.bookingType === 'destination' && !data.destination) {
    return false
  }
  return true
}, {
  message: 'Package is required when booking type is package, destination is required when booking type is destination',
  path: ['package']
})

type BookingFormData = z.infer<typeof bookingSchema>

interface Tourist {
  _id: string
  touristId: string
  name: string
  email: string
  phone: string
}

interface TourPackage {
  _id: string
  name: string
  price: number
  destination: string
  duration: number
}

interface Destination {
  _id: string
  name: string
  description: string
  category: string
}

interface Guide {
  _id: string
  name: string
  phone: string
  specializations: string[]
  pricePerDay: number
}

export default function NewBookingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tourists, setTourists] = useState<Tourist[]>([])
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      tourist: '',
      bookingType: 'package',
      package: '',
      destination: '',
      guide: '',
      startDate: today,
      endDate: today,
      numberOfPeople: 1,
      accommodationType: 'hotel',
      specialRequests: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculateTotalAmount()
  }, [formData.numberOfPeople, formData.startDate, formData.endDate, selectedPackage, selectedGuide])

  const loadData = async () => {
    try {
      setLoading(true)
      const [touristsRes, packagesRes, destinationsRes, guidesRes] = await Promise.all([
        fetch('/api/tourists'),
        fetch('/api/packages'),
        fetch('/api/admin/destinations'),
        fetch('/api/guides')
      ])

      if (touristsRes.ok) {
        const touristsData = await touristsRes.json()
        setTourists(touristsData.data || [])
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        setPackages(packagesData.packages || [])
      }

      if (destinationsRes.ok) {
        const destinationsData = await destinationsRes.json()
        setDestinations(destinationsData.destinations || [])
      }

      if (guidesRes.ok) {
        const guidesData = await guidesRes.json()
        setGuides(guidesData.guides || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAmount = () => {
    let total = 0
    
    if (selectedPackage) {
      total += selectedPackage.price * formData.numberOfPeople
    }
    
    if (selectedGuide && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      total += selectedGuide.pricePerDay * days
    }
    
    setTotalAmount(total)
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })

    // Handle special selections
    if (field === 'tourist') {
      const tourist = tourists.find(t => t._id === value)
      setSelectedTourist(tourist || null)
    }
    
    if (field === 'package') {
      const pkg = packages.find(p => p._id === value)
      setSelectedPackage(pkg || null)
    }
    
    if (field === 'guide') {
      const guide = guides.find(g => g._id === value)
      setSelectedGuide(guide || null)
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate form
    const validation = bookingSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        const field = error.path.join('.')
        fieldErrors[field] = error.message
      })
      setErrors(fieldErrors)
      toast.error('Please fix the form errors')
      return
    }

    setIsSubmitting(true)
    
    try {
      const bookingData = {
        touristId: formData.tourist,
        ...(formData.bookingType === 'package' && formData.package && { packageId: formData.package }),
        ...(formData.bookingType === 'destination' && formData.destination && { destinationId: formData.destination }),
        ...(formData.guide && { guideId: formData.guide }),
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfPeople: formData.numberOfPeople,
        accommodationType: formData.accommodationType,
        specialRequests: formData.specialRequests,
        emergencyContact: formData.emergencyContact,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to create booking')
        return
      }

      const data = await response.json()
      toast.success('Booking created successfully!')
      router.push('/dashboard/bookings')
      
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('An error occurred while creating booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking form...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Booking</h1>
              <p className="text-sm text-gray-600">Book a tour package or destination for a registered tourist</p>
            </div>
          </div>
          {totalAmount > 0 && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-lg font-semibold">
              Total: BDT {totalAmount.toLocaleString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tourist Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Select Tourist</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tourist *
                </label>
                <select
                  value={formData.tourist}
                  onChange={(e) => handleFieldChange('tourist', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tourist ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a tourist</option>
                  {tourists.map((tourist) => (
                    <option key={tourist._id} value={tourist._id}>
                      {tourist.name} ({tourist.touristId}) - {tourist.phone}
                    </option>
                  ))}
                </select>
                {errors.tourist && <p className="text-red-500 text-sm mt-1">{errors.tourist}</p>}
              </div>

              {selectedTourist && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Selected Tourist</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Name:</strong> {selectedTourist.name}</p>
                    <p><strong>ID:</strong> {selectedTourist.touristId}</p>
                    <p><strong>Email:</strong> {selectedTourist.email}</p>
                    <p><strong>Phone:</strong> {selectedTourist.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Type and Package/Destination Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Booking Details</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Type *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="package"
                      checked={formData.bookingType === 'package'}
                      onChange={(e) => handleFieldChange('bookingType', e.target.value)}
                      className="mr-2"
                    />
                    Tour Package
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="destination"
                      checked={formData.bookingType === 'destination'}
                      onChange={(e) => handleFieldChange('bookingType', e.target.value)}
                      className="mr-2"
                    />
                    Destination Only
                  </label>
                </div>
              </div>

              {formData.bookingType === 'package' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Package *
                  </label>
                  <select
                    value={formData.package || ''}
                    onChange={(e) => handleFieldChange('package', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.package ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name} - BDT {pkg.price} ({pkg.duration} days) - {pkg.destination}
                      </option>
                    ))}
                  </select>
                  {errors.package && <p className="text-red-500 text-sm mt-1">{errors.package}</p>}
                </div>
              )}

              {formData.bookingType === 'destination' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <select
                    value={formData.destination || ''}
                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.destination ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a destination</option>
                    {destinations.map((dest) => (
                      <option key={dest._id} value={dest._id}>
                        {dest.name} ({dest.category})
                      </option>
                    ))}
                  </select>
                  {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guide (Optional)
                </label>
                <select
                  value={formData.guide || ''}
                  onChange={(e) => handleFieldChange('guide', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No guide required</option>
                  {guides.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name} - {guide.specializations.join(', ')} (BDT {guide.pricePerDay}/day)
                    </option>
                  ))}
                </select>
              </div>

              {selectedPackage && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Selected Package</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Package:</strong> {selectedPackage.name}</p>
                    <p><strong>Destination:</strong> {selectedPackage.destination}</p>
                    <p><strong>Duration:</strong> {selectedPackage.duration} days</p>
                    <p><strong>Price per person:</strong> BDT {selectedPackage.price}</p>
                  </div>
                </div>
              )}

              {selectedGuide && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Selected Guide</h3>
                  <div className="text-sm text-purple-800 space-y-1">
                    <p><strong>Guide:</strong> {selectedGuide.name}</p>
                    <p><strong>Specializations:</strong> {selectedGuide.specializations.join(', ')}</p>
                    <p><strong>Daily Rate:</strong> BDT {selectedGuide.pricePerDay}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Travel Dates and Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Travel Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={(e) => handleFieldChange('numberOfPeople', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.numberOfPeople && <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Type
                </label>
                <select
                  value={formData.accommodationType || 'hotel'}
                  onChange={(e) => handleFieldChange('accommodationType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="hostel">Hostel</option>
                  <option value="vacation-rental">Vacation Rental</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-700 mb-4">Emergency Contact for This Trip</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.name}
                      onChange={(e) => handleFieldChange('emergencyContact.name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact?.phone}
                      onChange={(e) => handleFieldChange('emergencyContact.phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Emergency contact phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.relationship}
                      onChange={(e) => handleFieldChange('emergencyContact.relationship', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.tourist}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
