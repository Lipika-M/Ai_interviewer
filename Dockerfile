# Multi-stage build for AI Interviewer application

# Build stage for React frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Build stage for Node.js backend
FROM node:18-alpine as backend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY backend/ ./backend/

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install MongoDB client tools
RUN apk add --no-cache mongodb-tools

# Copy backend files
COPY --from=backend-build /app/backend ./backend

# Copy frontend build
COPY --from=frontend-build /app/client/build ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "backend/src/index.js"]
