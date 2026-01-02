# Khemcha 2 - Consistent Patterns Guide

> Hypedrive Brand - SOLID IMPLEMENTED PATTERNS (41 Rules)

---

## 🏗️ ARCHITECTURE PATTERNS

### ✅ DO's

| # | Rule | Example | Location |
|---|------|---------|----------|
| 1 | Feature-first folder structure | `features/campaigns/actions/`, `hooks/`, `types/`, `ssr.ts`, `index.ts` | `features/*/` |
| 2 | Barrel exports in feature index | `export { useCampaigns } from "./hooks/use-campaigns"` | `features/*/index.ts` |
| 3 | SSR via feature ssr.ts | `import { getCampaignsSSR } from "@/features/campaigns/ssr"` | `features/*/ssr.ts` |
| 4 | Actions via authAction/publicActionClient | `authAction.inputSchema(schema).action(async ({ parsedInput, ctx }) => {})` | `features/*/actions/` |
| 5 | React Query hooks with factories | `queryKey: campaignKeys.list(orgId)` | `features/*/hooks/` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 1 | Flat file structure | Use `features/*/` with subfolders |
| 2 | Direct exports without barrel | Always export via `index.ts` |
| 3 | SSR logic in page.tsx | Extract to `ssr.ts` file |
| 4 | Raw server actions without middleware | Use `authAction` or `publicActionClient` |
| 5 | Direct useQuery without factory | Use `createQueryKeyFactory()` pattern |

---

## 📦 IMPORT PATTERNS

### ✅ DO's

| # | Rule | Example |
|---|------|---------|
| 6 | `"use client"` with double quotes | `"use client"` (line 1 or 8) |
| 7 | `"use server"` with double quotes | `"use server"` (line 1) |
| 8 | Type-only imports | `import type { Campaign } from "@/features/campaigns"` |
| 9 | Feature barrel imports | `import { useCampaigns } from "@/features/campaigns"` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 6 | `'use client'` single quotes | Use double quotes `"use client"` |
| 7 | `'use server'` single quotes | Use double quotes `"use server"` |
| 8 | `import { Campaign }` for types | Use `import type { Campaign }` |
| 9 | `import { x } from "@/features/campaigns/hooks/use-campaigns"` | Use barrel `@/features/campaigns` |

---

## 🔧 REACT QUERY PATTERNS

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 10 | Query key factories | `campaignKeys.list(orgId)`, `campaignKeys.detail(orgId, id)` | `query-config.ts` |
| 11 | STALE_TIME constants | `staleTime: STALE_TIME.SHORT` (1min) | `query-config.ts` |
| 12 | GC_TIME constants | `gcTime: GC_TIME.MEDIUM` (15min) | `query-config.ts` |
| 13 | PAGE_SIZE constants | `pageSize: PAGE_SIZE.DEFAULT` (10) | `query-config.ts` |
| 14 | Retry config spread | `...DEFAULT_RETRY_CONFIG` | `query-config.ts` |
| 15 | Mutation error handler | `onError: createMutationErrorHandler("createCampaign")` | `query-config.ts` |
| 16 | Optimistic update helpers | `performOptimisticUpdate(queryClient, ...)` | `optimistic-updates.ts` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 10 | `queryKey: ["campaigns", orgId]` | Use `campaignKeys.list(orgId)` |
| 11 | `staleTime: 60000` | Use `STALE_TIME.SHORT` |
| 12 | `gcTime: 900000` | Use `GC_TIME.MEDIUM` |
| 13 | `pageSize: 10` | Use `PAGE_SIZE.DEFAULT` |
| 14 | Manual retry logic | Use `...DEFAULT_RETRY_CONFIG` |
| 15 | Inline error handling | Use `createMutationErrorHandler()` |
| 16 | Manual cache updates | Use `performOptimisticUpdate()` |

---

## ✅ VALIDATION PATTERNS

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 17 | Zod schemas from validations | `import { campaignFormSchema } from "@/lib/utils/validations"` | `validations.ts` |
| 18 | Status validators | `isValidCampaignStatus(status)` | `validators.ts` |
| 19 | React Hook Form + Zod | `useForm({ resolver: zodResolver(schema) })` | All forms |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 17 | Inline Zod schemas | Define in `validations.ts` |
| 18 | `status === "approved"` | Use `isValidCampaignStatus()` |
| 19 | Manual form validation | Use `zodResolver(schema)` |

---

## 🔒 AUTH & API PATTERNS

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 20 | next-safe-action for mutations | `authAction.inputSchema(schema).action()` | `safe-action.ts` |
| 21 | Browser API singleton | `import { client } from "@/lib/api/client"` | `lib/api/client.ts` |
| 22 | Server API per-request | `getAuthenticatedEncoreClient(token)` | `lib/api/server.ts` |
| 23 | Middleware Edge-optimized | Lightweight checks, no DB queries | `middleware.ts` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 20 | Raw server actions | Use `authAction` wrapper |
| 21 | `new Client()` in hooks | Use singleton from `lib/api/client` |
| 22 | Singleton on server | Use `getAuthenticatedEncoreClient()` |
| 23 | DB queries in middleware | Keep Edge-compatible |

---

