# Backend-Frontend Consistency Audit

**Date:** 2024-12-19  
**Status:** 🔴 **CRITICAL ISSUES FOUND**

This document contains a comprehensive audit of backend endpoints and their usage in the frontend, identifying inconsistencies, missing fields, type mismatches, and potential breaking points.

---

## 🔴 CRITICAL ISSUES - Will Break in Production

### 1. **Campaign Status Methods - Method Name Mismatch**

**Issue:** Frontend calls methods that don't exist or have wrong signatures

**Backend Reality:**
- ✅ `updateCampaignStatus(id, { targetStatus })` - EXISTS
- ❌ `cancelCampaign(id)` - DOES NOT EXIST (removed, use updateCampaignStatus)
- ❌ `completeCampaign(id)` - DOES NOT EXIST (removed, use updateCampaignStatus)

**Frontend Usage:**
- `app/actions/campaigns.ts:106` - Uses `updateCampaignStatus` correctly ✅
- `app/actions/campaigns.ts:115` - Uses `updateCampaignStatus` correctly ✅

**Status:** ✅ **FIXED** - Frontend already uses correct method

---

### 2. **Bank Account Removal - Method Exists But Frontend Says It Doesn't**

**Issue:** Frontend claims `removeBankAccount` doesn't exist, but backend has `deleteBankAccount`

**Backend:**
- ✅ `deleteBankAccount(organizationId, id)` - EXISTS at line 844 in `organizations.ts`
- Path: `DELETE /organizations/:organizationId/bank-accounts/:id`

**Frontend:**
- `app/actions/settings.ts:196-208` - Returns error saying "Bank account removal is not yet available"
- Should use: `client.organizations.deleteBankAccount(orgId, accountId)`

