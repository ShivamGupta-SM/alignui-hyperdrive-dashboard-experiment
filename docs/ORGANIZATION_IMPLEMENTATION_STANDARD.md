# Organization Management - Standard Implementation Guide

**Date:** 2024-12-19  
**Based on:** Industry best practices for multi-tenant SaaS applications

## 🎯 Standard Pattern: How Production Apps Handle Organizations

### 1. **Single Source of Truth: Session/Auth**

**Standard Approach:**
```typescript
// ✅ CORRECT: Active organization stored in auth session
session.user.activeOrganizationId  // ← Single source of truth
```

**Why:**
- ✅ One place to check
- ✅ Automatically synced across all requests
- ✅ No state management complexity
- ✅ Works for SSR and client-side

**Current Status:** ✅ Already implemented correctly

---

### 2. **Organization Context in Every Request**

**Standard Pattern:**
```typescript
// ✅ CORRECT: Get org from session, not cookies/state
async function getData() {
  const session = await getSession()
  const orgId = session.user.activeOrganizationId
  
  if (!orgId) {
    redirect('/onboarding')  // ← Clear redirect
  }
  
  return fetchData(orgId)
}
```

**Anti-Pattern (What NOT to do):**
```typescript
// ❌ WRONG: Multiple sources of truth
const orgId = 
  cookies().get('active-organization-id')?.value ||  // Cookie
  zustandStore.activeOrganizationId ||              // Zustand
  session.user.activeOrganizationId ||               // Session
  organizations[0]?.id                              // Fallback
```

**Current Status:** ⚠️ Partially correct - using session, but also checking cookies

---

### 3. **Simple Organization Switching**

**Standard Pattern:**
```typescript
// ✅ CORRECT: Simple API call, session updates automatically
async function switchOrganization(orgId: string) {
  await auth.setActiveOrganization({ organizationId: orgId })
  // Session automatically updated
  // All subsequent requests use new org
}
```

**Why Simple:**
- ✅ No cookie management needed
- ✅ No state synchronization
- ✅ No query invalidation complexity
- ✅ Session is the source of truth

**Current Status:** ⚠️ Over-complicated with cookies, Zustand, query invalidation

---

### 4. **Data Fetching Pattern**

**Standard Pattern:**
```typescript
// ✅ CORRECT: Always use session's activeOrganizationId
export async function getDashboardData() {
  const session = await getSession()
  const orgId = session.user.activeOrganizationId
  
  if (!orgId) {
    throw new Error('No active organization')
  }
  
  // Fetch data for this org
  return db.query({
    where: { organizationId: orgId }
  })
}
```

**Key Points:**
- ✅ Always check session first
- ✅ Clear error if no org
- ✅ No fallbacks or defaults
- ✅ Redirect to onboarding if needed

**Current Status:** ⚠️ Complex with token passing, cookie fallbacks

---

### 5. **Onboarding Flow**

**Standard Pattern:**
```typescript
// ✅ CORRECT: Check org existence, redirect if missing
export async function requireOrganization() {
  const session = await getSession()
  const orgId = session.user.activeOrganizationId
  
  if (!orgId) {
    redirect('/onboarding')
  }
  
  return orgId
}
```

**Why:**
- ✅ Single check
- ✅ Clear redirect
- ✅ No complex logic
- ✅ Works everywhere

**Current Status:** ⚠️ Complex with multiple checks, token passing

---

## 🔧 Recommended Simplifications

### 1. **Remove Cookie-Based Organization Storage**

**Current (Complex):**
```typescript
// ❌ Multiple sources
cookieStore.set('active-organization-id', orgId)
const orgId = cookieStore.get('active-organization-id')?.value
```

**Recommended (Simple):**
```typescript
// ✅ Only session
const session = await getSession()
const orgId = session.user.activeOrganizationId
```

**Why:**
- Session already has it
- Cookies add complexity
- No sync issues

---

### 2. **Simplify Organization Switching**

**Current (Complex):**
```typescript
// ❌ Too many steps
1. Update Zustand store
2. Call server action
3. Update cookie
4. Invalidate queries
5. Refresh router
```

**Recommended (Simple):**
```typescript
// ✅ Just update session
async function switchOrganization(orgId: string) {
  await auth.setActiveOrganization({ organizationId: orgId })
  router.refresh()  // ← That's it!
}
```

**Why:**
- Session update is automatic
- Next.js router.refresh() handles everything
- No manual query invalidation needed

