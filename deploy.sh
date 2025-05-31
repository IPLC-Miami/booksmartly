#!/bin/bash
set -e

echo "Starting deployment..."
cd /var/www/booksmartly

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend  
npm install

echo "Building frontend..."
npm run build

echo "Starting/restarting PM2 process..."
cd ..
pm2 describe booksmartly > /dev/null 2>&1
if [ $? -eq 0 ]; then
    pm2 restart booksmartly
else
    pm2 start backend/app.js --name booksmartly
fi

echo "Deployment completed successfully!"