**Fix Required:**
```typescript
// app/actions/settings.ts:196
export async function removeBankAccount(accountId: string): Promise<SettingsActionResult> {
  const client = getEncoreClient()
  const cookieStore = await cookies()
  const orgId = cookieStore.get("active-organization-id")?.value
  
  if (!orgId) {
    return { success: false, error: "Organization ID not found" }
  }
  
  try {
    await client.organizations.deleteBankAccount(orgId, accountId)
    revalidatePath("/dashboard/settings")
    return { success: true, message: "Bank account removed" }
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

**Priority:** 🔴 **HIGH** - Feature is broken, users can't remove bank accounts

---

### 3. **Invitations Endpoint - Wrong Namespace**

**Issue:** Frontend tries to use `organizations.listInvitations()` but endpoint is in `auth` namespace

**Backend:**
- ✅ `auth.listInvitations({ organizationId })` - EXISTS
- ❌ `organizations.listInvitations()` - DOES NOT EXIST

**Frontend:**
- `lib/ssr-data.ts:203-209` - Uses `client.organizations.listInvitations(orgId)` ❌
- Returns empty array as workaround

**Fix Required:**
```typescript
// lib/ssr-data.ts:203
const invitationsResult = await client.auth.listInvitations({ organizationId: orgId })
const invitations = invitationsResult.invitations || []
```

**Priority:** 🟡 **MEDIUM** - Team page invitations list is empty

---

## 🟡 HIGH PRIORITY - Missing Fields in Responses

### 4. **GET /auth/me - Missing Fields**

**Missing Fields:**
- ❌ `phone: string | undefined`
- ❌ `twoFactorEnabled: boolean | undefined`

**Where Used:**
- `lib/ssr-data.ts:264` - Uses `me.phone || ''` (empty string fallback)
- `lib/ssr-data.ts:268` - Uses `me.twoFactorEnabled` (undefined)
- `app/(dashboard)/dashboard/profile/profile-client.tsx` - Uses `user.twoFactorEnabled`
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `user.phone`

**Impact:** Profile and settings pages can't display phone or 2FA status

**Priority:** 🔴 **HIGH**

---

### 5. **GET /organizations/:id - Field Name Mismatches**

**Backend Returns:**
- `phoneNumber?: string`
- `industryCategory?: string`
- ❌ `email` - MISSING

**Frontend Expects:**
- `phone?: string`
- `industry?: string`
- `email?: string`

**Where Used:**
- `lib/ssr-data.ts:238-240` - Has workaround mapping:
  ```typescript
  phone: organization.phoneNumber || '',
  industry: organization.industryCategory || '',
  email: '', // ❌ Missing in backend
  ```
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `organization.email`, `organization.phone`, `organization.industry`

**Impact:** Settings page can't show/edit organization email

**Priority:** 🟡 **MEDIUM**

---

### 6. **GET /auth/list-sessions - Missing Device Info**

**Missing Fields:**
- ❌ `device: string`
- ❌ `browser: string`
- ❌ `location: string`
- ❌ `lastActive: string`
- ❌ `current: boolean`
- ❌ `iconType: 'computer' | 'smartphone' | 'mac'`

**Where Used:**
- `app/actions/settings.ts:493-516` - Has client-side parsing workaround
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Displays device info

**Current Workaround:**
Frontend parses `userAgent` client-side, but this is unreliable and incomplete.

**Impact:** Sessions list shows "Unknown Device/Browser/Location"

**Priority:** 🟡 **MEDIUM**

---

## 🟠 MEDIUM PRIORITY - Missing Endpoints

### 7. **Subscription/Billing Endpoints - Completely Missing**

**Missing Endpoints:**
- ❌ `GET /organizations/:id/subscription`
- ❌ `GET /organizations/:id/billing-history`
- ❌ `GET /organizations/:id/billing-address`
- ❌ `PATCH /organizations/:id/billing-address`
- ❌ `GET /organizations/:id/payment-methods`
- ❌ `GET /organizations/:id/plans`
- ❌ `POST /organizations/:id/subscription`

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - All hard-coded values
- Shows "Pro Plan", "₹4,999/mo", hard-coded payment history

**Impact:** Billing section is completely non-functional

**Priority:** 🟡 **MEDIUM**

---

### 8. **Credit Request - Parameter Name Mismatch**

**Backend:**
- `organizations.requestCreditIncrease(organizationId, { requestedAmount, reason })`

**Frontend:**
- `app/actions/wallet.ts:63` - Uses `requestedAmount` ✅ CORRECT

**Status:** ✅ **CORRECT** - No issue here

---

## 🟢 LOW PRIORITY - Type Safety Issues

### 9. **Settings Actions - Missing Return Type Fields**

**Issue:** `enable2FA` returns `backupCodes` but type doesn't include it

**Backend Response:**
```typescript
{
  success: boolean
  totpURI?: string
  backupCodes?: string[]
}
```

**Frontend:**
- `app/actions/settings.ts:307` - Returns `backupCodes: result.backupCodes`
- `SettingsActionResult` type may not include `backupCodes`

**Check Required:** Verify `SettingsActionResult` type includes `backupCodes?: string[]`

**Priority:** 🟢 **LOW**

---

### 10. **Enrollment Detail - Type Assertions**

**Issue:** Using type assertions for fields that should exist in type

**Frontend:**
- `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:92-94`
- Uses type guards instead of `as any` ✅ FIXED

**Status:** ✅ **FIXED**

---

## 📊 Summary by Category

### Method Name Mismatches
1. ✅ `cancelCampaign` / `completeCampaign` - Frontend uses correct `updateCampaignStatus`
2. 🔴 `removeBankAccount` - Frontend says doesn't exist, but `deleteBankAccount` exists
3. 🟡 `listInvitations` - Wrong namespace (`organizations` vs `auth`)

### Missing Fields
1. 🔴 `auth.me()` - Missing `phone`, `twoFactorEnabled`
2. 🟡 `organizations.getOrganization()` - Missing `email`, field name mismatches
3. 🟡 `auth.listSessions()` - Missing device info fields

### Missing Endpoints
1. 🟡 Subscription management (7 endpoints)
2. 🟢 Bank account verification (unimplemented but endpoint exists)

### Type Safety
1. ✅ Enrollment detail type assertions - FIXED
2. 🟢 Settings action return types - Needs verification

---

## 🎯 Action Items

### Immediate Fixes (Do First)

1. **Fix `removeBankAccount` in settings.ts**
   - File: `app/actions/settings.ts:196`
   - Change: Use `client.organizations.deleteBankAccount(orgId, accountId)`
   - Impact: Users can remove bank accounts

2. **Fix `listInvitations` namespace**
   - File: `lib/ssr-data.ts:203`
   - Change: Use `client.auth.listInvitations({ organizationId: orgId })`
   - Impact: Team page shows invitations

### Backend Required (High Priority)

3. **Add fields to `auth.me()`**
   - Add `phone?: string`
   - Add `twoFactorEnabled?: boolean`
   - Impact: Profile and settings pages work correctly

4. **Fix `organizations.getOrganization()`**
   - Add `email?: string`
   - Standardize `phoneNumber` → `phone` OR add `phone` alias
   - Standardize `industryCategory` → `industry` OR add `industry` alias
   - Impact: Settings page can show/edit organization details

5. **Add device info to `auth.listSessions()`**
   - Add `device`, `browser`, `location`, `lastActive`, `current`, `iconType`
   - Impact: Sessions list shows proper device info

### Backend Required (Medium Priority)

6. **Create subscription/billing endpoints**
   - 7 new endpoints needed
   - Impact: Billing section becomes functional

---

## 🔍 Detailed Findings

### Campaign Actions

**File:** `app/actions/campaigns.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `createCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `updateCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `deleteCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `submitForApproval` | ✅ Yes | ✅ Correct | ✅ OK |
| `activateCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `pauseCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `resumeCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `endCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `archiveCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `unarchiveCampaign` | ✅ Yes | ✅ Correct | ✅ OK |
| `updateCampaignStatus` | ✅ Yes | ✅ Correct | ✅ OK |
| `cancelCampaign` | ❌ No (removed) | ✅ Uses `updateCampaignStatus` | ✅ OK |
| `completeCampaign` | ❌ No (removed) | ✅ Uses `updateCampaignStatus` | ✅ OK |

