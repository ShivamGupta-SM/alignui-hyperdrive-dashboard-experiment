# Comprehensive Mixed Patterns Audit - Full Project

## 🔍 Audit Summary

**Date:** 2025-01-XX
**Scope:** Entire codebase audit for mixed patterns
**Status:** ⚠️ Multiple mixed patterns found

---

## 1. ❌ Mixed Patterns - Direct API Calls in Hooks

### Problem:
Hooks में direct API calls हो रहे हैं instead of centralized API layer.

### Found Issues:

#### 1.1 Settings Feature
**File:** `hooks/use-settings.ts`
**Issues:**
- ❌ Line 77: `getEncoreBrowserClient()` directly in hook
- ❌ Line 85: `client.organizations.getOrganization()` direct call
- ❌ Line 88: `client.auth.me()` direct call
- ❌ Line 101: `client.organizations.listBankAccounts()` direct call
- ❌ Line 113: `client.organizations.getGSTDetails()` direct call
- ❌ Line 130: `client.organizations.updateOrganization()` direct call
- ❌ Multiple other direct calls throughout file

**Should be:**
```typescript
// features/settings/lib/api.ts
export const settingsAPI = {
  async getOrganization(id: string) {
    const client = getEncoreBrowserClient()
    return client.organizations.getOrganization(id)
  },
  // ... other methods
}

// features/settings/hooks/use-settings.ts
export function useOrganizationSettings(id: string) {
  return useQuery({
    queryKey: settingsKeys.organization(),
    queryFn: () => settingsAPI.getOrganization(id),
  })
}
```

#### 1.2 Organizations Feature
**File:** `hooks/use-organizations.ts`
**Issues:**
- ❌ Line 31: `client.auth.listOrganizations()` direct call

**Should be:**
```typescript
// features/organizations/lib/api.ts
export const organizationsAPI = {
  async listOrganizations() {
    const client = getEncoreBrowserClient()
    return client.auth.listOrganizations()
  },
}
```

#### 1.3 Dashboard Feature
**File:** `hooks/use-dashboard.ts`
**Issues:**
- ❌ Line 40: `getEncoreBrowserClient()` directly in hook
- ❌ Line 48: `client.organizations.getDashboardOverview()` direct call

#### 1.4 Notifications Feature
**File:** `hooks/use-notifications.ts`
**Issues:**
- ❌ Multiple `getEncoreBrowserClient()` calls
- ❌ Direct API calls in queryFn

#### 1.5 Products Feature
**File:** `hooks/use-products.ts`
**Issues:**
- ❌ Types defined in hook file (should be in types/)
- ❌ Likely direct API calls (needs verification)

#### 1.6 Categories Feature
**File:** `hooks/use-categories.ts`
**Issues:**
- ❌ Line 34: `getEncoreBrowserClient()` direct call

---

## 2. ❌ Server Actions - Inconsistent Result Pattern

### Problem:
Some server actions use Result pattern, some don't.

### Found Issues:

#### 2.1 Organizations Actions
**File:** `app/actions/organizations.ts`
**Issues:**
- ❌ Line 11-54: `createBasicOrganization()` returns `{ success: boolean, error?: string, organizationId?: string }` - NOT Result pattern
- ❌ Line 60-90: `switchOrganization()` returns `{ success: boolean, error?: string }` - NOT Result pattern

**Should be:**
```typescript
import type { Result } from "@/shared/lib/errors/types"

export async function createBasicOrganization(name: string): Promise<Result<Organization>> {
  // ... implementation
  return { success: true, data: result }
  // or
  return { success: false, error: handleAPIError(error) }
}
```

#### 2.2 Auth Actions
**File:** `app/actions/auth.ts`
**Issues:**
- ❌ Mixed return types - some return `{ success: true }`, some return different formats
- ❌ Not using Result pattern consistently

#### 2.3 Settings Actions
**File:** `app/actions/settings.ts`
**Issues:**
- ❌ Line 89: `return { success: false, error: "..." }` - NOT Result pattern (error should be Error object)
- ❌ Multiple inconsistent return formats

#### 2.4 Team Actions
**File:** `app/actions/team.ts`
**Issues:**
- ❌ Line 12: `return { success: false, error: "..." }` - NOT Result pattern

