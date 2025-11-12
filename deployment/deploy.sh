#!/bin/bash
set -e

echo "🚀 Deploying Relicon to AWS EC2..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Create it first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# 1. Create security group
echo "📡 Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name relicon-sg-$(date +%s) \
    --description "Relicon app security group" \
    --query 'GroupId' --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
    --group-names relicon-sg \
    --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)

if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name relicon-sg \
        --description "Relicon app security group" \
        --query 'GroupId' --output text)
fi

# Add security group rules
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp --port 22 --cidr 0.0.0.0/0 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp --port 3000 --cidr 0.0.0.0/0 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp --port 8000 --cidr 0.0.0.0/0 2>/dev/null || true

echo "✅ Security group ready: $SG_ID"

# 2. Create key pair
KEY_NAME="relicon-key"
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME >/dev/null 2>&1; then
    echo "🔑 Creating key pair..."
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --query 'KeyMaterial' \
        --output text > ${KEY_NAME}.pem
    chmod 400 ${KEY_NAME}.pem
    echo "✅ Key saved to ${KEY_NAME}.pem"
else
    echo "✅ Key pair already exists"
fi

# 3. Create user data script
cat > user-data-temp.sh << 'EOF'
#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git

# Install Python 3.11
yum install -y python3 python3-pip

# Install pnpm
npm install -g pnpm

# Install ffmpeg
amazon-linux-extras install epel -y
yum install -y ffmpeg

# Create app directory
mkdir -p /opt/relicon
cd /opt/relicon

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/relicon-full.git .

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon

# Install dependencies as ec2-user
sudo -u ec2-user bash << 'USEREOF'
cd /opt/relicon

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd engine
pip3 install --user -r requirements.txt
cd ..

# Build frontend
pnpm build
USEREOF

# Copy environment file
cp .env.production .env.local

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
After=network.target relicon-backend.service

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
systemctl start relicon-backend
sleep 5
systemctl start relicon-frontend

echo "✅ Relicon deployment completed" >> /var/log/user-data.log
EOF

# 4. Launch EC2 instance
echo "🖥️ Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --user-data file://user-data-temp.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-app}]' \
    --query 'Instances[0].InstanceId' --output text)

echo "✅ Instance launching: $INSTANCE_ID"

# 5. Wait for instance
echo "⏳ Waiting for instance to be ready..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# 6. Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Clean up temp file
rm -f user-data-temp.sh

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "================================"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Security Group: $SG_ID"
echo ""
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend API: http://$PUBLIC_IP:8000"
echo "🔑 SSH: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "⏳ App will be ready in 5-10 minutes"
echo "📝 Check status: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP 'sudo systemctl status relicon-frontend relicon-backend'"
echo ""
echo "🔧 IMPORTANT: Edit environment variables on the server:"
echo "ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo "sudo nano /opt/relicon/.env.local"
echo "sudo systemctl restart relicon-backend relicon-frontend"
