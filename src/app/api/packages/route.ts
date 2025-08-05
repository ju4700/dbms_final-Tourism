import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import { TourPackage } from '../../../models/TourPackage'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const skip = (page - 1) * limit

    const filter: any = {}
    if (destination) filter.destination = destination
    if (category) filter.category = category
    if (isActive !== null) filter.isActive = isActive === 'true'

    const total = await TourPackage.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    
    const packages = await TourPackage.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      
    return NextResponse.json({ 
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching tour packages:', error)
    return NextResponse.json({ error: 'Failed to fetch tour packages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      name,
      description,
      destination,
      duration,
      price,
      inclusions,
      exclusions,
      itinerary,
      maxGroupSize,
      difficulty,
      category,
      images,
      seasonalPricing
    } = body

    // Generate package ID
    const packages = await TourPackage.find(
      { packageId: { $regex: /^PKG-\d+$/ } },
      { packageId: 1 }
    ).lean()

    let nextNumber = 1
    if (packages.length > 0) {
      const numbers = packages
        .map(p => {
          const match = p.packageId?.match(/^PKG-(\d+)$/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter(n => n > 0)
      
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1
      }
    }

    const packageId = `PKG-${nextNumber.toString().padStart(3, '0')}`

    const packageData = {
      packageId,
      name,
      description,
      destination,
      duration: parseInt(duration),
      price: parseFloat(price),
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      itinerary: itinerary || [],
      maxGroupSize: parseInt(maxGroupSize) || 20,
      difficulty: difficulty || 'easy',
      category,
      images: images || [],
      seasonalPricing: seasonalPricing || []
    }

    const newPackage = await TourPackage.create(packageData)
    return NextResponse.json({ success: true, data: newPackage })
  } catch (error) {
    console.error('Error creating tour package:', error)
    return NextResponse.json({ error: 'Failed to create tour package' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()
    
    if (!_id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const updatedPackage = await TourPackage.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedPackage })
  } catch (error) {
    console.error('Error updating tour package:', error)
    return NextResponse.json({ error: 'Failed to update tour package' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const deletedPackage = await TourPackage.findByIdAndDelete(id)
    
    if (!deletedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Package deleted successfully' })
  } catch (error) {
    console.error('Error deleting tour package:', error)
    return NextResponse.json({ error: 'Failed to delete tour package' }, { status: 500 })
  }
}
