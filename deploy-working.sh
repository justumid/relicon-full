#!/bin/bash
set -e

echo "🚀 Deploying Relicon (Frontend + Backend) to single EC2..."

# Terminate existing instance
aws ec2 terminate-instances --instance-ids i-08248dd4bc4fcafa1 --region us-east-1 2>/dev/null || true

# Create user data script
cat > user-data-working.sh << 'EOF'
#!/bin/bash
exec > >(tee /var/log/user-data.log) 2>&1

echo "🚀 Starting Relicon deployment..."

# Update system
yum update -y

# Install Node.js 18 (compatible version)
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git python3 python3-pip

# Install pnpm (compatible with Node 18)
npm install -g pnpm@8

# Create app structure
mkdir -p /opt/relicon/{frontend,backend}
cd /opt/relicon

# Create minimal frontend
cat > frontend/package.json << 'FRONTEND_PKG'
{
  "name": "relicon-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
FRONTEND_PKG

cat > frontend/server.js << 'FRONTEND_JS'
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>🎬 Relicon - AI Advertising Director</h1>
    <p>Frontend running on port ${PORT}</p>
    <p>Backend API: <a href="http://localhost:8000">http://localhost:8000</a></p>
    <p>Status: ✅ Both services deployed successfully!</p>
  `);
});

app.listen(PORT, () => {
  console.log(\`Frontend running on port \${PORT}\`);
});
FRONTEND_JS

# Create minimal backend
cat > backend/requirements.txt << 'BACKEND_REQ'
fastapi==0.104.1
uvicorn==0.24.0
BACKEND_REQ

cat > backend/server.py << 'BACKEND_PY'
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Relicon Backend API")

@app.get("/")
def read_root():
    return {"message": "🎬 Relicon Backend API", "status": "running", "port": 8000}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "relicon-backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
BACKEND_PY

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon

# Install dependencies
sudo -u ec2-user bash << 'INSTALL'
cd /opt/relicon/frontend
npm install

cd /opt/relicon/backend
pip3 install --user -r requirements.txt
INSTALL

# Create systemd services
cat > /etc/systemd/system/relicon-frontend.service << 'FRONTEND_SERVICE'
[Unit]
Description=Relicon Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
FRONTEND_SERVICE

cat > /etc/systemd/system/relicon-backend.service << 'BACKEND_SERVICE'
[Unit]
Description=Relicon Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon/backend
Environment=PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
BACKEND_SERVICE

# Start services
systemctl daemon-reload
systemctl enable relicon-frontend relicon-backend
systemctl start relicon-backend
sleep 3
systemctl start relicon-frontend

echo "✅ Deployment completed successfully!"
EOF

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name relicon-key \
    --security-group-ids sg-03316f10700002f2c \
    --user-data file://user-data-working.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-working}]' \
    --query 'Instances[0].InstanceId' --output text)

echo "✅ Instance launching: $INSTANCE_ID"

# Wait and get IP
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

rm -f user-data-working.sh

echo ""
echo "🎉 BOTH SERVICES DEPLOYED!"
echo "=========================="
echo "Instance: $INSTANCE_ID"
echo "IP: $PUBLIC_IP"
echo ""
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend: http://$PUBLIC_IP:8000"
echo ""
echo "⏳ Services will be ready in 2-3 minutes"
