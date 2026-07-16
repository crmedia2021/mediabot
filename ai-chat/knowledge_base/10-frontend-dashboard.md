# CRMedia Bot — User Dashboard

## 1. Goal & Scope

The authenticated user's main interface at `/dashboard`. Provides a modern sidebar layout with tabs for overview, downloads, credits, referrals, credit packages (Stripe checkout), and profile settings. This is where users spend most of their time.

## 2. Architecture Visuals

### Dashboard Layout

```mermaid
flowchart TD
    SIDEBAR[Fixed Sidebar] --> MAIN[Main Content Area]
    SIDEBAR --> LOGO[Logo + Toggle]
    SIDEBAR --> NAV[Nav Items: 6 tabs]
    SIDEBAR --> BOTTOM[Admin Link + Home + Sign Out]
    MAIN --> HEADER[Sticky Top Bar: title, mode badge, credits, avatar]
    MAIN --> CONTENT[Tab Content Area]
    CONTENT --> TAB{Active Tab}
    TAB -->|overview| OV[OverviewTab]
    TAB -->|downloads| DL[DownloadsTab]
    TAB -->|credits| CR[CreditsTab]
    TAB -->|referrals| RF[ReferralsTab]
    TAB -->|packages| PK[PackagesTab]
    TAB -->|settings| ST[SettingsTab]
```

### Tab Components

```mermaid
flowchart LR
    subgraph "OverviewTab"
        A[Quick Stats: 4 cards]
        B[Quick Download: URL input]
        C[Recent Downloads: last 5]
    end
    subgraph "DownloadsTab"
        D[Full download history with status badges]
    end
    subgraph "CreditsTab"
        E[Balance display]
        F[Transaction history]
    end
    subgraph "ReferralsTab"
        G[Referral code display]
        H[Apply referral code input]
        I[Referral stats]
    end
    subgraph "PackagesTab"
        J[Credit package cards]
        K[Stripe checkout dialog]
    end
    subgraph "SettingsTab"
        L[Profile name/language edit]
    end
```

### Download Flow from Dashboard

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Dashboard.tsx
    participant CV as Convex API
    participant DB as Database

    U->>FE: Paste URL + Click Download
    FE->>CV: downloads.createDownload(url)
    CV->>DB: Detect platform + check credits
    CV->>DB: Deduct credits (if credit mode)
    CV->>DB: Insert download record
    CV-->>FE: { downloadId, platform, creditsSpent }
    FE->>FE: Clear input, refresh downloads list
```

## 3. Code References

**File:** `src/pages/Dashboard.tsx`

| Component | Lines | Description |
|-----------|-------|-------------|
| `Dashboard` (main) | 73-185 | Sidebar layout, auth check, state management |
| `OverviewTab` | 188-260 | Stats grid, quick download, recent downloads |
| `DownloadsTab` | 263-310 | Full download history with platform badges |
| `CreditsTab` | 313-360 | Balance display, transaction history |
| `ReferralsTab` | 363-420 | Referral code, apply code, stats |
| `PackagesTab` | 423-460 | Credit package cards (uses `StripeCheckout` component) |
| `SettingsTab` | 463-500 | Profile name/language edit |

**State variables:** `activeTab`, `sidebarOpen`, `urlInput`, `downloading`, `copiedCode`, `referralInput`, `applyingReferral`, `checkoutPkg`

**Convex hooks used:**
- Queries: `credits.getBalance`, `credits.getTransactions`, `downloads.getMyDownloads`, `referrals.getMyReferrals`, `settings.getCreditPackages`, `users.getProfile`, `admin.isAdmin`
- Mutations: `users.ensureProfile`, `downloads.createDownload`, `credits.switchMode`, `referrals.applyReferralCode`, `users.updateProfile`, `users.touchLastSeen`

## 4. Edge Cases & Failure Modes

| Scenario | Behavior |
|----------|----------|
| Unauthenticated access | Redirects to `/auth` via useEffect |
| Loading state | Shows spinner with "Loading your dashboard..." |
| Download fails | Console error logged, input not cleared |
| Referral code already used | Backend throws error, caught in catch block |
| Copy referral code | Uses `navigator.clipboard.writeText()`, shows checkmark for 2s |
| Sidebar collapsed | Shows icons only (w-16), toggle expands to w-64 |
| Admin link visible | Only shown if `admin.isAdmin` returns true |
| Stripe checkout opens | Dialog overlay with Stripe Elements payment form |
