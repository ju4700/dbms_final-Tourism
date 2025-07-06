import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Tourist } from '@/models/Tourist'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const destination = searchParams.get('destination')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tourPackage = searchParams.get('tourPackage')
    const paymentStatus = searchParams.get('paymentStatus')

    // Build filter query
    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { touristId: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
        { 'address.country': { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { tourPackage: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      filter.status = status
    }

    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' }
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (tourPackage) {
      filter.tourPackage = tourPackage
    }

    // Get total count for pagination
    const total = await Tourist.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Get tourists
    const tourists = await Tourist.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: tourists,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching tourists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow admin and manager to create tourists
    if (session.user?.role !== 'admin' && session.user?.role !== 'manager') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      destination,
      passportNumber,
      tourPackage,
      packagePrice,
      status,
      bookingDate,
      travelDate,
      returnDate,
      numberOfTravelers,
      emergencyContact,
      specialRequests,
      accommodationType,
      totalAmount,
      paidAmount,
      paymentStatus,
      assignedGuide,
      profilePicture,
      passportImage,
      visaImage
    } = body

    // Generate tourist ID
    const tourists = await Tourist.find(
      { touristId: { $regex: /^TMS-\d+$/ } },
      { touristId: 1 }
    ).lean();

    let nextNumber = 1;

    if (tourists.length > 0) {
      const numbers = tourists
        .map(t => {
          const touristRecord = t as { touristId?: string };
          if (touristRecord.touristId && typeof touristRecord.touristId === 'string') {
            const match = touristRecord.touristId.match(/^TMS-(\d+)$/);
            const num = match ? parseInt(match[1], 10) : 0;
            return num;
          }
          return 0;
        })
        .filter(n => n > 0);

      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }

    const touristId = `TMS-${nextNumber.toString().padStart(4, '0')}`;
    console.log('POST: Generated tourist ID:', touristId);

    const touristData = {
      touristId,
      name,
      email: email || undefined,
      phone,
      address,
      destination,
      passportNumber: passportNumber || undefined,
      tourPackage,
      packagePrice: parseFloat(packagePrice),
      status: status || 'pending',
      bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
      travelDate: new Date(travelDate),
      returnDate: new Date(returnDate),
      numberOfTravelers: parseInt(numberOfTravelers) || 1,
      emergencyContact: emergencyContact || undefined,
      specialRequests: specialRequests || undefined,
      accommodationType: accommodationType || 'hotel',
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount) || 0,
      paymentStatus: paymentStatus || 'pending',
      assignedGuide: assignedGuide || undefined,
      profilePicture: profilePicture || undefined,
      passportImage: passportImage || undefined,
      visaImage: visaImage || undefined
    }

    const tourist = await Tourist.create(touristData)

    return NextResponse.json({
      success: true,
      data: tourist,
      message: 'Tourist registered successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating tourist:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Tourist ID already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
