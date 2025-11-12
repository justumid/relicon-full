#!/bin/bash

echo "🔧 Setting up environment variables..."

# Get instance IP
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create production environment file
cat > /home/ec2-user/relicon-full/.env.local << EOF
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# AI Services
OPENAI_API_KEY=sk-...
LUMA_API_KEY=luma_...
ELEVENLABS_API_KEY=...

# Backend URL
ENGINE_URL=http://$INSTANCE_IP:8000

# Optional
HAILUO_API_KEY=...
ADMIN_API_KEY=admin123
EOF

echo "✅ Environment file created at /home/ec2-user/relicon-full/.env.local"
echo "📝 Edit this file with your actual API keys"
