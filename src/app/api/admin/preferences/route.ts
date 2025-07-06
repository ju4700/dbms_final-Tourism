import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

// Get admin preferences that can be inherited by staff
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Find an admin user to get their customer view settings
    const adminUser = await User.findOne({ role: 'admin' }).select('preferences')
    
    if (!adminUser || !adminUser.preferences) {
      return NextResponse.json({
        success: true,
        data: {}
      })
    }

    // Return only customer view settings for inheritance
    return NextResponse.json({
      success: true,
      data: {
        customerViewSettings: adminUser.preferences.customerViewSettings || {}
      }
    })
  } catch (error) {
    console.error('Error fetching admin preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin preferences' },
      { status: 500 }
    )
  }
}
