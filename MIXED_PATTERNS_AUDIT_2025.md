# 🔍 Mixed Patterns Audit - January 2025

**Date:** 2025-01-XX  
**Status:** ⚠️ **Multiple Mixed Patterns Found**

---

## 📊 Executive Summary

After comprehensive refactoring, several mixed patterns remain that need standardization:

1. **API Export Patterns** - Inconsistent (object vs individual functions)
2. **Query Keys** - Hardcoded strings instead of factory pattern
3. **Direct Client Calls** - Some hooks bypass API layer
4. **Settings API Usage** - References non-existent `settingsAPI` object
5. **Query Key Naming** - Inconsistent (singular vs plural)

---

## 1. ❌ API Export Pattern Inconsistency

### Problem:
Different features use different export patterns for their API layer.

### Current State:

#### Pattern A: Object Export (Used by some features)
```typescript
// features/enrollments/lib/api.ts
export const enrollmentAPI = {
  async getEnrollment(id: string) { ... },
  async listEnrollments(params) { ... },
} as const

// Usage in hooks
import { enrollmentAPI } from '../lib/api'
enrollmentAPI.getEnrollment(id)
```

**Used by:**
- ✅ `features/enrollments/lib/api.ts` - `enrollmentAPI`
- ✅ `features/products/lib/api.ts` - `productAPI` (but hooks use it)
- ✅ `features/invoices/lib/api.ts` - `invoiceAPI`
- ✅ `features/wallet/lib/api.ts` - `walletAPI`
- ✅ `features/team/lib/api.ts` - `teamAPI`

#### Pattern B: Individual Function Exports (Used by others)
```typescript
// features/settings/lib/api.ts
export async function getOrganization(id: string) { ... }
export async function listBankAccounts() { ... }

// Usage in hooks
import { getOrganization, listBankAccounts } from '../lib/api'
getOrganization(id)
```

**Used by:**
- ✅ `features/settings/lib/api.ts` - Individual functions
- ✅ `features/organizations/lib/api.ts` - Individual functions
- ✅ `features/campaigns/lib/api.ts` - Individual functions (via `* as campaignAPI`)
- ✅ `features/auth/lib/api.ts` - Individual functions

### Issue:
**Settings hooks reference non-existent `settingsAPI` object:**

**File:** `features/settings/hooks/use-settings.ts`
```typescript
// ❌ WRONG - Line 45, 100, 125
queryFn: () => settingsAPI.getOrganization(organizationId),  // settingsAPI doesn't exist!
queryFn: () => settingsAPI.getSettingsData(organizationId),  // settingsAPI doesn't exist!
const response = await settingsAPI.getOrganizationActivity({ skip, take })  // settingsAPI doesn't exist!
```

**Should be:**
```typescript
// ✅ CORRECT
import { getOrganization, getSettingsData, getOrganizationActivity } from '../lib/api'
queryFn: () => getOrganization(organizationId),
queryFn: () => getSettingsData(organizationId),
const response = await getOrganizationActivity({ skip, take })
```

### Recommendation:
**Standardize on Individual Function Exports** (Pattern B) because:
- ✅ More tree-shakeable
- ✅ Better TypeScript inference
- ✅ Easier to import only what you need
- ✅ Matches most features already

---

## 2. ❌ Hardcoded Query Keys

### Problem:
Some hooks use hardcoded query key strings instead of query keys factory.

### Found Issues:

#### 2.1 Organizations Feature
**File:** `features/organizations/hooks/use-organizations.ts`

**Line 29:**
```typescript
// ❌ WRONG
queryKey: ["organizations"],

// ✅ SHOULD BE
import { organizationsQueryKeys } from '../lib/query-keys'
queryKey: organizationsQueryKeys.list(),
```

**Lines 73, 112, 113:**
```typescript
// ❌ WRONG
await queryClient.cancelQueries({ queryKey: ["session"] })
await queryClient.invalidateQueries({ queryKey: ["session"] })
await queryClient.refetchQueries({ queryKey: ["session"] })

// ✅ SHOULD BE
import { authQueryKeys } from '@/features/auth/lib/query-keys'
await queryClient.cancelQueries({ queryKey: authQueryKeys.session() })
await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
await queryClient.refetchQueries({ queryKey: authQueryKeys.session() })
```

#### 2.2 Organization Mutations
**File:** `features/organizations/hooks/use-organization-mutations.ts`

**Lines 31, 57, 58:**
```typescript
// ❌ WRONG
await queryClient.cancelQueries({ queryKey: ["session"] })
await queryClient.invalidateQueries({ queryKey: ["session"] })
await queryClient.refetchQueries({ queryKey: ["session"] })

// ✅ SHOULD BE
import { authQueryKeys } from '@/features/auth/lib/query-keys'
await queryClient.cancelQueries({ queryKey: authQueryKeys.session() })
await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
await queryClient.refetchQueries({ queryKey: authQueryKeys.session() })
```

### Note:
`features/auth/hooks/use-organizations.ts` correctly uses `authQueryKeys.organizations()` and `authQueryKeys.session()` ✅

