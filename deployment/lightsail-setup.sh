#!/bin/bash
apt update && apt upgrade -y
apt install -y docker.io git nodejs npm python3 python3-pip

# Install pnpm
npm install -g pnpm

# Clone repo
git clone https://github.com/your-username/relicon-full.git
cd relicon-full

# Quick setup
cp .env.local.template .env.local
# Edit .env.local with your keys

# Install and run
pnpm install
cd engine && pip3 install -r requirements.txt && cd ..

# Start services
nohup pnpm dev > frontend.log 2>&1 &
nohup python3 engine/server.py > backend.log 2>&1 &
