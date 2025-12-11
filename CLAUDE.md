# Hyprive Hyperdrive Dashboard

A B2B SaaS dashboard for influencer marketing campaign management built with Next.js 16, AlignUI, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16.0.7 (App Router, React 19.2.1, Turbopack)
- **Styling**: Tailwind CSS 4.1.17 (CSS-first with @theme)
- **Design System**: AlignUI with OKLCH colors
- **Language**: TypeScript 5 (strict mode)
- **Authentication**: Better-Auth 1.4.5 (OAuth, Passkey, 2FA, Magic Links, Email OTP)
- **Data Fetching**: TanStack React Query 5.90.11
- **State Management**: Zustand 5.0.9
- **Forms**: React Hook Form 7.67 + Zod 4.1.13
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion 11.13.3
- **HTTP Client**: Axios 1.13.2
- **Charts**: Recharts 3.5.1
- **Tables**: TanStack React Table 8.21.3
- **Notifications**: Sonner 2.0.0
- **Package Manager**: pnpm 10.12.1

---

## Project Structure

```
├── app/
│   ├── (auth)/                 # Auth route group
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── verify/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx        # Main dashboard
│   │       ├── campaigns/      # Campaign management
│   │       ├── enrollments/    # Enrollment tracking
│   │       ├── invoices/       # Billing & invoices
│   │       ├── wallet/         # Wallet & transactions
│   │       ├── settings/       # Organization settings
│   │       ├── profile/        # User profile
│   │       ├── security/       # 2FA, passkeys, sessions
│   │       ├── team/           # Team management
│   │       └── products/       # Product catalog
│   ├── (onboarding)/           # Onboarding flow
│   ├── api/                    # API routes
│   │   ├── auth/[...all]/      # Better-Auth handler
│   │   ├── campaigns/          # Campaign CRUD
│   │   ├── enrollments/        # Enrollment CRUD
│   │   ├── invoices/           # Invoice listing
│   │   ├── wallet/             # Wallet & transactions
│   │   └── dashboard/          # Dashboard metrics
│   ├── actions/                # Server actions
│   ├── globals.css             # Tailwind v4 theme
│   ├── providers.tsx           # Client providers
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # AlignUI components (79 files)
│   ├── dashboard/              # Dashboard components (39 files)
│   └── claude-generated-components/  # Pre-built complex components
├── hooks/                      # Custom React hooks
├── lib/
│   ├── types/                  # TypeScript definitions
│   ├── auth/                   # Better-Auth UI components (140+ files)
│   ├── data/                   # Server-side data fetching
│   ├── mocks/                  # Mock data
│   ├── auth-client.ts          # Better-Auth client config
│   ├── axios.ts                # Axios instance with interceptors
│   ├── query-client.tsx        # React Query provider
│   └── utils/                  # Utility functions
└── docs/                       # Documentation
```

---

## Core Entities & Types

All types defined in `lib/types/index.ts`:

### Business Entities
- `User`, `TeamMember`, `Invitation`
- `Organization` (business details, verification, billing)
- `Campaign` (status, dates, limits, deliverables)
- `Enrollment` (OCR data, submissions, history)
- `WalletBalance`, `Transaction`, `ActiveHold`
- `Invoice`, `InvoiceLineItem`
- `Product`, `Notification`

### Status Enums
- `CampaignStatus`: draft, pending_review, approved, active, paused, completed, cancelled
- `EnrollmentStatus`: pending, approved, rejected, completed, expired
- `TransactionType`: payout, withdrawal, refund, adjustment, hold, release
- `InvoiceStatus`: draft, pending, paid, overdue, cancelled

### Query Keys (for React Query)
```tsx
import { QUERY_KEYS, STALE_TIMES } from '@/lib/types'

QUERY_KEYS.CAMPAIGNS    // 'campaigns'
QUERY_KEYS.ENROLLMENTS  // 'enrollments'
QUERY_KEYS.INVOICES     // 'invoices'
QUERY_KEYS.WALLET       // 'wallet'
QUERY_KEYS.DASHBOARD    // 'dashboard'

STALE_TIMES.REALTIME    // 30 seconds
STALE_TIMES.STANDARD    // 60 seconds
STALE_TIMES.STATIC      // 5 minutes
```

---

## Data Fetching Patterns

### Server-Side (RSC)
```tsx
// In page.tsx or layout.tsx
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getDashboardData()
  return <DashboardClient initialData={data} />
}
```

