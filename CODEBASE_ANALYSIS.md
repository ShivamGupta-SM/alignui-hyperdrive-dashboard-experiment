# Hypedrive Brand Frontend - Codebase Analysis

## 10 CONSISTENT Patterns

### 1. Query Key Structure - Hierarchical Organization
Saare hooks files me same hierarchical query key pattern follow hota hai.

```typescript
export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (filters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id) => [...campaignKeys.details(), id] as const,
}
```

**Files:** `use-campaigns.ts`, `use-enrollments.ts`, `use-products.ts`, `use-invoices.ts`, `use-wallet.ts`, `use-team.ts`

---

### 2. "use client" Directive
Har hook file `"use client"` se start hoti hai.

**Files:** All 11 hook files

---

### 3. Client Instance - Singleton Pattern
Har hook file me module level pe client create hota hai.

```typescript
const client = getEncoreBrowserClient()
```

**Files:** All hook files in features folder

---

### 4. Server Actions - next-safe-action with Zod
Saare server actions `authAction.inputSchema().action()` pattern use karte hain.

```typescript
export const createCampaign = authAction
  .inputSchema(createCampaignSchema)
  .action(async ({ parsedInput, ctx }) => { ... })
```

**Files:** `campaigns.ts`, `enrollments.ts`, `organizations.ts`, `products.ts`, `wallet.ts`

---

### 5. Cache Invalidation - revalidateTag()
Saare server actions me `revalidateTag()` use hota hai.

```typescript
revalidateTag("campaigns")
revalidateTag("dashboard")
```

**Files:** All action files

---

### 6. Import Pattern - Namespace Aliases
Components namespace imports use karte hain.

```typescript
import * as Button from "@/components/ui/primitives/button"
import * as Table from "@/components/ui/data-display/table"
```

---

### 7. useMutation with Cache Invalidation
Saare mutations `queryClient.invalidateQueries()` use karte hain.

```typescript
useMutation({
  mutationFn: actions.createProduct,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: productKeys.lists(orgId) })
  }
})
```

**Files:** All hook files with mutations

---

### 8. Feature Index Exports
Har feature ka `index.ts` types, hooks, aur actions export karta hai.

**Files:** `features/*/index.ts`

---

### 9. Enabled Condition in useQuery
Query hooks me `enabled` field se ID check hoti hai.

```typescript
useQuery({
  queryKey: [...],
  queryFn: () => ...,
  enabled: !!orgId
})
```

---

### 10. Zod Schema Organization
Action files me schemas comment separators ke saath top pe organized hain.

```typescript
// ============================================
// Schemas
// ============================================
const createCampaignSchema = z.object({ ... })
```

---

### 11. Props Interface with JSDoc Documentation
Har client component me Props interface JSDoc comments ke saath define hota hai.

```typescript
export interface CampaignsClientProps {
  /** Initial status filter to apply */
  initialStatus?: string
  /** Initial campaign data to display */
  initialData?: { campaigns?: CampaignWithStats[] }
}
```

**Files:** `campaigns-client.tsx`, `enrollments-client.tsx`, `products-client.tsx`

---

### 12. Reference Time Memoization
Date-dependent components me stable reference timestamp use hota hai.

```typescript
const referenceTime = useMemo(() => Date.now(), [])
```

**Purpose:** Re-renders prevent karta hai constantly changing dates se.

**Files:** `campaigns-client.tsx`, `enrollments-client.tsx`

---

### 13. Centralized Formatting Utilities
Saari formatting `lib/utils/format.ts` se aati hai - inline nahi.

```typescript
import { formatCurrency, formatDateMedium } from "@/lib/utils/format"
```

**Files:** All components displaying dates/currency

---

### 14. Validation Constants - Single Source of Truth
Saare validation rules `VALIDATION_CONSTANTS` object me defined hain.

```typescript
// lib/utils/validations.ts
export const VALIDATION_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_MAX_LENGTH: 128,
  // 80+ more constants
}
```

---

### 15. Skeleton Loading Components
Loading states dedicated skeleton components use karte hain, generic spinners nahi.

```typescript
// app/(dashboard)/dashboard/loading.tsx
import { DashboardPageLoading } from "@/components/dashboard/loading-skeletons"
export default function Loading() { return <DashboardPageLoading /> }
```

---

### 16. Error Boundary with Auth Handling
Error boundaries authentication errors ko separately handle karte hain.

