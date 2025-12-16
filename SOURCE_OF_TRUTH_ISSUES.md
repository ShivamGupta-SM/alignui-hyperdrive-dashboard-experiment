# Source of Truth Issues - Frontend Audit

**Date:** 2025-01-27  
**Status:** Critical issues found

---

## 🚨 Critical Source of Truth Problems

### 1. **getCurrentUser() vs getSession() - Duplicate User Fetching** ⚠️

**Problem:** Two separate functions fetch user data:

1. **`getCurrentUser()`** (`app/actions/auth.ts:314`)
   - Calls `client.auth.me()`
   - Returns `MeResponse`

2. **`getSession()`** (`app/actions/auth.ts:257`)
   - Calls `client.auth.getSession()`
   - Returns `{ session, user }` (includes user)

**Issues:**
- `getSession()` already includes user data
- `getCurrentUser()` is redundant
- Both are used in different places
- No single source of truth

**Current Usage:**
- `use-session.ts` uses `getSession()` ✅ (correct)
- `getCurrentUser()` is exported but not used in hooks ❌

**Recommendation:**
- **DELETE** `getCurrentUser()` - it's redundant
- Use `getSession()` everywhere (it has complete data)
- If only user needed, extract from `getSession().user`

---

### 2. **SSR Data Fetching - Multiple Fallback Chains** ⚠️

**Problem:** `lib/ssr-data.ts` has confusing fallback logic:

```typescript
// getOrganizationIdOrNull() - Lines 88-154
try {
  const meResult = await client.auth.me()  // First try
  if (activeOrgId) return activeOrgId
} catch {
  try {
    const sessionResult = await client.auth.getSession()  // Fallback
    // ...
  }
}
```

**Issues:**
- `me()` → `getSession()` fallback chain is confusing
- Both return same data (activeOrganizationId)
- No clear reason for fallback
- Multiple places in same file call `client.auth.me()` directly

**Locations with direct `me()` calls:**
- `getDashboardData()` - Line 199
- `getTeamData()` - Line 584
- `getSettingsData()` - Line 626
- `getProfileData()` - Line 782
- `getOrganizationIdOrNull()` - Line 96

**Recommendation:**
- **Standardize:** Use `getSession()` everywhere (single source)
- **Remove:** `me()` fallback chain
- **Create:** Helper function `getActiveOrganizationId()` that uses `getSession()`
- **Update:** All SSR functions to use helper

---

### 3. **Organization ID - Multiple Fetching Patterns** ⚠️

**Problem:** Organization ID is fetched in multiple ways:

1. **SSR:** `ssr-data.ts:getOrganizationIdOrNull()`
   - Uses `client.auth.me()` → `getSession()` fallback

2. **Client Hook:** `use-session.ts`
   - Uses `getSession()` → extracts `activeOrganizationId`

3. **Context:** `organization-context.tsx`
   - Uses `useSession()` → extracts `activeOrganizationId`

4. **Direct Calls:** Multiple SSR functions
   - Call `client.auth.me()` directly

**Issues:**
- No single pattern
- Some use `me()`, some use `getSession()`
- Inconsistent error handling
- Redundant API calls

**Recommendation:**
- **SSR:** Create `getActiveOrganizationId()` helper using `getSession()`
- **Client:** Use `useSession()` hook (already correct)
- **Remove:** Direct `me()` calls in SSR functions
- **Standardize:** All use `getSession()` as source of truth

---

### 4. **Dashboard Data - SSR vs Client Duplication** ⚠️

**Problem:** Dashboard data fetched in two places:

1. **SSR:** `ssr-data.ts:getDashboardData()` (Line 191)
   - Uses `unstable_cache`
   - Calls `client.organizations.getDashboardOverview()`

2. **Client:** `hooks/use-dashboard.ts:useDashboard()` (Line 23)
   - Uses React Query
   - Calls `client.organizations.getDashboardOverview()`

**Issues:**
- Same data fetched twice
- SSR data might be stale when client refetches
- No clear source of truth
- Potential hydration mismatches

**Current Pattern:**
- SSR fetches initial data
- Client hook refetches on mount
- Both use same API endpoint

