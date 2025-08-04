import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Tourist } from '@/models/Tourist'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    
    // Basic search parameters
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Advanced search parameters
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const nationality = searchParams.get('nationality')
    const gender = searchParams.get('gender')
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    // Build filter query
    const filter: any = {}

    // Basic search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Advanced search filters
    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    }

    if (email) {
      filter.email = { $regex: email, $options: 'i' }
    }

    if (nationality) {
      filter.nationality = { $regex: nationality, $options: 'i' }
    }

    if (status) {
      filter.status = status
    }

    if (gender) {
      filter.gender = gender
    }

    // Age-based filtering using date of birth
    if (minAge || maxAge) {
      const today = new Date()
      filter.dateOfBirth = {}
      
      if (maxAge) {
        // If max age is 30, person should be born after (today - 30 years)
        const maxDate = new Date(today.getFullYear() - parseInt(maxAge), today.getMonth(), today.getDate())
        filter.dateOfBirth.$gte = maxDate
      }
      
      if (minAge) {
        // If min age is 18, person should be born before (today - 18 years)
        const minDate = new Date(today.getFullYear() - parseInt(minAge), today.getMonth(), today.getDate())
        filter.dateOfBirth.$lte = minDate
      }
    }

    // Registration date range
    if (fromDate || toDate) {
      filter.createdAt = {}
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate)
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate + 'T23:59:59.999Z')
      }
    }

    // Get total count for pagination
    const total = await Tourist.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Get tourists with aggregation to include booking statistics
    const tourists = await Tourist.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'tourist',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          totalSpent: { $sum: '$bookings.totalAmount' },
          lastBooking: { $max: '$bookings.createdAt' }
        }
      },
      {
        $project: {
          bookings: 0 // Remove the bookings array from response
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])

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

// PUT /api/tourists - Update tourist
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()
    
    if (!_id) {
      return NextResponse.json({ error: 'Tourist ID is required' }, { status: 400 })
    }

    const updatedTourist = await Tourist.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedTourist) {
      return NextResponse.json({ error: 'Tourist not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: updatedTourist,
      message: 'Tourist updated successfully'
    })
  } catch (error) {
    console.error('Error updating tourist:', error)
    return NextResponse.json({ error: 'Failed to update tourist' }, { status: 500 })
  }
}

// DELETE /api/tourists - Delete tourist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Tourist ID is required' }, { status: 400 })
    }

    const deletedTourist = await Tourist.findByIdAndDelete(id)
    
    if (!deletedTourist) {
      return NextResponse.json({ error: 'Tourist not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tourist deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting tourist:', error)
    return NextResponse.json({ error: 'Failed to delete tourist' }, { status: 500 })
  }
}
