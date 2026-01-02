# Khemcha - Codebase Conventions

> Hypedrive Brand - OPINIONATED RULES

---

## ✅ DO's

| # | Rule | Example | Auto |
|---|------|---------|------|
| 1 | Feature imports from barrel | `import { useSession } from "@/features/auth"` | ✅ |
| 2 | Hooks from barrel | `import { useLocalStorage } from "@/hooks/state"` | ✅ |
| 3 | "use client" double quotes | `"use client"` (first line) | ✅ |
| 4 | Actions from feature/app | `import { createCampaign } from "@/features/campaigns"` | ✅ |
| 5 | Query keys via factory | `queryKey: campaignKeys.list(orgId)` | ⚠️ |
| 6 | Structured logging | `logError(error, { source: "Action" })` | ✅ |
| 7 | Zustand for 3+ related states | `const { step, formData } = useOnboardingStore()` | ❌ |
| 8 | useState for 1-2 independent | `const [isOpen, setIsOpen] = useState(false)` | ❌ |
| 9 | SSR via feature/ssr.ts | `import { getWalletData } from "@/features/wallet/ssr"` | ❌ |
| 10 | Constants from lib | `import { STORAGE_KEYS } from "@/lib/constants"` | ⚠️ |
| 11 | Error = log + toast | `logError(error); toast.error(msg)` | ❌ |
| 12 | Single flexible mutation hook | `useCampaignAction(orgId)` with action param | ❌ |
| 13 | Max 400 lines per component | Split into `_components/` folder | ✅ |
| 14 | Type-only imports | `import type { Campaign } from "..."` | ✅ |
| 15 | Namespace import for actions | `import * as actions from "../actions/campaigns"` | ⚠️ |
| 16 | Empty array constants | `const EMPTY: T[] = []` outside component | ❌ |
| 17 | useMemo for hook returns | `return useMemo(() => ({ data }), [data])` | ❌ |
| 18 | All hooks before early returns | Hooks first, then `if (loading) return` | ✅ |
| 19 | ssrFetch helper | `ssrFetch(options, fetcher, fallback)` | ❌ |
| 20 | Pass SSR data as props | Server fetches → Client receives via props | ❌ |
| 21 | STATUS_CHECKS helpers | `STATUS_CHECKS.isApproved(status)` not `=== "approved"` | ⚠️ |
| 22 | Centralized query config | `staleTime: STALE_TIME.SHORT` from query-config | ⚠️ |
| 23 | AlignUI compound components | `tv()` with slots and variants | ❌ |
| 24 | URL-based org context | `useParams()` + `useCurrentOrganization()` | ❌ |
| 25 | Export types from feature index | `export type * from "./types"` | ✅ |

---

## ❌ DON'Ts

