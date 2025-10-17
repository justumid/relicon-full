import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const engineUrl = process.env.ENGINE_URL || 'http://localhost:8000';
    const response = await fetch(`${engineUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Generation failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Engine API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ad generation engine' },
      { status: 500 }
    );
  }
}
