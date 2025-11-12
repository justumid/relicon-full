#!/bin/bash

echo "📊 Relicon App Status"
echo "===================="

# Check services
echo "🔧 Services:"
systemctl is-active relicon-frontend && echo "✅ Frontend: Running" || echo "❌ Frontend: Stopped"
systemctl is-active relicon-backend && echo "✅ Backend: Running" || echo "❌ Backend: Stopped"

# Check ports
echo ""
echo "🌐 Ports:"
netstat -tlnp | grep :3000 >/dev/null && echo "✅ Port 3000: Open" || echo "❌ Port 3000: Closed"
netstat -tlnp | grep :8000 >/dev/null && echo "✅ Port 8000: Open" || echo "❌ Port 8000: Closed"

# Check disk space
echo ""
echo "💾 Disk Usage:"
df -h / | tail -1 | awk '{print "Used: " $3 "/" $2 " (" $5 ")"}'

# Check memory
echo ""
echo "🧠 Memory Usage:"
free -h | grep Mem | awk '{print "Used: " $3 "/" $2}'

# Show logs
echo ""
echo "📝 Recent Logs:"
echo "Frontend:"
journalctl -u relicon-frontend --no-pager -n 3
echo ""
echo "Backend:"
journalctl -u relicon-backend --no-pager -n 3
