# Complete Issues TODO - Comprehensive List

**Generated:** 2024-12-19  
**Status:** 🔍 All Issues Extracted - Need Verification & Fixes

This document contains ALL issues found across all documentation files. We'll verify and fix them one by one.

---

## 🔴 CRITICAL - Build & TypeScript Errors (Must Fix First)

### 1. TypeScript Errors (80+ errors)

#### 1.1 Missing Module: `use-dashboard`
- **File:** `hooks/index.ts:13`, `components/dashboard/dashboard-shell.tsx:17`
- **Error:** Module not found: Can't resolve './use-dashboard'
- **Impact:** Dashboard shell component will not work
- **Fix:** Create `hooks/use-dashboard.ts` or remove the import
- **Status:** ❌ NOT FIXED

#### 1.2 Duplicate Imports
- **File:** `app/(dashboard)/dashboard/products/new/new-product-client.tsx:4,31`
- **Error:** Duplicate identifier 'useRouter'
- **Impact:** Build failure
- **Fix:** Remove duplicate import
- **Status:** ❌ NOT FIXED

#### 1.3 Missing Type Definitions
- **Files:** Multiple
- **Errors:**
  - `InlineBackButton` not found (enrollment-detail-client.tsx)
  - `ListChecks`, `Info`, `LinkIcon`, `ImageIcon`, `CheckCircle`, `VideoCamera`, `Star`, `ShareNetwork`, `ClipboardText` not found
  - `ProductFormInput`, `productFormSchema` not found
  - `control` not found in products-client.tsx
- **Impact:** Multiple components will not compile
- **Fix:** Add missing imports or create missing components
- **Status:** ❌ NOT FIXED

#### 1.4 Type Mismatches
- **Files:** Multiple
- **Errors:**
  - `EnrollmentStatus` type mismatch ("rejected" not in type)
  - `Campaign[]` vs `CampaignWithStats[]` mismatch
  - `Date | undefined` passed where `Date` expected
  - `"lighter"` not assignable to Badge variant type
  - `WithdrawalStatus` type mismatch
- **Impact:** Runtime type errors possible
- **Fix:** Fix type definitions and type guards
- **Status:** ❌ NOT FIXED

#### 1.5 Server-Only Import Issues
- **File:** `lib/encore.ts`
- **Error:** 'server-only' cannot be imported from Client Component
- **Impact:** Build failure
- **Fix:** Ensure `lib/encore.ts` is only imported in Server Components
- **Status:** ❌ NOT FIXED

#### 1.6 Missing Route Handler
- **File:** `.next/dev/types/validator.ts:314`
- **Error:** Cannot find module '../../../app/api/auth/[...all]/route.js'
- **Impact:** Auth routes may not work
- **Fix:** Create missing route handler or fix path
- **Status:** ❌ NOT FIXED

### 2. Build Errors (32 errors)

#### 2.1 Next.js Cache Components Conflict
- **Files:**
  - `app/(auth)/layout.tsx`
  - `app/(dashboard)/layout.tsx`
  - `app/(onboarding)/layout.tsx`
  - `app/auth/layout.tsx`
