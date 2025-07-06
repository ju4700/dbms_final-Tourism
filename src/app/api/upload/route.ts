import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToHosting } from '@/lib/hosting'

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    const customerId = formData.get('customerId');
    const type = formData.get('type');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing customerId' }, { status: 400 });
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing type' }, { status: 400 });
    }

    // Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const allowedTypes = ['profile', 'nidfront', 'nidback'] as const;
    if (!allowedTypes.includes(type as any)) {
      return NextResponse.json({ success: false, error: 'Invalid upload type' }, { status: 400 });
    }

    console.log('Upload API called with:')
    console.log('- type:', type)
    console.log('- customerId:', customerId)
    console.log('- file:', file.name, `(${file.type}, ${file.size} bytes)`)
    console.log('- environment:', process.env.NODE_ENV)
    console.log('- upload URL:', process.env.UPLOAD_HANDLER_URL)

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to hosting (HTTP with FTP fallback)
    const result = await uploadToHosting(buffer, file.name, customerId, type as 'profile' | 'nidfront' | 'nidback');

    return NextResponse.json({
      success: true,
      url: result.imageUrl,
      filename: result.fileName,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
