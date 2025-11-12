#!/bin/bash
# Copy this script to your EC2 instance for easy management

case "$1" in
    "status")
        echo "📊 Relicon Status:"
        sudo systemctl status relicon-frontend relicon-backend --no-pager
        ;;
    "logs")
        echo "📝 Recent logs:"
        echo "=== Frontend ==="
        sudo journalctl -u relicon-frontend --no-pager -n 10
        echo "=== Backend ==="
        sudo journalctl -u relicon-backend --no-pager -n 10
        ;;
    "restart")
        echo "🔄 Restarting services..."
        sudo systemctl restart relicon-backend relicon-frontend
        echo "✅ Services restarted"
        ;;
    "update")
        echo "📦 Updating application..."
        cd /opt/relicon
        git pull
        sudo -u ec2-user pnpm install
        sudo -u ec2-user pnpm build
        sudo systemctl restart relicon-backend relicon-frontend
        echo "✅ Update complete"
        ;;
    "monitor")
        echo "📈 System resources:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
        echo "Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
        echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
        ;;
    *)
        echo "Usage: $0 {status|logs|restart|update|monitor}"
        ;;
esac
