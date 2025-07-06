import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select('preferences')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user.preferences || {}
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preferences } = await request.json()

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences data required' }, { status: 400 })
    }

    await connectDB()
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user.preferences
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'Preference key required' }, { status: 400 })
    }

    await connectDB()
    
    const updatePath = `preferences.${key}`
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { [updatePath]: value } },
      { new: true, runValidators: true }
    ).select('preferences')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user.preferences
    })
  } catch (error) {
    console.error('Error updating user preference:', error)
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}
