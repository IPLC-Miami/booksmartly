# BookSmartly VPS Deployment Setup Guide

This guide will help you set up automatic deployment to your VPS (145.223.73.170) using GitHub Actions for the `feature/cureit-integration` branch.

## 🏗️ Project Structure Analysis

Based on the repository analysis, BookSmartly consists of:

### Core Components:
- **Backend**: Node.js/Express app (`backend/app.js`) - Main API server
- **Frontend**: React/Vite app (`frontend/`) - User interface
- **ML Model**: FastAPI service (`ml_model/main.py`) - AI specialist recommendations
- **Chatbot**: FastAPI service (`ml_model/chatbot/main1.py`) - FAQ chatbot
- **Report Service**: Python service (`ml_model/report/main.py`) - Analytics
- **Sentiment Analysis**: Python service (`ml_model/sentiment/main2.py`) - Feedback analysis

### Key Features:
- Real-time appointment booking and queue management
- AI-powered clinician specialization suggestions
- Multi-role dashboards (Patient, Clinician, Reception, Health Worker)
- WebSocket-based real-time updates
- Redis caching for performance
- Supabase integration for database and auth

## 🔧 Prerequisites

### On Your VPS (145.223.73.170):
1. **Node.js** (v16 or higher)
2. **Python 3.8+** with pip
3. **PM2** for process management
4. **Git** configured
5. **Redis** server running
6. **Nginx** (optional, for reverse proxy)

### Installation Commands for VPS:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt update
sudo apt install python3 python3-pip -y

# Install PM2 globally
sudo npm install -g pm2

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Clone your repository (if not already done)
cd /root
git clone https://github.com/YOUR_USERNAME/BookSmartly.git
cd BookSmartly
git checkout feature/cureit-integration
```

## 🔐 Step 1: Generate SSH Key Pair

### On your local machine:
```bash
# Generate a new SSH key pair specifically for deployment
ssh-keygen -t rsa -b 4096 -C "github-actions-booksmartly" -f ~/.ssh/booksmartly_deploy

# This creates two files:
# ~/.ssh/booksmartly_deploy (private key)
# ~/.ssh/booksmartly_deploy.pub (public key)
```

### Copy the public key to your VPS:
```bash
# Copy public key to VPS
ssh-copy-id -i ~/.ssh/booksmartly_deploy.pub root@145.223.73.170

# Or manually add it:
cat ~/.ssh/booksmartly_deploy.pub | ssh root@145.223.73.170 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Test the connection:
```bash
ssh -i ~/.ssh/booksmartly_deploy root@145.223.73.170
```

## 🔑 Step 2: Set Up GitHub Secrets

### In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secret:

**Secret Name**: `VPS_SSH_PRIVATE_KEY`
**Secret Value**: Copy the entire content of your private key file:
```bash
cat ~/.ssh/booksmartly_deploy
```

Copy everything including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[key content]
-----END OPENSSH PRIVATE KEY-----
```

## 🚀 Step 3: Configure VPS Environment

### Create environment files on your VPS:

```bash
# SSH into your VPS
ssh root@145.223.73.170

# Navigate to project directory
cd /root/BookSmartly

# Create backend environment file
cat > backend/.env << 'EOF'
PORT=8000
NODE_ENV=production
FRONTEND_URL=http://145.223.73.170:3000
# Add your other environment variables here
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
# REDIS_URL=redis://localhost:6379
# Add other required environment variables
EOF

# Create frontend environment file
cat > frontend/.env << 'EOF'
VITE_API_URL=http://145.223.73.170:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
# Add other frontend environment variables
EOF
```

### Set up PM2 ecosystem file (optional but recommended):
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'booksmartly-backend',
      script: './backend/app.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    },
    {
      name: 'booksmartly-ml',
      script: './ml_model/main.py',
      interpreter: 'python3',
      env: {
        PORT: 8001
      }
    },
    {
      name: 'booksmartly-chatbot',
      script: './ml_model/chatbot/main1.py',
      interpreter: 'python3',
      env: {
        PORT: 8002
      }
    },
    {
      name: 'booksmartly-report',
      script: './ml_model/report/main.py',
      interpreter: 'python3',
      env: {
        PORT: 8003
      }
    },
    {
      name: 'booksmartly-sentiment',
      script: './ml_model/sentiment/main2.py',
      interpreter: 'python3',
      env: {
        PORT: 8004
      }
    }
  ]
};
EOF
```

