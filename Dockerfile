# ──────────────────────────────────────────────────────────────────────
# CRMedia Bot — Dockerfile
# Multi-stage build for production deployment.
#
# Build:   docker build -t crmedia-bot .
# Run:     docker run -p 5173:5173 -e VITE_CONVEX_URL=... crmedia-bot
# Compose: docker compose up -d
# ──────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source
COPY . .

# Set build args
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

# Build frontend
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
