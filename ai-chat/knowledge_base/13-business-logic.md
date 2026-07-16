# CRMedia Bot — Business Logic

## 1. Goal & Scope

Documents the core business rules governing credit economics, download modes, referral bonuses, payment processing, and admin operations. These rules are the source of truth for product behavior.

## 2. Architecture Visuals

### Credit Economy

```mermaid
flowchart TD
    subgraph "Earn Credits"
        A[Sign up: 10 free credits]
        B[Weekly top-up: 10 credits]
        C[Referral bonus: 5 credits]
        D[Referred bonus: 3 credits]
        E[Stripe purchase: variable]
        F[Admin adjustment: variable]
    end
    subgraph "Spend Credits"
        G[Download in credit mode: 1 credit per download]
    end

    A --> BAL[(Credit Balance)]
    B --> BAL
    C --> BAL
    D --> BAL
    E --> BAL
    F --> BAL
    BAL --> G
```

### Mode Decision Tree

```mermaid
flowchart TD
    A[User requests download] --> B{Global freeModeEnabled?}
    B -->|true| C[ALL users download FREE]
    B -->|false| D{User mode?}
    D -->|free| E[Download FREE]
    D -->|credit| F{Sufficient credits?}
    F -->|true| G[Deduct creditsRate, allow download]
    F -->|false| H[Reject: insufficient credits]
```

### Referral Bonus Rules

```mermaid
flowchart TD
    A[New user enters referral code] --> B{Same as own code?}
    B -->|Yes| C[Reject: self-referral]
    B -->|No| D{Already referred?}
    D -->|Yes| E[Reject: already referred]
    D -->|No| F[Find referrer by code]
    F --> G{Referrer exists?}
    G -->|No| H[Reject: invalid code]
    G -->|Yes| I[Award referrer: referralBonus credits]
    I --> J[Award referred: referredBonus credits]
    J --> K[Create referrals record]
```

### Payment Processing Rules

```mermaid
flowchart TD
    A[User clicks Buy] --> B[Create payment record: pending]
    B --> C[Stripe Elements collects payment]
    C --> D{Payment success?}
    D -->|Yes| E[Webhook: confirmPayment]
    D -->|No| F[failPayment: mark failed]
    E --> G[Mark completed]
    G --> H[Award creditsAwarded to user]
    H --> I[Create credit transaction]
```

## 3. Code References

| Rule | Source File | Function/Constant |
|------|------------|-------------------|
| Free mode bypass | `src/convex/downloads.ts` | `createDownload` line 27: `creditsNeeded = user.mode === "free" ? 0 : creditRate` |
| Credit rate | `src/convex/settings.ts` | `DEFAULT_SETTINGS.creditRate: 1` |
| Weekly top-up amount | `src/convex/settings.ts` | `DEFAULT_SETTINGS.weeklyTopupAmount: 10` |
| Referral bonus | `src/convex/settings.ts` | `DEFAULT_SETTINGS.referralBonus: 5` |
| Referred bonus | `src/convex/settings.ts` | `DEFAULT_SETTINGS.referredBonus: 3` |
| New user credits | `src/convex/users.ts` | `ensureProfile` line 22: `credits: 10` |
| Platform enables | `src/convex/settings.ts` | `DEFAULT_SETTINGS.{platform}Enabled: true` |
| Credit packages | `src/convex/settings.ts` | `initCreditPackages` lines 37-42 |

### Default Credit Packages

| Package | Credits | Price | Badge |
|---------|---------|-------|-------|
| Starter | 50 | $4.99 | — |
| Popular | 150 | $9.99 | "Best Value" |
| Pro | 500 | $19.99 | "Most Credits" |
| Enterprise | 1500 | $49.99 | "Bulk" |

## 4. Edge Cases & Failure Modes

| Scenario | Rule | Enforcement |
|----------|------|-------------|
| Free mode + global enabled | User always downloads free regardless of mode | `downloads.ts` line 27 |
| Credit mode + zero credits | Reject with descriptive error | `downloads.ts` line 36 |
| Weekly top-up already done | Skip if `weeklyTopupLastAt` < 7 days | `credits.ts` line 38 |
| Referral code not found | Throw "Invalid referral code" | `referrals.ts` line 42 |
| Payment idempotency | `confirmPayment` returns `{ already: true }` | `payments.ts` line 22 |
| Admin adjusts below zero | Throw "Cannot reduce credits below 0" | `credits.ts` line 49 |
| Platform disabled globally | Throw descriptive error | `downloads.ts` line 30 |
