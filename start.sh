#!/bin/bash
set -e

echo "🚀 Starting Relicon Services"

# Check environment
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found! Copy .env.local.template and add your API keys."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

if [ ! -d "engine/venv" ]; then
    echo "🐍 Installing Python dependencies..."
    cd engine
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start backend
echo "🐍 Starting backend..."
cd engine
source venv/bin/activate
python3 server.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "⚛️ Starting frontend..."
pnpm dev &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "Frontend: http://localhost:5000"
echo "Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"

# Wait for interrupt
trap "kill $FRONTEND_PID $BACKEND_PID" EXIT
wait
