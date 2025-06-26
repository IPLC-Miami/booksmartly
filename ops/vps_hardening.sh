#!/bin/bash

# GlowLabs VPS Hardening Script
# This script hardens a Ubuntu/Debian VPS for Docker deployment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting VPS hardening for GlowLabs deployment..."

# Update system packages
log "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    ntp \
    ufw \
    fail2ban \
    logrotate \
    rsyslog \
    ca-certificates \
    gnupg \
    lsb-release

# Configure automatic security updates
log "Configuring automatic security updates..."
apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Configure firewall
log "Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4000/tcp  # GlowLabs server port
ufw --force enable

# Configure fail2ban
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Install Docker
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configure Docker daemon
log "Configuring Docker daemon..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "userland-proxy": false,
  "live-restore": true
}
EOF

# Start and enable Docker
systemctl enable docker
systemctl start docker

# Create application directory
log "Creating application directory..."
mkdir -p /opt/glowlabs
cd /opt/glowlabs

# Create logs directory with proper permissions
mkdir -p logs
chmod 755 logs

# Create environment file template
cat > .env.template << 'EOF'
# GlowLabs Environment Configuration
NODE_ENV=production
PORT=4000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Square Payment Configuration
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_ENVIRONMENT=production

# Email Configuration
EMAIL_SERVICE=your-email-service
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password

# Other configurations...
EOF

warn "Please copy .env.template to .env and configure with your actual values"

# Configure logrotate for application logs
log "Configuring log rotation..."
cat > /etc/logrotate.d/glowlabs << 'EOF'
/opt/glowlabs/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/glowlabs/docker-compose.yml restart || true
    endscript
}
EOF

# Configure system limits
log "Configuring system limits..."
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

# Configure sysctl for better performance
log "Configuring kernel parameters..."
cat >> /etc/sysctl.conf << 'EOF'
# Network performance tuning
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# Security
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
EOF

sysctl -p

# Set up basic monitoring
log "Setting up basic monitoring..."
cat > /opt/glowlabs/health_check.sh << 'EOF'
#!/bin/bash

# Simple health check script for GlowLabs
LOG_FILE="/opt/glowlabs/logs/health_check.log"

check_service() {
    local service_name=$1
    local url=$2
    
    if curl -f -s --max-time 10 "$url" > /dev/null; then
        echo "$(date): ✅ $service_name is healthy" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): ❌ $service_name is not responding" >> "$LOG_FILE"
        return 1
    fi
}

# Check services
check_service "GlowLabs Server" "http://localhost:4000/graphql"
check_service "GlowLabs Client" "http://localhost/"

# Check Docker containers
docker ps --filter "name=glowlabs" --format "table {{.Names}}\t{{.Status}}" >> "$LOG_FILE"
EOF

chmod +x /opt/glowlabs/health_check.sh

# Add cron job for health checks
echo "*/5 * * * * /opt/glowlabs/health_check.sh" | crontab -

# Secure SSH (basic hardening)
log "Hardening SSH configuration..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

systemctl restart sshd

# Clean up
log "Cleaning up..."
apt autoremove -y
apt autoclean

log "VPS hardening completed successfully!"
log "Next steps:"
echo "1. Configure .env file with your actual environment variables"
echo "2. Add your SSH public key to /root/.ssh/authorized_keys"
echo "3. Configure GitHub secrets: VPS_SSH_KEY and VPS_IP"
echo "4. Deploy your application using the GitHub Actions workflow"

warn "Remember to test SSH access before closing your current session!"