### Client-Side (React Query)
```tsx
import { useCampaigns, useCampaign, useCreateCampaign } from '@/hooks/use-campaigns'

// List with filters
const { data, isLoading } = useCampaigns({ status: 'active', page: 1 })

// Single item
const { data: campaign } = useCampaign(id)

// Mutations
const { mutate: createCampaign } = useCreateCampaign()
```

### Generic Hooks (lib/hooks/use-api.ts)
```tsx
import { useFetch, useFetchList, useCreate, useUpdate, useDelete } from '@/hooks/use-api'

// Generic patterns available for any entity
const { data } = useFetch<Campaign>('/api/campaigns/123', QUERY_KEYS.CAMPAIGNS)
const { data: list } = useFetchList<Campaign>('/api/campaigns', QUERY_KEYS.CAMPAIGNS)
```

---

## Authentication

### Better-Auth Setup
Configured in `lib/auth-client.ts` with plugins:
- OAuth (Google, GitHub, etc.)
- Passkey (WebAuthn)
- Two-Factor Authentication
- Magic Links
- Email OTP
- Organization management
- Multi-session support

### Auth Client Usage
```tsx
import { authClient } from '@/lib/auth-client'

// Sign in
await authClient.signIn.email({ email, password })
await authClient.signIn.social({ provider: 'google' })

// Session
const session = await authClient.getSession()

// Sign out
await authClient.signOut()
```

### Protected Routes
Dashboard routes use `(dashboard)` route group with auth checks in layout.tsx.

---

## Next.js 16 Patterns

### Async Params (CRITICAL)
```tsx
// params and searchParams are Promises in v16
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page } = await searchParams
}
```

### Server Actions
```tsx
// app/actions/campaigns.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createCampaign(formData: FormData) {
  // Validate with Zod
  // Create campaign
  revalidateTag('campaigns')
  return { success: true }
}
```

### Route Handlers
```tsx
// app/api/campaigns/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  // Return paginated data
  return NextResponse.json({ data, meta })
}
```

---

## AlignUI Design System

### Semantic Colors
```tsx
// Backgrounds
bg-bg-white-0      // Primary
bg-bg-weak-50      // Secondary
bg-bg-soft-200     // Tertiary
bg-bg-surface-800  // Surface
bg-bg-strong-950   // Strong/inverted

// Text
text-text-strong-950   // Primary
text-text-sub-600      // Secondary
text-text-soft-400     // Tertiary
text-text-disabled-300 // Disabled

// Status
bg-success-lighter text-success-dark
bg-error-lighter text-error-dark
bg-warning-lighter text-warning-dark
bg-information-lighter text-information-dark

// Primary
bg-primary-base hover:bg-primary-darker
bg-primary-alpha-10  // 10% opacity
```

### Typography
```tsx
text-title-h1 through text-title-h6  // Headings
text-label-xs through text-label-xl  // Labels (medium weight)
text-paragraph-xs through text-paragraph-xl  // Body text
text-subheading-2xs through text-subheading-md  // Uppercase with tracking
```

### Shadows
```tsx
shadow-regular-xs/sm/md    // Regular shadows
shadow-custom-xs/sm/md/lg  // Complex layered shadows
shadow-fancy-buttons-primary/neutral/error  // Button shadows
focus:shadow-button-primary-focus  // Focus states
```

### Border Radius
```tsx
rounded-10  // 10px
rounded-20  // 20px
```

---

## UI Components

### Core (components/ui/)
- **Form**: `button`, `fancy-button`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `slider`, `digit-input`, `color-picker`, `datepicker`
- **Layout**: `card`, `modal`, `drawer`, `side-panel`, `popover`, `dropdown`, `accordion`, `divider`, `grid`
- **Feedback**: `alert`, `callout`, `notification`, `skeleton`, `progress-bar`, `progress-circle`
- **Navigation**: `breadcrumb`, `pagination`, `tab-menu-horizontal`, `tab-menu-vertical`, `segmented-control`, `category-bar`
- **Data Display**: `data-table`, `avatar`, `avatar-group`, `badge`, `status-badge`, `tag`, `tooltip`, `list`, `bar-list`, `tracker`
- **Specialized**: `file-upload`, `file-dropzone`, `command-menu`, `metallic-paint`

### Dashboard (components/dashboard/)
- `DashboardShell` - Main layout wrapper
- `Sidebar`, `Header` - Navigation
- `CampaignCard`, `EnrollmentCard`, `StatCard` - Data cards
- `SettingsPanel`, `NotificationsDrawer` - Panels
- `EmptyStates`, `LoadingSkeletons` - State components

