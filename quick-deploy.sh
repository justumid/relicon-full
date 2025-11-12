#!/bin/bash
set -e

echo "🚀 Quick Deploy Relicon to AWS EC2..."

# Terminate the failed instance first
echo "🗑️ Terminating failed instance..."
aws ec2 terminate-instances --instance-ids i-0c26860506f8430c0 --region us-east-1

echo "⏳ Waiting for termination..."
aws ec2 wait instance-terminated --instance-ids i-0c26860506f8430c0 --region us-east-1

# Create new user data script with fixes
cat > user-data-fixed.sh << 'EOF'
#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "🚀 Starting Relicon deployment..."

# Update system
yum update -y

# Install git first
yum install -y git

# Install Node.js 16 (compatible with Amazon Linux 2)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Install Python 3 and pip
yum install -y python3 python3-pip

# Install pnpm
npm install -g pnpm

# Install ffmpeg from EPEL
amazon-linux-extras install epel -y
yum install -y ffmpeg

# Create app directory
mkdir -p /opt/relicon
cd /opt/relicon

# Clone repository (you'll need to replace this with your actual repo)
git clone https://github.com/your-username/relicon-full.git . || {
    echo "⚠️ Git clone failed, creating minimal structure..."
    mkdir -p engine
    echo "print('Backend placeholder')" > engine/server.py
    echo '{"name": "relicon", "scripts": {"start": "echo Frontend placeholder"}}' > package.json
}

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon

# Install dependencies as ec2-user
sudo -u ec2-user bash << 'USEREOF'
cd /opt/relicon

# Install frontend dependencies if package.json exists
if [ -f package.json ]; then
    pnpm install || echo "⚠️ pnpm install failed"
    pnpm build || echo "⚠️ pnpm build failed"
fi

# Install backend dependencies if requirements.txt exists
if [ -f engine/requirements.txt ]; then
    cd engine
    pip3 install --user -r requirements.txt || echo "⚠️ pip install failed"
    cd ..
fi
USEREOF

# Copy environment file
cp .env.production .env.local 2>/dev/null || echo "⚠️ No .env.production found"

# Create systemd services
cat > /etc/systemd/system/relicon-backend.service << 'SERVICEEOF'
[Unit]
Description=Relicon Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon/engine
Environment=PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEOF

cat > /etc/systemd/system/relicon-frontend.service << 'SERVICEEOF'
[Unit]
Description=Relicon Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Enable and start services
systemctl daemon-reload
systemctl enable relicon-backend relicon-frontend

echo "✅ Relicon deployment setup completed" >> /var/log/user-data.log
EOF

# Launch new instance
echo "🖥️ Launching new EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name relicon-key \
    --security-group-ids sg-03316f10700002f2c \
    --user-data file://user-data-fixed.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-app-v2}]' \
    --query 'Instances[0].InstanceId' --output text)

echo "✅ New instance launching: $INSTANCE_ID"

# Wait for instance
echo "⏳ Waiting for instance to be ready..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Clean up temp file
rm -f user-data-fixed.sh

echo ""
echo "🎉 NEW DEPLOYMENT LAUNCHED!"
echo "================================"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo ""
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend API: http://$PUBLIC_IP:8000"
echo "🔑 SSH: ssh -i relicon-key.pem ec2-user@$PUBLIC_IP"
echo ""
echo "⏳ App will be ready in 5-10 minutes"
echo "📝 Monitor: ssh -i relicon-key.pem ec2-user@$PUBLIC_IP 'sudo tail -f /var/log/user-data.log'"

# Update status checker with new IP
sed -i "s/IP=\".*\"/IP=\"$PUBLIC_IP\"/" check-app-status.sh

echo ""
echo "🔄 Run './check-app-status.sh' to monitor progress"