**Verdict:** ✅ All campaign actions are correct

---

### Enrollment Actions

**File:** `app/actions/enrollments.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `approveEnrollment` | ✅ Yes | ✅ Correct | ✅ OK |
| `rejectEnrollment` | ✅ Yes | ✅ Correct | ✅ OK |
| `withdrawEnrollment` | ✅ Yes | ✅ Correct | ✅ OK |
| `bulkApproveEnrollments` | ✅ Yes | ✅ Correct | ✅ OK |
| `bulkRejectEnrollments` | ✅ Yes | ✅ Correct | ✅ OK |
| `requestChanges` | ✅ Yes | ✅ Correct | ✅ OK |
| `exportEnrollments` | ✅ Yes | ✅ Correct | ✅ OK |

**Verdict:** ✅ All enrollment actions are correct

---

### Organization Actions

**File:** `app/actions/organizations.ts`, `app/actions/settings.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `updateOrganization` | ✅ Yes | ✅ Correct | ✅ OK |
| `verifyGST` | ✅ Yes | ✅ Correct | ✅ OK |
| `verifyPAN` | ✅ Yes | ✅ Correct | ✅ OK |
| `addBankAccount` | ✅ Yes | ✅ Correct | ✅ OK |
| `setDefaultBankAccount` | ✅ Yes | ✅ Correct | ✅ OK |
| `deleteBankAccount` | ✅ Yes | ❌ Frontend says doesn't exist | 🔴 **BROKEN** |
| `verifyBankAccount` | ⚠️ Exists but unimplemented | ✅ Handles gracefully | 🟡 OK |
| `requestCreditIncrease` | ✅ Yes | ✅ Correct | ✅ OK |
| `listInvitations` | ✅ Yes (in `auth`) | ❌ Wrong namespace | 🟡 **BROKEN** |

**Verdict:** 
- 🔴 `removeBankAccount` is broken (should use `deleteBankAccount`)
- 🟡 `listInvitations` uses wrong namespace

---

### Wallet Actions

**File:** `app/actions/wallet.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `createOrganizationWithdrawal` | ✅ Yes | ✅ Correct | ✅ OK |
| `cancelWithdrawal` | ✅ Yes | ✅ Correct | ✅ OK |
| `requestCreditIncrease` | ✅ Yes | ✅ Correct | ✅ OK |

**Verdict:** ✅ All wallet actions are correct

---

### Product Actions

**File:** `app/actions/products.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `createProduct` | ✅ Yes | ✅ Correct | ✅ OK |
| `updateProduct` | ✅ Yes | ✅ Correct | ✅ OK |
| `deleteProduct` | ✅ Yes | ✅ Correct | ✅ OK |
| `bulkImportProducts` | ✅ Yes | ✅ Correct | ✅ OK |

**Verdict:** ✅ All product actions are correct

---

### Auth Actions

**File:** `app/actions/auth.ts`

