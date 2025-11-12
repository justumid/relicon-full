#!/bin/bash

IP="44.201.71.128"
KEY="relicon-key.pem"

echo "🔍 Checking Relicon deployment status on $IP..."
echo "================================================"

# Check if services are running
echo "📊 Service Status:"
ssh -i $KEY -o StrictHostKeyChecking=no ec2-user@$IP 'sudo systemctl is-active relicon-frontend relicon-backend 2>/dev/null || echo "Services not ready yet"'

echo ""
echo "🌐 Testing Frontend (port 3000):"
curl -s -o /dev/null -w "%{http_code}" http://$IP:3000 || echo "Not responding yet"

echo ""
echo "🔧 Testing Backend (port 8000):"
curl -s -o /dev/null -w "%{http_code}" http://$IP:8000/health || echo "Not responding yet"

echo ""
echo "📝 Recent logs:"
ssh -i $KEY -o StrictHostKeyChecking=no ec2-user@$IP 'sudo tail -5 /var/log/cloud-init-output.log 2>/dev/null || echo "Logs not available"'

echo ""
echo "💡 To monitor in real-time:"
echo "ssh -i $KEY ec2-user@$IP 'sudo tail -f /var/log/cloud-init-output.log'"
