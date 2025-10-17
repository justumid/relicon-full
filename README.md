# Relicon - AI Advertising Director

<p align="center">
  <img src="public/images/relicon-website-screenshot02.png" alt="Relicon Website Preview" width="100%">
</p>
## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components

**Backend:**
- FastAPI (Python 3.11)
- Supabase (PostgreSQL database)
- AI Services:
  - OpenAI GPT-4o
  - Luma AI Ray-2
  - ElevenLabs TTS & Music

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.11
- Supabase account (free tier works fine)
- API Keys: OPENAI_API_KEY, LUMA_API_KEY, ELEVENLABS_API_KEY

### Installation

```bash
# Install dependencies
pnpm install

# Set up Supabase (see SUPABASE_SETUP.md for detailed instructions)
# 1. Create a Supabase project at https://app.supabase.com
# 2. Run the SQL schema from supabase-schema.sql
# 3. Copy .env.example to .env.local and add your credentials

# Start development servers
pnpm dev              # Frontend on port 5000
cd engine && python server.py  # Backend on port 8000
```

### Environment Variables

**Required for Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Required for AI Video Generation:**
- `OPENAI_API_KEY` - GPT-4o API key
- `LUMA_API_KEY` - Luma AI API key (Ray-2 model)
- `ELEVENLABS_API_KEY` - ElevenLabs API key

**Optional:**
- `ADMIN_API_KEY` - For admin endpoints
- `HAILUO_API_KEY` - Fallback video provider

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup instructions.

## Project Structure

```
├── app/                  # Next.js pages
│   ├── dashboard/       # Dashboard section
│   │   ├── studio/     # Creative Studio
│   │   ├── ads/        # Ads archive
│   │   └── chat/       # AI assistant
│   └── api/            # API routes
├── components/          # React components
├── engine/             # AI ad generation backend
│   ├── core/          # Services (orchestrator, planning, video, audio)
│   ├── providers/     # AI providers (OpenAI, Luma, ElevenLabs)
│   ├── config/        # Configuration
│   └── server.py      # FastAPI server
└── public/            # Static assets

```

## License

Proprietary - All rights reserved
