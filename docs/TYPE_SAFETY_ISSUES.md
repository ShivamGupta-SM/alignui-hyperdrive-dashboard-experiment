# Type Safety Issues - Fix Required

**Request:** "jo bhi hooks ya server actions bana rhe ho sab typesafe hai na encore client k sath? hone hi chahiye. even frontend k components bhi"

## ❌ Type Safety Issues Found

### 1. **Server Actions - `error: any` in catch blocks** ⚠️
- **Status:** Acceptable for error handling, but can be improved
- **Files:** All server actions
- **Issue:** Using `error: any` in catch blocks
- **Fix:** Use proper error types or `unknown` with type guards

---

### 2. **Server Actions - `session: any` in getUserSessions()** ❌
- **File:** `app/actions/settings.ts` (Line 471)
- **Issue:** `(result.sessions || []).map((session: any) => {`
- **Fix:** Use `auth.SessionResponse` type from Encore client
- **Priority:** HIGH

---

### 3. **Hooks - `old: any` in optimistic update** ❌
- **File:** `hooks/use-organizations.ts` (Line 76)
- **Issue:** `queryClient.setQueryData(['session'], (old: any) => {`
- **Fix:** Use proper session type from `useSession()` return type
- **Priority:** HIGH

---

### 4. **Components - `as any` casts everywhere** ❌
- **Files:**
  - `app/(dashboard)/dashboard/dashboard-client.tsx` - `initialData as any`
  - `app/(dashboard)/dashboard/enrollments/enrollments-client.tsx` - `as any[]`
  - `app/(dashboard)/dashboard/profile/profile-client.tsx` - `initialData as any`
  - `app/(dashboard)/dashboard/wallet/wallet-client.tsx` - Multiple `: any` types
  - `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx` - `initialData as any`
- **Issue:** Components using `as any` instead of proper Encore types
- **Fix:** Import and use proper types from Encore client
- **Priority:** HIGH

---

### 5. **Components - Array map with `: any`** ❌
- **Files:**
  - `dashboard-client.tsx` - `.map((e: any) =>`, `.map((d: any) =>`, `.map((c: any) =>`
  - `wallet-client.tsx` - `.filter((t: any) =>`, `.map((transaction: any) =>`
  - `enrollments-client.tsx` - `.map((e: any) =>`
  - `invoices-client.tsx` - `.filter((i: any) =>`, `.reduce((acc, i: any) =>`
- **Issue:** Using `: any` in array operations instead of proper types
- **Fix:** Use proper Encore types
- **Priority:** HIGH

---

## ✅ What's Already Type-Safe

### Server Actions:
- ✅ Using Encore client methods (type-safe)
- ✅ Input validation with Zod (type-safe)
- ✅ Return types defined (type-safe)
- ⚠️ Error handling uses `error: any` (acceptable but can improve)

### Hooks:
- ✅ Importing types from `@/lib/encore-browser` and `@/lib/encore-client`
- ✅ Using Encore client methods (type-safe)
- ✅ Re-exporting Encore types (type-safe)
- ❌ One `old: any` in optimistic update

### Components:
- ❌ Many `as any` casts instead of proper types

---

## 🎯 Fix Plan

### Priority 1: Server Actions
1. Fix `getUserSessions()` to use `auth.SessionResponse` type
2. Improve error handling types (optional)

### Priority 2: Hooks
1. Fix optimistic update in `use-organizations.ts` to use proper session type

### Priority 3: Components
1. Replace all `as any` with proper Encore types
2. Replace all `: any` in array operations with proper types
3. Define proper prop types for all client components

---

## 📝 Type Safety Checklist

**Server Actions:**
- [ ] All Encore client calls use proper types
- [ ] Input validation with Zod
- [ ] Return types explicitly defined
- [ ] No `as any` casts
- [ ] Error handling with proper types

**Hooks:**
- [ ] Import types from Encore client
- [ ] Re-export types for convenience
- [ ] Use proper types in React Query
- [ ] No `as any` casts
- [ ] Optimistic updates use proper types

**Components:**
- [ ] Props typed with Encore types
- [ ] No `as any` casts
- [ ] Array operations use proper types
- [ ] All data transformations type-safe

---

## 🔧 Example Fixes Needed

### Fix 1: getUserSessions() - Use SessionResponse type
```typescript
// ❌ Current (unsafe)
const sessions = (result.sessions || []).map((session: any) => {

// ✅ Fixed (type-safe)
import type { auth } from '@/lib/encore-client'
const sessions = (result.sessions || []).map((session: auth.SessionResponse) => {
```

### Fix 2: use-organizations.ts - Use session type
```typescript
// ❌ Current (unsafe)
queryClient.setQueryData(['session'], (old: any) => {

// ✅ Fixed (type-safe)
import type { SessionData } from '@/hooks/use-session'
queryClient.setQueryData<SessionData>(['session'], (old) => {
```

### Fix 3: Components - Use proper types
```typescript
// ❌ Current (unsafe)
const data = initialData as any

// ✅ Fixed (type-safe)
import type { organizations } from '@/lib/encore-browser'
interface DashboardClientProps {
  initialData: organizations.DashboardOverviewResponse
}
```

---

**Status:** Type safety needs improvement in components and some hooks/actions.
