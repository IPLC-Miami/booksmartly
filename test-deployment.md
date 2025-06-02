# GitHub Actions Deployment Test

This file was created to test the GitHub Actions deployment workflow.

**Test Details:**
- Date: June 2, 2025
- Time: 9:49 AM EST
- Purpose: Verify GitHub Actions deployment to VPS (145.223.73.170)
- Branch: feature/cureit-integration

**Expected Behavior:**
1. Push to feature/cureit-integration branch triggers GitHub Actions
2. Workflow connects to VPS via SSH
3. Code is pulled and deployed
4. Services are restarted via PM2
5. Health checks verify deployment success

**Deployment Components:**
- Backend (Node.js) - Port 8000
- Frontend (React/Vite) - Build and serve
- ML Model (FastAPI) - Port 8001
- Chatbot (FastAPI) - Port 8002
- Report Service (Python) - Port 8003
- Sentiment Analysis (Python) - Port 8004

This test will confirm the webhook issue is resolved and GitHub Actions is working properly.