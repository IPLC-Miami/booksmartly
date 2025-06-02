# GitHub Webhook Troubleshooting Guide

## Problem Analysis

Your GitHub webhook is failing with "failed to connect to host" error. This indicates that GitHub cannot reach the webhook endpoint you've configured.

## Root Cause

You have **two deployment systems** configured:
1. **GitHub Actions** (recommended) - runs on GitHub's servers
2. **GitHub Webhook** (currently failing) - requires a handler on your VPS

## Solution Options

### Option 1: Remove Webhook (Recommended)

Since you already have GitHub Actions set up, the webhook is redundant:

1. Go to: `https://github.com/IPLC-Miami/booksmartly/settings/hooks`
2. Find the failing webhook
3. Click **Delete** to remove it
4. GitHub Actions will handle all deployments automatically

### Option 2: Fix Webhook Handler

If you prefer webhooks over GitHub Actions:

#### Step 1: Setup Webhook Handler on VPS

```bash
# On your VPS (145.223.73.170)
cd /root
git clone https://github.com/IPLC-Miami/booksmartly.git temp-repo
cp temp-repo/webhook-handler.js .
cp temp-repo/setup-webhook-handler.sh .
rm -rf temp-repo

# Make setup script executable
chmod +x setup-webhook-handler.sh

# Run setup
./setup-webhook-handler.sh
```

#### Step 2: Configure Environment

```bash
# Edit the environment file
nano /root/webhook-handler/.env

# Update these values:
WEBHOOK_SECRET=your-secure-secret-here-123456
WEBHOOK_PORT=9000
REPO_PATH=/root/BookSmartly
```

#### Step 3: Start Webhook Handler

```bash
cd /root/webhook-handler
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Update GitHub Webhook Configuration

1. Go to: `https://github.com/IPLC-Miami/booksmartly/settings/hooks`
2. Edit the existing webhook or create new one:
   - **Payload URL**: `http://145.223.73.170:9000/webhook`
   - **Content type**: `application/json`
   - **Secret**: Use the same secret from your `.env` file
   - **Events**: Select "Just the push event"
   - **Active**: ✓ Checked

#### Step 5: Test Webhook

```bash
# Test health endpoint
curl http://145.223.73.170:9000/health

# Check webhook handler logs
pm2 logs webhook-handler
```

## Current Webhook Error Details

From your webhook payload:
- **Repository**: IPLC-Miami/booksmartly
- **Branch**: feature/cureit-integration
- **Commit**: 50e82a956557e494b653daf26b9c0f018ef286f9
- **Error**: "failed to connect to host"
- **Time**: 2025-06-02 09:23:13

## Recommended Action

**I recommend Option 1 (Remove Webhook)** because:

1. ✅ **GitHub Actions is already configured** and working
2. ✅ **More secure** - no need to expose webhook ports
3. ✅ **More reliable** - runs on GitHub's infrastructure
4. ✅ **Better logging** - GitHub provides detailed logs
5. ✅ **No VPS maintenance** - no webhook handler to manage

## GitHub Actions vs Webhooks Comparison

| Feature | GitHub Actions | Webhooks |
|---------|---------------|----------|
| **Security** | SSH keys only | Exposed HTTP endpoint |
| **Reliability** | GitHub infrastructure | Depends on VPS uptime |
| **Maintenance** | Zero | Webhook handler updates |
| **Logs** | GitHub UI | VPS logs |
| **Setup** | One-time SSH key | Handler + firewall + monitoring |

## Next Steps

1. **If choosing Option 1**: Simply delete the webhook from GitHub settings
2. **If choosing Option 2**: Follow the setup steps above
3. **Test deployment**: Make a commit to `feature/cureit-integration` branch

The GitHub Actions workflow is already configured and will automatically deploy when you push to the `feature/cureit-integration` branch.