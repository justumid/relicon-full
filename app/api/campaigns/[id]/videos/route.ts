/**
 * Campaign Videos API Route
 *
 * GET /api/campaigns/[id]/videos - Fetch all videos for a campaign
 *
 * Author: Relicon Team
 * Last Updated: 2025-01-09
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/videos
 * Fetch all videos for a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('generated_videos')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaign videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: data || []
    });
  } catch (error) {
    console.error('Campaign videos API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