#### 2.5 Onboarding Actions
**File:** `app/actions/onboarding.ts`
**Issues:**
- ❌ Large file (422 lines) - should be split
- ❌ Inconsistent error handling

---

## 3. ❌ Type Definitions - Duplicate/Multiple Locations

### Problem:
Same types defined in multiple places.

### Found Issues:

#### 3.1 Organization Types
**Locations:**
- ❌ `lib/types/organization.ts` - Has Organization interface
- ❌ `hooks/use-settings.ts` - Has OrganizationSettings interface
- ❌ `hooks/use-organizations.ts` - Re-exports Organization type
- ❌ `mocks/handlers/typed-responses.ts` - Has Organization type

**Should be:**
```typescript
// features/organizations/types/index.ts
export type Organization = organizations.Organization
export interface OrganizationSettings { ... }
```

#### 3.2 Product Types
**Locations:**
- ❌ `hooks/use-products.ts` - Has Product, ProductWithStats, ProductFilters, etc.
- ❌ `lib/types/index.ts` - Re-exports Product
- ❌ `mocks/handlers/typed-responses.ts` - Has Product types
- ❌ `mocks/db/schemas.ts` - Has Product type

**Should be:**
```typescript
// features/products/types/index.ts
export type Product = products.Product
export type ProductWithStats = products.ProductWithStats
export interface ProductFilters { ... }
```

#### 3.3 Settings Types
**Locations:**
- ❌ `hooks/use-settings.ts` - Has OrganizationSettings, BankAccount, GstDetails, etc.
- ❌ `mocks/db/schemas.ts` - Has OrganizationSettings type

---

## 4. ❌ Error Handling - Inconsistent Patterns

### Problem:
Different error handling patterns across codebase.

### Found Issues:

#### 4.1 Server Actions
**Pattern 1:** Using handleAPIError (inconsistent return)
```typescript
// app/actions/organizations.ts
catch (error: unknown) {
  return handleAPIError(error)  // Returns { success: false, error: string }
}
```

**Pattern 2:** Custom error messages
```typescript
// app/actions/settings.ts
return { success: false, error: "Organization ID not found" }  // String, not Error object
```

**Pattern 3:** Result pattern (CORRECT - only in campaigns)
```typescript
// features/campaigns/actions/campaigns.ts
return { success: false, error: handleAPIError(error) }  // Error object
```

**Should be:**
All server actions should use Result pattern:
```typescript
import type { Result } from "@/shared/lib/errors/types"

export async function someAction(): Promise<Result<Data>> {
  try {
    const data = await apiCall()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleAPIError(error) }  // Error object
  }
}
```

#### 4.2 Hooks Error Handling
**Issues:**
- ❌ Some hooks return `null` on error
- ❌ Some hooks throw errors
- ❌ Some hooks use try-catch with logging
- ❌ No consistent pattern

---

## 5. ❌ Missing Documentation - JSDoc Comments

### Problem:
Many functions/hooks missing JSDoc documentation.

### Found Issues:

#### 5.1 Hooks Missing Documentation
- ❌ `hooks/use-settings.ts` - Most functions missing JSDoc
- ❌ `hooks/use-organizations.ts` - Some functions have docs, some don't
- ❌ `hooks/use-dashboard.ts` - Basic docs but missing @example
- ❌ `hooks/use-products.ts` - No JSDoc
- ❌ `hooks/use-categories.ts` - No JSDoc
- ❌ `hooks/use-notifications.ts` - No JSDoc

#### 5.2 Server Actions Missing Documentation
- ❌ `app/actions/organizations.ts` - Missing JSDoc
- ❌ `app/actions/settings.ts` - Missing JSDoc
- ❌ `app/actions/team.ts` - Missing JSDoc
- ❌ `app/actions/products.ts` - Missing JSDoc
- ❌ `app/actions/enrollments.ts` - Missing JSDoc
- ❌ `app/actions/invoices.ts` - Missing JSDoc
- ❌ `app/actions/wallet.ts` - Missing JSDoc

**Should have:**
```typescript
/**
 * Hook: Fetch organization settings
 * 
 * @description
 * Fetches organization settings from the API using React Query.
 * 
 * @param organizationId - Organization ID
 * @returns React Query result with organization settings
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOrganizationSettings(orgId)
 * ```
 */
