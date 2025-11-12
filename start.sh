#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Relicon Full Stack${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}🔧 Starting Python backend (port 8000)...${NC}"
cd engine && python3 server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${BLUE}🌐 Starting Next.js frontend (port 5000)...${NC}"
cd ..
pnpm dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "🌐 Frontend: ${GREEN}http://localhost:5000${NC}"
echo -e "🔧 Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "🎬 Studio:   ${GREEN}http://localhost:5000/dashboard/studio${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
