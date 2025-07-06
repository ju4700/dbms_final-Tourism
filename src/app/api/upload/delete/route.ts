import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFromHosting } from '@/lib/hosting';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const customerId = searchParams.get('customerId');

    if (!fileName || !customerId) {
      return NextResponse.json({ error: 'Missing fileName or customerId' }, { status: 400 });
    }

    // Delete from cPanel hosting via FTP
    const deleted = await deleteFromHosting(customerId, fileName);

    return NextResponse.json({ 
      success: deleted,
      message: deleted ? 'File deleted successfully' : 'File deletion failed or file not found'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Delete failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
