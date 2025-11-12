#!/bin/bash

echo "🚀 Deploying Relicon to EC2 t3.micro..."

# 1. Create security group
echo "📡 Creating security group..."
SG_ID=$(aws ec2 create-security-group \
  --group-name relicon-sg \
  --description "Relicon app security group" \
  --query 'GroupId' --output text)

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8000 \
  --cidr 0.0.0.0/0

echo "✅ Security group created: $SG_ID"

# 2. Create key pair (if doesn't exist)
if ! aws ec2 describe-key-pairs --key-names relicon-key >/dev/null 2>&1; then
  echo "🔑 Creating key pair..."
  aws ec2 create-key-pair \
    --key-name relicon-key \
    --query 'KeyMaterial' \
    --output text > relicon-key.pem
  chmod 400 relicon-key.pem
  echo "✅ Key saved to relicon-key.pem"
fi

# 3. Launch EC2 instance
echo "🖥️ Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name relicon-key \
  --security-group-ids $SG_ID \
  --user-data file://ec2-setup.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=relicon-app}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "✅ Instance launching: $INSTANCE_ID"

# 4. Wait for instance to be running
echo "⏳ Waiting for instance to be ready..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# 5. Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "🎉 Deployment complete!"
echo "📱 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend API: http://$PUBLIC_IP:8000"
echo "🔑 SSH: ssh -i relicon-key.pem ec2-user@$PUBLIC_IP"
echo ""
echo "⏳ App will be ready in 3-5 minutes (installing dependencies)"
