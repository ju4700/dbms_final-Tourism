import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Tourist } from '@/models/Tourist';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all tourist IDs that match the TMS-xxxx pattern and find the highest number
    const tourists = await Tourist.find(
      { touristId: { $regex: /^TMS-\d+$/ } },
      { touristId: 1 }
    ).lean();

    console.log('Found tourists with TMS pattern:', tourists.length);

    let nextNumber = 1;

    if (tourists.length > 0) {
      // Extract all numbers and find the maximum
      const numbers = tourists
        .map(t => {
          const touristRecord = t as { touristId?: string };
          if (touristRecord.touristId && typeof touristRecord.touristId === 'string') {
            const match = touristRecord.touristId.match(/^TMS-(\d+)$/);
            const num = match ? parseInt(match[1], 10) : 0;
            console.log(`Tourist ID: ${touristRecord.touristId}, extracted number: ${num}`);
            return num;
          }
          return 0;
        })
        .filter(n => n > 0);

      console.log('All extracted numbers:', numbers);

      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }

    const nextId = `TMS-${nextNumber.toString().padStart(4, '0')}`;
    console.log('Generated next tourist ID:', nextId);

    // Double-check that this ID doesn't already exist
    const existingTourist = await Tourist.findOne({ touristId: nextId });
    if (existingTourist) {
      console.log('ID already exists, incrementing...');
      nextNumber++;
      const newNextId = `TMS-${nextNumber.toString().padStart(4, '0')}`;
      return NextResponse.json({ nextId: newNextId });
    }

    return NextResponse.json({ nextId });
  } catch (error) {
    console.error('Error generating next tourist ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
