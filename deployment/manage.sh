#!/bin/bash

case "$1" in
  "start")
    echo "🚀 Starting Relicon services..."
    sudo systemctl start relicon-backend
    sudo systemctl start relicon-frontend
    ;;
  "stop")
    echo "🛑 Stopping Relicon services..."
    sudo systemctl stop relicon-frontend
    sudo systemctl stop relicon-backend
    ;;
  "restart")
    echo "🔄 Restarting Relicon services..."
    sudo systemctl restart relicon-backend
    sudo systemctl restart relicon-frontend
    ;;
  "status")
    ./monitor.sh
    ;;
  "logs")
    echo "📝 Backend logs:"
    sudo journalctl -u relicon-backend -f
    ;;
  "update")
    echo "📦 Updating application..."
    cd /home/ec2-user/relicon-full
    git pull
    pnpm install
    pnpm build
    sudo systemctl restart relicon-backend
    sudo systemctl restart relicon-frontend
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|update}"
    ;;
esac
