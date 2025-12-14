# Multi-Source Problem Analysis - Active Organization

**Date:** 2024-12-19  
**Status:** ❌ **YES - Multi-source problem exists**

---

## 🔍 Current Sources of Active Organization

### 1. **Session (Database) - PRIMARY** ✅
**Location:** Backend database `session.activeOrganizationId`

**How it's used:**
- Backend: `getAuthData()` reads from session table
- Frontend SSR: `client.auth.me()` returns `activeOrganizationId` from session
- Frontend Client: `useSession()` hook gets from API (which reads session)

**Status:** ✅ **CORRECT** - This is the source of truth

---

### 2. **Cookie (active-organization-id) - REDUNDANT** ❌
**Location:** Browser cookie `active-organization-id`

**Where it's SET:**
1. `app/actions/organizations.ts:switchOrganization()` (line 95)
2. `app/actions/organizations.ts:createBasicOrganization()` (line 47)
3. `app/actions/onboarding.ts:submitOnboarding()` (line 125)

**Where it's READ:**
1. `app/actions/settings.ts` - Multiple functions (lines 86, 172, 208, 237, 265)
2. `lib/ssr-data.ts` - Constant defined but not actively used (line 39)

**Status:** ❌ **REDUNDANT** - Session already has this, cookie is duplicate

---

### 3. **Zustand Store - REMOVED** ✅
**Status:** ✅ **NOT FOUND** - No `organization-store.ts` file exists
- Zustand was removed in previous refactoring
- Now using React Query session hook instead

---

## 📊 Multi-Source Problem Details

### Problem 1: Cookie vs Session Mismatch

**Scenario:**
```
1. User switches org → Backend updates session.activeOrganizationId
2. Frontend sets cookie "active-organization-id"
3. If cookie gets out of sync → Wrong org ID used
```

**Where it causes issues:**
- `app/actions/settings.ts` reads from cookie instead of session
- If cookie is stale → Wrong organization data modified

**Example:**
```typescript
// app/actions/settings.ts (WRONG - reads cookie)
const orgId = cookieStore.get("active-organization-id")?.value

// Should be (CORRECT - reads session)
const me = await client.auth.me()
const orgId = me.activeOrganizationId
```

---

### Problem 2: Multiple Places Setting Cookie

**Current:**
- `switchOrganization()` sets cookie
- `createBasicOrganization()` sets cookie
- `submitOnboarding()` sets cookie

**Issue:**
- If any one fails to set cookie → Inconsistency
- Cookie can become stale if not updated everywhere

---

### Problem 3: Cookie Not Used in SSR Data Functions

**Good News:**
- `lib/ssr-data.ts` functions use `me()` endpoint (reads from session)
- Cookie constant is defined but not actively used
- ✅ **This is correct!**

**But:**
- `app/actions/settings.ts` still uses cookie (WRONG)

---

## 🔍 Where Cookie is Being Used (WRONG)

### 1. `app/actions/settings.ts`

**Lines 86, 172, 208, 237, 265:**
```typescript
// ❌ WRONG - Reading from cookie
const orgId = cookieStore.get("active-organization-id")?.value

// ✅ SHOULD BE - Reading from session
const client = getAuthenticatedEncoreClient(token)
const me = await client.auth.me()
const orgId = me.activeOrganizationId
```

**Impact:**
- If cookie is stale → Wrong org data modified
- Security risk if cookie is manipulated
- Inconsistent with rest of codebase

---

## ✅ Where Session is Being Used (CORRECT)

### 1. `lib/ssr-data.ts` - All Functions ✅
```typescript
// ✅ CORRECT - Uses me() endpoint (reads from session)
const meResult = await client.auth.me()
const activeOrgId = meResult.activeOrganizationId
```

### 2. `hooks/use-active-organization.ts` ✅
```typescript
// ✅ CORRECT - Uses session from React Query
const { data: sessionData } = useSession()
const activeOrgId = sessionData?.user?.activeOrganizationId
```

---

## 🎯 Solution: Remove Cookie, Use Only Session

### Step 1: Remove Cookie Setting
**Files to fix:**
- `app/actions/organizations.ts` - Remove cookie setting (lines 45-53, 92-101)
- `app/actions/onboarding.ts` - Remove cookie setting (line 125)

### Step 2: Remove Cookie Reading
**Files to fix:**
- `app/actions/settings.ts` - Replace cookie reading with session (5 places)

### Step 3: Remove Cookie Constant
**Files to fix:**
- `lib/ssr-data.ts` - Remove `ACTIVE_ORG_COOKIE` constant (line 39)

---

## 📋 Complete Fix Checklist

### Backend:
- [x] Session storage ✅ (Already correct)
- [x] No cookie usage ✅ (Backend doesn't use cookies)

### Frontend:
- [ ] Remove cookie setting from `switchOrganization()` ❌
- [ ] Remove cookie setting from `createBasicOrganization()` ❌
- [ ] Remove cookie setting from `submitOnboarding()` ❌
- [ ] Fix `app/actions/settings.ts` to use session instead of cookie ❌
- [ ] Remove `ACTIVE_ORG_COOKIE` constant ❌

---

## 🔍 Verification

### After Fix:
1. **Only ONE source:** Session (database)
2. **All reads:** From `me()` endpoint or `useSession()` hook
3. **No cookies:** For active organization ID
4. **Consistent:** All code uses same source

---

## ✅ Summary

**Current State:**
- ❌ **Multi-source problem EXISTS**
- ❌ Cookie is redundant (session already has it)
- ❌ Cookie used in `settings.ts` (wrong source)
- ✅ Session used in `ssr-data.ts` (correct)
- ✅ Zustand removed (good)

**After Fix:**
- ✅ **Single source:** Session only
- ✅ All code uses session
- ✅ No cookie needed
- ✅ Consistent across codebase

**Files Needing Fix:**
1. `app/actions/organizations.ts` - Remove cookie setting (2 places)
2. `app/actions/onboarding.ts` - Remove cookie setting (1 place)
3. `app/actions/settings.ts` - Replace cookie with session (5 places)
4. `lib/ssr-data.ts` - Remove cookie constant (1 place)

**Total:** 9 places to fix
