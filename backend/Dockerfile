FROM node:alpine

# Install git (needed for git-based dependencies)
RUN apk add --no-cache git

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy backend package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend/ ./

# Copy models directory from root (needed for imports)
COPY models/ ./models/

EXPOSE 4000

# Run the web service on container startup.
ENTRYPOINT [ "node", "app.js" ]