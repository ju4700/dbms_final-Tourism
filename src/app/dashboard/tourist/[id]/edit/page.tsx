'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users, FileText, Shield, Heart, Edit3, RefreshCw, CreditCard } from 'lucide-react'

const touristSchema = z.object({
  touristId: z.string().min(1, 'Tourist ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().optional().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    { message: 'Please enter a valid email address' }
  ),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.object({
    building: z.string().optional(),
    street: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().optional(),
  }),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  nidNumber: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
})

type TouristFormData = z.infer<typeof touristSchema>

export default function EditTouristPage() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState<TouristFormData>(() => ({
    touristId: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    gender: undefined,
    address: {
      building: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    passportNumber: '',
    passportExpiryDate: '',
    nidNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (params.id) {
      fetchTourist()
    }
  }, [params.id])

  const fetchTourist = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tourists/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        const touristData = data.data
        
        // Format dates for input fields
        const formatDateForInput = (date: string | Date) => {
          if (!date) return ''
          return new Date(date).toISOString().split('T')[0]
        }
        
        // Populate form with tourist data
        setFormData({
          touristId: touristData.touristId || '',
          name: touristData.name || '',
          email: touristData.email || '',
          phone: touristData.phone || '',
          dateOfBirth: formatDateForInput(touristData.dateOfBirth),
          nationality: touristData.nationality || '',
          gender: touristData.gender || undefined,
          address: {
            building: touristData.address?.building || '',
            street: touristData.address?.street || '',
            city: touristData.address?.city || '',
            state: touristData.address?.state || '',
            country: touristData.address?.country || '',
            zipCode: touristData.address?.zipCode || '',
          },
          passportNumber: touristData.passportNumber || '',
          passportExpiryDate: formatDateForInput(touristData.passportExpiryDate),
          nidNumber: touristData.nidNumber || '',
          emergencyContact: touristData.emergencyContact || {
            name: '',
            phone: '',
            relationship: '',
          },
        })
      } else {
        toast.error('Tourist not found')
        router.push('/dashboard/tourist')
      }
    } catch (error) {
      console.error('Error fetching tourist:', error)
      toast.error('Failed to load tourist')
      router.push('/dashboard/tourist')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate form data
    try {
      touristSchema.parse(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
        setErrors(newErrors)
        toast.error('Please fix the errors in the form')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tourists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Tourist updated successfully!')
        router.push(`/dashboard/tourist/${params.id}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update tourist')
      }
    } catch (error) {
      console.error('Error updating tourist:', error)
      toast.error('Failed to update tourist')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tourist details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/dashboard/tourist/${params.id}`)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Tourist Details
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tourist</h1>
            <p className="text-gray-600 mt-2">Update tourist information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tourist ID Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Tourist ID</h2>
              </div>
              <div className="bg-gray-50 px-4 py-3 rounded-lg">
                <p className="text-lg font-mono font-semibold text-gray-800">{formData.touristId}</p>
                <p className="text-sm text-gray-600">Tourist identification number (cannot be changed)</p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => handleFieldChange('gender', e.target.value || undefined)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleFieldChange('nationality', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nationality ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter nationality"
                  />
                  {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Address Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building/House Number
                  </label>
                  <input
                    type="text"
                    value={formData.address.building}
                    onChange={(e) => handleFieldChange('address.building', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.building'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Building/House number"
                  />
                  {errors['address.building'] && <p className="text-red-500 text-sm mt-1">{errors['address.building']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleFieldChange('address.street', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street address"
                  />
                  {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleFieldChange('address.city', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleFieldChange('address.state', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter state/province"
                  />
                  {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleFieldChange('address.country', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.country'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter country"
                  />
                  {errors['address.country'] && <p className="text-red-500 text-sm mt-1">{errors['address.country']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleFieldChange('address.zipCode', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter ZIP/postal code"
                  />
                  {errors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>}
                </div>
              </div>
            </div>

            {/* Document Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Document Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter passport number"
                  />
                  {errors.passportNumber && <p className="text-red-500 text-sm mt-1">{errors.passportNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => handleFieldChange('passportExpiryDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.passportExpiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.passportExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.passportExpiryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NID/National ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.nidNumber}
                    onChange={(e) => handleFieldChange('nidNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nidNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter NID number"
                  />
                  {errors.nidNumber && <p className="text-red-500 text-sm mt-1">{errors.nidNumber}</p>}
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Heart className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Emergency Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter contact name"
                  />
                  {errors['emergencyContact.name'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.name']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter contact phone"
                  />
                  {errors['emergencyContact.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => handleFieldChange('emergencyContact.relationship', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                  {errors['emergencyContact.relationship'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.relationship']}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/tourist/${params.id}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Tourist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
