import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

async function getUserAnalytics(userId?: string) {
  console.log('Getting analytics for userId:', userId);
  
  if (!userId || userId === 'null' || userId === 'undefined') {
    console.log('No valid userId provided');
    return null;
  }
  
  try {
    // Get user's campaigns and analytics
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.log('Campaigns query error:', campaignsError);
    }

    const { data: videos, error: videosError } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (videosError) {
      console.log('Videos query error:', videosError);
    }

    console.log('Found campaigns:', campaigns?.length || 0);
    console.log('Found videos:', videos?.length || 0);

    // Calculate basic metrics
    const totalVideos = videos?.length || 0;
    const totalCampaigns = campaigns?.length || 0;
    
    // Get recent performance (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentVideos = videos?.filter(v => 
      new Date(v.created_at) > lastWeek
    ) || [];

    const analytics = {
      totalVideos,
      totalCampaigns,
      recentVideos: recentVideos.length,
      campaigns: campaigns?.slice(0, 5), // Last 5 campaigns
      videos: videos?.slice(0, 10) // Last 10 videos
    };

    console.log('Analytics result:', analytics);
    return analytics;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}

const SYSTEM_PROMPT = `You are Relicon AI, an expert advertising and analytics assistant specializing in social media marketing, video ads, and performance optimization.

You have access to the user's campaign and video data. When users ask about their performance, use the provided analytics data to give specific, personalized insights.

Your primary role is to help users:
1. **Analyze their specific campaign performance** using their actual data
2. **Compare metrics over time** (this week vs last week, etc.)
3. **Provide actionable recommendations** based on their performance
4. **Answer questions about their ads** (CTR, views, engagement, costs)
5. **Suggest improvements** for underperforming campaigns
6. **Help with campaign planning** based on past performance

When you have user data, reference specific numbers and campaigns. When you don't have data, ask them to provide more context or suggest they create some campaigns first.

Always be helpful, concise, and provide actionable insights. Keep responses under 200 words.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, message, userId } = await request.json();
    
    console.log('Chat request received:');
    console.log('- userId:', userId);
    console.log('- message:', message);
    console.log('- messages length:', messages?.length);

    // Handle both message formats
    const userMessage = message || (messages && messages[messages.length - 1]?.content);

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user analytics data
    const analytics = await getUserAnalytics(userId);
    console.log('Analytics retrieved:', !!analytics);
    
    // Prepare context for AI
    let contextMessage = '';
    if (analytics && analytics.totalVideos > 0) {
      contextMessage = `
User Analytics Context:
- Total Videos: ${analytics.totalVideos}
- Total Campaigns: ${analytics.totalCampaigns}
- Videos Created This Week: ${analytics.recentVideos}

Recent Campaigns: ${analytics.campaigns?.map(c => 
  `"${c.name}" (${c.campaign_type || c.objective}, created ${new Date(c.created_at).toLocaleDateString()})`
).join(', ') || 'None'}

Recent Videos: ${analytics.videos?.map(v => 
  `"${v.product_name}" (${v.status}, created ${new Date(v.created_at).toLocaleDateString()})`
).join(', ') || 'None'}

Use this data to provide specific insights about the user's performance.
`;
    } else {
      contextMessage = `The user has no video generation data yet. Suggest they create their first video campaign to start tracking analytics. Be encouraging and helpful about getting started with video creation.`;
    }

    console.log('Context message prepared, length:', contextMessage.length);

    console.log('Calling OpenAI API with user context...');
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: contextMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    console.log('OpenAI API success');

    return NextResponse.json({ message: response });

  } catch (error: any) {
    console.error('Chat API error:', error);

    let errorMessage = 'Chat service temporarily unavailable. Please try again.';
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        debug: {
          errorType: error.name,
          errorMessage: error.message,
          hasApiKey: !!process.env.OPENAI_API_KEY
        }
      },
      { status: 500 }
    );
  }
}
