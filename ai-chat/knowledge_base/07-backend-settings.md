# CRMedia Bot — Settings Backend

## 1. Goal & Scope

Manages bot configuration (key-value settings) and credit packages. Settings control global behavior (mode toggles, credit rates, platform enables) while credit packages define purchasable bundles.

## 2. Architecture Visuals

### Settings Flow

```mermaid
flowchart TD
    A[Admin opens Settings] --> B[getSettings: load all key-value pairs]
    B --> C[Admin toggles/edits]
    C --> D[updateSettings: upsert key-value pairs]
    D --> E[Insert activity log]
```

### Credit Package Initialization

```mermaid
flowchart TD
    A[initCreditPackages called] --> B{Packages exist?}
    B -->|Yes| C[Return already: true]
    B -->|No| D[Insert 4 default packages]
    D --> E[Starter: 50 credits / $4.99]
    D --> F[Popular: 150 credits / $9.99]
    D --> G[Pro: 500 credits / $19.99]
    D --> H[Enterprise: 1500 credits / $49.99]
```

### Default Settings

```mermaid
graph LR
    subgraph "Mode"
        A[freeModeEnabled: true]
        B[weeklyTopupEnabled: true]
        C[weeklyTopupAmount: 10]
    end
    subgraph "Credits"
        D[creditRate: 1]
        E[referralBonus: 5]
        F[referredBonus: 3]
    end
    subgraph "Platforms"
        G[youtubeEnabled: true]
        H[instagramEnabled: true]
        I[tiktokEnabled: true]
        J[twitterEnabled: true]
        K[facebookEnabled: true]
    end
```

## 3. Code References

**File:** `src/convex/settings.ts`

| Function | Type | Args | Returns | Description |
|----------|------|------|---------|-------------|
| `initSettings` | mutation | `{}` | `{ created, total }` | Seed default settings (idempotent) |
| `getSettings` | query | `{}` | `Record<string, any>` | All settings as key-value map |
| `updateSettings` | mutation | `{ settings: Record<string, any> }` | `{ updated }` | Upsert settings (admin only) |
| `getCreditPackages` | query | `{}` | `CreditPackage[]` | Active credit packages |
| `initCreditPackages` | mutation | `{}` | `{ created }` or `{ already: true }` | Seed default packages |
| `getSetting` | query | `{ key }` | `any` | Single setting value |

**Default settings defined:** `DEFAULT_SETTINGS` constant in `settings.ts` lines 8-24

## 4. Edge Cases & Failure Modes

| Scenario | Behavior | Code Reference |
|----------|----------|----------------|
| Settings already initialized | Skips existing keys, only creates new ones | `initSettings` line 15 |
| Non-admin update | Throws "Not authorized" | `updateSettings` line 24 |
| Packages already exist | Returns `{ already: true }` | `initCreditPackages` line 35 |
| Unknown setting key | Creates new setting with empty description | `updateSettings` line 29 |
| Settings read by other modules | Each module has its own `getSettingsMap()` helper | `credits.ts`, `downloads.ts`, `referrals.ts` |