```typescript
// app/(dashboard)/dashboard/error.tsx
if (isAuthenticationError(error)) {
  handleAuthError(error) // Clears token, redirects to login
  return <div>Redirecting to login...</div>
}
return <PageError error={error} reset={reset} />
```

---

### 17. useLocalStorage for Persistent UI State
Dismissal states localStorage me persist hote hain.

```typescript
const [dismissedAlert, setDismissedAlert] = useLocalStorage<boolean>(
  "enrollments-onboarding-alert-dismissed",
  false
)
```

**Files:** `enrollments-client.tsx`, `products-client.tsx`

---

### 18. Early Exit Pattern for Organization Check
Organization check early karte hain, empty state return before main content.

```typescript
if (!hasOrganization) {
  return (
    <div className="space-y-5">
      <CalloutWithActions variant="warning" ... />
    </div>
  )
}
// Main content below
```

---

### 19. Environment Variables with t3-oss Validation
`@t3-oss/env-nextjs` se environment variables validate hote hain build time pe.

```typescript
// lib/config/env.ts
export const env = createEnv({
  server: { ENCORE_API_URL: z.string().url().optional() },
  client: { NEXT_PUBLIC_POSTHOG_KEY: z.string().optional() },
  emptyStringAsUndefined: true,
})
```

---

### 20. Feature Folder Structure
Har feature ka same folder structure hai.

```
features/campaigns/
├── actions/
│   └── campaigns.ts
├── hooks/
│   └── use-campaigns.ts
├── types/
│   └── index.ts
├── lib/
│   └── validation.ts
└── index.ts
```

---

## 10 INCONSISTENT Patterns

### 1. ~~Query Key Naming - Dual Exports~~ ✅ FIXED
~~Kuch features me dual names export hote hain - confusing hai.~~

**Status:** Fixed - Removed dual exports. Now only `campaignKeys` and `enrollmentKeys` are exported.

---

### 2. Toast Notifications - Partial Implementation
Sirf kuch features me toast use hota hai.

**With Toast:**
- `use-organizations.ts` - `toast.success()`, `toast.error()`
- `campaigns-client.tsx`

**Without Toast:**
- `use-invoices.ts`
- `use-products.ts`
- `use-wallet.ts`
- `use-team.ts`

**Problem:** Inconsistent UX feedback.

---

### 3. ~~Stale Time - Random Values~~ ✅ FIXED
~~Different hooks me different stale times hain.~~

**Status:** Fixed - Created `STALE_TIME` constants in `lib/utils/query-config.ts`:
- `STALE_TIME.REALTIME` (30s) - wallet balances
- `STALE_TIME.SHORT` (1min) - lists, search results
- `STALE_TIME.MEDIUM` (5min) - user data, settings
- `STALE_TIME.LONG` (10min) - rarely changing data (platforms)

All hook files now use these constants.

---

### 4. Type Definitions - Varying Depth
Kuch features me rich types hain, kuch me minimal.

**Rich Types:**
- `features/campaigns/types/index.ts` - Forms, Filters, etc.

**Minimal:**
- `features/organizations/types/index.ts` - Just re-exports
- `features/invoices/types/index.ts` - One interface

---

### 5. Server Action Exports - Inconsistent Locations
Action exports alag alag jagah se hote hain.

```typescript
// campaigns - single file
export { createCampaign, updateCampaign } from "./actions/campaigns"

// organizations - multiple files
export { ... } from "./actions/onboarding"
export { ... } from "./actions/draft"
export { ... } from "./actions/approval"
```

---

### 6. Error Handling - Missing in Many Hooks
Bahut saare mutations me `onError` callback nahi hai.

**With Error Handlers:**
- `use-organizations.ts`

**Without Error Handlers:**
- `use-campaigns.ts`
- `use-enrollments.ts`
- `use-products.ts`
- `use-wallet.ts`
- `use-team.ts`

**Problem:** Silent failures in most features.

---

### 7. Mutation Pattern - Actions vs Client
Kuch mutations server actions use karte hain, kuch direct client.

**Server Actions:**
```typescript
mutationFn: actions.createCampaign
```

**Direct Client:**
```typescript
mutationFn: (id) => client.wallets.cancelWithdrawal(id)
```

**Problem:** Unclear kab kaunsa use karna hai.

---

### 8. Documentation Comments - Varying Quality
Kuch files me detailed comments hain, kuch me minimal.

