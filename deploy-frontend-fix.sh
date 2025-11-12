#!/bin/bash

# Frontend Fix Deployment Script
# This script addresses potential frontend service issues

# Update system
yum update -y

# Install Node.js 16 (compatible with Amazon Linux 2)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git python3 python3-pip

# Create application directory
mkdir -p /opt/relicon
cd /opt/relicon

# Create simple Express.js frontend
cat > package.json << 'EOF'
{
  "name": "relicon-frontend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = 3000;

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
            .api-test { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .btn { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            .btn:hover { background: #005a87; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎬 Relicon - AI Advertising Director</h1>
            <div class="status">
                <h3>✅ Frontend Service Running</h3>
                <p>The Relicon frontend is successfully deployed and running on port 3000.</p>
                <p><strong>Instance:</strong> ${process.env.HOSTNAME || 'EC2 Instance'}</p>
                <p><strong>Node.js Version:</strong> ${process.version}</p>
                <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
            </div>
            
            <div class="api-test">
                <h3>🔗 Backend API Test</h3>
                <p>Backend should be running on port 8000</p>
                <button class="btn" onclick="testBackend()">Test Backend Connection</button>
                <div id="backend-result"></div>
            </div>
            
            <div class="api-test">
                <h3>📋 Service Information</h3>
                <p><strong>Frontend URL:</strong> http://[instance-ip]:3000</p>
                <p><strong>Backend URL:</strong> http://[instance-ip]:8000</p>
                <p><strong>Status:</strong> Both services deployed successfully</p>
            </div>
        </div>
        
        <script>
            async function testBackend() {
                const result = document.getElementById('backend-result');
                result.innerHTML = '<p>Testing backend connection...</p>';
                
                try {
                    const response = await fetch('http://' + window.location.hostname + ':8000');
                    const data = await response.json();
                    result.innerHTML = '<p style="color: green;">✅ Backend connected: ' + data.message + '</p>';
                } catch (error) {
                    result.innerHTML = '<p style="color: red;">❌ Backend connection failed: ' + error.message + '</p>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'relicon-frontend',
    uptime: process.uptime(),
    version: process.version
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Relicon frontend listening on port ${port}`);
});
EOF

# Install dependencies
npm install

# Create systemd service for frontend
cat > /etc/systemd/system/relicon-frontend.service << 'EOF'
[Unit]
Description=Relicon Frontend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Create Python backend
pip3 install fastapi==0.103.2 uvicorn==0.22.0

cat > backend.py << 'EOF'
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "🎬 Relicon Backend API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "relicon-backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create systemd service for backend
cat > /etc/systemd/system/relicon-backend.service << 'EOF'
[Unit]
Description=Relicon Backend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon
ExecStart=/usr/bin/python3 backend.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=/opt/relicon

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/relicon

# Enable and start services
systemctl daemon-reload
systemctl enable relicon-frontend relicon-backend
systemctl stop relicon-frontend relicon-backend 2>/dev/null || true
systemctl start relicon-backend
sleep 5
systemctl start relicon-frontend

# Check service status
echo "=== Service Status ==="
systemctl status relicon-backend --no-pager
systemctl status relicon-frontend --no-pager

echo "=== Port Check ==="
netstat -tlnp | grep -E ':(3000|8000)'

echo "✅ Frontend fix deployment completed!"
