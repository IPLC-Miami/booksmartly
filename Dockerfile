# GlowLabs Server Dockerfile - Node.js/Express/GraphQL
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Remove Client directory and other non-server files to reduce image size
RUN rm -rf Client/ emails/ models/ schema/ validation/ \
    createAdminTokens.js createTokens.js getMainImage.js imageFinderFunction.js \
    css.css LICENSE.txt README.md

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S glowlabs -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R glowlabs:nodejs /app
USER glowlabs

# Expose port 4000 (GlowLabs server port)
EXPOSE 4000

# Health check to ensure server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 4000, timeout: 2000 }; \
    const request = http.request(options, (res) => { \
        console.log('Health check passed'); process.exit(0); \
    }); \
    request.on('error', () => { console.log('Health check failed'); process.exit(1); }); \
    request.end();"

# Start the application
CMD ["node", "index.js"]