| # | Anti-Pattern | Fix | Auto |
|---|--------------|-----|------|
| 1 | Direct subpath import | Use barrel: `@/features/auth` | ✅ |
| 2 | `'use client'` single quotes | Use double quotes | ✅ |
| 3 | Relative action imports | Use `@/features/*` or `@/app/actions` | ✅ |
| 4 | Manual query keys | Use factory: `campaignKeys.list()` | ⚠️ |
| 5 | console.log/error/warn | Use `logInfo/logError/logWarn` | ✅ |
| 6 | Multiple useState for related data | Use Zustand | ❌ |
| 7 | Dynamic import in handlers | Static imports only | ❌ |
| 8 | Inline complex types | Define in `types.ts` | ⚠️ |
| 9 | Direct fetch in components | Use React Query hooks | ❌ |
| 10 | Multiple hooks for same action | Single flexible hook with params | ❌ |
| 11 | Same export from multiple places | One canonical location | ⚠️ |
| 12 | Mix wildcard/named imports | Pick one style | ⚠️ |
| 13 | Both localStorage + server | Pick one storage strategy | ❌ |
| 14 | Type assertions `as` | Use proper types/guards | ✅ |
| 15 | 1000+ line components | Split into sub-components | ✅ |
| 16 | Hardcode data in mocks | Import from `@/lib/constants` | ❌ |
| 17 | Only toast OR only log | Always both | ❌ |
| 18 | Zustand + RHF for same data | RHF for forms, Zustand for UI state | ❌ |
| 19 | Default exports | Named exports only | ✅ |
| 20 | Inline empty arrays `?? []` | Use constant for referential stability | ❌ |
| 21 | Hooks after early returns | All hooks before any return | ✅ |
| 22 | Hardcode storage keys | Use `STORAGE_KEYS.*` | ⚠️ |
| 23 | Manual try-catch in SSR | Use `ssrFetch()` helper | ❌ |
| 24 | Hardcode contact info | Use `CONTACT_INFO.*` | ⚠️ |
| 25 | Client fetch for SSR-able data | SSR fetch → pass as props | ❌ |
| 26 | Direct status comparison | Use `STATUS_CHECKS.isApproved()` | ⚠️ |
| 27 | Re-export from different module | Keep in one place only | ⚠️ |
| 28 | Deprecated hooks without removal | Remove or add timeline | ❌ |
| 29 | Duplicate mock handler logic | Extract shared helper | ❌ |
| 30 | Missing type exports in index | Add `export type * from "./types"` | ✅ |

---

## 🤖 Automation Legend

| Symbol | Meaning | Tool |
|--------|---------|------|
| ✅ | Fully automatable | ESLint/Biome |
| ⚠️ | Partially automatable | Custom ESLint rule |
| ❌ | Manual (architecture) | Code review |

---

## 🛠️ Automation Setup

### Biome (ESLint + Prettier replacement)

```json
// biome.json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noConsoleLog": "error",
        "noExplicitAny": "error"
      },
      "style": {
        "noDefaultExport": "error",
        "useImportType": "error"
      }
    }
  }
}
```

### ESLint Rules

```javascript
// .eslintrc.js
{
  "rules": {
    // DO #1, #2 - Barrel imports
    "boundaries/element-types": [2, {
      "default": "disallow",
      "rules": [{ "from": "**/*", "allow": ["features/*/index.ts", "hooks/index.ts"] }]
    }],
    // DO #6 - No console
    "no-console": "error",
    // DO #14 - Type imports
    "@typescript-eslint/consistent-type-imports": "error",
    // DO #18 - Hooks rules
    "react-hooks/rules-of-hooks": "error",
    // DON'T #19 - Named exports
    "import/no-default-export": "error",
    // DO #13 - Max lines
    "max-lines": ["warn", { "max": 400 }]
  }
}
```

### TypeScript Strict

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 📁 File Structure

```
features/*/           → actions/, hooks/, types/, ssr.ts, index.ts
hooks/                → shared/, state/, index.ts
lib/                  → constants.ts, logging/, safe-action.ts, utils/
components/           → ui/, dashboard/, shared/
```

---

## 🎯 SSOT Locations

| Utility | Location | Re-export |
|---------|----------|-----------|
| `getErrorMessage` | `@/lib/errors/encore-error-handler` | `@/lib/utils` |
| `formatDate*` | `@/lib/utils/format` | `@/lib/utils` |
| `formatCurrency` | `@/lib/utils/format` | `@/lib/utils` |
| Zod Schemas | `@/lib/utils/validations` | `@/lib/utils` |
| STATUS_CHECKS | `@/lib/utils/validations` | `@/lib/utils` |
| API Client | `@/lib/api/client` | — |
| Query Keys | `features/*/hooks/*.ts` | `features/*/index.ts` |
| Query Config | `@/lib/utils/query-config` | — |
| Constants | `@/lib/constants` | — |
| Feature Types | `features/*/types.ts` | `features/*/index.ts` |

---

## 🏗️ Architecture - KEEP

