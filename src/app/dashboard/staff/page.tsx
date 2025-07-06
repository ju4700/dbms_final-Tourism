'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Users, Plus, Mail, User, Calendar, Trash2, Edit, Settings as SettingsIcon } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { defaultColumns } from '@/hooks/useGlobalSettings'

interface StaffMember {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type StaffFormData = z.infer<typeof staffSchema>

export default function StaffManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editStaffId, setEditStaffId] = useState<string | null>(null)
  const [settingsStaffId, setSettingsStaffId] = useState<string | null>(null)

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
  })

  const [editFormData, setEditFormData] = useState<Partial<StaffFormData> & { role?: string }>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const [staffTableView, setStaffTableView] = useState<string>('default')
  const [staffTableColumns, setStaffTableColumns] = useState<any>(defaultColumns)
  const [isSettingsSubmitting, setIsSettingsSubmitting] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Only admin can access staff management
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.')
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchStaff()
    }
  }, [status, router, session])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')

      if (response.ok) {
        const data = await response.json()
        setStaff(data.data || [])
      } else {
        toast.error('Failed to load staff')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      staffSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const field = err.path[0]
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const validateEditForm = (): boolean => {
    try {
      staffSchema.partial().parse(editFormData)
      setEditErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const field = err.path[0]
          newErrors[field] = err.message
        })
        setEditErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setStaff((prev) => [data.data, ...prev])
        toast.success('Staff member added successfully!')
        setShowAddForm(false)
        setFormData({ name: '', email: '', password: '' })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add staff member')
      }
    } catch (error) {
      console.error('Error adding staff:', error)
      toast.error('An error occurred while adding the staff member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEditForm() || !editStaffId) {
      toast.error('Please fix the errors below')
      return
    }
    setIsEditSubmitting(true)
    try {
      // Only send password if not blank
      const payload = { ...editFormData }
      if (!payload.password) {
        delete payload.password
      }
      const response = await fetch(`/api/staff/${editStaffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        setStaff((prev) =>
          prev.map((m) => (m._id === editStaffId ? { ...m, ...data.data } : m))
        )
        toast.success('Staff member updated successfully!')
        closeEditForm()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update staff member')
      }
    } catch (error) {
      console.error('Error updating staff:', error)
      toast.error('An error occurred while updating the staff member')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete staff member "${name}"?`)) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Staff member deleted successfully')
        setStaff((prev) => prev.filter((member) => member._id !== id))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete staff member')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Failed to delete staff member')
    } finally {
      setDeletingId(null)
    }
  }

  const openEditForm = (member: StaffMember) => {
    setEditStaffId(member._id)
    setEditFormData({ name: member.name, email: member.email, password: '', role: member.role })
    setEditErrors({})
  }

  const closeEditForm = () => {
    setEditStaffId(null)
    setEditFormData({})
    setEditErrors({})
  }

  const openSettingsModal = (member: StaffMember) => {
    setSettingsStaffId(member._id)
    // Always fetch latest from DB for this staff
    fetch(`/api/staff/${member._id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.data && data.data.preferences && data.data.preferences.customerViewSettings) {
          setStaffTableColumns(data.data.preferences.customerViewSettings)
        } else {
          setStaffTableColumns(defaultColumns)
        }
        setSettingsError(null)
      })
      .catch(() => {
        setStaffTableColumns(defaultColumns)
        setSettingsError(null)
      })
  }

  const closeSettingsModal = () => {
    setSettingsStaffId(null)
    setSettingsError(null)
  }

  const handleTableViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStaffTableView(e.target.value)
  }

  const handleColumnToggle = (key: string) => {
    setStaffTableColumns((prev: any) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settingsStaffId) return
    setIsSettingsSubmitting(true)
    setSettingsError(null)
    try {
      const response = await fetch(`/api/staff/${settingsStaffId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerTableColumns: staffTableColumns }),
      })
      if (response.ok) {
        setStaff(prev => prev.map(m => m._id === settingsStaffId ? { ...m, customerTableColumns: staffTableColumns } : m))
        toast.success('Table view updated for staff member!')
        closeSettingsModal()
      } else {
        const errorData = await response.json()
        setSettingsError(errorData.error || 'Failed to update table view')
      }
    } catch (error) {
      setSettingsError('An error occurred while updating table view')
    } finally {
      setIsSettingsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage staff members and their access</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </button>
        </div>

        {/* Add Staff Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Add New Staff Member</h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ name: '', email: '', password: '' })
                  setErrors({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ name: '', email: '', password: '' })
                    setErrors({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {staff.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first staff member</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(member.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        <button
                          onClick={() => openEditForm(member)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit staff member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openSettingsModal(member)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Set customer table view for staff"
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id, member.name)}
                          disabled={deletingId === member._id}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete staff member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Staff Form Modal */}
        {editStaffId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Edit Staff Member</h2>
                <button
                  onClick={closeEditForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${editErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter full name"
                    />
                    {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${editErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter email address"
                    />
                    {editErrors.email && <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password (leave blank to keep unchanged)
                    </label>
                    <input
                      type="password"
                      id="edit-password"
                      name="password"
                      value={editFormData.password || ''}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${editErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter new password"
                    />
                    {editErrors.password && <p className="mt-1 text-sm text-red-600">{editErrors.password}</p>}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Table View Settings Modal */}
        {settingsStaffId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Set Customer Table View</h2>
                <button
                  onClick={closeSettingsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(staffTableColumns)
                    .filter(([key]) => key !== '_id') // Hide _id from settings UI
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Show ', '')}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={() => handleColumnToggle(key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                        </label>
                      </div>
                  ))}
                </div>
                {settingsError && <p className="text-sm text-red-600">{settingsError}</p>}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeSettingsModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSettingsSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSettingsSubmitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
