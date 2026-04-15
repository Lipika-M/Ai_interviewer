# Frontend Dockerfile - React/Vite application
FROM node:18-alpine as build

WORKDIR /app

# Copy root and frontend package files
COPY package.json package-lock.json* ./
COPY frontend/package.json frontend/package-lock.json* ./frontend/

# Install frontend dependencies only
RUN npm ci && cd frontend && npm ci

# Copy frontend source
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built frontend from builder
COPY --from=build /app/frontend/build ./build
COPY --from=build /app/frontend/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Serve frontend with simple HTTP server
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
