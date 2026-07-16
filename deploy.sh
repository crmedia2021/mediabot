#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# CRMedia Bot — Production Deployment Script
# Deploys the Convex backend and builds the frontend for production.
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Banner ──
echo -e "${CYAN}"
echo "  CRMedia Bot — Production Deployment"
echo "═══════════════════════════════════════"
echo -e "${NC}"

# ── Validate environment ──
info "Validating environment..."

if [ -z "${CONVEX_DEPLOY_KEY:-}" ]; then
  err "CONVEX_DEPLOY_KEY is not set. Export it before running this script."
fi

if [ -z "${VITE_CONVEX_URL:-}" ]; then
  # Try to read from .env
  if [ -f ".env" ]; then
    export $(grep -E '^VITE_CONVEX_URL=' .env | xargs)
  fi
  if [ -z "${VITE_CONVEX_URL:-}" ]; then
    err "VITE_CONVEX_URL is not set. Add it to .env or export it."
  fi
fi

ok "Environment validated"

# ── Install dependencies ──
info "Installing dependencies..."
npm ci --prefer-offline 2>/dev/null || npm install
ok "Dependencies installed"

# ── Push Convex functions ──
info "Deploying Convex backend functions..."
npx convex dev --once
ok "Convex functions deployed"

# ── TypeScript check ──
info "Running TypeScript type check..."
npx tsc -b --noEmit
ok "TypeScript check passed"

# ── Build frontend ──
info "Building frontend for production..."
npm run build
ok "Frontend built"

# ── Summary ──
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "  Backend:  Convex functions pushed to cloud"
echo "  Frontend: dist/ directory ready to deploy"
echo ""
echo "  Next steps:"
echo "    - Deploy dist/ to Vercel, Netlify, or Cloudflare Pages"
echo "    - Set VITE_CONVEX_URL as an environment variable"
echo "    - Configure custom domain if needed"
echo ""