| Pattern | Location | Why |
|---------|----------|-----|
| Feature-based architecture | `features/*/` | Self-contained, scalable |
| next-safe-action | `lib/safe-action.ts` | Type-safe, auth middleware |
| Centralized API clients | `lib/api/*.ts` | Clear server/client separation |
| Status config objects | `lib/constants/index.ts` | Consistent UI |
| Middleware route protection | `middleware.ts` | Edge-level auth |
| Query key factories | `features/*/hooks/*.ts` | Type-safe cache invalidation |
| AlignUI + tailwind-variants | `components/ui/*.tsx` | Consistent styling |
| ssrFetch pattern | `lib/api/server.ts` | Standardized SSR |
| URL-based multi-tenancy | Route params | Clean architecture |

---

## 🚫 Architecture - FIX

| Priority | Issue | Location | Fix |
|----------|-------|----------|-----|
| CRITICAL | Duplicate AUTH_COOKIE_NAMES | `middleware.ts:25` | Create `lib/constants/edge.ts` |
| CRITICAL | Duplicate createMutationErrorHandler | `query-config.ts` + `error-logger-simple.ts` | Keep only in `error-logger-simple.ts` |
| HIGH | console.log in prod | `proxy.ts` | Use `logDebug()` |
| HIGH | Mock PUT/PATCH duplication | `mocks/handlers/organizations.ts:82-165` | Extract helper |
| HIGH | Schema duplication | `features/campaigns/actions/campaigns.ts:19-74` | Import from `validations.ts` |
| HIGH | Manual query keys | `use-organizations.ts:358,307` | Use `organizationKeys.*` |
| MEDIUM | Mixed export patterns | Various `index.ts` | Use explicit named exports |
| MEDIUM | Inconsistent response shapes | Action files | Use `ActionResponse<T>` type |
| MEDIUM | Mixed revalidation | Action files | Prefer `revalidateTag()` |
| MEDIUM | Direct status comparison | `use-current-organization.ts` | Use `STATUS_CHECKS.*` |
| LOW | Unused factory methods | `query-config.ts` | Remove or adopt |
| LOW | Provider nesting | `providers.tsx` | Review order |
| LOW | Deprecated hooks | `use-organizations.ts` | Remove with timeline |

---

## 🚨 Codebase Issues

| Issue | Location | Fix |
|-------|----------|-----|
| Manual query keys | `use-organizations.ts:358,307` | Use factory |
| Redundant status hooks | `use-campaigns.ts:386-431` | Merge into one |
| 1375 line component | `onboarding/page.tsx` | Split into `_components/` |
| Dual storage | Onboarding | Pick server drafts |
| Type assertions | Various | Define proper types |
| Mock data duplication | `mocks/handlers/*.ts` | Import from constants |
| Re-export confusion | `features/organizations/index.ts` | Keep hooks in one place |
| Missing type exports | Some feature indexes | Add `export type *` |

---

## 🔧 Priority Fixes

**HIGH:** Query keys factory • Split large components • Merge redundant hooks • Remove console.log

**MEDIUM:** Audit imports • Add missing log/toast • Fix type assertions • Use STATUS_CHECKS

**LOW:** Extract mock constants • Decide storage strategy • Named exports only • Clean deprecated

---

## 📊 Automation Summary

| Category | Automatable | Manual |
|----------|-------------|--------|
| DO's | 12 rules | 13 rules |
| DON'Ts | 13 rules | 17 rules |
| **Total** | **25 rules (42%)** | **30 rules (58%)** |

**Automate:** Import paths, console.log, type imports, hooks rules, max lines, default exports

**Manual:** Architecture decisions, SSOT patterns, SSR strategy, state management choices

---

> **RULE:** Consistency > Cleverness. Follow this file.

---

## 🆕 Additional DO's (From Codebase Analysis)

