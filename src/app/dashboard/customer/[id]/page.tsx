'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Calendar, Package, DollarSign, Wifi, Shield, Download, Printer, Trash2, X } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Customer } from '@/types'

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && params.id) {
      fetchCustomer()
    }
  }, [status, router, params.id])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
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

  const handleEdit = () => {
    router.push(`/dashboard/customer/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!customer || !window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Customer deleted successfully')
        router.push('/dashboard')
      } else {
        toast.error('Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  // Delete image functions (Admin only)
  const deleteImage = async (imageType: 'profile' | 'nidfront' | 'nidback') => {
    if (!customer || session?.user?.role !== 'admin') {
      toast.error('Unauthorized action')
      return
    }

    const imageNames = {
      profile: 'profile picture',
      nidfront: 'NID front image',
      nidback: 'NID back image'
    }

    if (!window.confirm(`Are you sure you want to delete the ${imageNames[imageType]}?`)) {
      return
    }

    try {
      // Extract filename from URL for deletion
      let imageUrl = ''
      let fileName = ''
      
      if (imageType === 'profile' && customer.profilePicture) {
        imageUrl = customer.profilePicture
      } else if (imageType === 'nidfront' && customer.nidFrontImage) {
        imageUrl = customer.nidFrontImage
      } else if (imageType === 'nidback' && customer.nidBackImage) {
        imageUrl = customer.nidBackImage
      }

      if (imageUrl) {
        // Extract filename from URL (last part after /)
        fileName = imageUrl.split('/').pop() || ''
        
        // Delete from hosting
        const deleteResponse = await fetch(`/api/upload/delete?fileName=${fileName}&customerId=${customer.customerId}`, {
          method: 'DELETE'
        })

        if (!deleteResponse.ok) {
          console.warn('Failed to delete file from hosting, but continuing with database update')
        }
      }

      // Update customer record in database
      const updateData: any = {}
      if (imageType === 'profile') {
        updateData.profilePicture = null
      } else if (imageType === 'nidfront') {
        updateData.nidFrontImage = null
      } else if (imageType === 'nidback') {
        updateData.nidBackImage = null
      }

      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        // Update local state
        setCustomer(prev => prev ? { ...prev, ...updateData } : null)
        toast.success(`${imageNames[imageType]} deleted successfully`)
      } else {
        toast.error(`Failed to delete ${imageNames[imageType]}`)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error(`Failed to delete ${imageNames[imageType]}`)
    }
  }

  // Helper to ensure image URLs are absolute and point to hosting
  const getAbsoluteImageUrl = (url?: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    return `https://server.procloudify.com/~pasherdo/${cleanUrl}`
  }

  // Helper to get proxied image URL for customer images
  const getProxiedImageUrl = (url?: string): string => {
    if (!url) return ''
    const absUrl = getAbsoluteImageUrl(url)
    // Only proxy if it's a customer image from hosting
    if (absUrl.startsWith('https://server.procloudify.com/~pasherdo/uploads/customers/')) {
      return `/api/image-proxy?url=${encodeURIComponent(absUrl)}`
    }
    return absUrl
  }

  // Helper to load image as HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }

  const generateCustomerPDF = async (customer: Customer, mode: 'download' | 'print') => {
    const jsPDF = (await import('jspdf')).default
    // Use smaller margins for better utilization
    const margin = 12
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    let y = margin

    // Header with logo on top left, date on top right, and name centered
    let logoHeight = 13 // smaller logo
    let logoWidth = 0
    try {
      const logoImg = await loadImage('/logo1.png')
      logoWidth = logoHeight * (logoImg.width / logoImg.height)
      // Draw logo at top left
      pdf.addImage(logoImg, 'PNG', margin, y, logoWidth, logoHeight)
    } catch {
      // fallback: no logo
    }
    // Add date generated at top right
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const dateStr = `Generated: ${new Date().toLocaleDateString()}`
    pdf.text(dateStr, pageWidth - margin, y + 7, { align: 'right' })
    // Move y just below logo for name, but not too far down
    let nameY = y + logoHeight / 2 + 2
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text(customer.name, pageWidth / 2, nameY, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text(`Customer ID: ${customer.customerId}`, pageWidth / 2, nameY + 8, { align: 'center' })
    y = nameY + 18

    // Profile Picture (centered, larger)
    if (customer.profilePicture) {
      try {
        const img = await loadImage(getProxiedImageUrl(customer.profilePicture))
        const size = 48 // bigger profile image
        const x = pageWidth / 2 - size / 2
        pdf.addImage(img, 'JPEG', x, y, size, size)
        y += size + 10
      } catch {
        y += 12
      }
    }

    // Info grid (more space, bigger font)
    pdf.setFontSize(12)
    const infoBoxTop = y - 2
    const leftCol = [
      ['Phone', customer.phone],
      ['Email', customer.email || 'Not set'],
      ['Zone', customer.zone],
      ['Package', customer.package],
      ['Monthly Fee', `${customer.monthlyFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ]
    const rightCol = [
      ['NID Number', customer.nidNumber || 'Not set'],
      ['IP Address', customer.ipAddress || 'Not set'],
      ['PPPoE Password', customer.pppoePassword || 'Not set'],
      ['Joining Date', customer.joiningDate ? new Date(customer.joiningDate).toLocaleDateString() : 'Not set'],
      ['Status', customer.status.charAt(0).toUpperCase() + customer.status.slice(1)],
    ]
    const rowHeight = 9
    const infoBoxHeight = leftCol.length * rowHeight + 10
    const infoBoxWidth = pageWidth - margin * 2
    // Draw rounded rectangle for info box
    pdf.setDrawColor(180, 180, 180)
    pdf.roundedRect(margin, infoBoxTop, infoBoxWidth, infoBoxHeight, 4, 4)
    pdf.setDrawColor(0, 0, 0)
    for (let i = 0; i < leftCol.length; i++) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${leftCol[i][0]}:`, margin + 6, y + i * rowHeight + 8)
      pdf.setFont('helvetica', 'normal')
      // Place value closer to label
      pdf.text(String(leftCol[i][1]), margin + 38, y + i * rowHeight + 8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${rightCol[i][0]}:`, pageWidth / 2 + 10, y + i * rowHeight + 8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(String(rightCol[i][1]), pageWidth / 2 + 54, y + i * rowHeight + 8)
    }
    y += leftCol.length * rowHeight + 16

    // Address (centered)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.text('Address:', pageWidth / 2, y, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    const addressParts = []
    if (customer.address?.building) addressParts.push(customer.address.building)
    if (customer.address?.flatNo) addressParts.push(`Flat: ${customer.address.flatNo}`)
    if (customer.address?.roadNo) addressParts.push(`Road: ${customer.address.roadNo}`)
    if (customer.address?.thana) addressParts.push(customer.address.thana)
    if (customer.address?.district) addressParts.push(customer.address.district)
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not set'
    const addressLines = pdf.splitTextToSize(fullAddress, pageWidth - margin * 2 - 20)
    // Center each address line
    let addressY = y + 8
    addressLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, addressY, { align: 'center' })
      addressY += 7
    })
    y = addressY + 8

    // NID Images (side by side, larger)
    const nidWidth = 80
    const nidHeight = 48
    const spacing = 16
    const totalWidth = nidWidth * 2 + spacing
    const startX = pageWidth / 2 - totalWidth / 2
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('NID Documents', pageWidth / 2, y, { align: 'center' })
    y += 10
    // NID Front
    if (customer.nidFrontImage) {
      try {
        const img = await loadImage(getProxiedImageUrl(customer.nidFrontImage))
        pdf.addImage(img, 'JPEG', startX, y, nidWidth, nidHeight)
      } catch {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.setTextColor(180, 180, 180)
        pdf.text('NID Front Not Available', startX + nidWidth / 2, y + nidHeight / 2, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
      }
    } else {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(180, 180, 180)
      pdf.text('NID Front Not Available', startX + nidWidth / 2, y + nidHeight / 2, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
    }
    // NID Back
    if (customer.nidBackImage) {
      try {
        const img = await loadImage(getProxiedImageUrl(customer.nidBackImage))
        pdf.addImage(img, 'JPEG', startX + nidWidth + spacing, y, nidWidth, nidHeight)
      } catch {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.setTextColor(180, 180, 180)
        pdf.text('NID Back Not Available', startX + nidWidth + spacing + nidWidth / 2, y + nidHeight / 2, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
      }
    } else {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(180, 180, 180)
      pdf.text('NID Back Not Available', startX + nidWidth + spacing + nidWidth / 2, y + nidHeight / 2, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
    }
    y += nidHeight + 18

    // Footer
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`"The Document is not authorized to be shared without LinkUp Administration consent."`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 12, { align: 'center' })
    pdf.setTextColor(0, 0, 0)

    // Download or Print
    const cleanName = customer.name.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `Customer_${customer.customerId}_${cleanName}.pdf`
    if (mode === 'download') {
      pdf.save(fileName)
    } else {
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl)
          }, 1000)
        }
      } else {
        // Fallback if popup is blocked
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = fileName
        link.click()
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }

  const handleDownloadPDF = async () => {
    if (!customer) return
    setIsGeneratingPdf(true)
    try {
      await generateCustomerPDF(customer, 'download')
    } catch (error) {
      toast.error('Error generating PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrintPDF = async () => {
    if (!customer) return
    setIsGeneratingPdf(true)
    try {
      await generateCustomerPDF(customer, 'print')
    } catch (error) {
      toast.error('Error printing PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout 
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
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
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
            <p className="text-gray-600">The customer you're looking for doesn't exist or has been deleted.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Header with photo and basic info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {customer.profilePicture ? (
                  <img
                    src={customer.profilePicture}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              {/* Delete profile picture button for admin */}
              {session?.user?.role === 'admin' && customer.profilePicture && (
                <button
                  onClick={() => deleteImage('profile')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Delete profile picture"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{customer.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {customer.package}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ৳{customer.monthlyFee}/month
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Only admin can edit and delete customers */}
              {session?.user?.role === 'admin' && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Edit Customer
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customer Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium">
                      {customer.email || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="font-medium space-y-1">
                      {customer.address?.building && (
                        <p className="text-gray-900">{customer.address.building}</p>
                      )}
                      <div className="flex gap-4">
                        {customer.address?.flatNo && (
                          <span className="text-gray-700">Flat: {customer.address.flatNo}</span>
                        )}
                        {customer.address?.roadNo && (
                          <span className="text-gray-700">Road: {customer.address.roadNo}</span>
                        )}
                      </div>
                      {customer.address?.thana && (
                        <p className="text-gray-900">{customer.address.thana}</p>
                      )}
                      {customer.address?.district && (
                        <p className="text-gray-900 font-semibold">{customer.address.district}</p>
                      )}
                      {!customer.address?.thana && !customer.address?.district && (
                        <p className="text-gray-400 italic">Address not set</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Zone: {customer.zone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Service Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Joining Date</p>
                    <p className="font-medium">
                      {new Date(customer.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-medium">
                      {customer.ipAddress || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">PPPoE Password</p>
                    <p className="font-medium">
                      {customer.pppoePassword ? (
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {customer.pppoePassword}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">NID Number</p>
                    <p className="font-medium">
                      {customer.nidNumber || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NID Images */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">NID Documents</h3>
              {session?.user?.role === 'admin' && (
                <p className="text-sm text-gray-500 italic">Click the delete button to remove images</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <p className="text-sm text-gray-600 mb-2">NID Front</p>
                {customer.nidFrontImage ? (
                  <div className="relative">
                    <img
                      src={customer.nidFrontImage}
                      alt="NID Front"
                      className="w-full h-auto border border-gray-200 rounded-lg"
                    />
                    {/* Delete NID front button for admin */}
                    {session?.user?.role === 'admin' && (
                      <button
                        onClick={() => deleteImage('nidfront')}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Delete NID front image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400 italic">Not available</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <p className="text-sm text-gray-600 mb-2">NID Back</p>
                {customer.nidBackImage ? (
                  <div className="relative">
                    <img
                      src={customer.nidBackImage}
                      alt="NID Back"
                      className="w-full h-auto border border-gray-200 rounded-lg"
                    />
                    {/* Delete NID back button for admin */}
                    {session?.user?.role === 'admin' && (
                      <button
                        onClick={() => deleteImage('nidback')}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Delete NID back image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400 italic">Not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PDF Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrintPDF}
              disabled={isGeneratingPdf}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Preparing...' : 'Print PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
