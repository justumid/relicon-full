#!/bin/bash

# Start FastAPI backend on port 8000 in the background
cd engine
python3 server.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Start Next.js server on Railway's PORT
cd ..
export ENGINE_URL="http://localhost:8000"
export NODE_ENV="production"
node server.js

# If Next.js crashes, kill the backend too
kill $BACKEND_PID