| # | Rule | Example | Auto |
|---|------|---------|------|
| 26 | Extract repeated UI patterns | `<OnboardingRequiredAlert />` not inline 80 lines | ❌ |
| 27 | Create hooks for repeated patterns | `useReferenceTime()` for `useRef(Date.now())` pattern | ❌ |
| 28 | Memoize callbacks in wrapper components | `useCallback` for stable handler refs | ❌ |
| 29 | Use `useHydratedLocalStorage` for SSR | Prevents hydration mismatch | ❌ |
| 30 | Single localStorage hook pattern | Either `useLocalStorage` OR `useHydratedLocalStorage` | ❌ |
| 31 | Break god components into sub-components | `_components/` folder for 400+ line files | ❌ |
| 32 | Import from barrel even within feature | `import { useSession } from "@/features/auth"` in auth hooks | ✅ |
| 33 | Consistent naming: `handle*` for component | `handleDelete`, `handleSubmit` for internal handlers | ❌ |
| 34 | Consistent naming: `on*` for props | `onDelete`, `onSubmit` for callback props | ❌ |
| 35 | Document deprecated hooks with timeline | `@deprecated Use X instead. Will be removed in v2.0` | ❌ |
| 36 | Stats calculation in dedicated hook | `useCampaignStats(campaigns)` not inline useMemo | ❌ |
| 37 | Avoid useMemo for cheap calculations | Simple `.filter()`, `.length` don't need memoization | ❌ |
| 38 | Group related state with custom hook | `useModalState()` for `isOpen` + `data` + `handlers` | ❌ |
| 39 | Use context for deeply passed props | Avoid 3+ level prop drilling | ❌ |
| 40 | Parallel data fetching | `Promise.all([fetch1, fetch2])` in SSR | ❌ |

---

## 🆕 Additional DON'Ts (From Codebase Analysis)

| # | Anti-Pattern | Fix | Auto |
|---|--------------|-----|------|
| 31 | Duplicate alert/callout JSX in 8+ files | Extract to shared component | ❌ |
| 32 | `useRef(Date.now())` pattern repeated | Create `useReferenceTime()` hook | ❌ |
| 33 | Mix `useLocalStorage` and `useHydratedLocalStorage` | Pick one, document when to use each | ❌ |
| 34 | Inline arrow functions in memo'd children | `() => handler()` breaks memo - use useCallback | ❌ |
| 35 | 12+ callback props to child component | Use context or action pattern | ❌ |
| 36 | Pass `organizationId` prop when hook available | Use `useCurrentOrganization()` in child | ❌ |
| 37 | `useMemo` for `Date.now()` | Primitive - use `useRef` instead | ❌ |
| 38 | Inconsistent `isPending` vs `isLoading` naming | Pick one convention per codebase | ❌ |
| 39 | God components (1000+ lines) | Split: page → sections → components | ❌ |
| 40 | Multiple similar stat calculation functions | Create `useStats(data, config)` generic hook | ❌ |
| 41 | Import from `@/lib/utils/format` directly | Import from `@/lib/utils` barrel | ✅ |
| 42 | `useOrganizationWithDetails` when `useCurrentOrganization` enough | Use simpler hook for status checks | ❌ |
| 43 | Search state in both URL AND useState | Single source: URL params only | ❌ |
| 44 | `export function` for page components | Use named export: `export function PageClient` | ✅ |
| 45 | Mutation via mixed patterns | Pick: `useMutation` OR `useTransition` + action | ❌ |

---

## 🔄 Component Extraction Candidates

> Extract these duplicated patterns into reusable components

| Pattern | Files Affected | Extract To |
|---------|---------------|------------|
| Onboarding Alert + Empty State | 8 client pages | `<OnboardingRequiredAlert />` |
| Reference Time Ref | campaigns, enrollments | `useReferenceTime()` hook |
| Stats Calculation | products, campaigns, enrollments | `useDataStats(data, config)` |
| Modal State Management | all client pages | `useModalState<T>()` hook |
| Search + Filter State | all list pages | `useListFilters()` hook |
| Bulk Actions State | products, enrollments | `useBulkActions(ids)` hook |
| Export Handler | campaigns, enrollments, invoices | `useExportHandler(config)` |

