#!/bin/bash

echo "🚀 Deploying to Lightsail..."

# Create Lightsail instance
aws lightsail create-instances \
  --instance-names relicon-app \
  --availability-zone us-east-1a \
  --blueprint-id ubuntu_20_04 \
  --bundle-id nano_2_0 \
  --user-data file://lightsail-setup.sh

echo "✅ Lightsail instance creating..."
echo "📝 Get IP: aws lightsail get-instance --instance-name relicon-app"