---

## 3. ❌ Direct Client Calls in Hooks

### Problem:
Some hooks call `getEncoreBrowserClient()` directly instead of using the API layer.

### Found Issues:

#### 3.1 Organizations Feature
**File:** `features/organizations/hooks/use-organizations.ts`

**Lines 31-32:**
```typescript
// ❌ WRONG
const client = getEncoreBrowserClient()
const result = await client.auth.listOrganizations()

// ✅ SHOULD BE
import { listOrganizations } from '../lib/api'
const result = await listOrganizations()
```

**Note:** `features/organizations/lib/api.ts` already has `listOrganizations()` function, but the hook doesn't use it!

---

## 4. ❌ Settings Mutations - Incorrect Import Usage

### Problem:
Settings mutations reference `settingsActions.verifyGST` but `verifyGST` is imported directly.

**File:** `features/settings/hooks/use-settings-mutations.ts`

**Line 122:**
```typescript
// ❌ WRONG
import { verifyGST } from '../actions/settings'
// ...
mutationFn: (data: VerifyGstInput) => settingsActions.verifyGST(data),  // settingsActions doesn't exist!

// ✅ SHOULD BE
import { verifyGST } from '../actions/settings'
mutationFn: (data: VerifyGstInput) => verifyGST(data),
```

---

## 5. ⚠️ Query Key Naming Inconsistency

### Problem:
Query key factories use inconsistent naming (singular vs plural).

### Current State:

| Feature | Query Keys Name | Status |
|---------|----------------|--------|
| campaigns | `campaignQueryKeys` | ✅ Singular |
| enrollments | `enrollmentsQueryKeys` | ✅ Plural |
| products | `productsQueryKeys` | ✅ Plural |
| invoices | `invoiceQueryKeys` | ✅ Singular |
| wallet | `walletQueryKeys` | ✅ Singular |
| team | `teamQueryKeys` | ✅ Singular |
| organizations | `organizationsQueryKeys` | ✅ Plural |
| settings | `settingsQueryKeys` | ✅ Plural |
| auth | `authQueryKeys` | ✅ Singular |

### Issue:
**Products hooks use wrong name:**

**File:** `features/products/hooks/use-products.ts`
```typescript
// ❌ WRONG - Line 13, 27
import { productQueryKeys } from "../lib/query-keys"  // Should be productsQueryKeys
queryKey: productsQueryKeys.list(filters),  // productsQueryKeys not imported!

// ✅ SHOULD BE
import { productsQueryKeys } from "../lib/query-keys"
queryKey: productsQueryKeys.list(filters),
```

**Note:** `features/products/lib/query-keys.ts` correctly exports `productsQueryKeys` (plural), but the hook imports `productQueryKeys` (singular).

---

## 6. ✅ What's Working Well

### Good Patterns Found:

1. **Campaigns Feature** ✅
   - Uses `* as campaignAPI` import pattern
   - Uses `campaignQueryKeys` factory consistently
   - No direct client calls

2. **Auth Feature** ✅
   - Uses `authQueryKeys` factory consistently
   - Uses API layer properly
   - `use-organizations.ts` in auth correctly uses query keys

3. **Enrollments Feature** ✅
   - Uses `enrollmentAPI` object consistently
   - Uses `enrollmentsQueryKeys` factory

4. **Most Features** ✅
   - Properly use API layer
   - Use query keys factory (with minor exceptions)

---

## 📋 Action Items

### Priority 1 (Critical - Breaks Code):
1. ❌ **Fix Settings hooks** - Remove `settingsAPI` references
2. ❌ **Fix Settings mutations** - Remove `settingsActions.verifyGST` reference
3. ❌ **Fix Products hooks** - Import `productsQueryKeys` instead of `productQueryKeys`

### Priority 2 (Important - Inconsistency):
4. ⚠️ **Fix Organizations hooks** - Use API layer instead of direct client calls
5. ⚠️ **Fix Organizations query keys** - Use `organizationsQueryKeys.list()` instead of `["organizations"]`
6. ⚠️ **Fix Organizations session keys** - Use `authQueryKeys.session()` instead of `["session"]`

### Priority 3 (Nice to Have - Standardization):
7. 🔄 **Consider standardizing API exports** - All features should use individual function exports
8. 🔄 **Consider standardizing query key naming** - All should be plural (or all singular)

---

## 📊 Statistics

- **Total Issues Found:** 8
- **Critical (Breaks Code):** 3
- **Important (Inconsistency):** 3
- **Nice to Have (Standardization):** 2
- **Features Affected:** 3 (settings, organizations, products)

---

## 🎯 Summary

Most of the codebase follows good patterns, but there are a few critical issues that need immediate fixing:

1. **Settings hooks** reference non-existent `settingsAPI` object
2. **Settings mutations** reference non-existent `settingsActions` object
3. **Products hooks** import wrong query keys name
4. **Organizations hooks** bypass API layer and use hardcoded query keys

These should be fixed to ensure consistency and prevent runtime errors.