---

## 📐 Component Size Guidelines

| Size | Action | Example |
|------|--------|---------|
| < 200 lines | Keep as-is | Simple form, card component |
| 200-400 lines | Review for extraction | Consider splitting |
| 400-800 lines | Must split | Extract to `_components/` |
| 800+ lines | God component - URGENT | Split into 3-4 sub-components |

### Current God Components (Fix These)

| File | Lines | Split Into |
|------|-------|------------|
| `products-client.tsx` | 1,217 | ProductsHeader, ProductsGrid, ProductModal, ProductStats |
| `enrollments-client.tsx` | 1,223 | EnrollmentsHeader, EnrollmentsTable, BulkActions, ExportHandler |
| `campaigns-client.tsx` | 800+ | CampaignsHeader, CampaignGrid, CampaignFilters |
| `onboarding/page.tsx` | 1,375 | OnboardingSteps, StepForms, ReviewStep |

---

## 🔀 Hook Consolidation Map

> Current duplication → Single source

| Current (Duplicated) | Consolidate To | Location |
|---------------------|----------------|----------|
| `useLocalStorage` + `useHydratedLocalStorage` | `useHydratedLocalStorage` only | `@/hooks/ui` |
| `useOrganization` + `useCurrentOrganization` | `useCurrentOrganization` for URL-based | `@/hooks/shared` |
| Inline `useRef(Date.now())` | `useReferenceTime()` | `@/hooks/shared` |
| Inline stats `useMemo` | Feature-specific `use*Stats` | `@/features/*/hooks` |

---

## 🎨 Naming Conventions

### Consistent Hook Naming

| Type | Pattern | Example |
|------|---------|---------|
| Data fetching | `use{Entity}` | `useCampaigns()`, `useProducts()` |
| Single item | `use{Entity}ById` | `useCampaignById(id)` |
| Mutation | `use{Action}{Entity}` | `useCreateCampaign()`, `useDeleteProduct()` |
| URL-based current | `useCurrent{Entity}` | `useCurrentOrganization()` |
| Search | `useSearch{Entity}` | `useSearchCampaigns()` |
| Stats | `use{Entity}Stats` | `useCampaignStats()` |

### Consistent Handler Naming

| Context | Prefix | Example |
|---------|--------|---------|
| Internal component handlers | `handle` | `handleSubmit`, `handleDelete` |
| Callback props | `on` | `onSubmit`, `onDelete` |
| Mutation functions | Action verb | `createCampaign`, `deleteProduct` |

### Consistent State Naming

| State | Preferred | Avoid |
|-------|-----------|-------|
| Loading | `isLoading` | `isPending`, `loading` |
| Open/Close | `isOpen` | `open`, `visible`, `shown` |
| Fetching | `isFetching` | `fetching` |
| Error | `error` | `isError` (for boolean use `hasError`) |

---

## ⚡ Performance Anti-Patterns Found

| Anti-Pattern | Location | Fix |
|--------------|----------|-----|
| useMemo for primitives | `const today = useMemo(() => new Date(), [])` | Just `new Date()` or `useRef` |
| Inline callbacks in memo | `<MemoComp onClick={() => fn()} />` | `useCallback` the handler |
| 252 useMemo calls | Entire codebase | Audit: only keep expensive ones |
| Object spread in deps | `useMemo(..., [{...obj}])` | Spread individual primitive deps |
| New array on every render | `data ?? []` | Use `EMPTY_ARRAY` constant |

---

## 🧪 Testing Conventions

| Type | File Pattern | Location |
|------|--------------|----------|
| Unit tests | `*.test.ts` | Same directory as source |
| Component tests | `*.test.tsx` | Same directory |
| Integration tests | `*.integration.test.ts` | `__tests__/` folder |
| E2E tests | `*.e2e.ts` | `e2e/` folder |

---

## 📝 Comment Conventions