---

## Custom Hooks

```tsx
// Data fetching
import { useCampaigns, useCampaign, useCreateCampaign, useUpdateCampaign } from '@/hooks/use-campaigns'
import { useEnrollments, useEnrollment, useUpdateEnrollment } from '@/hooks/use-enrollments'
import { useInvoices } from '@/hooks/use-invoices'
import { useWallet, useTransactions, useRequestWithdrawal } from '@/hooks/use-wallet'
import { useDashboard } from '@/hooks/use-dashboard'

// Utilities
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useNotification } from '@/hooks/use-notification'
import { useSignOut } from '@/hooks/use-sign-out'
import { useTabObserver } from '@/hooks/use-tab-observer'
```

---

## Tailwind CSS v4

### CSS-First Config
Theme defined in `app/globals.css` using `@theme`:
```css
@import "tailwindcss";

@theme {
  --color-primary-base: oklch(0.65 0.2 250);
  --font-display: "Satoshi", sans-serif;
  --spacing-18: 4.5rem;
}
```

### Renamed Utilities (v3 → v4)
| v3 | v4 |
|----|-----|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |

### New Syntax
```tsx
// CSS variables use parentheses
className="bg-(--brand-color)"

// Important modifier is suffix
className="flex!"

// Variant stacking is left-to-right
className="*:last:pb-0"
```

---

## Providers Setup

`app/providers.tsx` wraps the app with:
- `QueryProvider` - React Query
- `ThemeProvider` - next-themes (system + class-based dark mode)
- `AuthUIProvider` - Better-Auth UI
- `TooltipProvider` - Radix tooltips
- `NotificationProvider` - Custom notifications
- `Toaster` - Sonner toasts
- `SpeedInsights` - Vercel monitoring

---

## Image Configuration

Remote patterns configured in `next.config.ts`:
- `unsplash.com` / `images.unsplash.com`
- `dicebear.com` (avatars)
- `logo.clearbit.com` (company logos)

---

## Naming Conventions

### Files
- Components: `kebab-case.tsx` → `campaign-card.tsx`
- Hooks: `use-kebab-case.ts` → `use-campaigns.ts`
- Client components: `*-client.tsx` → `dashboard-client.tsx`
- Types: Colocated or in `lib/types/`

### Code
- Components: `PascalCase` → `CampaignCard`
- Functions/variables: `camelCase` → `handleSubmit`
- Boolean prefixes: `is`, `has`, `should`, `can`
- Constants: `SCREAMING_SNAKE_CASE` → `QUERY_KEYS`

---

## Import Order

```tsx
// 1. React and Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Third-party
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

// 3. Internal (@/)
import { Button } from '@/components/ui/button'
import { useCampaigns } from '@/hooks/use-campaigns'
import { cn } from '@/lib/utils'

// 4. Relative
import { CampaignHeader } from './campaign-header'

// 5. Types
import type { Campaign } from '@/lib/types'
```

---

## Error Handling

### API Responses
```tsx
// Axios interceptors in lib/axios.ts handle:
// - Auth token injection
// - 401 → redirect to sign-in
// - Error toast notifications

// Standard response types
type ApiResponse<T> = { data: T; meta?: PaginationMeta }
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
```

### Component Pattern
```tsx
function DataDisplay() {
  const { data, error, isLoading } = useCampaigns()

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} />
  if (!data?.length) return <EmptyState />

  return <CampaignList campaigns={data} />
}
```

---

## Best Practices

1. **Server Components by default** - Only use `'use client'` when needed
2. **Semantic color tokens** - Never use raw colors like `text-gray-900`
3. **React Query for client data** - Use provided hooks from `hooks/`
4. **Zod for validation** - Define schemas in `lib/validations.ts`
5. **Type everything** - Use types from `lib/types/`
6. **cn() for conditional classes** - Import from `@/lib/utils`
7. **Mobile-first responsive** - iOS safe areas handled in globals.css
8. **Dark mode support** - Test both modes, use semantic tokens

---

## Git Conventions

```
type(scope): description

feat(campaigns): add bulk enrollment approval
fix(wallet): resolve transaction display issue
refactor(auth): simplify sign-in flow
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

---

## Safety Rules

- Never `git restore` until explicitly told
- Never make destructive git changes that can cause data loss