| Method | Backend Exists? | Frontend Usage | Status |
|--------|----------------|----------------|--------|
| `signInEmail` | ✅ Yes | ✅ Correct | ✅ OK |
| `signUpEmail` | ✅ Yes | ✅ Correct | ✅ OK |
| `signInSocial` | ✅ Yes | ✅ Correct | ✅ OK |
| `signOut` | ✅ Yes | ✅ Correct | ✅ OK |
| `getSession` | ✅ Yes | ✅ Correct | ✅ OK |
| `me` | ✅ Yes | ⚠️ Missing fields | 🟡 **INCOMPLETE** |
| `listSessions` | ✅ Yes | ⚠️ Missing fields | 🟡 **INCOMPLETE** |
| `revokeSession` | ✅ Yes | ✅ Correct | ✅ OK |
| `revokeOtherSessions` | ✅ Yes | ✅ Correct | ✅ OK |
| `inviteMemberAuth` | ✅ Yes | ✅ Correct | ✅ OK |

**Verdict:** 
- 🟡 `me` endpoint missing `phone` and `twoFactorEnabled`
- 🟡 `listSessions` missing device info fields

---

## 🚨 Potential Breaking Points

### 1. **Settings Page - Bank Account Removal**
- **File:** `app/actions/settings.ts:196`
- **Issue:** Returns error instead of calling existing endpoint
- **Impact:** Users cannot remove bank accounts
- **Fix:** Use `client.organizations.deleteBankAccount(orgId, accountId)`

### 2. **Team Page - Invitations List**
- **File:** `lib/ssr-data.ts:203`
- **Issue:** Uses wrong namespace, returns empty array
- **Impact:** Team page doesn't show pending invitations
- **Fix:** Use `client.auth.listInvitations({ organizationId: orgId })`

### 3. **Profile Page - Phone & 2FA**
- **Files:** `lib/ssr-data.ts:264,268`
- **Issue:** Backend doesn't return `phone` or `twoFactorEnabled`
- **Impact:** Profile page shows empty/undefined values
- **Fix:** Backend needs to add these fields to `MeResponse`

### 4. **Settings Page - Organization Email**
- **File:** `lib/ssr-data.ts:240`
- **Issue:** Backend doesn't return `email` field
- **Impact:** Settings page can't show/edit organization email
- **Fix:** Backend needs to add `email` to `Organization` response

### 5. **Settings Page - Sessions Device Info**
- **File:** `app/actions/settings.ts:493-516`
- **Issue:** Backend doesn't return device/browser/location
- **Impact:** Sessions list shows "Unknown Device/Browser/Location"
- **Fix:** Backend needs to parse userAgent and add fields to `SessionResponse`

### 6. **Settings Page - Billing Section**
- **File:** `app/(dashboard)/dashboard/settings/settings-client.tsx`
- **Issue:** All subscription/billing endpoints missing
- **Impact:** Entire billing section is hard-coded, non-functional
- **Fix:** Backend needs to create 7 new endpoints

---

## ✅ Verification Checklist

### Frontend Fixes (Do Immediately)
- [ ] Fix `removeBankAccount` to use `deleteBankAccount`
- [ ] Fix `listInvitations` to use `auth` namespace
- [ ] Remove workarounds after backend fixes

### Backend Fixes (High Priority)
- [ ] Add `phone` to `MeResponse`
- [ ] Add `twoFactorEnabled` to `MeResponse`
- [ ] Add `email` to `Organization` response
- [ ] Standardize `phoneNumber` → `phone` in `Organization`
- [ ] Standardize `industryCategory` → `industry` in `Organization`
- [ ] Add device info fields to `SessionResponse`

### Backend Fixes (Medium Priority)
- [ ] Create `GET /organizations/:id/subscription`
- [ ] Create `GET /organizations/:id/billing-history`
- [ ] Create `GET /organizations/:id/billing-address`
- [ ] Create `PATCH /organizations/:id/billing-address`
- [ ] Create `GET /organizations/:id/payment-methods`
- [ ] Create `GET /organizations/:id/plans`
- [ ] Create `POST /organizations/:id/subscription`

---

## 📝 Notes

1. **Most endpoints are correctly used** - Good news!
2. **Main issues are missing fields and missing endpoints**
3. **Two critical frontend bugs** - `removeBankAccount` and `listInvitations`
4. **Billing section completely non-functional** - Needs 7 new endpoints

---

**Total Issues Found:** 14
- 🔴 Critical: 2 (frontend bugs)
- 🟡 High Priority: 4 (missing fields)
- 🟡 Medium Priority: 7 (missing endpoints)
- 🟢 Low Priority: 1 (type verification)

**Status:** ⚠️ **Action Required** - Fix frontend bugs immediately, coordinate with backend for missing fields/endpoints

