#!/bin/bash

# Setup script for BookSmartly webhook handler on VPS
# Run this script on your VPS (145.223.73.170) as root

echo "Setting up BookSmartly webhook handler..."

# Install dependencies if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create webhook directory
WEBHOOK_DIR="/root/webhook-handler"
mkdir -p $WEBHOOK_DIR

# Copy webhook handler script
cp webhook-handler.js $WEBHOOK_DIR/
cd $WEBHOOK_DIR

# Initialize package.json and install dependencies
cat > package.json << EOF
{
  "name": "booksmartly-webhook-handler",
  "version": "1.0.0",
  "description": "Webhook handler for BookSmartly VPS deployment",
  "main": "webhook-handler.js",
  "scripts": {
    "start": "node webhook-handler.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "Installing Node.js dependencies..."
npm install

# Create environment file
cat > .env << EOF
WEBHOOK_PORT=9000
WEBHOOK_SECRET=your-webhook-secret-here
REPO_PATH=/root/BookSmartly
EOF

echo "Environment file created at $WEBHOOK_DIR/.env"
echo "Please update the WEBHOOK_SECRET in .env file!"

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'webhook-handler',
    script: './webhook-handler.js',
    env: {
      NODE_ENV: 'production',
      WEBHOOK_PORT: 9000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Setup firewall rule for webhook port
echo "Setting up firewall rule for port 9000..."
ufw allow 9000/tcp

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the WEBHOOK_SECRET in $WEBHOOK_DIR/.env"
echo "2. Start the webhook handler: pm2 start ecosystem.config.js"
echo "3. Configure your GitHub webhook URL to: http://145.223.73.170:9000/webhook"
echo "4. Set the webhook secret in GitHub to match your .env file"
echo "5. Test the webhook: curl http://145.223.73.170:9000/health"
echo ""
echo "To view logs: pm2 logs webhook-handler"
echo "To restart: pm2 restart webhook-handler"