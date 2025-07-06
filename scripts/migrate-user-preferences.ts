import { connectDB } from '../src/lib/db'
import User from '../src/models/User'

const defaultPreferences = {
  customerViewSettings: {
    showCustomerId: true,
    showName: true,
    showEmail: true,
    showPhone: true,
    showNidNumber: true,
    showArea: true,
    showIpAddress: false,
    showPppoePassword: false,
    showPackage: true,
    showMonthlyFee: true,
    showStatus: true,
    showJoiningDate: true
  },
  dashboard: {
    defaultTab: 'overview',
    showQuickActions: true,
    compactMode: false,
    refreshInterval: 30000
  }
}

async function migrateUserPreferences() {
  try {
    await connectDB()
    
    console.log('Starting user preferences migration...')
    
    // Update all users without preferences
    const result = await User.updateMany(
      { preferences: { $exists: false } },
      { $set: { preferences: defaultPreferences } }
    )
    
    console.log(`Updated ${result.modifiedCount} users with default preferences`)
    
    // Also ensure existing users have all required preference fields
    const allUsers = await User.find({})
    
    for (const user of allUsers) {
      let needsUpdate = false
      const updatedPrefs = { ...user.preferences }
      
      // Check customerViewSettings
      if (!updatedPrefs.customerViewSettings) {
        updatedPrefs.customerViewSettings = defaultPreferences.customerViewSettings
        needsUpdate = true
      } else {
        // Ensure all customerViewSettings fields exist
        for (const [key, value] of Object.entries(defaultPreferences.customerViewSettings)) {
          if (updatedPrefs.customerViewSettings[key] === undefined) {
            updatedPrefs.customerViewSettings[key] = value
            needsUpdate = true
          }
        }
      }
      
      // Check dashboard preferences
      if (!updatedPrefs.dashboard) {
        updatedPrefs.dashboard = defaultPreferences.dashboard
        needsUpdate = true
      } else {
        // Ensure all dashboard fields exist
        for (const [key, value] of Object.entries(defaultPreferences.dashboard)) {
          if (updatedPrefs.dashboard[key] === undefined) {
            updatedPrefs.dashboard[key] = value
            needsUpdate = true
          }
        }
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { preferences: updatedPrefs })
        console.log(`Updated preferences for user: ${user.email}`)
      }
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run migration
migrateUserPreferences()
