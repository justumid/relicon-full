import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns
 * Fetch campaigns with analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId || userId === 'null') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use the generated_videos table for campaign data
    // Fetch campaigns that belong to the user OR have no user_id (legacy campaigns)
    let query = supabaseServer
      .from('generated_videos')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: data || []
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      objective,
      budgetTotal,
      budgetDaily,
      startDate,
      endDate,
      targetAudience,
      platforms
    } = body;

    console.log('Creating campaign with data:', { userId, name, objective });

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      );
    }

    // Try to insert into campaigns table first
    let campaignData;
    let error;

    try {
      const { data, error: campaignError } = await supabaseServer
        .from('campaigns')
        .insert({
          user_id: userId,
          name: name,
          objective: objective || 'awareness',
          budget_total: budgetTotal || 0,
          budget_daily: budgetDaily || 0,
          start_date: startDate,
          end_date: endDate,
          target_audience: targetAudience || {},
          platforms: platforms || [],
          status: 'active'
        })
        .select()
        .single();

      if (campaignError) {
        console.log('Campaigns table not available, using generated_videos table');
        throw campaignError;
      }

      campaignData = data;
    } catch (campaignError) {
      // Fallback to generated_videos table
      const { data, error: videoError } = await supabaseServer
        .from('generated_videos')
        .insert({
          user_id: userId,
          product_name: name,
          product_description: targetAudience?.description || '',
          campaign_type: objective || 'awareness',
          status: 'queued',
          metadata: {
            budget_total: budgetTotal,
            budget_daily: budgetDaily,
            start_date: startDate,
            end_date: endDate,
            target_audience: targetAudience || {},
            platforms: platforms || []
          }
        })
        .select()
        .single();

      if (videoError) {
        console.error('Error creating campaign in generated_videos:', videoError);
        return NextResponse.json(
          { error: 'Failed to create campaign', details: videoError.message },
          { status: 500 }
        );
      }

      campaignData = data;
    }

    console.log('Campaign created successfully:', campaignData);

    return NextResponse.json({
      success: true,
      campaign: campaignData
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns?id=xxx
 * Update campaign
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('generated_videos')
      .update(body)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: data
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
