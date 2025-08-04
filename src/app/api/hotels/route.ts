import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import { Hotel } from '../../../models/Hotel'

export async function GET() {
  try {
    await connectDB()
    const hotels = await Hotel.find({}).sort({ name: 1 })
    
    return NextResponse.json({ hotels })
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    await connectDB()
    
    // Generate hotel ID
    const lastHotel = await Hotel.findOne({}, {}, { sort: { 'hotelId': -1 } })
    let nextId = 1
    if (lastHotel && lastHotel.hotelId) {
      const lastNumber = parseInt(lastHotel.hotelId.replace('H', ''))
      nextId = lastNumber + 1
    }
    const hotelId = `H${nextId.toString().padStart(3, '0')}`
    
    const hotel = new Hotel({
      hotelId,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    await hotel.save()
    
    const hotels = await Hotel.find({}).sort({ name: 1 })
    
    return NextResponse.json({ 
      message: 'Hotel created successfully',
      hotel,
      hotels
    })
  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()
    
    if (!_id) {
      return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 })
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedHotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    })
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 })
    }

    const deletedHotel = await Hotel.findByIdAndDelete(id)
    
    if (!deletedHotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Hotel deleted successfully' })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 })
  }
}
