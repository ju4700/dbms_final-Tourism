'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useDestinations } from '@/hooks/useDestinations'
import DashboardLayout from '@/components/layout/DashboardLayout'

const touristSchema = z.object({
  touristId: z.string().optional(), // Backend will generate this
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().optional().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    { message: 'Please enter a valid email address' }
  ),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().optional(),
  }),
  destination: z.string().min(1, 'Destination is required'),
  tourPackage: z.string().min(1, 'Tour package is required'),
  numberOfTravelers: z.number().min(1, 'Number of travelers must be at least 1'),
  travelDate: z.string().min(1, 'Travel date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  packagePrice: z.number().min(1, 'Package price must be greater than 0'),
  totalAmount: z.number().min(1, 'Total amount must be greater than 0'),
  paidAmount: z.number().min(0, 'Paid amount must be 0 or greater'),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']),
  status: z.enum(['active', 'completed', 'cancelled', 'pending']),
  bookingDate: z.string().min(1, 'Booking date is required'),
  passportNumber: z.string().optional(),
  passportImage: z.string().optional(),
  visaImage: z.string().optional(),
  profilePicture: z.string().optional(),
  assignedGuide: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  specialRequests: z.string().optional(),
})

type TouristFormData = z.infer<typeof touristSchema>

export default function AddTouristPage() {
  const router = useRouter()
  const { destinations, loading: destinationsLoading } = useDestinations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingNextId, setIsLoadingNextId] = useState(false)
  
  // Basic form data
  const [formData, setFormData] = useState<TouristFormData>(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      touristId: '',
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
      destination: '',
      tourPackage: '',
      numberOfTravelers: 1,
      travelDate: today,
      returnDate: today,
      packagePrice: 0,
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: 'pending',
      status: 'active',
      bookingDate: today,
      passportNumber: '',
      passportImage: '',
      visaImage: '',
      profilePicture: '',
      assignedGuide: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
      specialRequests: '',
    }
  })

  // Image handling
  const [previewUrls, setPreviewUrls] = useState<{
    profilePicture?: string
    passportImage?: string
    visaImage?: string
  }>({})
  
  const [selectedFiles, setSelectedFiles] = useState<{
    profilePicture?: File
    passportImage?: File
    visaImage?: File
  }>({})

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Authentication check
  useEffect(() => {
    // Load next tourist ID
    loadNextTouristId()
  }, [])

  // Auto-generate tourist ID
  const loadNextTouristId = async () => {
    setIsLoadingNextId(true)
    try {
      const response = await fetch('/api/tourists/next-id')
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, touristId: data.nextId }))
      } else {
        toast.error('Failed to generate tourist ID')
      }
    } catch (error) {
      console.error('Error loading next tourist ID:', error)
      toast.error('Error loading next tourist ID')
    } finally {
      setIsLoadingNextId(false)
    }
  }

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      let current = newData as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle file selection
  const handleFileSelect = (field: 'profilePicture' | 'passportImage' | 'visaImage', file: File) => {
    setSelectedFiles(prev => ({ ...prev, [field]: file }))
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrls(prev => ({ ...prev, [field]: previewUrl }))
  }

  // Handle file removal
  const handleFileRemove = (field: 'profilePicture' | 'passportImage' | 'visaImage') => {
    setSelectedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[field]
      return newFiles
    })
    
    // Clean up preview URL
    if (previewUrls[field]) {
      URL.revokeObjectURL(previewUrls[field]!)
      setPreviewUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[field]
        return newUrls
      })
    }
  }

  // Upload files
  const uploadFiles = async (touristId: string): Promise<Record<string, string>> => {
    const uploadedUrls: Record<string, string> = {}
    
    for (const [field, file] of Object.entries(selectedFiles)) {
      if (file) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('touristId', touristId)
        uploadFormData.append('type', field)
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (response.ok) {
            const data = await response.json()
            uploadedUrls[field] = data.url
          } else {
            throw new Error(`Failed to upload ${field}`)
          }
        } catch (error) {
          console.error(`Error uploading ${field}:`, error)
          toast.error(`Failed to upload ${field}`)
        }
      }
    }
    
    return uploadedUrls
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate form
    const validation = touristSchema.safeParse(formData)
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
      // First, create the tourist
      const response = await fetch('/api/tourists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add tourist')
        return
      }

      const data = await response.json()
      const createdTourist = data.data
      
      // Then upload files using the created tourist's ID
      const uploadedUrls = await uploadFiles(createdTourist.touristId)
      
      // If there are uploaded files, update the tourist with file URLs
      if (Object.keys(uploadedUrls).length > 0) {
        const updateResponse = await fetch('/api/tourists', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: createdTourist._id,
            ...uploadedUrls,
          }),
        })
        
        if (!updateResponse.ok) {
          console.warn('Tourist created but file upload update failed')
        }
      }
      
      toast.success('Tourist added successfully!')
      router.push(`/dashboard/tourist/${createdTourist.touristId}`)
      
    } catch (error) {
      console.error('Error adding tourist:', error)
      toast.error('An error occurred while adding tourist')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Package options
  const packageOptions = [
    { value: 'budget', label: 'Budget Package', price: 500 },
    { value: 'standard', label: 'Standard Package', price: 1000 },
    { value: 'premium', label: 'Premium Package', price: 1500 },
    { value: 'luxury', label: 'Luxury Package', price: 2500 },
  ]

  // Update total amount when package or travelers change
  useEffect(() => {
    const selectedPackage = packageOptions.find(p => p.value === formData.tourPackage)
    if (selectedPackage) {
      const totalAmount = selectedPackage.price * formData.numberOfTravelers
      setFormData(prev => ({
        ...prev,
        packagePrice: selectedPackage.price,
        totalAmount,
      }))
    }
  }, [formData.tourPackage, formData.numberOfTravelers])

  if (destinationsLoading || isLoadingNextId) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Tourist</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tourist ID
                  </label>
                  <input
                    type="text"
                    value={formData.touristId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Travelers *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfTravelers}
                    onChange={(e) => handleFieldChange('numberOfTravelers', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.numberOfTravelers ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfTravelers && <p className="mt-1 text-sm text-red-600">{errors.numberOfTravelers}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleFieldChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleFieldChange('address.city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleFieldChange('address.state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleFieldChange('address.country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors['address.country'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['address.country'] && <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleFieldChange('address.zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Travel Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Travel Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.destination ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select destination</option>
                    {destinations.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                  {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Package *
                  </label>
                  <select
                    value={formData.tourPackage}
                    onChange={(e) => handleFieldChange('tourPackage', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.tourPackage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select package</option>
                    {packageOptions.map((pkg) => (
                      <option key={pkg.value} value={pkg.value}>
                        {pkg.label} - ${pkg.price}
                      </option>
                    ))}
                  </select>
                  {errors.tourPackage && <p className="mt-1 text-sm text-red-600">{errors.tourPackage}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => handleFieldChange('travelDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.travelDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.travelDate && <p className="mt-1 text-sm text-red-600">{errors.travelDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleFieldChange('returnDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.returnDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.returnDate && <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleFieldChange('bookingDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.bookingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.bookingDate && <p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Guide
                  </label>
                  <input
                    type="text"
                    value={formData.assignedGuide}
                    onChange={(e) => handleFieldChange('assignedGuide', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Price
                  </label>
                  <input
                    type="number"
                    value={formData.packagePrice}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleFieldChange('paidAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handleFieldChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Emergency Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Special Requests</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding Tourist...' : 'Add Tourist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
