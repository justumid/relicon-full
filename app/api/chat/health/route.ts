/**
 * Chat API Health Check
 *
 * Quick endpoint to verify OpenAI API key is configured
 * GET /api/chat/health
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const keyLength = process.env.OPENAI_API_KEY?.length || 0;
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || 'none';

  return NextResponse.json({
    status: hasOpenAIKey ? 'healthy' : 'missing_api_key',
    openai_configured: hasOpenAIKey,
    key_length: keyLength,
    key_prefix: keyPrefix,
    environment: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
  });
}