export function useOrganizationSettings(organizationId: string) { ... }
```

---

## 6. ❌ File Organization - Not Feature-Based

### Problem:
Code scattered across multiple folders instead of feature-based organization.

### Current Structure:
```
hooks/
├── use-settings.ts      # Settings hooks
├── use-organizations.ts  # Organization hooks
├── use-products.ts      # Product hooks
├── use-enrollments.ts   # Enrollment hooks
└── ...

app/actions/
├── settings.ts          # Settings actions
├── organizations.ts    # Organization actions
├── products.ts         # Product actions
└── ...

lib/types/
├── organization.ts     # Organization types
├── product.ts          # Product types
└── ...
```

### Should be:
```
features/
├── settings/
│   ├── hooks/
│   ├── actions/
│   ├── types/
│   └── lib/
├── organizations/
│   ├── hooks/
│   ├── actions/
│   ├── types/
│   └── lib/
├── products/
│   ├── hooks/
│   ├── actions/
│   ├── types/
│   └── lib/
└── ...
```

---

## 7. ❌ Query Keys - No Factory Pattern

### Problem:
Query keys defined inline or inconsistently.

### Found Issues:

#### 7.1 Settings
**File:** `hooks/use-settings.ts`
- ✅ Has `settingsKeys` factory (GOOD)
- ❌ But not exported for use in other files

#### 7.2 Organizations
**File:** `hooks/use-organizations.ts`
- ❌ Line 29: `queryKey: ["organizations"]` - Hardcoded, no factory

#### 7.3 Dashboard
**File:** `hooks/use-dashboard.ts`
- ❌ Has `dashboardKeys` but not following same pattern as campaigns

**Should be:**
```typescript
// features/[feature]/lib/query-keys.ts
export const featureQueryKeys = {
  all: ['feature'] as const,
  lists: () => [...featureQueryKeys.all, 'list'] as const,
  list: (filters) => [...featureQueryKeys.lists(), filters] as const,
  details: () => [...featureQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureQueryKeys.details(), id] as const,
} as const
```

---

## 📊 Summary by Feature

### ✅ Campaigns Feature
- ✅ Feature-based structure
- ✅ Centralized API layer
- ✅ Result pattern
- ✅ Query keys factory
- ✅ JSDoc documentation
- ✅ Single source types

### ❌ Settings Feature
- ❌ Direct API calls in hooks
- ❌ No centralized API layer
- ❌ Types in hook file
- ❌ Missing JSDoc
- ❌ Not feature-based

### ❌ Organizations Feature
- ❌ Direct API calls in hooks
- ❌ No Result pattern in actions
- ❌ Types scattered
- ❌ Missing JSDoc
- ❌ Not feature-based

### ❌ Products Feature
- ❌ Direct API calls (likely)
- ❌ Types in hook file
- ❌ Missing JSDoc
- ❌ Not feature-based

### ❌ Enrollments Feature
- ❌ Not audited yet (needs check)

### ❌ Invoices Feature
- ❌ Not audited yet (needs check)

### ❌ Wallet Feature
- ❌ Not audited yet (needs check)

### ❌ Team Feature
- ❌ No Result pattern in actions
- ❌ Missing JSDoc
- ❌ Not feature-based

---

## 🎯 Priority Fixes

### High Priority:
1. **Settings Feature** - Create API layer, move to feature structure
2. **Organizations Feature** - Create API layer, implement Result pattern
3. **Products Feature** - Create API layer, move to feature structure

### Medium Priority:
4. **Enrollments Feature** - Standardize
5. **Invoices Feature** - Standardize
6. **Wallet Feature** - Standardize

### Low Priority:
7. **Team Feature** - Add Result pattern, JSDoc
8. **Auth Feature** - Standardize error handling

---

## 📋 Action Items

1. Create feature structure for all remaining features
2. Create centralized API layers for each feature
3. Implement Result pattern in all server actions
4. Move types to feature-specific type files
5. Add JSDoc documentation to all functions
6. Create query keys factories for all features
7. Remove duplicate type definitions
8. Standardize error handling

---

**Total Issues Found:** 50+ mixed patterns across codebase
**Status:** ⚠️ Needs systematic refactoring