---

### 3. **Simplify Data Fetching**

**Current (Complex):**
```typescript
// ❌ Token passing everywhere
export async function getDashboardData(token?: string) {
  const orgId = await getOrganizationIdOrNull(token)
  // Complex logic...
}
```

**Recommended (Simple):**
```typescript
// ✅ Direct session access
export async function getDashboardData() {
  const session = await getSession()
  const orgId = session.user.activeOrganizationId
  
  if (!orgId) {
    throw new Error('No active organization')
  }
  
  return fetchData(orgId)
}
```

**Why:**
- Simpler code
- Less parameters
- Clearer errors
- Easier to debug

---

### 4. **Fix Onboarding Redirect**

**Current Issue:**
```typescript
// ❌ Complex logic, might return null incorrectly
export async function getOrganizationIdOrNull(token?: string) {
  // Multiple checks, fallbacks, error handling
  // Might return null even when org exists
}
```

**Recommended (Simple):**
```typescript
// ✅ Clear and simple
export async function requireOrganization() {
  const session = await getSession()
  const orgId = session.user.activeOrganizationId
  
  if (!orgId) {
    redirect('/onboarding')
  }
  
  return orgId
}
```

**Why:**
- No ambiguity
- Clear redirect
- No false negatives

---

## 📋 Implementation Checklist

### Phase 1: Simplify Data Fetching
- [ ] Remove `token` parameter from all `ssr-data.ts` functions
- [ ] Use `getSession()` directly instead of `cookies()`
- [ ] Remove `getOrganizationIdOrNull()` complexity
- [ ] Use simple `requireOrganization()` that checks session

### Phase 2: Simplify Organization Switching
- [ ] Remove `active-organization-id` cookie
- [ ] Remove Zustand organization store (or keep only for UI)
- [ ] Simplify `switchOrganization()` to just call API + `router.refresh()`
- [ ] Remove manual query invalidation (router.refresh handles it)

### Phase 3: Fix Onboarding Flow
- [ ] Ensure `getSession()` always returns correct `activeOrganizationId`
- [ ] Fix backend to properly set `activeOrganizationId` in session
- [ ] Remove complex organization filtering logic
- [ ] Use simple check: `if (!orgId) redirect('/onboarding')`

---

## 🎯 Standard Architecture

```
┌─────────────────────────────────────────┐
│         User Session (Auth)              │
│  ┌───────────────────────────────────┐  │
│  │ activeOrganizationId: "org-123"   │  │ ← Single Source of Truth
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              │ (used in every request)
              ▼
┌─────────────────────────────────────────┐
│      Server Components / API Calls       │
│  ┌───────────────────────────────────┐  │
│  │ const orgId = session.user.       │  │
│  │   activeOrganizationId            │  │
│  │                                    │  │
│  │ if (!orgId) redirect('/onboarding')│ │
│  │                                    │  │
│  │ fetchData(orgId)                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              │ (organization context)
              ▼
┌─────────────────────────────────────────┐
│         Database / External APIs         │
│  ┌───────────────────────────────────┐  │
│  │ WHERE organizationId = orgId       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔍 Key Principles

1. **Single Source of Truth**
   - Session is the only source for active organization
   - No cookies, no Zustand, no local state

2. **Simple Switching**
   - One API call: `setActiveOrganization()`
   - Session updates automatically
   - Router refresh handles UI updates

3. **Clear Data Flow**
   - Every request checks session
   - Clear error if no org
   - Redirect to onboarding if needed

4. **No Complexity**
   - No token passing
   - No cookie management
   - No state synchronization
   - No manual query invalidation

---

## 📚 References

- [Clerk Organizations](https://clerk.com/docs/organizations/overview) - Industry standard
- [Next.js Multi-Tenancy](https://vercel.com/platforms/docs/examples/multi-tenant-template)
- [Multi-Tenant Architecture Patterns](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview)

---

## ✅ Summary

**Current Issues:**
- ❌ Too many sources of truth (cookies, Zustand, session)
- ❌ Complex organization switching flow
- ❌ Token passing everywhere
- ❌ Complex onboarding redirect logic

**Recommended:**
- ✅ Session as single source of truth
- ✅ Simple organization switching
- ✅ Direct session access in data fetching
- ✅ Clear onboarding redirect

**Result:**
- 🎯 Simpler code
- 🎯 Easier to debug
- 🎯 Better user experience
- 🎯 Industry-standard pattern