## 🔄 Step 4: Initial Manual Setup

### Run the initial setup manually on your VPS:

```bash
cd /root/BookSmartly

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

# Install Python dependencies
cd ../ml_model
pip3 install -r requirements.txt

# Install chatbot dependencies
cd chatbot
pip3 install -r requirements.txt
cd ..

# Install other ML service dependencies if they exist
if [ -f report/requirements.txt ]; then
  cd report && pip3 install -r requirements.txt && cd ..
fi

if [ -f sentiment/requirements.txt ]; then
  cd sentiment && pip3 install -r requirements.txt && cd ..
fi

cd ..

# Start services with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Step 5: Configure Nginx (Optional but Recommended)

### Create Nginx configuration:
```bash
sudo apt install nginx -y

cat > /etc/nginx/sites-available/booksmartly << 'EOF'
server {
    listen 80;
    server_name 145.223.73.170;

    # Serve frontend static files
    location / {
        root /root/BookSmartly/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy ML model requests
    location /ml/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy chatbot requests
    location /chatbot/ {
        proxy_pass http://localhost:8002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/booksmartly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🧪 Step 6: Test the Deployment

### Trigger the workflow:
1. Make a small change to any file in the `feature/cureit-integration` branch
2. Commit and push:
```bash
git add .
git commit -m "Test automatic deployment"
git push origin feature/cureit-integration
```

3. Go to your GitHub repository → **Actions** tab
4. Watch the deployment workflow run

### Manual testing:
```bash
# Test backend
curl http://145.223.73.170:8000/

# Test ML model
curl http://145.223.73.170:8001/

# Check PM2 status
ssh root@145.223.73.170 "pm2 status"
```

## 🔍 Troubleshooting

### Common Issues:

1. **SSH Connection Failed**:
   - Verify SSH key is correctly added to GitHub secrets
   - Test SSH connection manually
   - Check VPS firewall settings

2. **PM2 Processes Not Starting**:
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Check port conflicts

3. **Build Failures**:
   - Check Node.js and Python versions
   - Verify all dependencies are installed
   - Check disk space: `df -h`

4. **Service Not Responding**:
   - Check if ports are open: `netstat -tlnp`
   - Verify firewall rules: `ufw status`
   - Check service logs: `pm2 logs [service-name]`

### Useful Commands:
```bash
# Check deployment logs
ssh root@145.223.73.170 "pm2 logs --lines 50"

# Restart all services
ssh root@145.223.73.170 "pm2 restart all"

# Check system resources
ssh root@145.223.73.170 "htop"

# View recent deployments
ssh root@145.223.73.170 "ls -la /root/BookSmartly_backup_*"
```

## 🎯 What Gets Deployed Automatically

When you push to the `feature/cureit-integration` branch, the workflow will:

1. ✅ Pull latest code from GitHub
2. ✅ Install/update Node.js dependencies (backend & frontend)
3. ✅ Build frontend for production
4. ✅ Install/update Python dependencies (ML services)
5. ✅ Restart all services using PM2
6. ✅ Verify deployment health
7. ✅ Create automatic backups

## 🔒 Security Considerations

- SSH keys are stored securely in GitHub secrets
- Production environment variables are kept on the VPS
- Services run with appropriate permissions
- Regular backups are created before each deployment
- Failed deployments don't affect running services

## 📊 Monitoring

After deployment, monitor your services:
- **PM2 Dashboard**: `pm2 monit`
- **System Resources**: `htop` or `top`
- **Service Logs**: `pm2 logs`
- **Application Health**: Check endpoints manually

Your BookSmartly application should now automatically deploy whenever you push changes to the `feature/cureit-integration` branch! 🚀