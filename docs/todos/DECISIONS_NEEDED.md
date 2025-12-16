# Decisions Needed - A vs B Choices

**Generated:** 2024-12-19  
**Status:** ⚠️ **AWAITING DECISIONS** - User input required

This document lists all A vs B decisions that need to be made. Each decision has clear options with pros/cons and recommendations.

---

## 🔴 HIGH PRIORITY DECISIONS (Must Decide First)

### 1. Form Simplification - useActionState vs React Hook Form

**Question:** Simple forms (2-3 fields) ke liye kya use karein?

**Option A:** Keep React Hook Form (RHF) for ALL forms
- ✅ Pros: Consistent approach, mature library, handles complex forms well, validation built-in
- ❌ Cons: Overkill for simple 2-3 field forms, more boilerplate

**Option B:** Use `useActionState` (React 19) for simple forms, keep RHF for complex
- ✅ Pros: Native React, less boilerplate, built-in pending state, simpler for small forms
- ❌ Cons: Manual validation needed, less features than RHF

**Forms to Consider:**
- **Team Invite** (3 fields: email, role, message) → Currently using RHF
- **Wallet Credit Request** (2 fields: amount, reason) → Currently using RHF (but broken)
- **All other forms** → Keep RHF (complex forms)

**Recommendation:** **Option B** - Simplify Team Invite & Wallet Credit Request to `useActionState`

**Your Decision:** [ ] Option A  [ ] Option B

---

### 2. Modal State Management - Zustand vs useState

**Question:** Modal states ke liye kya use karein?

**Option A:** Use Zustand modal system (global state)
- ✅ Pros: Consistent, no prop drilling, can open modals from anywhere, persisted
- ❌ Cons: More setup, global state pollution

**Option B:** Keep `useState` for page-level modals
- ✅ Pros: Simple, local state, no global pollution, easier to understand
- ❌ Cons: Prop drilling if needed elsewhere, not persisted, can't open from outside component

**Current Usage:**
- `wallet-client.tsx` - Fund & Credit Request modals (useState)
- `team-client.tsx` - Invite & Remove modals (useState)
- `products-client.tsx` - Add & Bulk Import modals (useState)
- `enrollment-detail-client.tsx` - Approve, Reject, Changes modals (useState)

**Note:** Zustand modal system already exists in codebase

**Recommendation:** **Option A** - Use Zustand for consistency and better UX

**Your Decision:** [ ] Option A  [ ] Option B

---

### 3. Filter Persistence - Zustand vs useState

**Question:** Filter states (category, platform, view mode) ko persist karein ya nahi?

**Option A:** Use Zustand for filter persistence
- ✅ Pros: Persists across page refreshes, better UX, filters remembered
- ❌ Cons: More state management, global state

**Option B:** Keep `useState` for filters
- ✅ Pros: Simple, local state, no global pollution
- ❌ Cons: Lost on refresh, no persistence, user has to set filters again

**Current Usage:**
- `products-client.tsx` - Category/Platform filters (useState)
- `enrollments-client.tsx` - View mode filter (useState)
- `notifications-drawer.tsx` - Filter preference (useState)
- `notification-center.tsx` - Filter preference (useState)

**Recommendation:** **Option A** - Better UX with persistence

**Your Decision:** [ ] Option A  [ ] Option B

---

### 4. React Query Usage - useCategories Hook

**Question:** Categories ke liye React Query use karein ya server-side fetch?

**Option A:** Keep React Query (current)
- ✅ Pros: Caching, real-time updates, client-side refetch
- ❌ Cons: Unnecessary for static data (categories rarely change), extra network request

**Option B:** Server-side fetch, pass as prop
- ✅ Pros: Faster initial load, simpler, no client fetch needed
- ❌ Cons: No client-side caching, need to refetch on navigation

**Current Usage:** `products/new/page.tsx` - For product form dropdown

**Recommendation:** **Option B** - Categories rarely change, server-side is better

**Your Decision:** [ ] Option A  [ ] Option B

---

### 5. React Query Usage - useOrganizations Hook

**Question:** Organizations check ke liye React Query use karein ya server-side check?

**Option A:** Keep React Query check
- ✅ Pros: Client-side validation, can check before navigation
- ❌ Cons: Redundant (server already checks with `requireOrganization()`), extra network request

**Option B:** Remove, rely on server check
- ✅ Pros: Simpler, no redundant check, server is source of truth
- ❌ Cons: None (server already handles this)

**Current Usage:** `products/new/page.tsx` - Check if user has organization

**Note:** Server already checks with `requireOrganization()` in page.tsx

**Recommendation:** **Option B** - Remove redundant check

**Your Decision:** [ ] Option A  [ ] Option B