- **Error:** Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`
- **Impact:** Build will fail
- **Fix:** Remove `export const dynamic = 'force-dynamic'` or disable `cacheComponents` in `next.config.ts`
- **Status:** ❌ NOT FIXED

#### 2.2 "use cache" Directive Placement
- **Files:**
  - `app/(dashboard)/dashboard/campaigns/create/page.tsx`
  - `app/(dashboard)/dashboard/campaigns/page.tsx`
  - `app/(dashboard)/dashboard/enrollments/page.tsx`
  - `app/(dashboard)/dashboard/invoices/page.tsx`
  - `app/(dashboard)/dashboard/products/new/page.tsx`
  - `app/(dashboard)/dashboard/products/page.tsx`
  - `app/(dashboard)/dashboard/settings/page.tsx`
  - `app/(dashboard)/dashboard/team/page.tsx`
  - `app/(dashboard)/dashboard/wallet/page.tsx`
- **Error:** The "use cache" directive must be at the top of the file
- **Impact:** Build will fail
- **Fix:** Move `'use cache'` directive to line 1 (before imports)
- **Status:** ❌ NOT FIXED

#### 2.3 Server Actions Must Be Async
- **File:** `lib/error-handler-server.ts:9,33`
- **Error:** Server Actions must be async functions
- **Impact:** Server actions will not work
- **Fix:** Make `isAuthError` and `handleServerAuthError` async functions
- **Status:** ❌ NOT FIXED

---

## 🟠 HIGH PRIORITY - Code Issues & Missing Features

### 3. Type Safety Issues

#### 3.1 Server Actions - `session: any`
- **File:** `app/actions/settings.ts:471`
- **Issue:** `(result.sessions || []).map((session: any) => {`
- **Fix:** Use `auth.SessionResponse` type from Encore client
- **Status:** ❌ NOT FIXED

#### 3.2 Hooks - `old: any` in optimistic update
- **File:** `hooks/use-organizations.ts:76`
- **Issue:** `queryClient.setQueryData(['session'], (old: any) => {`
- **Fix:** Use proper session type from `useSession()` return type
- **Status:** ❌ NOT FIXED

#### 3.3 Components - `as any` casts everywhere
- **Files:**
  - `app/(dashboard)/dashboard/dashboard-client.tsx` - `initialData as any`
  - `app/(dashboard)/dashboard/enrollments/enrollments-client.tsx` - `as any[]`
  - `app/(dashboard)/dashboard/profile/profile-client.tsx` - `initialData as any`
  - `app/(dashboard)/dashboard/wallet/wallet-client.tsx` - Multiple `: any` types
  - `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx` - `initialData as any`
- **Fix:** Import and use proper types from Encore client
- **Status:** ❌ NOT FIXED

#### 3.4 Components - Array map with `: any`
- **Files:**
  - `dashboard-client.tsx` - `.map((e: any) =>`, `.map((d: any) =>`, `.map((c: any) =>`
  - `wallet-client.tsx` - `.filter((t: any) =>`, `.map((transaction: any) =>`
  - `enrollments-client.tsx` - `.map((e: any) =>`
  - `invoices-client.tsx` - `.filter((i: any) =>`, `.reduce((acc, i: any) =>`
- **Fix:** Use proper Encore types
- **Status:** ❌ NOT FIXED

### 4. Product Form - Hardcoded `isFormValid`
- **File:** `app/(dashboard)/dashboard/products/new/new-product-client.tsx:96`
- **Issue:** `const isFormValid = true` - hardcoded, button never disabled
- **Fix:** Use `formState.isValid` from RHF
- **Status:** ❌ NOT FIXED

### 5. Empty States - NOT Using Standard Components

#### 5.1 campaigns-client.tsx
- **File:** `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx:296-350`
- **Issue:** Using `EmptyState.Root` directly instead of `NoCampaignsEmptyState`
- **Fix:** Replace with `NoCampaignsEmptyState` component
- **Status:** ❌ NOT FIXED

#### 5.2 products-client.tsx
- **File:** `app/(dashboard)/dashboard/products/products-client.tsx:229-253`
- **Issue:** Using `EmptyState.Root` directly instead of `NoProductsEmptyState`
- **Fix:** Replace with `NoProductsEmptyState` component
- **Status:** ❌ NOT FIXED

#### 5.3 create-campaign-client.tsx
- **File:** `app/(dashboard)/dashboard/campaigns/create/create-campaign-client.tsx:454-458`
- **Issue:** Manual empty state (div with text-center)
- **Fix:** Use `EmptyState.Root` or `NoProductsEmptyState`
- **Status:** ❌ NOT FIXED

#### 5.4 settings-client.tsx
- **File:** `app/(dashboard)/dashboard/settings/settings-client.tsx:1188`
- **Issue:** Manual empty state (simple paragraph)
- **Fix:** Use `EmptyState.Root` with appropriate icon
- **Status:** ❌ NOT FIXED

### 6. Form Simplification - Convert to useActionState

#### 6.1 Team Invite Form
- **File:** `app/(dashboard)/dashboard/team/team-client.tsx:409-576`
- **Issue:** Using RHF for simple 3-field form
- **Fix:** Convert to `useActionState` (React 19)
- **Status:** ❌ NOT FIXED

#### 6.2 Wallet Credit Request Form
- **File:** `app/(dashboard)/dashboard/wallet/wallet-client.tsx:759-854`
- **Issue:** Using `useState` (inconsistent), should use `useActionState`
- **Fix:** Convert to `useActionState`
- **Status:** ❌ NOT FIXED

### 7. Zustand Missing Opportunities

#### 7.1 Modal States - Page Level Modals (HIGH PRIORITY)
- **Files:**
  - `app/(dashboard)/dashboard/wallet/wallet-client.tsx:72-73` - Fund & Credit Request modals
  - `app/(dashboard)/dashboard/team/team-client.tsx:95-96` - Invite & Remove modals
  - `app/(dashboard)/dashboard/products/products-client.tsx:64-65` - Add & Bulk Import modals
  - `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:65-67` - Approve, Reject, Changes modals
- **Issue:** Using `useState` for modals when Zustand modal system exists
- **Fix:** Use Zustand `useUIStore` modal system
- **Status:** ❌ NOT FIXED

#### 7.2 Filter States - Persistence (MEDIUM PRIORITY)
- **Files:**
  - `app/(dashboard)/dashboard/products/products-client.tsx:62-63` - Category/Platform filters
  - `app/(dashboard)/dashboard/enrollments/enrollments-client.tsx:128` - View mode
  - `components/dashboard/notifications-drawer.tsx:175` - Filter preference
  - `components/dashboard/notification-center.tsx:742` - Filter preference
- **Issue:** Using `useState` for filters (lost on refresh)
- **Fix:** Add to Zustand `viewPreferences` for persistence
- **Status:** ❌ NOT FIXED

### 8. React Query - Review & Potentially Remove

#### 8.1 useCategories Hook
- **File:** `hooks/use-categories.ts`
- **Usage:** `products/new/page.tsx` - For product form
- **Issue:** Categories rarely change, can be server-side fetched
- **Fix:** Convert to server-side fetch, pass as prop
- **Status:** ❌ NOT FIXED

#### 8.2 useOrganizations Hook
- **File:** `hooks/use-organizations.ts`
- **Usage:** `products/new/page.tsx` - Check if user has organization
- **Issue:** Redundant - server already checks with `requireOrganization()`
- **Fix:** Remove client-side check
- **Status:** ❌ NOT FIXED

#### 8.3 useSession Hook
- **File:** `hooks/use-session.ts`
- **Usage:** `settings-client.tsx`, `team-client.tsx`
- **Issue:** If session available from Server Component, pass as prop
- **Fix:** Review and potentially remove if redundant
- **Status:** ⚠️ NEEDS REVIEW

#### 8.4 useProducts Hook
- **File:** `hooks/use-products.ts`
- **Issue:** Need to check usage
- **Fix:** If used for initial data → Should be server-side
- **Status:** ⚠️ NEEDS REVIEW

#### 8.5 useTeam Hook
- **File:** `hooks/use-team.ts`
- **Issue:** Need to check usage
- **Fix:** Team data should come from server
- **Status:** ⚠️ NEEDS REVIEW

---

## 🟡 MEDIUM PRIORITY - Backend API Issues

### 9. Missing/Incomplete API Endpoints

#### 9.1 `/auth/me` - Missing Fields (HIGH PRIORITY)
- **Missing:** `phone: string | undefined`, `twoFactorEnabled: boolean | undefined`
- **Where Used:** `lib/ssr-data.ts:264,268`, `profile-client.tsx`, `settings-client.tsx`
- **Backend Fix Required:** Add fields to `MeResponse`
- **Status:** ❌ BACKEND FIX NEEDED

#### 9.2 `/organizations/:id` - Missing Fields (MEDIUM PRIORITY)
- **Missing:** `email: string | undefined`
- **Field Mismatches:** `phoneNumber` vs `phone`, `industryCategory` vs `industry`
- **Where Used:** `lib/ssr-data.ts:238-240`, `settings-client.tsx`
- **Backend Fix Required:** Add `email`, standardize field names
- **Status:** ❌ BACKEND FIX NEEDED

#### 9.3 `/auth/list-sessions` - Missing Device Info (MEDIUM PRIORITY)
- **Missing:** `device`, `browser`, `location`, `lastActive`, `current`, `iconType`
- **Where Used:** `settings-client.tsx:855-862,876-889`
- **Backend Fix Required:** Parse userAgent, add geolocation, track activity
- **Status:** ❌ BACKEND FIX NEEDED

#### 9.4 `/auth/list-device-sessions` - Missing Device Info (LOW PRIORITY)
- **Missing:** Same as #9.3
- **Backend Fix Required:** Same as #9.3
- **Status:** ❌ BACKEND FIX NEEDED

#### 9.5 `/organizations/:id/invitations` - Wrong Namespace
- **Issue:** Using `client.organizations.listInvitations()` which doesn't exist
- **Fix:** Use `client.auth.listInvitations({ organizationId: orgId })`
- **File:** `lib/ssr-data.ts:203-209`
- **Status:** ❌ NOT FIXED

#### 9.6 `/organizations/:organizationId/bank-accounts/:id/verify` - Unimplemented
- **Status:** Endpoint exists but throws `APIError.unimplemented`
- **Message:** "Bank account verification via penny drop is not yet implemented"
- **Backend Fix Required:** Integrate with RazorpayX Fund Account Validation API
- **Status:** ❌ BACKEND FIX NEEDED

### 10. Enrollment Detail - Unnecessary Type Assertions
- **File:** `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:37,39`
- **Issue:** Using `(enrollment as any).lockedBillRate` - fields exist in type
- **Fix:** Remove `as any` - use `enrollmentDetail.lockedBillRate` directly
- **Status:** ❌ NOT FIXED

---

## 🟢 MEDIUM PRIORITY - Code Quality & Improvements

### 11. Form Validation - Error Display Verification
- **Issue:** Need to verify error messages actually display
- **Check:**
  - Verify `FormField` component properly shows error prop
  - Check if error messages are visible to users
  - Ensure errors prevent form submission
- **Status:** ⚠️ NEEDS VERIFICATION

### 12. Session Revoke Handling - Incomplete
- **Issue:** Error handler only in error boundaries
- **Missing:**
  - Error handling in Server Actions (try-catch with `handleServerAuthError`)
  - React Query error handlers
  - Global API error interceptor
- **Status:** ❌ INCOMPLETE

### 13. Code Issues in campaigns-client.tsx
- **Line 42:** `useQueryClient` not imported
- **Line 72:** `data` is undefined
- **Line 76:** `data` is undefined
- **Status:** ❌ BROKEN CODE (may be fixed, needs verification)

### 14. Linting Issues
- **Issue:** JSON files need formatting
- **Files:** `.encore/manifest.json`, `.claude/settings.local.json`, `tsconfig.json`, `biome.json`, `package.json`
- **Issue:** Import statements need sorting in multiple files
- **Issue:** Quote style inconsistencies
- **Fix:** Run `pnpm format` or `pnpm check`
- **Status:** ❌ NOT FIXED

### 15. TODO Comments
- **File:** `components/error-boundary.tsx:35` - TODO: Send error to monitoring service
- **File:** `app/(dashboard)/dashboard/profile/profile-client.tsx` - Multiple TODOs for server actions
- **Status:** ⚠️ NEEDS ATTENTION

### 16. Environment Configuration
- **Issue:** Need to verify all required environment variables are set
- **Required:**
  - `NEXT_PUBLIC_APP_URL`
  - `ENCORE_API_URL` or `NEXT_PUBLIC_ENCORE_URL`
  - `BETTER_AUTH_SECRET` (min 32 characters)
- **Status:** ⚠️ NEEDS REVIEW

### 17. Node.js Version Mismatch
- **Required:** Node.js 24.x (as per `package.json`)
- **Current:** Node.js v25.2.1
- **Fix:** Use Node.js 24.x for production or update `package.json` engines field
- **Status:** ⚠️ WARNING

---

## 🔵 LOW PRIORITY - Optional Enhancements

### 18. Next.js 16 Optional Features

#### 18.1 `updateTag` vs `revalidateTag`
- **Issue:** Using `revalidateTag()` (background revalidation)
- **Enhancement:** Use `updateTag()` for immediate invalidation (Next.js 16)
- **Files:** `app/actions/campaigns.ts`, `app/actions/enrollments.ts`
- **Status:** 🟡 OPTIONAL

#### 18.2 Suspense Boundaries for Streaming
- **Issue:** Has `loading.tsx` files but no Suspense boundaries for streaming
- **Enhancement:** Add Suspense boundaries for slow data fetches
- **Status:** 🟡 OPTIONAL

### 19. React 19 Optional Features

#### 19.1 `useOptimistic` Hook
- **Issue:** Not used
- **Enhancement:** Use for optimistic updates (e.g., status changes)
- **Status:** 🟡 OPTIONAL

#### 19.2 `useFormStatus` Hook
- **Issue:** Not used (may be implemented, needs verification)
- **Enhancement:** Use in form buttons for better UX
- **Status:** 🟡 OPTIONAL (may already be done)

### 20. Testing
- **Issue:** No test files found
- **Issue:** No test scripts in `package.json`
- **Enhancement:** Add unit tests and integration tests
- **Status:** 🟡 OPTIONAL

### 21. Documentation
- **Issue:** Need to update README with deployment instructions
- **Issue:** Need to document environment variables
- **Issue:** Need to add API documentation
- **Status:** 🟡 OPTIONAL

### 22. Performance
- **Issue:** Need bundle size analysis
- **Issue:** Need performance testing
- **Issue:** Need optimization
- **Status:** 🟡 OPTIONAL

### 23. Security
- **Issue:** Run `pnpm audit` to check for vulnerable packages
- **Issue:** Ensure production secrets are strong and unique
- **Issue:** Verify `BETTER_AUTH_SECRET` is at least 32 characters
- **Status:** ⚠️ REVIEW REQUIRED

---

## 📊 Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Critical Build Errors** | 9 | ❌ NOT FIXED |
| **TypeScript Errors** | 6 | ❌ NOT FIXED |
| **Type Safety Issues** | 4 | ❌ NOT FIXED |
| **Empty States** | 4 | ❌ NOT FIXED |
| **Form Issues** | 3 | ❌ NOT FIXED |
| **Zustand Opportunities** | 2 | ❌ NOT FIXED |
| **React Query Review** | 5 | ⚠️ NEEDS REVIEW |
| **Backend API Issues** | 6 | ❌ BACKEND FIX NEEDED |
| **Code Quality** | 7 | ❌ NOT FIXED |
| **Optional Enhancements** | 6 | 🟡 OPTIONAL |

**Total Issues:** 52+

---

## 🎯 Action Plan

### Phase 1: Fix Critical Build Errors (MUST DO FIRST)
1. Fix TypeScript errors (80+)
2. Fix build errors (32)
3. Fix missing modules and imports
4. Verify build passes

### Phase 2: Fix High Priority Code Issues
1. Fix type safety issues
2. Fix empty states
3. Fix form issues
4. Convert simple forms to useActionState
5. Implement Zustand modal system

### Phase 3: Review & Optimize
1. Review React Query usage
2. Fix backend API issues (coordinate with backend team)
3. Complete session revoke handling
4. Fix code quality issues

### Phase 4: Optional Enhancements
1. Add React 19 features
2. Add Next.js 16 features
3. Add testing
4. Improve documentation

---

## 📝 Notes

- **Verification Required:** Many items marked as "FIXED" in other docs need manual verification
- **Backend Coordination:** Several issues require backend fixes
- **Priority Order:** Fix critical build errors first, then high priority, then medium/low
- **Testing:** After each fix, verify the change works correctly

---

**Next Step:** Start with Phase 1 - Fix Critical Build Errors



