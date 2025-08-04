import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tourist } from '@/models/Tourist';

// GET /api/tourists/[id] - Get single tourist
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('Fetching tourist with ID:', id);
    
    await connectDB();

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('Invalid ObjectId format:', id);
      return NextResponse.json({ error: 'Invalid tourist ID format' }, { status: 400 });
    }

    const tourist = await Tourist.findById(id);
    console.log('Tourist found:', !!tourist);
    
    if (!tourist) {
      return NextResponse.json({ error: 'Tourist not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: tourist
    });
  } catch (error) {
    console.error('Error fetching tourist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tourists/[id] - Update tourist
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    await connectDB();

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid tourist ID format' }, { status: 400 });
    }

    const tourist = await Tourist.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!tourist) {
      return NextResponse.json({ error: 'Tourist not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: tourist,
      message: 'Tourist updated successfully'
    });
  } catch (error) {
    console.error('Error updating tourist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tourists/[id] - Delete tourist
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await connectDB();

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid tourist ID format' }, { status: 400 });
    }

    const tourist = await Tourist.findByIdAndDelete(id);

    if (!tourist) {
      return NextResponse.json({ error: 'Tourist not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tourist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tourist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
