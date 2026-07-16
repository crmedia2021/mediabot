**🛑 NO AI AGENT IS PERMITTED TO MODIFY THIS FILE WITHOUT EXPLICIT APPROVAL FROM A HUMAN.**

# CRMedia Bot — Project Rules (PROJECT_RULES.md)

> **IMPORTANT**: This file contains the domain-specific business logic for CRMedia Bot. You MUST have read and understood `ai-chat/SOP.md` before applying the rules in this document.

## ⚠️ TOP RULES

| # | Rule | Symptom if missed |
|---|------|-------------------|
| 1 | **Never hand-edit `src/convex/_generated/*`** | Type errors, broken codegen |
| 2 | **Always run `npx convex dev --once && npx tsc -b --noEmit` after backend changes** | Stale types, runtime errors |
| 3 | **Convex validators must be inline** — don't import validators across files | Codegen failures |
| 4 | **Never run `convex dev` without `--once`** | Hangs indefinitely in CI |
| 5 | **Never `git add .`** — stage files explicitly | Accidental commits of secrets |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Convex (serverless functions) |
| Auth | @convex-dev/auth (email OTP + anonymous) |
| UI | shadcn/ui + Tailwind CSS + Framer Motion |
| Payments | Stripe (@stripe/stripe-js + @stripe/react-stripe-js) |
| Routing | react-router v7 |
| Deployment | Docker / Ansible / manual |

## Protocol Quick Reference

| Action | Command |
|--------|---------|
| **Typecheck frontend** | `npx tsc -b --noEmit` |
| **Typecheck backend** | `npx convex dev --once && npx tsc -b --noEmit` |
| **Install package** | `npm install <pkg>` |
| **Entry Point** | `ai-chat/SOP.md` |
| **Tasks** | `ai-chat/issues.md` |
| **Knowledge Base** | `ai-chat/knowledge_base/` |

## 1. Convex Backend Rules

- All validators must be defined inline in `schema.ts` or in the file that uses them
- Never import `v` validators across Convex function files
- Use `getAuthUserId(ctx)` for all authenticated operations
- Cast `ctx.db.get()` results with `as any` when accessing table-specific fields
- Always check authorization before admin/super_admin operations

## 2. Frontend Rules

- Use lazy imports for route pages in `main.tsx`
- Use shadcn/ui components from `src/components/ui/`
- Import hooks from `react` only (never shadow `useState`, `useMemo`, etc.)
- Use `useQuery`/`useMutation` from `convex/react` for backend calls
- Preserve `src/index.css` Tailwind directives and CSS variables

## 3. Payment Rules

- Stripe webhook endpoint: `/api/stripe-webhook` via `src/convex/http.ts`
- Verify webhook signatures in production (currently simulated)
- Credit packages initialized via `settings.initCreditPackages` mutation
- Payment flow: createCheckoutSession → Stripe Elements → confirmPayment → webhook

## 4. Deployment Rules

- Never run `npm run build` unless explicitly asked
- Never start/restart Vite dev server (it's always running)
- Convex deployment uses `CONVEX_DEPLOY_KEY` and `CONVEX_DEPLOYMENT` env vars
