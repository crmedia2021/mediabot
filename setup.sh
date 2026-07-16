#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# CRMedia Bot — Local Development Setup
# Sets up the full development environment in one command.
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
cat << 'EOF'
  ██████╗██████╗  ██████╗ ██████╗ ██╗██████╗  ██████╗
 ██╔════╝██╔══██╗██╔═══██╗██╔══██╗██║██╔══██╗██╔════╝
 ██║     ██████╔╝██║   ██║██████╔╝██║██║  ██║██║  ███╗
 ██║     ██╔══██╗██║   ██║██╔══██╗██║██║  ██║██║   ██║
 ╚██████╗██║  ██║╚██████╔╝██║  ██║██║██████╔╝╚██████╔╝
  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝
         Bot — Local Development Setup
EOF
echo -e "${NC}"

# ── Check prerequisites ──
info "Checking prerequisites..."

command -v node >/dev/null 2>&1 || err "Node.js is not installed. Install from https://nodejs.org/"
NODE_VER=$(node -v)
ok "Node.js $NODE_VER"

command -v npm >/dev/null 2>&1 || err "npm is not installed."
NPM_VER=$(npm -v)
ok "npm $NPM_VER"

# ── Install dependencies ──
info "Installing npm dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci --prefer-offline 2>/dev/null || npm install
else
  npm install
fi
ok "Dependencies installed"

# ── Check for .env file ──
if [ ! -f ".env" ]; then
  warn "No .env file found. Creating from template..."
  cat > .env << 'ENVEOF'
# ── Convex ──
VITE_CONVEX_URL=

# ── Optional: Vly Monitoring ──
VITE_VLY_APP_ID=
VITE_VLY_MONITORING_URL=

# ── Telegram Bot (for crmedia-bot/) ──
# TELEGRAM_API_ID=
# TELEGRAM_API_HASH=
# TELEGRAM_BOT_TOKEN=

# ── Payment Providers ──
# PAYPAL_CLIENT_ID=
# PAYPAL_CLIENT_SECRET=
# STRIPE_SECRET_KEY=
# TON_WALLET_ADDRESS=
ENVEOF
  warn ".env created — please fill in your values"
fi

# ── Check Convex config ──
if [ -f "convex.json" ]; then
  ok "Convex config found"
else
  warn "No convex.json found — you may need to run 'npx convex dev' first"
fi

# ── Start development ──
echo ""
info "═══════════════════════════════════════════════════"
info " Setup complete! Next steps:"
info "═══════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}1.${NC} Fill in your ${CYAN}.env${NC} file with API keys"
echo -e "  ${GREEN}2.${NC} Run ${CYAN}npx convex dev${NC} to start the backend"
echo -e "  ${GREEN}3.${NC} In another terminal, run ${CYAN}npm run dev${NC} to start the frontend"
echo -e "  ${GREEN}4.${NC} Open ${CYAN}http://localhost:5173${NC} in your browser"
echo ""
echo -e "  ${YELLOW}Optional:${NC} Run ${CYAN}npx convex dev --once${NC} to push schema changes"
echo ""
