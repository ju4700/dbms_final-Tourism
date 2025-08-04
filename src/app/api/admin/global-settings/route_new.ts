import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import GlobalSettings from '../../../../models/GlobalSettings'

// Global settings for the tourism application
interface TouristTableColumns {
  showName: boolean
  showTouristId: boolean
  showEmail: boolean
  showPhone: boolean
  showDestination: boolean
  showPassportNumber: boolean
  showTourPackage: boolean
  showPackagePrice: boolean
  showTotalAmount: boolean
  showPaidAmount: boolean
  showPaymentStatus: boolean
  showStatus: boolean
  showTravelDate: boolean
  showAssignedGuide: boolean
  showActions: boolean
}

const defaultSettings: TouristTableColumns = {
  showName: true,
  showTouristId: true,
  showEmail: true,
  showPhone: true,
  showDestination: true,
  showPassportNumber: false,
  showTourPackage: true,
  showPackagePrice: true,
  showTotalAmount: true,
  showPaidAmount: true,
  showPaymentStatus: true,
  showStatus: true,
  showTravelDate: true,
  showAssignedGuide: true,
  showActions: true
}

export async function GET() {
  try {
    await connectDB()
    let globalSettings = await GlobalSettings.findOne()
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({
        touristTableColumns: defaultSettings,
        updatedAt: new Date(),
        updatedBy: 'system'
      })
    }
    return NextResponse.json({ 
      success: true, 
      data: globalSettings.touristTableColumns || defaultSettings 
    })
  } catch (error) {
    console.error('Failed to get global settings:', error)
    return NextResponse.json(
      { error: 'Failed to get global settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json()
    await connectDB()
    let globalSettings = await GlobalSettings.findOne()
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({
        touristTableColumns: settings,
        updatedAt: new Date(),
        updatedBy: 'system'
      })
    } else {
      globalSettings.touristTableColumns = settings
      globalSettings.updatedAt = new Date()
      globalSettings.updatedBy = 'system'
      await globalSettings.save()
    }
    return NextResponse.json({ 
      success: true, 
      data: globalSettings.touristTableColumns 
    })
  } catch (error) {
    console.error('Failed to update global settings:', error)
    return NextResponse.json(
      { error: 'Failed to update global settings' },
      { status: 500 }
    )
  }
}
