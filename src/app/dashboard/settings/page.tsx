'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Save, User, Shield, Database, Trash2, Eye, EyeOff, Settings, MapPin, Plus } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGlobalCustomerTableSettings } from '@/hooks/useGlobalSettings'
import { useZones } from '@/hooks/useZones'
import HydrationBoundary from '@/components/HydrationBoundary'

interface UserSettings {
  name: string
  email: string
  role: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function SettingsContent() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Global customer table settings
  const { settings: customerViewSettings, updateSettings: updateCustomerViewSettings, loading: settingsLoading } = useGlobalCustomerTableSettings()
  
  // Zone management
  const { zones, addZone, deleteZone, loading: zonesLoading, editZone, mergeZones } = useZones()
  const [newZoneName, setNewZoneName] = useState('')
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editedZoneName, setEditedZoneName] = useState('')
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [mergeTarget, setMergeTarget] = useState('')

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    email: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Only admin can access settings
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.')
      router.push('/dashboard')
      return
    }

    if (session?.user) {
      setUserSettings({
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [status, session, router])

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userSettings.name,
          email: userSettings.email,
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        await update()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!userSettings.currentPassword || !userSettings.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (userSettings.newPassword !== userSettings.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (userSettings.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: userSettings.currentPassword,
          newPassword: userSettings.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setUserSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset all customer data? This action cannot be undone.')) {
      return
    }
    
    if (!window.confirm('This will permanently delete ALL customers. Type "RESET" to confirm:')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Database reset successfully')
      } else {
        toast.error('Failed to reset database')
      }
    } catch (error) {
      toast.error('Failed to reset database')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">Only administrators can access settings.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <User className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-gray-600 text-sm">Update your personal information</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={userSettings.role}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                <p className="text-gray-600 text-sm">Change your password and security preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={userSettings.currentPassword}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={userSettings.newPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={userSettings.confirmPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Customer View Settings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Database className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Table Settings</h2>
                <p className="text-gray-600 text-sm">Configure which columns are visible in the customer table</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(customerViewSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Show ', '')}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => updateCustomerViewSettings({ [key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    {Object.values(customerViewSettings).filter(Boolean).length} of {Object.keys(customerViewSettings).length} columns visible
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const allEnabled = Object.keys(customerViewSettings).reduce((acc, key) => ({
                        ...acc,
                        [key]: true
                      }), {})
                      updateCustomerViewSettings(allEnabled)
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => {
                      const allDisabled = Object.keys(customerViewSettings).reduce((acc, key) => ({
                        ...acc,
                        [key]: false
                      }), {})
                      updateCustomerViewSettings(allDisabled)
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Hide All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Zone Management</h2>
                <p className="text-gray-600 text-sm">Create and manage zones for customer assignments</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Add New Zone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Zone
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter zone name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                />
                <button
                  onClick={async () => {
                    if (newZoneName.trim()) {
                      const success = await addZone(newZoneName.trim())
                      if (success) {
                        setNewZoneName('')
                      }
                    }
                  }}
                  disabled={!newZoneName.trim() || zonesLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Zone
                </button>
              </div>
            </div>

            {/* Existing Zones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Existing Zones ({zones.length})
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setMergeMode(!mergeMode)}
                  className={`px-3 py-1 text-xs font-medium rounded ${mergeMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`}
                >
                  {mergeMode ? 'Cancel Merge' : 'Merge Zones'}
                </button>
              </div>
              {zonesLoading ? (
                <div className="text-center py-4 text-gray-500">Loading zones...</div>
              ) : zones.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No zones created yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zones.map((zone) => (
                    <div key={zone} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {editingZone === zone ? (
                        <input
                          type="text"
                          value={editedZoneName}
                          onChange={e => setEditedZoneName(e.target.value)}
                          onBlur={async () => {
                            if (editedZoneName && editedZoneName !== zone) {
                              await editZone(zone, editedZoneName)
                            }
                            setEditingZone(null)
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && editedZoneName && editedZoneName !== zone) {
                              await editZone(zone, editedZoneName)
                              setEditingZone(null)
                            }
                            if (e.key === 'Escape') setEditingZone(null)
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 border border-gray-300 rounded mr-2"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700 flex-1">{zone}</span>
                      )}
                      <div className="flex items-center gap-2">
                        {mergeMode && (
                          <input
                            type="checkbox"
                            checked={selectedZones.includes(zone)}
                            onChange={e => {
                              setSelectedZones(prev => e.target.checked ? [...prev, zone] : prev.filter(z => z !== zone))
                            }}
                          />
                        )}
                        {!mergeMode && (
                          <button
                            onClick={() => {
                              setEditingZone(zone)
                              setEditedZoneName(zone)
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit zone"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={() => deleteZone(zone)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete zone"
                          disabled={mergeMode}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Merge UI */}
              {mergeMode && (
                <div className="mt-4 p-3 border border-gray-300 rounded bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Zone Name</label>
                  <input
                    type="text"
                    value={mergeTarget}
                    onChange={e => setMergeTarget(e.target.value)}
                    placeholder="Enter new or existing zone name"
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                  />
                  <button
                    onClick={async () => {
                      if (selectedZones.length < 2) {
                        toast.error('Select at least two zones to merge')
                        return
                      }
                      if (!mergeTarget.trim()) {
                        toast.error('Enter a target zone name')
                        return
                      }
                      const success = await mergeZones(selectedZones, mergeTarget.trim())
                      if (success) {
                        setMergeMode(false)
                        setSelectedZones([])
                        setMergeTarget('')
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-1"
                  >
                    Merge Selected Zones
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    }>
      <HydrationBoundary>
        <SettingsContent />
      </HydrationBoundary>
    </Suspense>
  )
}
