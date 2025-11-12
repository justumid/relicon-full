#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./verify.sh PUBLIC_IP"
    exit 1
fi

PUBLIC_IP=$1

echo "🔍 Verifying Relicon deployment..."

# Test frontend
echo "📱 Testing frontend..."
if curl -s "http://$PUBLIC_IP:3000" | grep -q "Relicon"; then
    echo "✅ Frontend: Working"
else
    echo "❌ Frontend: Not responding"
fi

# Test backend
echo "🔧 Testing backend..."
if curl -s "http://$PUBLIC_IP:8000/health" | grep -q "ok"; then
    echo "✅ Backend: Working"
else
    echo "❌ Backend: Not responding"
fi

echo ""
echo "🌐 Access your app:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:8000"
