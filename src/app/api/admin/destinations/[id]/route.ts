import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../../lib/db'
import Destination from '../../../../../models/Destination'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    // Decode the ID in case it's URL encoded
    const decodedId = decodeURIComponent(id)
    
    // Try to find by MongoDB _id first, then by name
    let destination = await Destination.findById(decodedId).catch(() => null)
    if (!destination) {
      destination = await Destination.findOne({ name: decodedId })
    }
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, destination })
  } catch (error) {
    console.error('Error fetching destination:', error)
    return NextResponse.json({ error: 'Failed to fetch destination' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const body = await request.json()
    const { name, country, description, popularAttractions, bestTimeToVisit, averageCost } = body
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Destination name is required' }, { status: 400 })
    }
    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 })
    }
    
    // Decode the ID in case it's URL encoded
    const decodedId = decodeURIComponent(id)
    
    // Try to find by MongoDB _id first, then by name
    let destination = await Destination.findById(decodedId).catch(() => null)
    if (!destination) {
      destination = await Destination.findOne({ name: decodedId })
    }
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    
    // Check if new name already exists (only if name is being changed)
    if (name !== destination.name) {
      const existingDestination = await Destination.findOne({ name, _id: { $ne: destination._id } })
      if (existingDestination) {
        return NextResponse.json({ error: 'A destination with this name already exists' }, { status: 400 })
      }
    }
    
    // Update the destination
    destination.name = name
    destination.country = country
    destination.description = description
    destination.popularAttractions = popularAttractions
    destination.bestTimeToVisit = bestTimeToVisit
    destination.averageCost = averageCost
    
    await destination.save()
    
    // Return all destinations to maintain compatibility with frontend
    const allDestinations = await Destination.find({}).sort({ name: 1 })
    
    return NextResponse.json({ 
      success: true, 
      destinations: allDestinations,
      message: 'Destination updated successfully' 
    })
  } catch (error) {
    console.error('Error updating destination:', error)
    return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    // Decode the ID in case it's URL encoded
    const decodedId = decodeURIComponent(id)
    
    // Try to find by MongoDB _id first, then by name
    let destination = await Destination.findById(decodedId).catch(() => null)
    if (!destination) {
      destination = await Destination.findOne({ name: decodedId })
    }
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    
    await Destination.findByIdAndDelete(destination._id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Destination deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting destination:', error)
    return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 })
  }
}