**Detailed:**
- `use-campaigns.ts` - Full JSDoc blocks

**Minimal:**
- `use-integrations.ts`
- `use-wallet.ts`

---

### 9. Mega Hook vs Individual Hooks
`useOrganization` ek mega hook hai with 20+ properties, baaki features me individual hooks hain.

```typescript
// organizations - mega hook
export function useOrganization(id) {
  // 2 queries + 5 mutations + derived state
  return { org, isLoading, update, delete, ... }
}

// campaigns - individual hooks
export function useCampaigns() { ... }
export function useCreateCampaign() { ... }
export function useUpdateCampaign() { ... }
```

**Problem:** Unnecessary re-renders in organizations feature.

---

### 10. ~~Pagination Parameters - Mixed Patterns~~ ✅ FIXED

**Status:** Standardized to `skip`/`take` everywhere in filter types and hooks.

**Changes Made:**
- Updated `features/*/types/index.ts` - Changed `page?: number; limit?: number` to `skip?: number; take?: number`
- Updated `features/*/hooks/use-*.ts` - Changed to use `filters.skip ?? 0` and `filters.take ?? 10`
- Added pagination utilities to `lib/utils/query-config.ts`:
  - `toSkipTake(page, pageSize)` - Converts page-based to skip/take
  - `toPageLimit(skip, take)` - Converts skip/take to page-based
  - `DEFAULT_PAGE_SIZE = 10`

**Files Updated:**
- `features/products/types/index.ts`
- `features/enrollments/types/index.ts`
- `features/invoices/types/index.ts`
- `features/campaigns/types/index.ts`
- `features/products/hooks/use-products.ts`
- `features/enrollments/hooks/use-enrollments.ts`
- `features/invoices/hooks/use-invoices.ts`

---

### 11. Component Export Styles - Mixed Default vs Named ✅ DOCUMENTED

This follows Next.js conventions intentionally:

**Named Exports** (UI Components):

```typescript
// components/ui/primitives/button.tsx
export { ButtonRoot as Root, ButtonIcon as Icon }
```

Used for: Reusable UI components, compound component patterns

**Default Exports** (Pages/Layouts):

```typescript
// app/(auth)/sign-up/page.tsx
export default function SignUpPage()
```

Used for: Next.js pages, layouts, error boundaries (required by framework)

**Status:** This is correct Next.js pattern - pages MUST use default exports, components use named exports for better tree-shaking and explicit imports.

---

### 12. Wrapper Component Indirection - Inconsistent Layering

Kuch features unnecessary wrapper components use karte hain.

**With Wrapper:**
```typescript
// campaigns/page.tsx
import { CampaignsWrapper } from "./campaigns-wrapper"
<CampaignsWrapper initialData={initialData} />
```

**Without Wrapper:**
```typescript
// products/page.tsx
import { ProductsClient } from "./products-client"
<ProductsClient initialData={data} />
```

**Problem:** Unnecessary abstraction layer in campaigns but not in products.

---

### 13. ~~Loading State Variable Naming~~ ✅ FIXED

**Status:** Standardized to `isPending` everywhere (React Query v5 standard).

**Changes Made:**
1. **Core Hook:** `useOrganization()` renamed:
   - `isLoading` → `isPending` (for loading state)
   - `isPending` → `isApprovalPending` (for approval status to avoid naming conflict)
   - `isLoadingOrgs` → `isPendingOrgs`

2. **Consumer Components Updated:**
   - `components/dashboard/feature-guard.tsx`
   - `components/dashboard/status-banner.tsx`
   - `components/dashboard/dashboard-shell.tsx`
   - `components/dashboard/organization-guard.tsx`
   - `components/dashboard/sidebar.tsx`
   - `components/dashboard/activity-feed.tsx`
   - `app/(dashboard)/dashboard/page.tsx`
   - `app/(dashboard)/dashboard/[organizationId]/layout.tsx`
   - `app/(dashboard)/dashboard/[organizationId]/wallet/wallet-client.tsx`
   - `app/(dashboard)/dashboard/[organizationId]/dashboard-client.tsx`
   - `app/(dashboard)/dashboard/[organizationId]/enrollments/enrollments-client.tsx`
   - `app/(dashboard)/dashboard/[organizationId]/team/team-client.tsx`

**Pattern:** All hooks now use `isPending` for loading states, `isApprovalPending` for approval status checks.