**Recommendation:**
- **Option 1:** Use SSR only, pass data to client (no client refetch)
- **Option 2:** Use client only, remove SSR fetch (simpler)
- **Option 3:** SSR for initial load, client for updates (current, but needs coordination)

**Best:** Option 2 - Use React Query only (simpler, better caching)

---

### 5. **Session Data - Multiple Access Patterns** ⚠️

**Problem:** Session data accessed in multiple ways:

1. **Server Actions:** `getSession()` function
2. **SSR Functions:** Direct `client.auth.getSession()` calls
3. **Client Hook:** `useSession()` → calls `getSession()` action
4. **Direct Client:** Some components might call `client.auth.getSession()` directly

**Issues:**
- Inconsistent patterns
- Some bypass server actions
- No single source of truth

**Recommendation:**
- **Server:** Always use `getSession()` action (handles cookies, errors)
- **Client:** Always use `useSession()` hook (React Query caching)
- **Remove:** Direct `client.auth.getSession()` calls
- **Standardize:** Single pattern everywhere

---

### 6. **Organization List - Multiple Fetching** ⚠️

**Problem:** Organizations list fetched in multiple places:

1. **Client Hook:** `use-organizations.ts` (Line 27)
   - React Query hook
   - Calls `client.auth.listOrganizations()`

2. **SSR:** Multiple places call `client.auth.listOrganizations()` directly:
   - `app/actions/auth.ts:72` (sign-in)
   - `app/actions/onboarding.ts:93` (onboarding)
   - `app/(onboarding)/onboarding/page.tsx` (multiple places)

3. **Context:** `organization-context.tsx`
   - Uses `useOrganizations()` hook ✅ (correct)

**Issues:**
- SSR functions call API directly (bypass hooks)
- No caching in SSR
- Inconsistent patterns

**Recommendation:**
- **Client:** Use `useOrganizations()` hook (already correct)
- **SSR:** Create `getOrganizations()` helper in `ssr-data.ts`
- **Remove:** Direct `listOrganizations()` calls in actions
- **Standardize:** Single pattern

---

## 📊 Summary of Issues

### High Priority
1. ✅ **getCurrentUser() redundant** - Delete, use getSession()
2. ✅ **SSR fallback chains** - Simplify, use getSession() only
3. ✅ **Organization ID patterns** - Standardize to getSession()

### Medium Priority
4. ✅ **Dashboard duplication** - Choose SSR or client, not both
5. ✅ **Session access patterns** - Standardize to actions/hooks
6. ✅ **Organization list patterns** - Standardize to hooks/helpers

---

## 🎯 Recommended Fixes

### Fix 1: Remove getCurrentUser()
```typescript
// DELETE app/actions/auth.ts:getCurrentUser()
// Use getSession() everywhere instead
```

### Fix 2: Standardize SSR to getSession()
```typescript
// lib/ssr-data.ts
async function getActiveOrganizationId(): Promise<string | null> {
  const session = await getSession()  // Use action, not direct call
  return session.user?.activeOrganizationId || null
}

// Update all SSR functions to use this helper
```

### Fix 3: Create SSR Helpers
```typescript
// lib/ssr-data.ts
export async function getOrganizations() {
  const client = await getAuthClient()
  const result = await client.auth.listOrganizations()
  return result.organizations || []
}
```

### Fix 4: Remove Dashboard SSR (Use Client Only)
```typescript
// Remove getDashboardData() from ssr-data.ts
// Use useDashboard() hook only in client components
```

---

## ✅ What's Already Good

1. ✅ **Client hooks** - Use React Query correctly
2. ✅ **Organization context** - Uses hooks (no direct API calls)
3. ✅ **Session hook** - Uses getSession() action

---

## 📝 Implementation Order

1. **Delete getCurrentUser()** (5 min)
2. **Create SSR helpers** (30 min)
3. **Update SSR functions** (1 hour)
4. **Remove dashboard SSR** (15 min)
5. **Standardize organization fetching** (30 min)

**Total:** ~2.5 hours

---

**Status:** Multiple source of truth issues found. Need standardization across SSR and client code.



