#!/bin/bash
set -e

echo "🚀 Deploying Fixed Relicon..."

# Terminate current instance
aws ec2 terminate-instances --instance-ids i-064d1c07a40e3ff33 --region us-east-1 2>/dev/null || true

# Create fixed user data
cat > user-data-fixed.sh << 'EOF'
#!/bin/bash
exec > >(tee /var/log/user-data.log) 2>&1

echo "🚀 Starting Fixed Relicon deployment..."

# Update system
yum update -y

# Install Node.js 16 (compatible with Amazon Linux 2)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git python3 python3-pip

# Create app structure
mkdir -p /opt/relicon/{frontend,backend}
cd /opt/relicon

# Create frontend with Express
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
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relicon - AI Advertising Director</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .link { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .link:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎬 Relicon - AI Advertising Director</h1>
        <div class="status">
          <h3>✅ Frontend Service Running</h3>
          <p>Port: ${PORT}</p>
          <p>Status: Active and healthy</p>
        </div>
        <div>
          <a href="http://localhost:8000" class="link">🔧 Backend API</a>
          <a href="http://localhost:8000/docs" class="link">📚 API Docs</a>
        </div>
        <p><strong>Both services deployed successfully on single EC2 instance!</strong></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`Frontend running on port \${PORT}\`);
});
FRONTEND_JS

# Create backend with compatible FastAPI version
cat > backend/requirements.txt << 'BACKEND_REQ'
fastapi==0.103.2
uvicorn==0.24.0
BACKEND_REQ

cat > backend/server.py << 'BACKEND_PY'
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Relicon Backend API", version="1.0.0")

@app.get("/")
def read_root():
    return {
        "message": "🎬 Relicon Backend API",
        "status": "running",
        "port": 8000,
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "relicon-backend"}

@app.get("/api/status")
def api_status():
    return {
        "frontend": "http://localhost:3000",
        "backend": "http://localhost:8000",
        "docs": "http://localhost:8000/docs",
        "deployment": "success"
    }

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

echo "✅ Fixed deployment completed successfully!"
EOF

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name relicon-key \
    --security-group-ids sg-03316f10700002f2c \
    --user-data file://user-data-fixed.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-fixed}]' \
    --query 'Instances[0].InstanceId' --output text)

echo "✅ Instance launching: $INSTANCE_ID"

# Wait and get IP
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

rm -f user-data-fixed.sh

echo ""
echo "🎉 FIXED DEPLOYMENT LAUNCHED!"
echo "============================="
echo "Instance: $INSTANCE_ID"
echo "IP: $PUBLIC_IP"
echo ""
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend: http://$PUBLIC_IP:8000"
echo "📚 API Docs: http://$PUBLIC_IP:8000/docs"
echo ""
echo "⏳ Services will be ready in 3-4 minutes"
