#!/bin/bash

IP="44.212.90.167"
echo "🔍 Checking Relicon app status on $IP..."
echo "========================================"

# Check frontend
echo -n "📱 Frontend (port 3000): "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$IP:3000 || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ READY"
else
    echo "⏳ Setting up... (Status: $FRONTEND_STATUS)"
fi

# Check backend
echo -n "🔧 Backend (port 8000): "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$IP:8000/health || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ READY"
else
    echo "⏳ Setting up... (Status: $BACKEND_STATUS)"
fi

if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo ""
    echo "🎉 RELICON IS READY!"
    echo "📱 Visit: http://$IP:3000"
    echo "🎬 Studio: http://$IP:3000/dashboard/studio"
else
    echo ""
    echo "⏳ Still setting up... Run this script again in 2-3 minutes"
fi
