#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Clone and run
cd /home/ec2-user
git clone https://github.com/your-username/relicon-full.git
cd relicon-full

# Build and run
docker build -t relicon .
docker run -d -p 3000:3000 -p 8000:8000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e LUMA_API_KEY="$LUMA_API_KEY" \
  -e ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY" \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  relicon
