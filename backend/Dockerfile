# Backend Dockerfile - Isolated Node.js/Express application
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install backend dependencies only
RUN npm ci --only=production && \
    cd backend && npm ci --only=production

# Copy backend source code
COPY backend/src ./backend/src
COPY backend/.env ./backend/.env

# Install MongoDB client tools (optional, for debugging)
RUN apk add --no-cache mongodb-tools

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start backend
CMD ["node", "backend/src/index.js"]
