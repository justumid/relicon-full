import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const engineUrl = process.env.ENGINE_URL || 'http://localhost:8000';
    const response = await fetch(`${engineUrl}/status/${params.jobId}`);

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Status check failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Engine status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
