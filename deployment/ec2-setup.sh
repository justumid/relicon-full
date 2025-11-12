#!/bin/bash

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Python 3.11
yum install -y python3 python3-pip git

# Install pnpm
npm install -g pnpm

# Install ffmpeg for video processing
yum install -y epel-release
yum install -y ffmpeg

# Clone repository
cd /home/ec2-user
git clone https://github.com/your-username/relicon-full.git
cd relicon-full

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/relicon-full

# Switch to ec2-user for installations
sudo -u ec2-user bash << 'EOF'
cd /home/ec2-user/relicon-full

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd engine
pip3 install --user -r requirements.txt
cd ..

# Create environment file
cp .env.local.template .env.local

# Create systemd services
EOF

# Create systemd service for frontend
cat > /etc/systemd/system/relicon-frontend.service << 'EOF'
[Unit]
Description=Relicon Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/relicon-full
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for backend
cat > /etc/systemd/system/relicon-backend.service << 'EOF'
[Unit]
Description=Relicon Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/relicon-full/engine
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
systemctl daemon-reload
systemctl enable relicon-frontend
systemctl enable relicon-backend

# Build frontend first
sudo -u ec2-user bash << 'EOF'
cd /home/ec2-user/relicon-full
pnpm build
EOF

# Start services
systemctl start relicon-backend
systemctl start relicon-frontend
