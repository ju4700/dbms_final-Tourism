import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('url')
  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }
  try {
    // Only allow images from your hosting
    if (!imageUrl.startsWith('https://server.procloudify.com/~pasherdo/uploads/customers/')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 })
  }
}
