# CRMedia Bot — Users Backend

## 1. Goal & Scope

Manages user profiles, authentication state, Telegram linking, and activity tracking. The users module is the foundation — every other module depends on user records existing in the `users` table.

## 2. Architecture Visuals

### User Lifecycle

```mermaid
flowchart TD
    A[User signs in] --> B{Profile exists?}
    B -->|No| C[ensureProfile: create CRMedia row]
    B -->|Yes| D[User active]
    C --> D
    D --> E[touchLastSeen on every visit]
    D --> F[updateProfile: edit name/language]
    D --> G[linkTelegram: connect Telegram]
```

### Profile Initialization Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant CV as users.ts
    participant DB as Database

    FE->>CV: ensureProfile()
    CV->>DB: getAuthUserId(ctx)
    CV->>DB: db.get(userId) — check existing
    alt credits field exists
        CV-->>FE: Already initialized
    else First time
        CV->>CV: generateReferralCode() — 8 chars
        CV->>DB: db.patch(userId, { credits: 10, mode: "free", referralCode, ... })
        CV->>DB: db.insert("activityLogs", { action: "User registered" })
        CV-->>FE: userId
    end
```

## 3. Code References

**File:** `src/convex/users.ts`

| Function | Type | Args | Returns | Description |
|----------|------|------|---------|-------------|
| `currentUser` | query | `{}` | `User \| null` | Get current user profile |
| `getCurrentUser` | helper | `ctx` | `User \| null` | Internal helper for current user |
| `ensureProfile` | mutation | `{}` | `Id<"users">` | Create CRMedia profile if first login |
| `getProfile` | query | `{}` | `User \| null` | Full profile for current user |
| `updateProfile` | mutation | `{ name?, language? }` | `Id<"users">` | Update profile fields |
| `linkTelegram` | mutation | `{ telegramId, telegramUsername? }` | `Id<"users">` | Connect Telegram account |
| `touchLastSeen` | mutation | `{}` | `void` | Update lastSeen timestamp |
| `generateReferralCode` | helper | — | `string` | Generate 8-char alphanumeric code |

## 4. Edge Cases & Failure Modes

| Scenario | Behavior | Code Reference |
|----------|----------|----------------|
| Unauthenticated call | Throws "Not authenticated" | All mutations check `getAuthUserId(ctx)` |
| User not in auth table | Throws "User not found in auth table" | `ensureProfile` line 19 |
| Already initialized | Returns existing `_id` (idempotent) | `ensureProfile` line 17 |
| Referral code collision | Not handled — random generation | `generateReferralCode` |
| Patching non-existent field | Convex ignores unknown fields silently | `db.patch()` behavior |
