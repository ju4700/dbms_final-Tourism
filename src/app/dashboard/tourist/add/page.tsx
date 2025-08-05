'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function AddTouristPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingNextId, setIsLoadingNextId] = useState(false)
  const [isIdEditable, setIsIdEditable] = useState(false)
  
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
    loadNextTouristId()
  }, [])

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
      const response = await fetch('/api/tourists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle validation errors
        if (errorData.details) {
          setErrors(errorData.details)
          toast.error('Please fix the validation errors')
        } else {
          toast.error(errorData.error || errorData.message || 'Failed to register tourist')
        }
        return
      }

      const data = await response.json()
      const createdTourist = data.data
      
      toast.success('Tourist registered successfully!')
      router.push(`/dashboard/tourist/${createdTourist.touristId}`)
      
    } catch (error) {
      console.error('Error registering tourist:', error)
      toast.error('An error occurred while registering tourist')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Register New Tourist</h1>
              <p className="text-sm text-gray-600">Add a new tourist to the system</p>
            </div>
          </div>
          {formData.touristId && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
              ID: {formData.touristId}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tourist ID Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Tourist ID</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsIdEditable(!isIdEditable)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isIdEditable ? 'Lock ID' : 'Edit ID'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tourist ID *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.touristId}
                    onChange={(e) => handleFieldChange('touristId', e.target.value)}
                    disabled={!isIdEditable}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isIdEditable ? 'bg-gray-100 cursor-not-allowed' : ''
                    } ${errors.touristId ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="TMS-0001"
                  />
                  <button
                    type="button"
                    onClick={loadNextTouristId}
                    disabled={isLoadingNextId}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingNextId ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {errors.touristId && <p className="text-red-500 text-sm mt-1">{errors.touristId}</p>}
                <p className="text-gray-500 text-xs mt-1">Click edit to manually change, or refresh to generate next ID</p>
              </div>
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
                  placeholder="City"
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
                  placeholder="State/Province"
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
                  placeholder="Country"
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
                  placeholder="ZIP/Postal code"
                />
                {errors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>}
              </div>
            </div>
          </div>

          {/* Identity Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Identity Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID (NID) Number
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number (Optional)
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
                  Passport Expiry Date (Optional)
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
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Emergency Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="Emergency contact name"
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
                  placeholder="Emergency contact phone"
                />
                {errors['emergencyContact.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => handleFieldChange('emergencyContact.relationship', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
                {errors['emergencyContact.relationship'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.relationship']}</p>}
              </div>
            </div>
          </div>

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
              disabled={isSubmitting || isLoadingNextId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Tourist'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
