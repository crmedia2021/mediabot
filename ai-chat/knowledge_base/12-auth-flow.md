# CRMedia Bot — Authentication Flow

## 1. Goal & Scope

Handles user authentication via Convex Auth with two providers: Email OTP (primary) and Anonymous (guest). Auth is the gateway — every authenticated feature depends on it working correctly.

## 2. Architecture Visuals

### Auth Architecture

```mermaid
flowchart TD
    subgraph "Frontend"
        A[Auth.tsx: Login page]
        B[useAuth hook]
        C[ConvexAuthProvider]
    end
    subgraph "Convex Auth"
        D[auth.ts: convexAuth config]
        E[auth.config.ts: JWT config]
        F[Email OTP provider]
        G[Anonymous provider]
    end
    subgraph "Database"
        H[authTables: sessions, accounts]
        I[users: CRMedia profile]
    end

    A --> D
    B --> C
    C --> D
    D --> F
    D --> G
    F --> H
    G --> H
    H --> I
```

### Email OTP Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Auth.tsx
    participant CA as Convex Auth
    participant DB as Database

    U->>FE: Enter email
    FE->>CA: signIn(emailOtp, { email })
    CA->>CA: Generate OTP code
    CA->>CA: Send email with code
    CA-->>FE: Return to enter code
    U->>FE: Enter OTP code
    FE->>CA: signIn(emailOtp, { code })
    CA->>DB: Verify code + create session
    CA-->>FE: Auth token set
    FE->>CV: users.ensureProfile()
    CV->>DB: Create/update CRMedia profile
    FE->>FE: Redirect to /dashboard
```

### Anonymous Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Auth.tsx
    participant CA as Convex Auth
    participant DB as Database

    U->>FE: Click "Continue as Guest"
    FE->>CA: signIn(Anonymous)
    CA->>DB: Create anonymous session
    CA-->>FE: Auth token set
    FE->>CV: users.ensureProfile()
    CV->>DB: Create CRMedia profile (isAnonymous: true)
    FE->>FE: Redirect to /dashboard
```

## 3. Code References

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/convex/auth.ts` | Convex Auth configuration | `auth`, `signIn`, `signOut`, `store`, `isAuthenticated` |
| `src/convex/auth.config.ts` | JWT issuer config | Default auth config with `customJwt` provider |
| `src/convex/auth/emailOtp.ts` | Email OTP provider | Custom email OTP implementation |
| `src/hooks/use-auth.ts` | React hook for auth state | `useAuth()` → `{ isLoading, isAuthenticated, user, signIn, signOut }` |
| `src/pages/Auth.tsx` | Login/signup page UI | Email input, OTP verification, anonymous button |

### Auth Provider Chain

```typescript
// src/convex/auth.ts
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous],
});
```

## 4. Edge Cases & Failure Modes

| Scenario | Behavior | Code Reference |
|----------|----------|----------------|
| Expired OTP code | Convex Auth returns error, user retries | `auth/emailOtp.ts` |
| Anonymous user upgrades | Profile already exists, `ensureProfile` is idempotent | `users.ts` line 17 |
| Auth token expired | Convex handles refresh automatically | `@convex-dev/auth` |
| Multiple tabs | Each tab has independent auth state | Convex Auth behavior |
| `VLY_CONVEX_AUTH_ISSUER` not set | Falls back to `CONVEX_SITE_URL` or localhost | `auth.config.ts` line 5 |
