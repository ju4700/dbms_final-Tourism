'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Customer } from '@/types'
import { useZones } from '@/hooks/useZones'

const customerSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().optional().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    { message: 'Please enter a valid email address' }
  ),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    building: z.string().optional(),
    flatNo: z.string().optional(),
    roadNo: z.string().optional(),
    thana: z.string().min(1, 'Thana is required'),
    district: z.string().min(1, 'District is required'),
  }),
  zone: z.string().min(1, 'Zone is required'),
  nidNumber: z.string().optional(),
  nidFrontImage: z.string().optional(),
  nidBackImage: z.string().optional(),
  profilePicture: z.string().optional(),
  package: z.string().min(1, 'Package is required'),
  monthlyFee: z.number().min(1, 'Monthly fee must be greater than 0'),
  status: z.enum(['active', 'inactive']),
  joiningDate: z.string().min(1, 'Joining date is required'),
  ipAddress: z.string().optional(),
  pppoePassword: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { zones, loading: zonesLoading } = useZones()
  
  // Basic form data
  const [formData, setFormData] = useState<CustomerFormData>({
    customerId: '',
    name: '',
    email: '',
    phone: '',
    address: {
      building: '',
      flatNo: '',
      roadNo: '',
      thana: '',
      district: '',
    },
    zone: '',
    nidNumber: '',
    nidFrontImage: '',
    nidBackImage: '',
    profilePicture: '',
    package: '',
    monthlyFee: 0,
    status: 'active',
    joiningDate: '',
    ipAddress: '',
    pppoePassword: '',
  })

  // Image handling
  const [previewUrls, setPreviewUrls] = useState<{
    profilePicture?: string
    nidFrontImage?: string
    nidBackImage?: string
  }>({})
  
  const [selectedFiles, setSelectedFiles] = useState<{
    profilePicture?: File
    nidFrontImage?: File
    nidBackImage?: File
  }>({})

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Only admin can edit customers
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('Access denied. Only admins can edit customers.')
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated' && params.id) {
      fetchCustomer()
    }
  }, [status, router, params.id, session])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        const customer = data.customer
        setCustomer(customer)
        
        // Populate form with customer data
        setFormData({
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: {
            building: customer.address?.building || '',
            flatNo: customer.address?.flatNo || '',
            roadNo: customer.address?.roadNo || '',
            thana: customer.address?.thana || '',
            district: customer.address?.district || '',
          },
          zone: customer.zone || customer.area || '', // Support migration from area to zone
          nidNumber: customer.nidNumber || '',
          nidFrontImage: customer.nidFrontImage || '',
          nidBackImage: customer.nidBackImage || '',
          profilePicture: customer.profilePicture || '',
          package: customer.package,
          monthlyFee: customer.monthlyFee,
          status: customer.status,
          joiningDate: new Date(customer.joiningDate).toISOString().split('T')[0],
          ipAddress: customer.ipAddress || '',
          pppoePassword: customer.pppoePassword || '',
        })

        // Set existing image URLs for preview
        setPreviewUrls({
          profilePicture: customer.profilePicture || undefined,
          nidFrontImage: customer.nidFrontImage || undefined,
          nidBackImage: customer.nidBackImage || undefined,
        })
      } else {
        toast.error('Customer not found')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      toast.error('Failed to load customer')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (type: 'profilePicture' | 'nidFrontImage' | 'nidBackImage', file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      // Clean up old preview URL
      if (previewUrls[type] && previewUrls[type]!.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrls[type]!)
      }

      // Create new preview URL
      const previewUrl = URL.createObjectURL(file)
      
      setSelectedFiles(prev => ({ ...prev, [type]: file }))
      setPreviewUrls(prev => ({ ...prev, [type]: previewUrl }))
    } catch (error) {
      console.error('File selection error:', error)
      toast.error(error instanceof Error ? error.message : 'File selection failed')
    }
  }

  const handleChange = (field: keyof CustomerFormData, value: string | number | CustomerFormData['address']) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const uploadFiles = async (customerId: string) => {
    const uploadedUrls: Record<string, string> = {}
    
    for (const [type, file] of Object.entries(selectedFiles)) {
      if (file) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          // Map field names to upload types (same as add page)
          let uploadType: string
          if (type === 'profilePicture') {
            uploadType = 'profile'
          } else if (type === 'nidFrontImage') {
            uploadType = 'nidfront'
          } else if (type === 'nidBackImage') {
            uploadType = 'nidback'
          } else {
            throw new Error(`Unknown upload type: ${type}`)
          }
          
          console.log(`Uploading ${type} as type "${uploadType}" for customer ${customerId}`)
          
          formData.append('type', uploadType)
          formData.append('customerId', customerId)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            uploadedUrls[type] = data.url
          } else {
            const error = await response.json()
            throw new Error(error.error || `Failed to upload ${type}`)
          }
        } catch (error) {
          console.error(`Error uploading ${type}:`, error)
          throw new Error(`Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = customerSchema.parse(formData)

      // Upload new files if any
      const uploadedUrls = await uploadFiles(validatedData.customerId)

      // Prepare final data with uploaded URLs or existing URLs
      const finalData = {
        ...validatedData,
        nidFrontImage: uploadedUrls.nidFrontImage || formData.nidFrontImage || undefined,
        nidBackImage: uploadedUrls.nidBackImage || formData.nidBackImage || undefined,
        profilePicture: uploadedUrls.profilePicture || formData.profilePicture || undefined,
        email: validatedData.email || undefined,
        nidNumber: validatedData.nidNumber || undefined,
        ipAddress: validatedData.ipAddress || undefined,
        pppoePassword: validatedData.pppoePassword || undefined,
      }

      // Update customer
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (response.ok) {
        toast.success('Customer updated successfully')
        router.push(`/dashboard/customer/${params.id}`)
      } else {
        const errorData = await response.json()
        if (errorData.error === 'Customer ID already exists') {
          setErrors({ customerId: 'This Customer ID is already in use' })
        } else {
          toast.error(errorData.error || 'Failed to update customer')
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path.join('.')
            fieldErrors[field] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error('Please correct the errors below')
      } else {
        console.error('Error updating customer:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to update customer')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Package options and pricing
  const packageOptions = [
    { value: '5 Mbps', price: 800 },
    { value: '10 Mbps', price: 1200 },
    { value: '15 Mbps', price: 1500 },
    { value: '20 Mbps', price: 1800 },
    { value: '25 Mbps', price: 2200 },
    { value: '30 Mbps', price: 2500 },
  ]

  const packagePrices: Record<string, number> = Object.fromEntries(
    packageOptions.map(pkg => [pkg.value, pkg.price])
  )

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout 
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout 
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
            <p className="text-gray-600">The customer you're trying to edit doesn't exist or has been deleted.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer ID - Read Only */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">Customer ID *</label>
                <input
                  type="text"
                  id="customerId"
                  value={formData.customerId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Customer ID cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Zone */}
              <div>
                <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
                <select
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  disabled={zonesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100"
                >
                  <option value="">Select a zone</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
                {errors.zone && <p className="mt-1 text-sm text-red-600">{errors.zone}</p>}
                {zonesLoading && <p className="mt-1 text-xs text-gray-500">Loading zones...</p>}
              </div>

              {/* IP Address */}
              <div>
                <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="ipAddress"
                  value={formData.ipAddress}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.ipAddress && <p className="mt-1 text-sm text-red-600">{errors.ipAddress}</p>}
              </div>

              {/* PPPoE Password */}
              <div>
                <label htmlFor="pppoePassword" className="block text-sm font-medium text-gray-700 mb-2">
                  PPPoE Password <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="pppoePassword"
                  value={formData.pppoePassword || ''}
                  onChange={(e) => handleChange('pppoePassword', e.target.value)}
                  placeholder="Enter PPPoE authentication password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.pppoePassword && <p className="mt-1 text-sm text-red-600">{errors.pppoePassword}</p>}
              </div>

              {/* NID Number */}
              <div>
                <label htmlFor="nidNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  NID Number <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="nidNumber"
                  value={formData.nidNumber || ''}
                  onChange={(e) => handleChange('nidNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.nidNumber && <p className="mt-1 text-sm text-red-600">{errors.nidNumber}</p>}
              </div>

              {/* Joining Date */}
              <div>
                <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  id="joiningDate"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.joiningDate && <p className="mt-1 text-sm text-red-600">{errors.joiningDate}</p>}
              </div>

              {/* Package Selection */}
              <div>
                <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-2">Package *</label>
                <select
                  id="package"
                  value={formData.package}
                  onChange={(e) => {
                    const selectedPackage = e.target.value
                    handleChange('package', selectedPackage)
                    if (packagePrices[selectedPackage]) {
                      handleChange('monthlyFee', packagePrices[selectedPackage])
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Select a package</option>
                  {packageOptions.map((pkg) => (
                    <option key={pkg.value} value={pkg.value}>
                      {pkg.value} - ৳{pkg.price}/month
                    </option>
                  ))}
                  <option value="Custom">Custom Package</option>
                </select>
                {errors.package && <p className="mt-1 text-sm text-red-600">{errors.package}</p>}
              </div>

              {/* Monthly Fee */}
              <div>
                <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee (৳) *</label>
                <input
                  type="number"
                  id="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={(e) => handleChange('monthlyFee', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {errors.monthlyFee && <p className="mt-1 text-sm text-red-600">{errors.monthlyFee}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Building */}
                <div>
                  <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                    Building <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="building"
                    value={formData.address.building || ''}
                    onChange={(e) => handleChange('address', { ...formData.address, building: e.target.value })}
                    placeholder="e.g., Green Plaza"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                {/* Flat No */}
                <div>
                  <label htmlFor="flatNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Flat No <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="flatNo"
                    value={formData.address.flatNo || ''}
                    onChange={(e) => handleChange('address', { ...formData.address, flatNo: e.target.value })}
                    placeholder="e.g., 4A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                {/* Road No */}
                <div>
                  <label htmlFor="roadNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Road No <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="roadNo"
                    value={formData.address.roadNo || ''}
                    onChange={(e) => handleChange('address', { ...formData.address, roadNo: e.target.value })}
                    placeholder="e.g., 15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                {/* Thana */}
                <div>
                  <label htmlFor="thana" className="block text-sm font-medium text-gray-700 mb-2">Thana *</label>
                  <input
                    type="text"
                    id="thana"
                    value={formData.address.thana}
                    onChange={(e) => handleChange('address', { ...formData.address, thana: e.target.value })}
                    placeholder="e.g., Dhanmondi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  {errors['address.thana'] && <p className="mt-1 text-sm text-red-600">{errors['address.thana']}</p>}
                </div>

                {/* District */}
                <div className="md:col-span-2">
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <input
                    type="text"
                    id="district"
                    value={formData.address.district}
                    onChange={(e) => handleChange('address', { ...formData.address, district: e.target.value })}
                    placeholder="e.g., Dhaka"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  {errors['address.district'] && <p className="mt-1 text-sm text-red-600">{errors['address.district']}</p>}
                </div>
              </div>
            </div>

            {/* Images Upload Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Documents & Photos</h3>
              <div className="space-y-8">
                
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Picture <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                      {previewUrls.profilePicture ? (
                        <img
                          src={previewUrls.profilePicture}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-500 mt-2">Upload Photo</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect('profilePicture', e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* NID Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* NID Front */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      NID Front <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                      {previewUrls.nidFrontImage ? (
                        <img
                          src={previewUrls.nidFrontImage}
                          alt="NID Front preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-500 mt-2">Upload NID Front</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect('nidFrontImage', e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* NID Back */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      NID Back <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                      {previewUrls.nidBackImage ? (
                        <img
                          src={previewUrls.nidBackImage}
                          alt="NID Back preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-500 mt-2">Upload NID Back</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect('nidBackImage', e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/customer/${params.id}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
