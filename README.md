# GlowLabs - Beauty Salon Management Platform

GlowLabs is a comprehensive beauty salon management platform built with Node.js, Express, GraphQL, and React. This repository contains the complete dockerized application with CI/CD pipeline for deployment to Hostinger VPS.

## 🏗️ Architecture

**Monolithic Structure:**
- **Server**: Node.js/Express with Apollo GraphQL server (Port 4000)
- **Client**: React SPA with Nginx reverse proxy (Port 80)
- **Database**: MongoDB Atlas (External)
- **Containerization**: Docker with multi-stage builds
- **Deployment**: GitHub Actions CI/CD to Hostinger VPS

## 📋 Prerequisites

### Local Development
- Node.js 18+
- npm or yarn
- Git

### Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+

### Production Deployment
- Hostinger VPS with Ubuntu/Debian
- GitHub repository with Actions enabled
- MongoDB Atlas cluster

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/IPLC-Miami/booksmartly.git
cd booksmartly
```

2. **Install server dependencies:**
```bash
npm install
```

3. **Install client dependencies:**
```bash
cd Client
npm install
cd ..
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start development servers:**

**Server (Terminal 1):**
```bash
npm start
# Server runs on http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

**Client (Terminal 2):**
```bash
cd Client
npm start
# Client runs on http://localhost:3000
```

### Docker Development

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

2. **Access the application:**
- Client: http://localhost
- Server: http://localhost:4000
- GraphQL: http://localhost:4000/graphql

3. **Stop the application:**
```bash
docker-compose down
```

## 🐳 Docker Configuration

### Services

#### GlowLabs Server
- **Base Image**: node:18-alpine
- **Port**: 4000
- **Health Check**: HTTP endpoint monitoring
- **Environment**: Production optimized
- **Security**: Non-root user, minimal attack surface

#### GlowLabs Client
- **Build Stage**: node:18-alpine (React build)
- **Runtime Stage**: nginx:alpine
- **Port**: 80
- **Features**: Gzip compression, security headers, SPA routing
- **Health Check**: Nginx status monitoring

### Build Commands

```bash
# Build server image
docker build -t glowlabs-server .

# Build client image
docker build -t glowlabs-client ./Client

# Build both with compose
docker-compose build
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically:

1. **Builds** multi-architecture Docker images (amd64/arm64)
2. **Pushes** images to GitHub Container Registry (GHCR)
3. **Deploys** to production VPS via SSH
4. **Verifies** deployment health
5. **Rolls back** on failure

### Required GitHub Secrets

Configure these secrets in your GitHub repository:

```bash
VPS_SSH_KEY    # Private SSH key for VPS access
VPS_IP         # VPS IP address
GITHUB_TOKEN   # Automatically provided by GitHub
```

### Triggering Deployment

Push to `main` or `main-clean` branches:

```bash
git add .
git commit -m "Deploy new features"
git push origin main
```

## 🖥️ VPS Deployment

### Initial VPS Setup

1. **Run the hardening script:**
```bash
# On your VPS as root
curl -sSL https://raw.githubusercontent.com/IPLC-Miami/booksmartly/main/ops/vps_hardening.sh | bash
```

2. **Configure environment:**
```bash
cd /opt/glowlabs
cp .env.template .env
nano .env  # Add your configuration
```

3. **Add SSH key for GitHub Actions:**
```bash
# On your local machine, copy your public key
cat ~/.ssh/id_rsa.pub

# On VPS, add to authorized_keys
echo "your-public-key-here" >> /root/.ssh/authorized_keys
```

### Manual Deployment

If you need to deploy manually:

```bash
# On VPS
cd /opt/glowlabs
docker-compose pull
docker-compose up -d --remove-orphans
```

### Monitoring

Check deployment status:

```bash
# Container status
docker-compose ps

# Service logs
docker-compose logs -f

# Health check logs
tail -f /opt/glowlabs/logs/health_check.log
```

## 🔧 Configuration

### Environment Variables

Create `.env` file with these variables:

```bash
# Application
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-super-secure-jwt-secret

# Square Payments
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_ENVIRONMENT=production

# Email Service
EMAIL_SERVICE=your-email-service
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
```

### Database Setup

1. **Create MongoDB Atlas cluster**
2. **Configure network access** (allow VPS IP)
3. **Create database user** with read/write permissions
4. **Update connection string** in `.env`

## 🛠️ Development Guide

### Project Structure

```
booksmartly/
├── index.js              # Main server file
├── package.json          # Server dependencies
├── Dockerfile            # Server container config
├── docker-compose.yml    # Multi-service orchestration
├── Client/               # React frontend
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   ├── package.json     # Client dependencies
│   ├── Dockerfile       # Client container config
│   └── nginx.conf       # Nginx configuration
├── .github/workflows/   # CI/CD pipeline
├── ops/                 # Deployment scripts
└── docs/               # Documentation
```

### API Endpoints

#### GraphQL
- **Endpoint**: `/graphql`
- **Playground**: `/graphql` (development only)

#### REST Endpoints
- Health check: `GET /health`
- File uploads: `POST /upload`

### Development Workflow

1. **Create feature branch:**
```bash
git checkout -b feature/new-feature
```

2. **Make changes and test locally:**
```bash
npm start          # Test server
cd Client && npm start  # Test client
```

3. **Test with Docker:**
```bash
docker-compose up --build
```

4. **Commit and push:**
```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

5. **Create pull request** to `main` branch

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Connection Issues
```bash
# Check container logs
docker-compose logs glowlabs-server
docker-compose logs glowlabs-client

# Check network connectivity
docker network ls
docker network inspect booksmartly_glowlabs-network
```

#### Deployment Failures
```bash
# Check VPS logs
ssh root@your-vps-ip "journalctl -u docker -n 50"

# Manual deployment
ssh root@your-vps-ip "cd /opt/glowlabs && docker-compose up -d"
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Application logs
docker-compose logs -f --tail=100

# System monitoring on VPS
htop
df -h
free -h
```

## 🔒 Security

### Implemented Security Measures

- **Container Security**: Non-root users, minimal base images
- **Network Security**: UFW firewall, fail2ban protection
- **Application Security**: JWT authentication, input validation
- **Transport Security**: HTTPS ready (configure reverse proxy)
- **Data Security**: Environment variable isolation

### Security Best Practices

1. **Regularly update** base images and dependencies
2. **Monitor** container vulnerabilities
3. **Backup** database regularly
4. **Rotate** JWT secrets periodically
5. **Monitor** application logs for suspicious activity

## 📊 Monitoring & Logging

### Health Checks

- **Server**: HTTP endpoint monitoring every 30s
- **Client**: Nginx status check every 30s
- **Database**: Connection health in application logs

### Log Management

- **Application logs**: Docker container logs
- **System logs**: VPS system journal
- **Access logs**: Nginx access logs
- **Security logs**: fail2ban logs

### Backup Strategy

```bash
# Database backup (run regularly)
mongodump --uri="your-mongodb-uri" --out=/opt/glowlabs/backups/

# Configuration backup
tar -czf /opt/glowlabs/backups/config-$(date +%Y%m%d).tar.gz /opt/glowlabs/.env
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review application logs for error details

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Deployment Status**: Production Ready ✅