```tsx
// Good: Explains WHY
// Using ref instead of useMemo because Date.now() is a primitive
const referenceTimeRef = useRef(Date.now())

// Bad: Explains WHAT (obvious from code)
// Create a ref for reference time
const referenceTimeRef = useRef(Date.now())

// Good: SSOT reference
// SSOT: Uses STATUS_CHECKS from @/lib/utils/validations
const isApproved = STATUS_CHECKS.isApproved(status)

// Good: Deprecation with timeline
/** @deprecated Use useCurrentOrganization() instead. Remove in v2.0 */
export function useOrganizationWithDetails() {}
```

---

## ✅ FIXED ISSUES (Session Log)

> Issues fixed based on this document's rules

### Fixed: DO #41 / DON'T #41 - Import from barrel not direct subpath

**Before:** `import { formatCurrency } from "@/lib/utils/format"`
**After:** `import { formatCurrency } from "@/lib/utils"`

**Files Updated (30+):**

- `app/(auth)/sign-in/sign-in-client.tsx`
- `app/(auth)/sign-up/sign-up-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/enrollments/enrollments-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/campaigns/campaigns-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/wallet/wallet-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/products/products-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/team/team-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/invoices/invoices-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/settings/settings-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/profile/profile-client.tsx`
- `components/dashboard/*.tsx` (multiple files)
- `components/dashboard/modals/*.tsx` (all wallet/enrollment modals)
- `features/organizations/actions/onboarding.ts`
- `features/products/actions/products.ts`
- `hooks/ui/use-breadcrumbs.ts`
- And 15+ more files

---

### Fixed: DO #27 / DON'T #32 - useReferenceTime() hook

**Created:** `hooks/shared/use-reference-time.ts`

```tsx
"use client"

import { useRef } from "react"

/**
 * useReferenceTime Hook
 * Captures a reference timestamp at mount time for consistent time calculations.
 */
export function useReferenceTime(): number {
  const referenceTimeRef = useRef(Date.now())
  return referenceTimeRef.current
}
```

**Exported from:** `hooks/shared/index.ts`

**Files Updated:**

- `app/(dashboard)/dashboard/[organizationId]/enrollments/enrollments-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/campaigns/campaigns-client.tsx`

**Before:**

```tsx
import { useRef } from "react"
const referenceTimeRef = useRef(Date.now())
const referenceTime = referenceTimeRef.current
```

**After:**

```tsx
import { useReferenceTime } from "@/hooks/shared"
const referenceTime = useReferenceTime()
```

---

### Fixed: DO #26 / DON'T #31 - OnboardingRequiredAlert component

**Created:** `OnboardingRequiredAlert` in `components/dashboard/empty-states.tsx`

```tsx
interface OnboardingRequiredAlertProps {
  onDismiss: () => void
  onStartOnboarding: () => void
  title?: string
  description?: string
}

export function OnboardingRequiredAlert({
  onDismiss,
  onStartOnboarding,
  title = "Complete Your Organization Setup",
  description = "...",
}: OnboardingRequiredAlertProps) {
  return (
    <CalloutWithActions
      variant="warning"
      title={title}
      dismissible
      onDismiss={onDismiss}
      actions={...}
    >
      {description}
    </CalloutWithActions>
  )
}
```

**Files Updated (7):**

- `app/(dashboard)/dashboard/[organizationId]/dashboard-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/enrollments/enrollments-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/wallet/wallet-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/team/team-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/products/products-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/products/new/new-product-client.tsx`
- `app/(dashboard)/dashboard/[organizationId]/campaigns/create/create-campaign-client.tsx`

**Before:** ~25 lines of inline JSX per file
**After:** Single component call with props

---

### Summary

| Rule | Status | Lines Saved |
| ---- | ------ | ----------- |
| DO #41 (barrel imports) | ✅ Fixed in 30+ files | - |
| DO #27 (useReferenceTime) | ✅ Created & used | ~10 lines/file |
| DO #26 (OnboardingRequiredAlert) | ✅ Created & used in 7 files | ~150 lines total |
