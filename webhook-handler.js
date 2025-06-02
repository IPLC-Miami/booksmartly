#!/usr/bin/env node

/**
 * Simple webhook handler for BookSmartly VPS deployment
 * This script should run on your VPS to handle GitHub webhook requests
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
const REPO_PATH = '/root/BookSmartly';

// Middleware to parse JSON and verify webhook signature
app.use(express.json());

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify webhook signature
  if (!verifySignature(payload, signature)) {
    console.log('Invalid signature');
    return res.status(401).send('Unauthorized');
  }

  const { ref, repository } = req.body;
  
  // Only deploy on pushes to feature/cureit-integration branch
  if (ref !== 'refs/heads/feature/cureit-integration') {
    console.log(`Ignoring push to ${ref}`);
    return res.status(200).send('Ignored - not target branch');
  }

  console.log(`Received webhook for ${repository.full_name} on ${ref}`);
  
  // Start deployment process
  deployApplication()
    .then(() => {
      console.log('Deployment completed successfully');
      res.status(200).send('Deployment successful');
    })
    .catch((error) => {
      console.error('Deployment failed:', error);
      res.status(500).send('Deployment failed');
    });
});

async function deployApplication() {
  return new Promise((resolve, reject) => {
    const deployScript = `
      cd ${REPO_PATH} &&
      echo "Creating backup..." &&
      cp -r ${REPO_PATH} ${REPO_PATH}_backup_$(date +%Y%m%d_%H%M%S) &&
      echo "Pulling latest code..." &&
      git fetch origin &&
      git reset --hard origin/feature/cureit-integration &&
      echo "Installing backend dependencies..." &&
      cd backend && npm install --production &&
      echo "Building frontend..." &&
      cd ../frontend && npm install && npm run build &&
      echo "Installing Python dependencies..." &&
      cd ../ml_model && pip3 install -r requirements.txt &&
      cd chatbot && pip3 install -r requirements.txt &&
      cd ../.. &&
      echo "Restarting services..." &&
      pm2 restart all &&
      echo "Deployment complete!"
    `;

    exec(deployScript, (error, stdout, stderr) => {
      if (error) {
        console.error('Deployment error:', error);
        console.error('stderr:', stderr);
        reject(error);
      } else {
        console.log('Deployment output:', stdout);
        resolve();
      }
    });
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Webhook handler is running');
});

app.listen(PORT, () => {
  console.log(`Webhook handler listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});