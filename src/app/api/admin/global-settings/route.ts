import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import GlobalSettings from '@/models/GlobalSettings'

// Global settings for the application
interface GlobalSettingsType {
  customerTableColumns: {
    showName: boolean
    showCustomerId: boolean
    showEmail: boolean
    showPhone: boolean
    showZone: boolean
    showNidNumber: boolean
    showIpAddress: boolean
    showPppoePassword: boolean
    showPackage: boolean
    showMonthlyFee: boolean
    showStatus: boolean
    showJoiningDate: boolean
    showActions: boolean
  }
}

const defaultSettings: GlobalSettingsType = {
  customerTableColumns: {
    showName: true,
    showCustomerId: true,
    showEmail: true,
    showPhone: true,
    showZone: true,
    showNidNumber: true,
    showIpAddress: false,
    showPppoePassword: false,
    showPackage: true,
    showMonthlyFee: true,
    showStatus: true,
    showJoiningDate: true,
    showActions: true
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    let settings = await GlobalSettings.findOne()
    if (!settings) {
      settings = await GlobalSettings.create({
        customerTableColumns: defaultSettings.customerTableColumns,
        updatedAt: new Date(),
        updatedBy: ''
      })
    }
    return NextResponse.json(settings.customerTableColumns)
  } catch (error) {
    console.error('Error fetching global settings:', error)
    return NextResponse.json({})
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const settings = await request.json()
    await connectDB()
    let globalSettings = await GlobalSettings.findOne()
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({
        customerTableColumns: settings,
        updatedAt: new Date(),
        updatedBy: session.user.email
      })
    } else {
      globalSettings.customerTableColumns = settings
      globalSettings.updatedAt = new Date()
      globalSettings.updatedBy = session.user.email
      await globalSettings.save()
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving global settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
