import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Booking from '@/models/Booking'
import { Tourist } from '@/models/Tourist'
import { TourPackage } from '@/models/TourPackage'
import { Guide } from '@/models/Guide'

// GET /api/bookings - Get all bookings with advanced search
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Advanced search parameters
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.startDate = { $lte: new Date(endDate) }
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {}
      if (minAmount) query.totalAmount.$gte = parseInt(minAmount)
      if (maxAmount) query.totalAmount.$lte = parseInt(maxAmount)
    }

    // Get bookings with populated fields
    const bookings = await Booking.find(query)
      .populate('tourist', 'name email phone')
      .populate('package', 'name price destination duration')
      .populate('guide', 'name phone specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Booking.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const {
      touristId,
      packageId,
      guideId,
      startDate,
      endDate,
      numberOfPeople,
      specialRequests,
      emergencyContact
    } = body

    // Validate required fields
    if (!touristId || !packageId || !startDate || !endDate || !numberOfPeople) {
      return NextResponse.json({
        message: 'Missing required fields: touristId, packageId, startDate, endDate, numberOfPeople'
      }, { status: 400 })
    }

    // Calculate total amount (assuming basic price calculation)
    const totalAmount = 500 * numberOfPeople // Default price calculation

    // Create booking
    const booking = new Booking({
      tourist: touristId,
      package: packageId,
      guide: guideId || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numberOfPeople,
      totalAmount,
      specialRequests,
      emergencyContact,
      bookingDate: new Date()
    })

    await booking.save()

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings - Update booking
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()
    
    if (!_id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('tourist', 'name email phone')
    .populate('package', 'name price destination duration')
    .populate('guide', 'name phone specialization')

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// DELETE /api/bookings - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const deletedBooking = await Booking.findByIdAndDelete(id)
    
    if (!deletedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
