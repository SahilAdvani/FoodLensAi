#!/bin/bash
# EC2 Deployment Script (Linux)
IMAGE_NAME="sahiladvani/foodlens-backend"
TAG="latest"

echo "Pulling latest image..."
docker pull $IMAGE_NAME:$TAG

echo "Stopping existing container..."
docker stop foodlens-backend || true
docker rm foodlens-backend || true

echo "Starting new container..."
docker run -d \
  --name foodlens-backend \
  -p 10000:10000 \
  --env-file .env \
  --restart unless-stopped \
  $IMAGE_NAME:$TAG

echo "Deployment complete. Checking logs..."
docker logs --tail 20 foodlens-backend
