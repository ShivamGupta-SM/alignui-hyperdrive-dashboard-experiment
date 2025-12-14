# Industry Standard Implementation - Single Source of Truth

**Date:** 2024-12-19  
**Status:** ✅ **COMPLETE**

---

## 🎯 Goal

Implement industry-standard single source of truth pattern like Stripe, Notion, Clerk, Auth0:
- **Session-based active organization** (no cookies)
- **Simple API calls** (no complex state management)
- **Automatic data filtering** (session context)
- **No manual state sync** (session is source of truth)

---

## ✅ Changes Applied

### 1. **Removed Cookie Storage** ✅

**Before:**
```typescript
// ❌ Multiple sources of truth
cookieStore.set("active-organization-id", orgId)
const orgId = cookieStore.get("active-organization-id")?.value
```

**After:**
```typescript
// ✅ Single source of truth - session only
await client.auth.setActiveOrganization({ organizationId })
// Backend updates session.activeOrganizationId automatically
```

**Files Updated:**
- ✅ `app/actions/organizations.ts` - Removed cookie setting
- ✅ `app/actions/onboarding.ts` - Removed cookie setting
- ✅ `app/actions/settings.ts` - Uses session instead of cookie

---

### 2. **Simplified Data Fetching** ✅

**Before:**
```typescript
// ❌ Complex - token parameter everywhere
export async function getDashboardData(token?: string) {
  const client = await getAuthClient(token)
  const orgId = await getOrganizationIdOrNull(token)
  // ...
}
```

**After:**
```typescript
// ✅ Simple - uses cookies() directly (industry standard)
export async function getDashboardData() {
  const client = await getAuthClient() // Reads from cookies internally
  const orgId = await getOrganizationIdOrNull() // Reads from session
  // ...
}
```

**Files Updated:**
- ✅ `lib/ssr-data.ts` - All functions simplified
  - `getDashboardData()`
  - `getWalletData()`
  - `getCampaignsData()`
  - `getEnrollmentsData()`
  - `getProductsData()`
  - `getInvoicesData()`
  - `getTeamData()`
  - `getSettingsData()`
  - `getProfileData()`
  - `getCampaignDetailData()`
  - `getEnrollmentDetailData()`
  - `getCategoriesData()`
  - `getOrganizationIdOrNull()`
  - `requireOrganization()`

---

### 3. **Simplified Page Components** ✅

**Before:**
```typescript
// ❌ Complex - extract token, pass everywhere
const cookieStore = await cookies()
const token = cookieStore.get("auth-token")?.value
const orgId = await getOrganizationIdOrNull(token)
const data = await getDashboardData(token)
```

**After:**
```typescript
// ✅ Simple - direct calls (industry standard)
const orgId = await getOrganizationIdOrNull()
const data = await getDashboardData()
```

**Files Updated:**
- ✅ All 13 page components in `app/(dashboard)/dashboard/`
  - `dashboard/page.tsx`
  - `campaigns/page.tsx`
  - `campaigns/[id]/page.tsx`
  - `campaigns/create/page.tsx`
  - `enrollments/page.tsx`
  - `enrollments/[id]/page.tsx`
  - `products/page.tsx`
  - `products/new/page.tsx`
  - `wallet/page.tsx`
  - `invoices/page.tsx`
  - `team/page.tsx`
  - `settings/page.tsx`
  - `profile/page.tsx`

---

### 4. **Simplified Organization Switching** ✅

**Before:**
```typescript
// ❌ Multiple steps
async function switchOrganization(orgId: string) {
  1. Update Zustand store
  2. Call server action
  3. Update cookie
  4. Invalidate queries
  5. Refresh router
}
```

**After:**
```typescript
// ✅ Simple - just API call + router.refresh() (industry standard)
async function switchOrganization(orgId: string) {
  await client.auth.setActiveOrganization({ organizationId: orgId })
  router.refresh() // Server components auto-update
}
```

**Files Updated:**
- ✅ `app/actions/organizations.ts` - Removed cookie setting
- ✅ `hooks/use-organizations.ts` - Already simplified (optimistic updates)

---

### 5. **Removed Constants** ✅

**Before:**
```typescript
// ❌ Unused constant
const ACTIVE_ORG_COOKIE = "active-organization-id"
```

**After:**
```typescript
// ✅ Removed - no longer needed
```

**Files Updated:**
- ✅ `lib/ssr-data.ts` - Removed `ACTIVE_ORG_COOKIE` constant

---

## 📊 Industry Standard Pattern

### How It Works:

```
User Switches Organization
    ↓
Backend: setActiveOrganization()
    ↓
Better Auth updates session.activeOrganizationId
    ↓
Next Request: getAuthData() returns activeOrganizationId
    ↓
All data fetching uses session context automatically
    ↓
No manual state sync needed! ✅
```

### Comparison:

| Feature | Industry Standard | Our Implementation | Status |
|---------|------------------|-------------------|--------|
| Active Org Storage | Session only | Session only | ✅ |
| Switching | One API call | One API call | ✅ |
| State Management | None (session only) | None (session only) | ✅ |
| Query Invalidation | Automatic | Automatic (router.refresh) | ✅ |
| Data Fetching | Direct session access | Direct session access | ✅ |

---

## 🎯 Benefits

1. **Single Source of Truth**
   - Session is the only source
   - No cookie sync needed
   - No state management complexity

2. **Simpler Code**
   - No token parameters
   - No cookie management
   - Direct function calls

3. **Better Performance**
   - Fewer operations
   - Automatic caching
   - Less state sync overhead

4. **Industry Standard**
   - Matches Stripe, Notion, Clerk
   - Easier to maintain
   - Better developer experience

---

## ✅ Summary

**Removed:**
- ✅ Cookie storage (`active-organization-id`)
- ✅ Token parameters from all functions
- ✅ Complex state management
- ✅ Manual cookie sync

**Simplified:**
- ✅ Data fetching (direct session access)
- ✅ Page components (no token extraction)
- ✅ Organization switching (one API call)
- ✅ Settings actions (session-based)

**Result:**
- 🎯 Industry standard implementation
- 🎯 Single source of truth (session)
- 🎯 Simpler, cleaner code
- 🎯 Better maintainability

---

## 📚 References

- **Stripe:** Session-based organization context
- **Notion:** Workspace ID in session
- **Clerk:** `setActiveOrganization()` → session updates
- **Auth0:** Organization in auth token

Our implementation now matches these industry standards! ✅
