import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import { Guide } from '../../../models/Guide'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const skip = (page - 1) * limit

    const filter: any = {}
    if (destination) filter.destinations = { $in: [destination] }
    if (isActive !== null) filter.isActive = isActive === 'true'

    const total = await Guide.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    
    const guides = await Guide.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      
    return NextResponse.json({ 
      guides,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching guides:', error)
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })
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
      specializations,
      destinations,
      languages,
      experience,
      pricePerDay,
      certifications,
      bio,
      emergencyContact
    } = body

    // Generate guide ID
    const guides = await Guide.find(
      { guideId: { $regex: /^GD-\d+$/ } },
      { guideId: 1 }
    ).lean()

    let nextNumber = 1
    if (guides.length > 0) {
      const numbers = guides
        .map(g => {
          const match = g.guideId?.match(/^GD-(\d+)$/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter(n => n > 0)
      
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1
      }
    }

    const guideId = `GD-${nextNumber.toString().padStart(3, '0')}`

    const guideData = {
      guideId,
      name,
      email,
      phone,
      specializations: specializations || [],
      destinations: destinations || [],
      languages: languages || [],
      experience: parseInt(experience) || 0,
      pricePerDay: parseFloat(pricePerDay) || 0,
      certifications: certifications || [],
      bio,
      emergencyContact
    }

    const newGuide = await Guide.create(guideData)
    return NextResponse.json({ success: true, data: newGuide })
  } catch (error) {
    console.error('Error creating guide:', error)
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()
    
    if (!_id) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 })
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedGuide })
  } catch (error) {
    console.error('Error updating guide:', error)
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 })
    }

    const deletedGuide = await Guide.findByIdAndDelete(id)
    
    if (!deletedGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Guide deleted successfully' })
  } catch (error) {
    console.error('Error deleting guide:', error)
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 })
  }
}