## 📝 LOGGING & ERROR PATTERNS

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 24 | Centralized logging | `logError(error, { source: "Action" })` | `error-logger-simple.ts` |
| 25 | Error message extraction | `getErrorMessage(error)` | `encore-error-handler.ts` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 24 | `console.log()`, `console.error()` | Use `logInfo()`, `logError()` |
| 25 | `error.message` or `String(error)` | Use `getErrorMessage(error)` |

---

## 🎨 UI PATTERNS

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 26 | tailwind-variants for components | `tv({ slots: { root, item }, variants: { size } })` | `lib/utils/primitives/tv.ts` |
| 27 | cn() for class merging | `cn("base-class", isActive && "active")` | `lib/utils/primitives/cn.ts` |
| 28 | Avatar color helper | `getAvatarColor(userName)` | `avatar-color.ts` |
| 29 | Polymorphic components | `<Button as="a" href="/">` | `polymorphic.ts` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 26 | Inline variant logic | Use `tv()` slots and variants |
| 27 | Template literals for classes | Use `cn()` utility |
| 28 | Random avatar colors | Use `getAvatarColor()` |
| 29 | Duplicate components for elements | Use polymorphic `as` prop |

---

## 📊 FORMAT UTILITIES

### ✅ DO's

| # | Rule | Example | SSOT |
|---|------|---------|------|
| 30 | Currency formatting | `formatCurrency(1000)` → `₹1,000` | `format.ts` |
| 31 | Date formatting | `formatDateShort(date)` → `"15 Jan"` | `format.ts` |
| 32 | Number formatting | `formatNumber(1000)` → `"1,000"` | `format.ts` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 30 | `new Intl.NumberFormat()` inline | Use `formatCurrency()` |
| 31 | `date.toLocaleDateString()` | Use `formatDateShort()` |
| 32 | `number.toLocaleString()` | Use `formatNumber()` |

---

## 🧪 MOCK PATTERNS

### ✅ DO's

| # | Rule | Example | Location |
|---|------|---------|----------|
| 33 | MSW handlers per domain | `campaignHandlers`, `enrollmentHandlers` | `mocks/handlers/*.ts` |
| 34 | Mock utilities | `encoreUrl("/campaigns")`, `encoreResponse(data)` | `mocks/handlers/utils.ts` |
| 35 | Mock database | Centralized mock data store | `mocks/db/` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 33 | All handlers in one file | Split by domain |
| 34 | Hardcoded URLs in handlers | Use `encoreUrl()` helper |
| 35 | Inline mock data | Use `mocks/db/` collections |

---

## 📄 PAGE PATTERNS

### ✅ DO's

| # | Rule | Example |
|---|------|---------|
| 36 | Async server components | `export default async function Page({ params })` |
| 37 | Client components suffix | `campaigns-client.tsx` with `"use client"` |
| 38 | Page metadata export | `export const metadata: Metadata = { title: "..." }` |
| 39 | Dynamic rendering flag | `export const dynamic = "force-dynamic"` |
| 40 | OrganizationGuard wrapper | `<OrganizationGuard>{children}</OrganizationGuard>` |
| 41 | memo + useCallback | `memo(CampaignCard)`, `useCallback(() => {}, [])` |

### ❌ DON'Ts

| # | Anti-Pattern | Fix |
|---|--------------|-----|
| 36 | `"use client"` in page.tsx | Keep page.tsx as server component |
| 37 | Client logic in page.tsx | Extract to `*-client.tsx` |
| 38 | Missing metadata | Always export `metadata` |
| 39 | Static for dynamic data | Use `dynamic = "force-dynamic"` |
| 40 | Unprotected org pages | Wrap with `<OrganizationGuard>` |
| 41 | Unstable callbacks | Use `useCallback` for handlers |

---

## 📊 CONSISTENCY SCORE

| Category | DO's | DON'Ts | Total |
|----------|------|--------|-------|
| Architecture | 5 | 5 | 10 |
| Imports | 4 | 4 | 8 |
| React Query | 7 | 7 | 14 |
| Validation | 3 | 3 | 6 |
| Auth/API | 4 | 4 | 8 |
| Logging | 2 | 2 | 4 |
| UI | 4 | 4 | 8 |
| Format | 3 | 3 | 6 |
| Mocks | 3 | 3 | 6 |
| Pages | 6 | 6 | 12 |
| **Total** | **41** | **41** | **82 rules** |

---

## 🎯 SSOT Quick Reference

| Utility | Import From |
|---------|-------------|
| Query key factories | `@/lib/utils/query-config` |
| STALE_TIME, GC_TIME, PAGE_SIZE | `@/lib/utils/query-config` |
| Zod schemas | `@/lib/utils/validations` |
| Status validators | `@/lib/utils/validators` |
| formatCurrency, formatDate | `@/lib/utils/format` |
| logError, logInfo | `@/lib/logging/error-logger-simple` |
| getErrorMessage | `@/lib/errors/encore-error-handler` |
| cn(), tv() | `@/lib/utils/primitives/*` |
| authAction, publicActionClient | `@/lib/safe-action` |
| Browser API client | `@/lib/api/client` |
| Server API client | `@/lib/api/server` |

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `khemcha.md` | Anti-patterns & fixes (issues to resolve) |
| `khemcha2.md` | Consistent patterns (what's working) |

---

> **RULE:** These 41 patterns are SOLID. Follow them exactly. No exceptions.
