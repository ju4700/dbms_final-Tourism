import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'

export async function GET() {
  try {
    await connectDB()
    // Return default preferences since no authentication
    const defaultPreferences = {
      tableColumns: {
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
      },
      theme: 'light',
      notifications: true
    }
    
    return NextResponse.json({ 
      success: true, 
      data: defaultPreferences 
    })
  } catch (error) {
    console.error('Failed to get preferences:', error)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const preferences = await request.json()
    await connectDB()
    
    // Since no authentication, just return success
    return NextResponse.json({ 
      success: true, 
      data: preferences 
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json()
    await connectDB()
    
    // Since no authentication, just return success
    return NextResponse.json({ 
      success: true, 
      data: updates 
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
