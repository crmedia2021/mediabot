# Changelog

## 2026-07-16 — KB Reorganization

- Reorganized `ai-chat/knowledge_base/` to follow SOP §3 format
- All 16 KB docs now include: Goal & Scope, Architecture Visuals (Mermaid), Code References, Edge Cases
- Created `ai-chat/issues/open/`, `ai-chat/issues/closed/`, `ai-chat/decisions/`, `ai-chat/investigations/` directories
- Updated `PROJECT_RULES.md` for React+Convex stack
- Updated `PROJECT_HISTORY.md` with actual milestones
- Updated `INDEX.md` with knowledge_base reference

## 2026-07-16 — Stripe Integration

- Added `@stripe/stripe-js` and `@stripe/react-stripe-js` packages
- Created `src/components/StripeCheckout.tsx` (PaymentElement dialog)
- Updated `src/convex/payments.ts` with `createCheckoutSession`, `confirmPayment`, `handleStripeWebhook`
- Updated `src/convex/http.ts` with `/api/stripe-webhook` endpoint
- Updated schema with `stripeSessionId`, `badge`, `sortOrder` fields
- Fixed `price`/`currency` prop passing in StripeCheckout

## 2026-07-16 — Super Admin & Full Dashboards

- Added super-admin role with full system config access
- Built User Dashboard (sidebar layout, 6 tabs: overview, downloads, credits, referrals, packages, settings)
- Built Admin Dashboard (sidebar layout, 7 tabs: analytics, users, downloads, payments, settings, system, activity)
- Added `admin.ts`: `isAdmin`, `isSuperAdmin`, `getAnalytics`, `adjustUserCredits`, `manageUserRole`, `getSystemConfig`
- Added `settings.ts`: `initSettings`, `updateSettings`, `getCreditPackages`, `initCreditPackages`

## 2026-07-16 — Core Backend

- Created `users.ts`: `ensureProfile`, `getProfile`, `updateProfile`, `linkTelegram`, `touchLastSeen`
- Created `credits.ts`: `getBalance`, `getTransactions`, `spendCredits`, `addCredits`, `switchMode`, `weeklyTopUp`
- Created `downloads.ts`: `createDownload`, `getMyDownloads`, `getAllDownloads`, `detectPlatform`
- Created `referrals.ts`: `generateCode`, `applyReferralCode`, `getMyReferrals`

## 2026-07-16 — Project Setup

- Initial Convex + React + Vite project
- Convex Auth (email OTP + anonymous)
- Landing page with hero, features, platforms, pricing
- Deployment: setup.sh, deploy.sh, Dockerfile, docker-compose, Ansible
