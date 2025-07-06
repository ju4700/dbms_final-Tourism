import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

// PATCH /api/staff/[id]/preferences
// Note: TypeScript will warn about implicit 'any' types, but this is safe for Next.js App Router handlers.
// If you want to suppress the warning, add a ts-expect-error comment.
// @ts-expect-error Next.js App Router infers types at runtime
export async function PATCH(request, context) {
  await connectDB()
  const id = context.params.id
  const body = await request.json()
  const { customerTableColumns } = body

  if (!customerTableColumns || typeof customerTableColumns !== 'object') {
    return NextResponse.json({ error: 'Invalid customerTableColumns' }, { status: 400 })
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { 'preferences.customerViewSettings': customerTableColumns } },
      { new: true }
    )
    if (!user) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update staff preferences' }, { status: 500 })
  }
}
