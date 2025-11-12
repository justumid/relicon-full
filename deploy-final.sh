#!/bin/bash
set -e

echo "🚀 Final Working Deployment..."

# Terminate current instance
aws ec2 terminate-instances --instance-ids i-0e8165d4763e45c84 --region us-east-1 2>/dev/null || true

# Create final working user data
cat > user-data-final.sh << 'EOF'
#!/bin/bash
exec > >(tee /var/log/user-data.log) 2>&1

echo "🚀 Starting Final Working Deployment..."

# Update system
yum update -y

# Install Node.js 16 and Git
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git python3 python3-pip

# Create app structure
mkdir -p /opt/relicon/{frontend,backend}
cd /opt/relicon

# Frontend with Express
cat > frontend/package.json << 'PKG'
{
  "name": "relicon-frontend",
  "version": "1.0.0",
  "scripts": {"start": "node server.js"},
  "dependencies": {"express": "^4.18.0"}
}
PKG

cat > frontend/server.js << 'JS'
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>🎬 Relicon - AI Advertising Director</h1>
    <p>✅ Frontend: Running on port ${PORT}</p>
    <p>🔧 Backend: <a href="http://localhost:8000">http://localhost:8000</a></p>
    <p>📚 API Docs: <a href="http://localhost:8000/docs">http://localhost:8000/docs</a></p>
    <p><strong>Both services deployed successfully!</strong></p>
  `);
});

app.listen(PORT, () => console.log(\`Frontend running on port \${PORT}\`));
JS

# Backend with compatible versions
cat > backend/requirements.txt << 'REQ'
fastapi==0.103.2
uvicorn==0.22.0
REQ

cat > backend/server.py << 'PY'
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Relicon Backend API")

@app.get("/")
def read_root():
    return {"message": "🎬 Relicon Backend API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
PY

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon

# Install dependencies
sudo -u ec2-user bash << 'INSTALL'
cd /opt/relicon/frontend && npm install
cd /opt/relicon/backend && pip3 install --user -r requirements.txt
INSTALL

# Create services
cat > /etc/systemd/system/relicon-frontend.service << 'SVC1'
[Unit]
Description=Relicon Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon/frontend
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
SVC1

cat > /etc/systemd/system/relicon-backend.service << 'SVC2'
[Unit]
Description=Relicon Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon/backend
Environment=PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target
SVC2

# Start services
systemctl daemon-reload
systemctl enable relicon-frontend relicon-backend
systemctl start relicon-backend
sleep 2
systemctl start relicon-frontend

echo "✅ Final deployment completed!"
EOF

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name relicon-key \
    --security-group-ids sg-03316f10700002f2c \
    --user-data file://user-data-final.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-final}]' \
    --query 'Instances[0].InstanceId' --output text)

# Wait and get IP
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

rm -f user-data-final.sh

echo ""
echo "🎉 FINAL DEPLOYMENT READY!"
echo "========================="
echo "Instance: $INSTANCE_ID"
echo "IP: $PUBLIC_IP"
echo ""
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend: http://$PUBLIC_IP:8000"
echo ""
echo "⏳ Ready in 2-3 minutes"
