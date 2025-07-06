import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Zone from '@/models/Zone'
import { Customer } from '@/models/Customer'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { oldName, newName } = await request.json()
    if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
      return NextResponse.json({ error: 'Invalid zone names' }, { status: 400 })
    }
    await connectDB()
    const exists = await Zone.findOne({ name: newName })
    if (exists) {
      return NextResponse.json({ error: 'Target zone name already exists' }, { status: 400 })
    }
    const zone = await Zone.findOneAndUpdate({ name: oldName }, { name: newName })
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }
    await Customer.updateMany({ zone: oldName }, { zone: newName })
    const zones = await Zone.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, zones: zones.map(z => z.name) })
  } catch (error) {
    console.error('Error renaming zone:', error)
    return NextResponse.json({ error: 'Failed to rename zone' }, { status: 500 })
  }
}
