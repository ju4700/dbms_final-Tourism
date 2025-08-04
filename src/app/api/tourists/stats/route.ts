import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Tourist } from '@/models/Tourist'

export async function GET() {
  try {
    await connectDB()

    // Get stats using aggregation for tourist statuses
    const stats = await Tourist.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          totalRevenue: { $sum: '$paidAmount' },
          pendingPayments: {
            $sum: {
              $subtract: ['$totalAmount', '$paidAmount']
            }
          }
        }
      }
    ])

    // Get recent tourists count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentCount = await Tourist.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const result = stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      totalRevenue: 0,
      pendingPayments: 0
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        recentCount
      }
    })
  } catch (error) {
    console.error('Error fetching tourist stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
