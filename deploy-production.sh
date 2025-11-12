#!/bin/bash

# Production Relicon Deployment Script
yum update -y

# Install Node.js 16 and dependencies
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git python3 python3-pip

# Clone the actual project
cd /opt
git clone https://github.com/sardor-dev1/relicon-full.git
cd relicon-full

# Install frontend dependencies
npm install

# Install backend dependencies
cd engine
pip3 install -r requirements.txt
cd ..

# Create environment file with placeholder values
cat > .env.local << 'EOF'
# Database
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_key

# AI Services
OPENAI_API_KEY=placeholder_key
LUMA_API_KEY=placeholder_key
ELEVENLABS_API_KEY=placeholder_key

# Optional
ENGINE_URL=http://localhost:8000
EOF

# Build the frontend
npm run build

# Create systemd service for frontend
cat > /etc/systemd/system/relicon-frontend.service << 'EOF'
[Unit]
Description=Relicon Frontend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon-full
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for backend
cat > /etc/systemd/system/relicon-backend.service << 'EOF'
[Unit]
Description=Relicon Backend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon-full/engine
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=/opt/relicon-full/engine

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon-full

# Enable and start services
systemctl daemon-reload
systemctl enable relicon-backend relicon-frontend
systemctl start relicon-backend
sleep 5
systemctl start relicon-frontend

echo "✅ Production Relicon deployment completed!"