---

### 6. React Query Usage - useSession Hook

**Question:** Session data ke liye React Query use karein ya server-side pass?

**Option A:** Keep React Query (current)
- ✅ Pros: Real-time session updates, shared cache across components, can refetch
- ❌ Cons: May be redundant if passed from server, extra network request

**Option B:** Pass session from Server Component
- ✅ Pros: Faster, no client fetch, server is source of truth
- ❌ Cons: No real-time updates, need to pass props

**Current Usage:** `settings-client.tsx`, `team-client.tsx`

**Recommendation:** **Option A** - Session needs real-time updates (e.g., when revoked)

**Your Decision:** [ ] Option A  [ ] Option B

---

### 7. High Value Threshold - Hard-coded vs Configurable

**Question:** High value threshold (₹25,000) ko hard-coded rakhein ya configurable banayein?

**Option A:** Keep hard-coded (simple)
- ✅ Pros: Simple, no backend needed, fast
- ❌ Cons: Can't change without code deploy, not flexible

**Option B:** Make configurable
- ✅ Pros: Can change without deploy, flexible, per-organization config possible
- ❌ Cons: More complex, needs backend endpoint (optional)

**Options for Configurable:**
- **B1:** Move to constants file (`lib/constants.ts`) - Simple, still requires deploy
- **B2:** Use backend config endpoint (`GET /organizations/:id/config`) - Most flexible

**Current Usage:**
- `dashboard-client.tsx:506` - `25000` hard-coded
- `dashboard-client-islands.tsx:84` - `25000` hard-coded

**Recommendation:** **Option B1** (constants file) or **Option B2** (backend config)

**Your Decision:** [ ] Option A  [ ] Option B1 (constants)  [ ] Option B2 (backend config)

---

### 8. Node.js Version - 24.x vs 25.x

**Question:** Node.js version kya use karein?

**Option A:** Use Node.js 24.x (as per package.json)
- ✅ Pros: Matches package.json requirement, stable, tested
- ❌ Cons: Need to downgrade if using 25.x

**Option B:** Update package.json to allow 25.x
- ✅ Pros: Use latest version, no downgrade needed
- ❌ Cons: May have compatibility issues, not tested with 25.x

**Current:** Node.js v25.2.1 (if using)
**Required:** Node.js 24.x (per package.json engines field)

**Recommendation:** **Option A** - Match package.json requirement

**Your Decision:** [ ] Option A  [ ] Option B

---

## 🟡 OPTIONAL DECISIONS (Can Decide Later)

### 9. Cache Invalidation - revalidateTag vs updateTag

**Question:** Cache invalidation ke liye kya use karein?

**Option A:** Keep `revalidateTag()` (current, Next.js 15)
- ✅ Pros: Works, background revalidation, proven
- ❌ Cons: Not immediate, may show stale data briefly

**Option B:** Use `updateTag()` (Next.js 16 new feature)
- ✅ Pros: Immediate invalidation, better UX, no stale data
- ❌ Cons: New API, need to update code

**Recommendation:** **Option B** - Better for UX (optional enhancement)

**Your Decision:** [ ] Option A  [ ] Option B  [ ] Skip for now

---

## 📋 Summary of All Decisions

| # | Decision | Priority | Recommendation | Status |
|---|----------|----------|----------------|--------|
| 1 | Form Simplification (useActionState vs RHF) | 🔴 HIGH | Option B | ⚠️ NEEDS DECISION |
| 2 | Modal State (Zustand vs useState) | 🔴 HIGH | Option A | ⚠️ NEEDS DECISION |
| 3 | Filter Persistence (Zustand vs useState) | 🔴 HIGH | Option A | ⚠️ NEEDS DECISION |
| 4 | React Query - useCategories | 🔴 HIGH | Option B | ⚠️ NEEDS DECISION |
| 5 | React Query - useOrganizations | 🔴 HIGH | Option B | ⚠️ NEEDS DECISION |
| 6 | React Query - useSession | 🔴 HIGH | Option A | ⚠️ NEEDS DECISION |
| 7 | High Value Threshold | 🔴 HIGH | Option B1/B2 | ⚠️ NEEDS DECISION |
| 8 | Node.js Version | 🔴 HIGH | Option A | ⚠️ NEEDS DECISION |
| 9 | Cache Invalidation | 🟡 OPTIONAL | Option B | ⚠️ OPTIONAL |

---

## 🎯 Next Steps

1. **Review all decisions above**
2. **Mark your choice for each decision** (check the boxes)
3. **Save this file**
4. **I will implement your decisions**

---

**Note:** After you make decisions, I'll update `COMPREHENSIVE_AUDIT_FRESH.md` with your choices and implement them accordingly.




