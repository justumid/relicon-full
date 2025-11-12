#!/bin/bash

echo "🚀 Deploying to EC2..."

# 1. Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-app}]'

echo "✅ EC2 instance launching..."
echo "📝 Next steps:"
echo "1. Wait for instance to be ready (2-3 minutes)"
echo "2. Get public IP: aws ec2 describe-instances --filters 'Name=tag:Name,Values=relicon-app'"
echo "3. Access your app at http://PUBLIC_IP:3000"