---

### 14. Data Transformation Location - SSR vs Client

Data transformation kabhi server pe hoti hai, kabhi client pe.

**Server-side:**
```typescript
// ssr-data.ts
return { campaigns: response.data, ...response }
```

**Client-side:**
```typescript
// products-client.tsx
const getStats = (productList: Product[]) => { ... }
```

**Problem:** Inconsistent data flow reasoning.

---

### 15. Null vs Undefined Usage ✅ ANALYZED

Actually consistent when looking at the full codebase:

| Code Type | Returns | Reason |
|-----------|---------|--------|
| Custom code | `null` | Missing/not-found data |
| Generated client | `undefined` | API library convention |
| Optional properties | `undefined` | TypeScript convention |

**Status:** The codebase follows a clear pattern - custom code uses `null` for explicit "not found" cases, while generated/library code uses `undefined`. This creates a clear boundary between layers.

---

### 16. Route Parameter Handling

Route parameters kabhi Promise-based hain, kabhi synchronous.

**Promise-based (RSC):**
```typescript
const params = await searchParams
const statusFilter = params.status || "all"
```

**Synchronous (Client):**
```typescript
const params = useParams<{ organizationId: string }>()
const organizationId = params.organizationId
```

---

### 17. API Response Structure - Dual Key Pattern

API responses me dual keys hain (`campaigns`/`data`) - inconsistent.

```typescript
// ssr-data.ts
return { campaigns: response.data, ...response }  // Both 'campaigns' AND 'data'

// Page me fallback handling lagti hai
initialData = {
  campaigns: data.campaigns || data.data,  // Confusion!
  data: data.data || data.campaigns,
}
```

**Problem:** Kaunsa property use karna hai unclear.

---

### 18. Error Message Format

Error messages alag alag formats me hain.

**Template string:**
```typescript
error instanceof Error ? error.message : "Invalid email or password"
```

**Server error fallback:**
```typescript
result?.serverError || "Failed to create account"
```

**Concatenation:**
```typescript
throw new Error(`Backend connection failed: ${error.message}`)
```

**Problem:** Error extraction logic fragile hai.

---

### 19. Async/Await vs Promise Handling

Mixed patterns - Promise.all, Promise.allSettled, direct await.

**Promise.allSettled:**
```typescript
const results = await Promise.allSettled([
  client.campaigns.getCampaign(id),
  client.campaigns.getCampaignStats(id),
])
```

**Direct await:**
```typescript
const detail = await client.enrollments.getEnrollmentDetail(id)
```

**Problem:** No consistent pattern for multi-request handling.

---

### 20. Optional Chaining - Inconsistent Usage ✅ ANALYZED

The codebase actually uses operators correctly:

| Operator | Usage | When |
|----------|-------|------|
| `?.` | Optional chaining | Safe property access on potentially null objects |
| `??` | Nullish coalescing | Default for null/undefined only (preserves 0, false, "") |
| `\|\|` | OR operator | Default for all falsy values (treats "" as falsy) |

**Status:** The codebase shows nuanced understanding - using `??` for numeric/boolean defaults and `||` for string defaults. Some redundant checks exist but don't cause bugs.

---

## Recommendations

### ✅ Completed Fixes

1. ~~**Pick one query key export name**~~ ✅ DONE - Removed dual exports
2. ~~**Standardize stale times**~~ ✅ DONE - Created `STALE_TIME` constants in `lib/utils/query-config.ts`
3. ~~**Pagination pattern**~~ ✅ FIXED - Standardized to `skip`/`take` everywhere with utility functions
4. ~~**Export styles**~~ ✅ DOCUMENTED - Follows Next.js convention (default for pages, named for components)
5. ~~**Loading state naming**~~ ✅ FIXED - Standardized to `isPending` everywhere (React Query v5)
6. ~~**Null vs undefined**~~ ✅ ANALYZED - Custom code uses null, generated uses undefined (intentional boundary)
7. ~~**Optional chaining**~~ ✅ ANALYZED - Uses ??, ||, ?. appropriately

### 🔄 Future Improvements (Not Critical)

1. **Add toast to all mutations** - Consistent feedback across features
2. **Add onError to all mutations** - Better error UX (currently silent failures)
3. **Break mega hooks** - `useOrganization` has 20+ properties, consider splitting
4. **Standardize action vs client usage** - Document when to use server actions vs direct client
