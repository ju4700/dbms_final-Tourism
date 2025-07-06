import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Get all staff users
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      data: staff
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new staff user
    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
      preferences: {
        customerViewSettings: {
          showName: true,
          showCustomerId: true,
          showEmail: true,
          showPhone: true,
          showZone: true,
          showNidNumber: true,
          showIpAddress: true,
          showPppoePassword: true,
          showPackage: true,
          showMonthlyFee: true,
          showStatus: true,
          showJoiningDate: true,
          showActions: true
        },
        dashboard: {
          defaultTab: 'overview',
          showQuickActions: true,
          compactMode: false,
          refreshInterval: 60
        }
      }
    })

    const staffData = {
      _id: newStaff._id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      createdAt: newStaff.createdAt
    }

    return NextResponse.json({
      success: true,
      data: staffData,
      message: 'Staff member created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}
