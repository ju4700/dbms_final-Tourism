import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import { Hotel } from '../../../../models/Hotel'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await connectDB()
    const hotel = await Hotel.findOne({ hotelId: params.id })
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    return NextResponse.json({ hotel })
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotel' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    
    await connectDB()
    
    const hotel = await Hotel.findOneAndUpdate(
      { hotelId: params.id },
      { 
        ...body,
        updatedAt: new Date(),
      },
      { new: true }
    )
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, hotel })
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await connectDB()
    
    const hotel = await Hotel.findOneAndDelete({ hotelId: params.id })
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Hotel deleted successfully' })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
}
