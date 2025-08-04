import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import Destination from '../../../../models/Destination'

export async function GET() {
  try {
    await connectDB()
    const destinations = await Destination.find({}).sort({ name: 1 })
    return NextResponse.json(destinations.map(d => d.name))
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, country, description, popularAttractions, bestTimeToVisit, averageCost } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Destination name is required' }, { status: 400 })
    }
    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 })
    }
    
    await connectDB()
    
    const exists = await Destination.findOne({ name })
    if (exists) {
      return NextResponse.json({ error: 'Destination already exists' }, { status: 400 })
    }
    
    await Destination.create({ 
      name, 
      country, 
      description, 
      popularAttractions, 
      bestTimeToVisit, 
      averageCost 
    })
    
    const destinations = await Destination.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, destinations: destinations.map(d => d.name) })
  } catch (error) {
    console.error('Error creating destination:', error)
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json({ error: 'Destination name is required' }, { status: 400 })
    }
    
    await connectDB()
    
    const destination = await Destination.findOneAndDelete({ name })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    
    const destinations = await Destination.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, destinations: destinations.map(d => d.name) })
  } catch (error) {
    console.error('Error deleting destination:', error)
    return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 })
  }
}
