import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const engineUrl = process.env.ENGINE_URL || 'http://localhost:8000';
    const response = await fetch(`${engineUrl}/video/${params.filename}`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const videoBuffer = await response.arrayBuffer();
    
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve video' },
      { status: 500 }
    );
  }
}
