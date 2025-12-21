# Duplicate API Calls Analysis

## Issues Found

### 1. Multiple `listOrganizations` Calls (3 times)
**Locations:**
- `app/(onboarding)/onboarding/page.tsx:242` - In `loadDraft` function
- `app/(onboarding)/onboarding/page.tsx:492` - In `createOrganizationForDraft` function
- `app/(onboarding)/onboarding/page.tsx:597` - In `handleVerifyGst` function

**Problem:** Har function independently organizations fetch kar raha hai

### 2. Multiple `getOrganization` Calls (2+ times)
**Location:**
- `features/auth/actions/auth-actions.ts:58` - In `ensureActiveOrganization` loop (up to 3 times)

**Problem:** Loop mein har organization ke liye separate API call

### 3. Multiple `setActiveOrganization` Calls (2 times)
**Locations:**
- `features/auth/actions/auth-actions.ts:74` - In `ensureActiveOrganization`
- `features/organizations/actions/onboarding.ts` - In `verifyGST`

**Problem:** Same organization ko multiple baar set kar rahe hain

### 4. Multiple `verifyGST` Calls (2 times)
**Locations:**
- `app/(onboarding)/onboarding/page.tsx` - In `handleVerifyGst`
- `features/organizations/actions/onboarding.ts` - In `submitOnboarding`

**Problem:** GST verification do baar ho rahi hai

## Root Causes

1. **No Shared State:** Har function independently data fetch kar raha hai
2. **No Memoization:** Same data multiple baar fetch ho raha hai
3. **Inefficient Loops:** `ensureActiveOrganization` mein loop se multiple API calls
4. **Missing Caching:** Client-side caching nahi hai

## Solutions

### 1. Create Shared Organization List Hook
Use React Query to cache organization list

### 2. Optimize `ensureActiveOrganization`
- Don't call `getOrganization` in loop
- Use `listOrganizations` result directly (if approvalStatus is in response)

### 3. Memoize Organization List in Onboarding Page
- Fetch once, use everywhere

### 4. Remove Duplicate `verifyGST` Calls
- Only verify once, not in both places


