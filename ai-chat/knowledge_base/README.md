# CRMedia Bot — Knowledge Base

> Deep-dive technical documentation following SOP §3 (Agentic Feature Documentation Standards).
> Every file contains: Goal & Scope, Architecture Visuals (Mermaid), Code References, Edge Cases.

## Documentation Index

| # | File | Description |
|---|------|-------------|
| 00 | [architecture](00-architecture.md) | System design, tech stack, data flow, deployment topology |
| 01 | [schema](01-schema.md) | All 8 Convex database tables with ER diagram |
| 02 | [users](02-backend-users.md) | User management: profile, auth, Telegram linking |
| 03 | [credits](03-backend-credits.md) | Credit economy: balance, spend, earn, weekly top-up |
| 04 | [downloads](04-backend-downloads.md) | Download requests, platform detection, credit deduction |
| 05 | [referrals](05-backend-referrals.md) | Referral codes, bonus awards, tracking |
| 06 | [payments](06-backend-payments.md) | Stripe checkout, webhooks, payment history |
| 07 | [settings](07-backend-settings.md) | Bot config (key-value), credit packages |
| 08 | [admin](08-backend-admin.md) | Admin/super-admin operations, analytics, user mgmt |
| 09 | [landing](09-frontend-landing.md) | Landing page: hero, features, pricing, CTA |
| 10 | [dashboard](10-frontend-dashboard.md) | User dashboard: sidebar, tabs, all features |
| 11 | [admin-ui](11-frontend-admin.md) | Admin dashboard: analytics, users, settings, activity |
| 12 | [auth](12-auth-flow.md) | Convex Auth: email OTP, anonymous, session flow |
| 13 | [business-logic](13-business-logic.md) | Credit rules, referral bonuses, mode switching |
| 14 | [stripe](14-stripe-integration.md) | Stripe integration: checkout, webhook, setup |
| 15 | [pending](15-pending-work.md) | Completed features, TODOs, future improvements |

## Quick Reference

- **Tech Stack**: React 19 + TypeScript + Vite + Convex + shadcn/ui + Tailwind + Stripe
- **Backend**: 8 Convex function files in `src/convex/`
- **Frontend**: 4 pages (Landing, Auth, Dashboard, Admin) + StripeCheckout component
- **Database**: 8 tables (users, creditTransactions, downloads, referrals, payments, settings, creditPackages, activityLogs)
- **Auth**: Convex Auth with email OTP + anonymous
- **Payments**: Stripe with Checkout, Elements, and webhooks
- **Roles**: super_admin > admin > user > member
