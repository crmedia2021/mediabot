# CRMedia Bot — Pending Work & Future Improvements

## 1. Goal & Scope

Tracks completed features, in-progress items, and planned improvements. This is the living backlog for the CRMedia Bot project.

## 2. Completed Features ✅

| Feature | Status | Files |
|---------|--------|-------|
| Convex schema (8 tables + indexes) | ✅ Done | `src/convex/schema.ts` |
| User management (profile, mode, credits, tracking) | ✅ Done | `src/convex/users.ts` |
| Credit system (balance, spend, add, switchMode, weeklyTopUp) | ✅ Done | `src/convex/credits.ts` |
| Download system (create, history, platform detection) | ✅ Done | `src/convex/downloads.ts` |
| Referral system (generate, apply, bonuses) | ✅ Done | `src/convex/referrals.ts` |
| Stripe payment integration (checkout, webhook, packages) | ✅ Done | `src/convex/payments.ts`, `src/convex/http.ts`, `src/components/StripeCheckout.tsx` |
| Admin dashboard (analytics, user mgmt, settings, activity) | ✅ Done | `src/pages/Admin.tsx`, `src/convex/admin.ts` |
| Super-admin system config | ✅ Done | `admin.ts::getSystemConfig`, `Admin.tsx::SystemTab` |
| User dashboard (sidebar, all tabs) | ✅ Done | `src/pages/Dashboard.tsx` |
| Landing page (hero, features, platforms, pricing) | ✅ Done | `src/pages/Landing.tsx` |
| Auth (Convex Auth: email OTP + anonymous) | ✅ Done | `src/convex/auth.ts`, `src/hooks/use-auth.ts` |
| Deployment scripts (setup.sh, deploy.sh) | ✅ Done | `setup.sh`, `deploy.sh` |
| Docker support | ✅ Done | `Dockerfile`, `docker-compose.yml` |
| Ansible deployment | ✅ Done | `ansible/` |
| Knowledge base documentation | ✅ Done | `ai-chat/knowledge_base/` |

## 3. In Progress 🔄

| Feature | Status | Notes |
|---------|--------|-------|
| Stripe webhook signature verification | 🔄 TODO | Currently simulated in `http.ts` — needs `stripe.webhooks.constructEvent()` |
| Weekly top-up automation | 🔄 TODO | `weeklyTopUp` mutation exists but needs Convex scheduled functions to run automatically |
| Telegram bot backend | 🔄 TODO | Pyrogram-based bot that mirrors Convex features |

## 4. Future Improvements 📋

### Backend Priority

| Item | Impact | Effort |
|------|--------|--------|
| Rate limiting on API endpoints | High | Medium |
| Content moderation for download URLs | Medium | Low |
| Background job queue for large downloads | Medium | High |
| Multi-language support (i18n) | Medium | Medium |
| Database backup automation | High | Low |
| Scheduled weekly top-up via Convex cron | High | Low |

### Frontend Priority

| Item | Impact | Effort |
|------|--------|--------|
| Dark/light theme toggle | Medium | Low |
| Mobile responsive sidebar (drawer) | High | Medium |
| Real-time download progress indicators | High | High |
| Recharts analytics in Admin dashboard | Medium | Medium |
| User profile settings page | Medium | Low |
| Notification center | Medium | High |

### DevOps Priority

| Item | Impact | Effort |
|------|--------|--------|
| CI/CD pipeline (GitHub Actions) | High | Medium |
| Environment-based deployments (staging/prod) | High | Medium |
| Monitoring & alerting (Sentry) | High | Low |
| Load testing | Medium | Medium |

### Business Priority

| Item | Impact | Effort |
|------|--------|--------|
| Telegram bot (Pyrogram) | High | High |
| PayPal payment integration | Medium | Medium |
| Cryptocurrency payment support | Low | High |
| Subscription/recurring billing | Medium | High |
| Multi-tier referral program | Medium | Medium |
| API documentation (OpenAPI/Swagger) | Medium | Medium |

## 5. Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Stripe webhook not verifying signatures | High | Security risk in production |
| No rate limiting | Medium | Vulnerable to abuse |
| Referral code collision possible | Low | Random 8-char generation |
| `getSettingsMap()` duplicated in 3 files | Low | Should extract to shared utility |
