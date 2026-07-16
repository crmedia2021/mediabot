# AI-CHAT Documentation Index

## Core Operational Documents (Tier 1)

| Document | Purpose | Editable by AI? |
|----------|---------|-----------------|
| [SOP.md](SOP.md) | Universal agent protocols and governance | ❌ Human only |
| [PROJECT_RULES.md](PROJECT_RULES.md) | CRMedia Bot business logic & tech rules | ❌ Human only |
| [README.md](README.md) | Human context for the ai-chat folder | ❌ Human only |

## Decentralized State (Tier 2 — AI may create/edit files)

| Directory | Purpose |
|-----------|---------|
| [issues/open/](issues/open/) | Active tasks and bugs |
| [issues/closed/](issues/closed/) | Completed tasks |
| [decisions/](decisions/) | Architectural Decision Records (ADRs) |
| [investigations/](investigations/) | Bug investigation reports |
| [knowledge_base/](knowledge_base/) | Technical documentation (16 files) |
| [audit_logs/](audit_logs/) | Weekly hygiene audit logs |
| [plans/](plans/) | Implementation plans |
| [archive/](archive/) | Archived/rotated files |

## Knowledge Base — Technical Documentation

| # | Document | Description |
|---|----------|-------------|
| 00 | [architecture](knowledge_base/00-architecture.md) | System design, tech stack, data flow |
| 01 | [schema](knowledge_base/01-schema.md) | All 8 database tables with ER diagram |
| 02 | [users](knowledge_base/02-backend-users.md) | User management backend |
| 03 | [credits](knowledge_base/03-backend-credits.md) | Credit economy backend |
| 04 | [downloads](knowledge_base/04-backend-downloads.md) | Download system backend |
| 05 | [referrals](knowledge_base/05-backend-referrals.md) | Referral system backend |
| 06 | [payments](knowledge_base/06-backend-payments.md) | Stripe payment backend |
| 07 | [settings](knowledge_base/07-backend-settings.md) | Bot settings backend |
| 08 | [admin](knowledge_base/08-backend-admin.md) | Admin operations backend |
| 09 | [landing](knowledge_base/09-frontend-landing.md) | Landing page frontend |
| 10 | [dashboard](knowledge_base/10-frontend-dashboard.md) | User dashboard frontend |
| 11 | [admin-ui](knowledge_base/11-frontend-admin.md) | Admin dashboard frontend |
| 12 | [auth](knowledge_base/12-auth-flow.md) | Authentication flow |
| 13 | [business-logic](knowledge_base/13-business-logic.md) | Business rules |
| 14 | [stripe](knowledge_base/14-stripe-integration.md) | Stripe integration |
| 15 | [pending](knowledge_base/15-pending-work.md) | Pending work & TODOs |

## Utilities

| File | Purpose |
|------|---------|
| [utils/build_index.py](utils/build_index.py) | Rebuild INDEX.md from directory contents |
| [utils/archive_rotation.py](utils/archive_rotation.py) | Archive old tracking files |

## Agent Templates

| Template | Role |
|----------|------|
| [CODER_PROMPT.md](templates/CODER_PROMPT.md) | Standard code execution |
| [CODER-WRITER_PROMPT.md](templates/CODER-WRITER_PROMPT.md) | Ad-hoc fast-track with docs |
| [DEBUGGER_PROMPT.md](templates/DEBUGGER_PROMPT.md) | Read-only investigation |
| [DEBUGGER-WRITER_PROMPT.md](templates/DEBUGGER-WRITER_PROMPT.md) | Investigation + docs |
| [VERIFIER_PROMPT.md](templates/VERIFIER_PROMPT.md) | Pre-commit verification |

## Project Structure

```
crmedia-bot/
├── src/convex/          # Backend: 8 Convex function files
├── src/pages/           # Frontend: Landing, Auth, Dashboard, Admin
├── src/components/      # StripeCheckout, UI components (shadcn/ui)
├── src/hooks/           # use-auth.ts
├── ansible/             # Deployment automation
├── ai-chat/             # This AI collaboration workspace
│   ├── knowledge_base/  # Technical documentation (↑ above)
│   ├── issues/          # Task tracking (open/closed)
│   ├── decisions/       # ADRs
│   ├── investigations/  # Bug reports
│   ├── templates/       # Agent prompt templates
│   └── utils/           # Build/archival utilities
└── README.md            # Project overview & quick start
```
