import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Destination from '@/models/Destination'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    console.error('Error adding destination:', error)
    return NextResponse.json({ error: 'Failed to add destination' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { zoneName } = await request.json()
    if (!zoneName || typeof zoneName !== 'string') {
      return NextResponse.json({ error: 'Zone name is required' }, { status: 400 })
    }
    await connectDB()
    const result = await Zone.deleteOne({ name: zoneName })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }
    // Update all customers with this zone to 'Not Available'
    const { Customer } = await import('@/models/Customer')
    await Customer.updateMany({ zone: zoneName }, { zone: 'Not Available' })
    const zones = await Zone.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, zones: zones.map(z => z.name) })
  } catch (error) {
    console.error('Error deleting zone:', error)
    return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 })
  }
}
