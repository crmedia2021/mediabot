# CRMedia Bot — Referrals Backend

## 1. Goal & Scope

Manages the referral system: code generation, referral application, bonus awards, and referral tracking. Referrals are a key growth lever — both referrer and referred earn bonus credits.

## 2. Architecture Visuals

### Referral Flow

```mermaid
sequenceDiagram
    participant A as Referrer
    participant FE as Frontend
    participant CV as referrals.ts
    participant DB as Database
    participant B as Referred User

    A->>FE: Share referral code
    B->>FE: Enter referral code
    FE->>CV: applyReferralCode(code)
    CV->>DB: Find referrer by code
    CV->>DB: Check not self-referral
    CV->>DB: Check not already referred
    CV->>DB: Award referrer bonus (5 credits)
    CV->>DB: Award referred bonus (3 credits)
    CV->>DB: Insert referrals record
    CV->>DB: Insert activity log
    CV-->>FE: { success: true, referredBonus: 3 }
```

### Code Generation

```mermaid
flowchart TD
    A[generateCode called] --> B{User has code?}
    B -->|Yes| C[Return existing code]
    B -->|No| D[generateUniqueCode: 8 random chars]
    D --> E[Save to user.referralCode]
    E --> F[Return code]
```

## 3. Code References

**File:** `src/convex/referrals.ts`

| Function | Type | Args | Returns | Description |
|----------|------|------|---------|-------------|
| `generateCode` | mutation | `{}` | `string` | Generate/get referral code |
| `applyReferralCode` | mutation | `{ referralCode }` | `{ success, referredBonus }` | Apply code, award bonuses |
| `getMyReferrals` | query | `{}` | `{ referralCode, totalReferrals, totalBonusEarned, referredBy }` | Current user's referral info |
| `getAllReferrals` | query | `{ limit? }` | `Referral[]` | Admin: all referrals |

**Key settings used:** `referralBonus` (default 5), `referredBonus` (default 3)

## 4. Edge Cases & Failure Modes

| Scenario | Behavior | Code Reference |
|----------|----------|----------------|
| Self-referral | Throws "Cannot use your own referral code" | `referrals.ts` line 30 |
| Already referred | Throws "You have already been referred" | `referrals.ts` line 34 |
| Invalid code | Throws "Invalid referral code" | `referrals.ts` line 42 |
| Already referred by someone | Throws "You have already been referred" | `referrals.ts` line 48 |
| Admin query non-admin | Returns empty array `[]` | `referrals.ts` line 85 |
| Code collision | Not handled — random 8-char generation | `generateUniqueCode` |
