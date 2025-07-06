import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Zone from '@/models/Zone'
import { Customer } from '@/models/Customer'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { selectedZones, targetZone } = await request.json()
    if (!Array.isArray(selectedZones) || selectedZones.length < 2 || !targetZone || typeof targetZone !== 'string') {
      return NextResponse.json({ error: 'Invalid merge request' }, { status: 400 })
    }
    await connectDB()
    // Create target zone if it doesn't exist
    let target = await Zone.findOne({ name: targetZone })
    if (!target) {
      target = await Zone.create({ name: targetZone })
    }
    // Update all customers in selected zones to target zone
    await Customer.updateMany({ zone: { $in: selectedZones } }, { zone: targetZone })
    // Remove merged zones except the target
    await Zone.deleteMany({ name: { $in: selectedZones.filter(z => z !== targetZone) } })
    const zones = await Zone.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, zones: zones.map(z => z.name) })
  } catch (error) {
    console.error('Error merging zones:', error)
    return NextResponse.json({ error: 'Failed to merge zones' }, { status: 500 })
  }
}
