'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useZones } from '@/hooks/useZones'
import DashboardLayout from '@/components/layout/DashboardLayout'

const customerSchema = z.object({
  customerId: z.string().optional(), // Backend will generate this
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

export default function AddCustomerPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { zones, loading: zonesLoading } = useZones()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingNextId, setIsLoadingNextId] = useState(false)
  
  // Basic form data
  const [formData, setFormData] = useState<CustomerFormData>(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
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
      joiningDate: today,
      ipAddress: '',
      pppoePassword: '',
    }
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

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Both admin and staff can add customers
    if (status === 'authenticated' && session?.user?.role !== 'admin' && session?.user?.role !== 'staff') {
      toast.error('Access denied.')
      router.push('/dashboard')
      return
    }
  }, [status, router, session])

  // Auto-generate customer ID for new customers
  useEffect(() => {
    const fetchNextCustomerId = async () => {
      setIsLoadingNextId(true)
      try {
        const response = await fetch('/api/customers/next-id')
        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({ ...prev, customerId: data.nextId }))
        }
      } catch (error) {
        console.error('Error fetching next customer ID:', error)
        toast.error('Could not generate customer ID')
      } finally {
        setIsLoadingNextId(false)
      }
    }
    fetchNextCustomerId()
  }, [])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  // File handling
  const handleFileSelect = (file: File, type: 'profilePicture' | 'nidFrontImage' | 'nidBackImage') => {
    try {
      console.log('File selected:', file)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      // Store the file
      setSelectedFiles(prev => ({ ...prev, [type]: file }))
      
      // Create preview URL directly from original file
      const previewUrl = URL.createObjectURL(file)
      console.log('Preview URL created:', previewUrl)
      
      // Clean up previous preview URL if it exists
      setPreviewUrls(prev => {
        if (prev[type]) {
          URL.revokeObjectURL(prev[type]!)
        }
        return { ...prev, [type]: previewUrl }
      })
      
      toast.success('Image selected successfully')
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
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          
          // Map field names to upload types
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
          
          uploadFormData.append('type', uploadType)
          uploadFormData.append('customerId', customerId)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const data = await response.json()
          uploadedUrls[type] = data.url
        } catch (error) {
          console.error(`Upload error for ${type}:`, error)
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
      const validatedData = customerSchema.parse({
        ...formData,
        // Convert empty strings to undefined for optional fields
        email: formData.email || undefined,
        nidNumber: formData.nidNumber || undefined,
        ipAddress: formData.ipAddress || undefined,
        pppoePassword: formData.pppoePassword || undefined,
        // For image validation, consider files or existing URLs
        profilePicture: selectedFiles.profilePicture ? 'file-selected' : formData.profilePicture || undefined,
        nidFrontImage: selectedFiles.nidFrontImage ? 'file-selected' : formData.nidFrontImage || undefined,
        nidBackImage: selectedFiles.nidBackImage ? 'file-selected' : formData.nidBackImage || undefined,
      })

      let finalData = { ...validatedData }

      // Create new customer
      const hasFilesToUpload = Object.values(selectedFiles).some(file => file)
      
      if (hasFilesToUpload) {
        // Create customer without images first - let backend generate customerId
        const tempData = {
          ...finalData,
          nidFrontImage: '',
          nidBackImage: '',
          profilePicture: '',
          // Remove customerId - let backend generate it
          customerId: undefined,
          // Ensure required fields are properly set
          email: finalData.email || '',
          nidNumber: finalData.nidNumber || '',
          ipAddress: finalData.ipAddress || '',
        }

        const createResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tempData),
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          console.error('Create customer error:', errorData)
          throw new Error(errorData.error || 'Failed to create customer')
        }

        const createdCustomer = await createResponse.json()
        console.log('Customer created response:', createdCustomer)
        console.log('Customer data:', createdCustomer.data)
        
        if (!createdCustomer.data || !createdCustomer.data.customerId) {
          throw new Error('Invalid response: missing customer data or customerId')
        }
        
        const customerId = createdCustomer.data.customerId
        console.log('Using customerId for uploads:', customerId)

        // Upload files
        const uploadedUrls = await uploadFiles(customerId)
        console.log('Files uploaded:', uploadedUrls)

        // Update customer with image URLs
        console.log('About to update customer with images...')
        const updateData = {
          nidFrontImage: uploadedUrls.nidFrontImage || '',
          nidBackImage: uploadedUrls.nidBackImage || '',
          profilePicture: uploadedUrls.profilePicture || '',
        }

        console.log('Update data:', updateData)
        console.log('Customer ID for update:', createdCustomer.data._id)

        const updateResponse = await fetch(`/api/customers/${createdCustomer.data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        console.log('Update response status:', updateResponse.status)
        
        if (!updateResponse.ok) {
          const updateError = await updateResponse.json()
          console.error('Update customer error:', updateError)
          throw new Error('Failed to update customer with images')
        }
        
        const updateResult = await updateResponse.json()
        console.log('Customer updated successfully:', updateResult)
      } else {
        // Create customer directly - let backend generate customerId
        const cleanData = {
          ...finalData,
          customerId: undefined, // Let backend generate it
          email: finalData.email || '',
          nidNumber: finalData.nidNumber || '',
          ipAddress: finalData.ipAddress || '',
          nidFrontImage: '',
          nidBackImage: '',
          profilePicture: '',
        }

        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Create customer direct error:', errorData)
          throw new Error(errorData.error || 'Failed to create customer')
        }
      }

      toast.success('Customer created successfully')
      
      // Reset form and clean up
      Object.values(previewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      setPreviewUrls({})
      setSelectedFiles({})
      setFormData({
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
        joiningDate: new Date().toISOString().split('T')[0],
        ipAddress: '',
        pppoePassword: '',
      })
      
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast.error(error instanceof Error ? error.message : 'An error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout 
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer ID */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer ID * <span className="text-xs text-gray-500">(Auto-generated)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="customerId"
                    value={formData.customerId}
                    readOnly
                    disabled={isLoadingNextId}
                    placeholder={isLoadingNextId ? "Generating ID..." : "Auto-generated by system"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed disabled:bg-gray-50"
                  />
                  {isLoadingNextId && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    </div>
                  )}
                </div>
                {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  disabled={zonesLoading}
                >
                  <option value="">Select a zone</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
                {errors.zone && <p className="mt-1 text-sm text-red-600">{errors.zone}</p>}
                {zonesLoading && <p className="mt-1 text-sm text-gray-500">Loading zones...</p>}
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
                  value={formData.nidNumber}
                  onChange={(e) => handleChange('nidNumber', e.target.value)}
                  placeholder="Enter NID number"
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

              {/* Package */}
              <div>
                <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-2">Package *</label>
                <select
                  id="package"
                  value={formData.package}
                  onChange={(e) => {
                    const selectedPackage = e.target.value
                    handleChange('package', selectedPackage)
                    
                    const packagePrices: Record<string, number> = {
                      'Basic': 500, 'Bronze': 600, 'Silver': 700, 'Gold': 800,
                      'Platinum': 900, 'Platinum Plus': 1000, 'Diamond': 1200, 'Titanium': 1500,
                    }
                    
                    if (selectedPackage && packagePrices[selectedPackage]) {
                      handleChange('monthlyFee', packagePrices[selectedPackage])
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Select Package</option>
                  <option value="Basic">Basic - 5 Mbps (৳500)</option>
                  <option value="Bronze">Bronze - 10 Mbps (৳600)</option>
                  <option value="Silver">Silver - 15 Mbps (৳700)</option>
                  <option value="Gold">Gold - 20 Mbps (৳800)</option>
                  <option value="Platinum">Platinum - 25 Mbps (৳900)</option>
                  <option value="Platinum Plus">Platinum Plus - 30 Mbps (৳1000)</option>
                  <option value="Diamond">Diamond - 35 Mbps (৳1200)</option>
                  <option value="Titanium">Titanium - 40 Mbps (৳1500)</option>
                </select>
                {errors.package && <p className="mt-1 text-sm text-red-600">{errors.package}</p>}
              </div>

              {/* Monthly Fee */}
              <div>
                <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee (৳) *</label>
                <input
                  type="number"
                  id="monthlyFee"
                  value={formData.monthlyFee || ''}
                  onChange={(e) => handleChange('monthlyFee', parseInt(e.target.value) || 0)}
                  min="1"
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
            <div className="space-y-4">
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
            <div className="mt-6 pt-6 border-t border-gray-200">
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
                          alt="Profile Picture"
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Profile image loaded')}
                          onError={() => console.log('❌ Profile image failed')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 text-gray-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">Choose Image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file, 'profilePicture')
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  {errors.profilePicture && <p className="mt-2 text-sm text-red-600 text-center">{errors.profilePicture}</p>}
                </div>

                {/* NID Front Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    National ID Card - Front Side <span className="text-xs text-gray-500">(Optional)</span>
                    <span className="text-xs text-gray-500 ml-2">(16:9 ratio for phone photos)</span>
                  </label>
                  <div className="flex justify-center">
                    <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-pointer" 
                         style={{ width: '480px', height: '270px' }}>
                      {previewUrls.nidFrontImage ? (
                        <img
                          src={previewUrls.nidFrontImage}
                          alt="NID Front"
                          className="w-full h-full object-contain bg-white"
                          onLoad={() => console.log('✅ NID Front loaded')}
                          onError={() => console.log('❌ NID Front failed')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 text-gray-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">Choose Image</p>
                            <p className="text-xs text-gray-500 mt-1">NID Front Side</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file, 'nidFrontImage')
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  {errors.nidFrontImage && <p className="mt-2 text-sm text-red-600 text-center">{errors.nidFrontImage}</p>}
                </div>

                {/* NID Back Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    National ID Card - Back Side <span className="text-xs text-gray-500">(Optional)</span>
                    <span className="text-xs text-gray-500 ml-2">(16:9 ratio for phone photos)</span>
                  </label>
                  <div className="flex justify-center">
                    <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-pointer" 
                         style={{ width: '480px', height: '270px' }}>
                      {previewUrls.nidBackImage ? (
                        <img
                          src={previewUrls.nidBackImage}
                          alt="NID Back"
                          className="w-full h-full object-contain bg-white"
                          onLoad={() => console.log('✅ NID Back loaded')}
                          onError={() => console.log('❌ NID Back failed')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 text-gray-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">Choose Image</p>
                            <p className="text-xs text-gray-500 mt-1">NID Back Side</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file, 'nidBackImage')
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  {errors.nidBackImage && <p className="mt-2 text-sm text-red-600 text-center">{errors.nidBackImage}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
