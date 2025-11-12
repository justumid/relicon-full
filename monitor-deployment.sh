#!/bin/bash

IP="44.201.71.128"
echo "🚀 Monitoring Relicon Deployment: $IP"
echo "===================================="

while true; do
    echo -n "$(date '+%H:%M:%S') - "
    
    # Test backend
    BACKEND=$(curl -s -w "%{http_code}" http://$IP:8000/health 2>/dev/null)
    if [[ "$BACKEND" == *"200" ]]; then
        echo "✅ Backend: READY"
        break
    else
        echo "⏳ Backend: Setting up..."
    fi
    
    sleep 30
done

echo ""
echo "🎉 DEPLOYMENT READY!"
echo "Frontend: http://$IP:3000"
echo "Backend: http://$IP:8000"
echo "Studio: http://$IP:3000/dashboard/studio"
