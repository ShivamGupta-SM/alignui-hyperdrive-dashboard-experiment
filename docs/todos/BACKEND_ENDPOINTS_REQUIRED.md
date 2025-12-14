# Backend Endpoints Required - Complete List

**Generated:** 2024-12-19  
**For:** Backend Engineering Team  
**Status:** 🔴 **ACTION REQUIRED** - Frontend blocked on these endpoints

This document contains **ALL** missing endpoints and incomplete/broken endpoints that need backend fixes. Frontend is currently using workarounds/hard-coded values for these.

---

## 🔴 HIGH PRIORITY - Missing Fields in Existing Endpoints

### 1. `GET /auth/me` - Missing Fields

**Endpoint:** `client.auth.me()`  
**Backend File:** `Hypedrive Encore/auth/auth.ts` (line 272-301)  
**Response Type:** `MeResponse`

**Missing Fields:**
- ❌ `phone: string | undefined` - User phone number
- ❌ `twoFactorEnabled: boolean | undefined` - 2FA status

**Current Response:**
```typescript
interface MeResponse {
  userID: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
  role: string
  activeOrganizationId?: string
  organizationRole?: string
  organizationIds?: string[]
  shopperId?: string
  adminId?: string
  isImpersonating?: boolean
  impersonatedBy?: string
  // ❌ MISSING: phone
  // ❌ MISSING: twoFactorEnabled
}
```

**Required Response:**
```typescript
interface MeResponse {
  // ... existing fields
  phone?: string  // ← ADD THIS (from user table)
  twoFactorEnabled?: boolean  // ← ADD THIS (from user table or 2FA plugin)
}
```

**Where Used:**
- `lib/ssr-data.ts:264` - `phone: me.phone || ''` (empty string fallback)
- `lib/ssr-data.ts:268` - `twoFactorEnabled: me.twoFactorEnabled` (undefined)
- `app/(dashboard)/dashboard/profile/profile-client.tsx` - Uses `user.twoFactorEnabled`
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `user.phone`

**Implementation:**
- Fetch `phone` from user table
- Fetch `twoFactorEnabled` from user table or 2FA plugin configuration

**Priority:** 🔴 **HIGH** - Used in profile and settings pages

---

### 2. `GET /organizations/:id` - Missing Fields & Field Name Mismatches

**Endpoint:** `client.organizations.getOrganization(id)`  
**Backend File:** `Hypedrive Encore/organizations/organizations.ts`  
**Response Type:** `Organization`

**Missing/Incorrect Fields:**
- ❌ `email: string | undefined` - Organization contact email (completely missing)
- ⚠️ Field name mismatch: `phoneNumber` (backend) vs `phone` (frontend expects)
- ⚠️ Field name mismatch: `industryCategory` (backend) vs `industry` (frontend expects)

**Current Response:**
```typescript
interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  phoneNumber?: string  // ← Frontend expects 'phone'
  industryCategory?: string  // ← Frontend expects 'industry'
  // ❌ MISSING: email
  // ... other fields
}
```

**Required Response (Option A - Add fields):**
```typescript
interface Organization {
  // ... existing fields
  email?: string  // ← ADD THIS (organization contact email)
  phone?: string  // ← ADD THIS (alias for phoneNumber, or rename phoneNumber to phone)
  industry?: string  // ← ADD THIS (alias for industryCategory, or rename industryCategory to industry)
}
```

**Required Response (Option B - Standardize names):**
```typescript
interface Organization {
  // ... existing fields
  email?: string  // ← ADD THIS
  phone?: string  // ← RENAME from phoneNumber
  industry?: string  // ← RENAME from industryCategory
}
```

**Where Used:**
- `lib/ssr-data.ts:238-240` - Field mapping workaround:
  ```typescript
  phone: organization.phoneNumber || '',
  industry: organization.industryCategory || '',
  email: '', // ❌ Missing in backend - needs to be added
  ```
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `organization.email`, `organization.phone`, `organization.industry`

**Implementation:**
- Add `email` field to organization table/response
- Either rename `phoneNumber` → `phone` OR add `phone` as alias
- Either rename `industryCategory` → `industry` OR add `industry` as alias

**Priority:** 🟡 **MEDIUM** - Used in settings page, field mapping workaround exists

---

### 3. `GET /auth/list-sessions` - Missing Device Info

**Endpoint:** `client.auth.listSessions()`  
**Backend File:** `Hypedrive Encore/auth/auth.ts`  
**Response Type:** `{ sessions: SessionResponse[] }`

**Missing Fields:**
- ❌ `device: string | undefined` - Device name (e.g., "iPhone 14 Pro", "MacBook Pro")
- ❌ `browser: string | undefined` - Browser name (e.g., "Chrome", "Safari")
- ❌ `location: string | undefined` - Location (e.g., "Mumbai, India")
- ❌ `lastActive: string | undefined` - Last active timestamp
- ❌ `current: boolean` - Whether this is the current session
- ❌ `iconType: 'computer' | 'smartphone' | 'mac' | undefined` - Device type for icon

**Current Response:**
```typescript
interface SessionResponse {
  id: string
  token: string
  userId: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  // ❌ MISSING: device
  // ❌ MISSING: browser
  // ❌ MISSING: location
  // ❌ MISSING: lastActive
  // ❌ MISSING: current
  // ❌ MISSING: iconType
}
```

**Required Response:**
```typescript
interface SessionResponse {
  // ... existing fields
  device?: string  // ← ADD THIS (parse from userAgent)
  browser?: string  // ← ADD THIS (parse from userAgent)
  location?: string  // ← ADD THIS (IP geolocation)
  lastActive?: string  // ← ADD THIS (last activity timestamp)
  current?: boolean  // ← ADD THIS (compare with current session token)
  iconType?: 'computer' | 'smartphone' | 'mac'  // ← ADD THIS (infer from userAgent)
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:855-862` - `Session` interface expects these fields
- `app/(dashboard)/dashboard/settings/settings-client.tsx:876-889` - `getUserSessions()` server action
- Settings page security section displays device info

**Implementation Notes:**
- Parse `userAgent` to extract device and browser names (use library like `ua-parser-js`)
- Use IP geolocation service for location (e.g., MaxMind, ipapi.co)
- Track last activity timestamp per session (update on each request)
- Compare session token with current session to set `current`
- Infer `iconType` from userAgent:
  - Mobile devices → `'smartphone'`
  - Mac devices → `'mac'`
  - Others → `'computer'`

**Priority:** 🟡 **MEDIUM** - Used in settings security section

---

### 4. `GET /auth/list-device-sessions` - Missing Device Info

**Endpoint:** `client.auth.listDeviceSessions()`  
**Backend File:** `Hypedrive Encore/auth/auth.ts`  
**Response Type:** `{ sessions: DeviceSession[] }`

**Missing Fields:**
- ❌ Same as SessionResponse (device, browser, location, lastActive, iconType)

**Current Response:**
```typescript
interface DeviceSession {
  id: string
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
  // ❌ MISSING: device, browser, location, lastActive, iconType
}
```

**Required Response:**
```typescript
interface DeviceSession {
  // ... existing fields
  device?: string  // ← ADD THIS
  browser?: string  // ← ADD THIS
  location?: string  // ← ADD THIS
  lastActive?: string  // ← ADD THIS
  iconType?: 'computer' | 'smartphone' | 'mac'  // ← ADD THIS
}
```

**Implementation:** Same as Fix #3 (SessionResponse)

**Priority:** 🟢 **LOW** - Similar to listSessions

---

## 🟡 MEDIUM PRIORITY - Completely Missing Endpoints

### 5. `GET /organizations/:id/subscription` - Missing Endpoint

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `GET /organizations/:id/subscription`
- **Method:** `GET`
- **Auth:** Required (organization member)

**Response Type:**
```typescript
interface SubscriptionResponse {
  planId: string
  planName: string  // e.g., "Pro Plan", "Enterprise Plan"
  planType: 'starter' | 'growth' | 'enterprise' | 'custom'
  price: number  // Monthly price in paise
  currency: string  // e.g., "INR"
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  currentPeriodStart: string  // ISO date
  currentPeriodEnd: string  // ISO date
  cancelAtPeriodEnd: boolean
  features: {
    maxCampaigns?: number
    maxEnrollments?: number
    maxTeamMembers?: number
    customBranding?: boolean
    prioritySupport?: boolean
    // ... other features
  }
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:583-584` - Currently hard-coded "Pro Plan", "₹4,999/mo"
- `components/dashboard/settings-panel.tsx:1100-1105` - Currently hard-coded "Pro Plan", "₹4,999/month"

**Current Workaround:**
- Frontend shows hard-coded "Pro Plan" and "₹4,999/mo"

**Priority:** 🟡 **MEDIUM** - Used in settings page billing section

---

### 6. `GET /organizations/:id/billing-history` - Missing Endpoint

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `GET /organizations/:id/billing-history`
- **Method:** `GET`
- **Auth:** Required (organization member)
- **Query Params:** `?limit=10&offset=0` (optional pagination)

**Response Type:**
```typescript
interface BillingHistoryResponse {
  transactions: BillingTransaction[]
  total: number
  limit: number
  offset: number
}

interface BillingTransaction {
  id: string
  type: 'subscription' | 'one-time' | 'refund' | 'credit'
  amount: number  // In paise
  currency: string  // e.g., "INR"
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  description: string  // e.g., "Pro Plan - November 2024"
  date: string  // ISO date
  invoiceId?: string  // Link to invoice if available
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'upi'
    last4?: string  // Last 4 digits of card
    brand?: string  // Card brand (Visa, Mastercard, etc.)
  }
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:662-677` - Currently hard-coded `['Nov 2024', 'Oct 2024', 'Sep 2024']` and `"₹4,999"`
- `components/dashboard/settings-panel.tsx:1140-1144` - Currently hard-coded months and amounts

**Current Workaround:**
- Frontend shows hard-coded payment history array

**Priority:** 🟡 **MEDIUM** - Used in settings page billing section

---

### 7. `GET /organizations/:id/billing-address` - Missing Endpoint

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `GET /organizations/:id/billing-address`
- **Method:** `GET`
- **Auth:** Required (organization member)

**Response Type:**
```typescript
interface BillingAddressResponse {
  id: string
  organizationId: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  gstin?: string  // GST number if applicable
  createdAt: string
  updatedAt: string
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:640-657` - Currently uses `organization.address` (may not be billing address)
- Edit button is non-functional (needs update endpoint)

**Current Workaround:**
- Frontend uses `organization.address` as fallback

**Priority:** 🟡 **MEDIUM** - Used in settings page billing section

---

### 8. `PATCH /organizations/:id/billing-address` - Missing Endpoint

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `PATCH /organizations/:id/billing-address`
- **Method:** `PATCH`
- **Auth:** Required (organization admin)

**Request Body:**
```typescript
interface UpdateBillingAddressRequest {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  gstin?: string
}
```

**Response Type:**
```typescript
interface BillingAddressResponse {
  // Same as GET response
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:644-647` - Edit button is non-functional

**Priority:** 🟡 **MEDIUM** - Needed for billing address editing

---

### 9. `GET /organizations/:id/payment-methods` - Missing Endpoint

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `GET /organizations/:id/payment-methods`
- **Method:** `GET`
- **Auth:** Required (organization member)

**Response Type:**
```typescript
interface PaymentMethodsResponse {
  methods: PaymentMethod[]
  defaultMethodId?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'upi'
  isDefault: boolean
  // For cards:
  last4?: string  // Last 4 digits
  brand?: string  // Visa, Mastercard, etc.
  expiryMonth?: number
  expiryYear?: number
  // For bank accounts:
  accountNumber?: string  // Last 4 digits only
  bankName?: string
  ifsc?: string
  // For UPI:
  upiId?: string
  createdAt: string
}
```

**Where Used:**
- `components/dashboard/settings-panel.tsx:1128-1129` - Currently hard-coded "•••• 4242" and "Expires 12/25"

**Current Workaround:**
- Frontend shows hard-coded payment method

**Priority:** 🟡 **MEDIUM** - Used in settings panel

---

### 10. `GET /organizations/:id/plans` - Missing Endpoint (For Upgrade Flow)

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `GET /organizations/:id/plans`
- **Method:** `GET`
- **Auth:** Required (organization admin)
- **Query Params:** `?available=true` (optional - show only available plans)

**Response Type:**
```typescript
interface PlansResponse {
  plans: Plan[]
  currentPlanId?: string
}

interface Plan {
  id: string
  name: string  // e.g., "Starter", "Growth", "Enterprise"
  description: string
  price: number  // Monthly price in paise
  currency: string
  billingCycle: 'monthly' | 'yearly'
  features: {
    maxCampaigns?: number
    maxEnrollments?: number
    maxTeamMembers?: number
    customBranding?: boolean
    prioritySupport?: boolean
    // ... other features
  }
  isPopular?: boolean
  isAvailable: boolean
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:586-588` - "Upgrade" button is non-functional
- Needed for plan selection/upgrade flow

**Priority:** 🟡 **MEDIUM** - Needed for upgrade functionality

---

### 11. `POST /organizations/:id/subscription` - Missing Endpoint (For Plan Changes)

**Status:** ❌ **ENDPOINT DOES NOT EXIST**

**Required Endpoint:**
- **Path:** `POST /organizations/:id/subscription`
- **Method:** `POST`
- **Auth:** Required (organization admin)

**Request Body:**
```typescript
interface UpdateSubscriptionRequest {
  planId: string
  billingCycle?: 'monthly' | 'yearly'
  paymentMethodId?: string  // If changing payment method
}
```

**Response Type:**
```typescript
interface SubscriptionResponse {
  // Same as GET /organizations/:id/subscription
}
```

**Where Used:**
- Needed for plan upgrade/downgrade functionality
- Currently no way to change subscription

**Priority:** 🟡 **MEDIUM** - Needed for subscription management

---

## 🟢 LOW PRIORITY - Missing Endpoints

### 12. `POST /organizations/:organizationId/bank-accounts/:id/verify` - Unimplemented

**Status:** ⚠️ **ENDPOINT EXISTS BUT UNIMPLEMENTED**

**Endpoint:** `POST /organizations/:organizationId/bank-accounts/:id/verify`  
**Backend File:** `Hypedrive Encore/organizations/organizations.ts:728-737`  
**Current Status:** Throws `APIError.unimplemented` with message:
> "Bank account verification via penny drop is not yet implemented. Requires RazorpayX integration."

**Required Implementation:**

1. **Integrate with RazorpayX Fund Account Validation API**
   - API: `POST /fund_accounts/validations` (Fund Account Validation)
   - Documentation: https://razorpay.com/docs/api/x/fund-accounts/validation/

2. **Flow:**
   - a. Create a Fund Account for the bank details (if not exists)
   - b. Initiate penny drop validation (₹1 deposit)
   - c. Store validation ID in `organizationBankAccount.verificationDetails`
   - d. Handle webhook callback from RazorpayX with validation result

3. **Required Secrets:**
   - `RazorpayXApiKey`
   - `RazorpayXApiSecret`

4. **Webhook:**
   - Path: `/webhooks/razorpay-x/fund-account-validation`
   - Handle validation completion/failure events

5. **Database Updates:**
   - Update `organizationBankAccount.isVerified` to `true` on success
   - Update `organizationBankAccount.verifiedAt` timestamp
   - Store validation details in `organizationBankAccount.verificationDetails`

**Reference Implementation:**
A working implementation exists for withdrawal methods in `Hypedrive Encore/wallets/wallets.ts:521-594` (`verifyWithdrawalMethod`). This can be used as a reference.

**Where Used:**
- `app/actions/settings.ts:verifyBankAccount()`
- `app/(dashboard)/dashboard/settings/settings-client.tsx:BankAccountCard`
- `hooks/use-settings.ts:useVerifyBankAccount()`

**Priority:** 🟢 **LOW** - Frontend gracefully handles unimplemented error

---

### 13. `GET /organizations/:id/invitations` - Wrong Namespace

**Status:** ⚠️ **ENDPOINT EXISTS BUT WRONG NAMESPACE**

**Current Issue:**
- ✅ `client.auth.listInvitations()` exists (line 1956 in `lib/encore-client.ts`)
- ❌ `lib/ssr-data.ts:203-209` - Using `client.organizations.listInvitations()` which doesn't exist
- Should use `client.auth.listInvitations({ organizationId: orgId })` instead

**Current Workaround:**
- `lib/ssr-data.ts:209` - Returns empty array: `invitations: []`

**Where Used:**
- `app/(dashboard)/dashboard/team/team-client.tsx` - Team page expects invitations list
- `hooks/use-team.ts` - May use invitations

**Backend Options:**

**Option A:** Keep endpoint in `auth` namespace (recommended)
- Frontend should use `client.auth.listInvitations({ organizationId: orgId })`
- No backend changes needed

**Option B:** Add endpoint to `organizations` namespace
```typescript
// Hypedrive Encore/organizations/organizations.ts
export const listInvitations = api(
  { expose: true, auth: true, method: "GET", path: "/organizations/:organizationId/invitations" },
  async ({ organizationId }: { organizationId: string }): Promise<{ data: InvitationResponse[] }> => {
    // Fetch pending invitations for organization
  }
)
```

**Priority:** 🟢 **LOW** - Endpoint exists, just wrong namespace used (frontend can fix)

---

### 14. `GET /organizations/:id/config` - Missing Endpoint (Optional)

**Status:** ❌ **ENDPOINT DOES NOT EXIST** (Optional)

**Required Endpoint:**
- **Path:** `GET /organizations/:id/config`
- **Method:** `GET`
- **Auth:** Required (organization member)

**Response Type:**
```typescript
interface OrganizationConfigResponse {
  highValueThreshold: number  // Threshold for "high value" enrollments (currently 25000 hard-coded)
  // ... other organization-specific config
}
```

**Where Used:**
- `app/(dashboard)/dashboard/dashboard-client.tsx:506` - Currently hard-coded `25000`
- `app/(dashboard)/dashboard/components/dashboard-client-islands.tsx:84` - Currently hard-coded `25000`

**Current Workaround:**
- Frontend uses hard-coded `25000` threshold

**Priority:** 🟢 **LOW** - Nice to have for configurability

---

## 📊 Summary by Priority

### 🔴 HIGH PRIORITY (Must Fix First)

1. **`GET /auth/me`** - Add `phone` and `twoFactorEnabled` fields
   - **Impact:** Settings page can't show user phone or 2FA status
   - **Files:** `Hypedrive Encore/auth/auth.ts` (me endpoint)

### 🟡 MEDIUM PRIORITY (Should Fix Soon)

2. **`GET /organizations/:id`** - Add `email` field, standardize field names
   - **Impact:** Settings page can't show/edit organization email
   - **Files:** `Hypedrive Encore/organizations/organizations.ts` (getOrganization endpoint)

3. **`GET /auth/list-sessions`** - Add device info fields
   - **Impact:** Sessions list shows "Unknown Device/Browser/Location"
   - **Files:** `Hypedrive Encore/auth/auth.ts` (listSessions endpoint)

4. **`GET /organizations/:id/subscription`** - Create endpoint
   - **Impact:** Settings page shows hard-coded "Pro Plan"
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

5. **`GET /organizations/:id/billing-history`** - Create endpoint
   - **Impact:** Settings page shows hard-coded payment history
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

6. **`GET /organizations/:id/billing-address`** - Create endpoint
   - **Impact:** Settings page can't show/edit billing address
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

7. **`PATCH /organizations/:id/billing-address`** - Create endpoint
   - **Impact:** Can't update billing address
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

8. **`GET /organizations/:id/payment-methods`** - Create endpoint
   - **Impact:** Settings panel shows hard-coded payment method
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

9. **`GET /organizations/:id/plans`** - Create endpoint
   - **Impact:** Upgrade button non-functional
   - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

10. **`POST /organizations/:id/subscription`** - Create endpoint
    - **Impact:** Can't change subscription plan
    - **Files:** Create new endpoint in `Hypedrive Encore/organizations/organizations.ts`

### 🟢 LOW PRIORITY (Nice to Have)

11. **`GET /auth/list-device-sessions`** - Add device info fields
    - **Impact:** Device sessions list incomplete (if using this endpoint)
    - **Files:** `Hypedrive Encore/auth/auth.ts` (listDeviceSessions endpoint)

12. **`POST /organizations/:organizationId/bank-accounts/:id/verify`** - Implement RazorpayX integration
    - **Impact:** Bank account verification not working
    - **Files:** `Hypedrive Encore/organizations/organizations.ts:728-737`

13. **`GET /organizations/:id/invitations`** - Fix namespace or add to organizations
    - **Impact:** Team page invitations list empty
    - **Files:** Either fix frontend to use `auth.listInvitations()` OR add to organizations namespace

14. **`GET /organizations/:id/config`** - Create endpoint (optional)
    - **Impact:** High value threshold hard-coded
    - **Files:** Create new endpoint (optional)

---

## 🚫 Frontend Workarounds to Remove (After Backend Fixes)

Once backend fixes are implemented, frontend will remove these workarounds:

1. **`lib/ssr-data.ts:264`** - Remove `|| ''` fallback for `phone`
2. **`lib/ssr-data.ts:268`** - Remove undefined check for `twoFactorEnabled`
3. **`lib/ssr-data.ts:238-240`** - Remove field mapping (`phoneNumber` → `phone`, `industryCategory` → `industry`, empty `email`)
4. **`app/(dashboard)/dashboard/settings/settings-client.tsx:583-584`** - Replace hard-coded "Pro Plan" with subscription data
5. **`app/(dashboard)/dashboard/settings/settings-client.tsx:662-677`** - Replace hard-coded payment history with real data
6. **`components/dashboard/settings-panel.tsx:1100-1105`** - Replace hard-coded plan with subscription data
7. **`components/dashboard/settings-panel.tsx:1128-1129`** - Replace hard-coded payment method with real data
8. **`app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:37,39`** - Remove `as any` type assertions (fields exist in type)

---

## ✅ Verification Checklist

After backend fixes, verify:

### High Priority:
- [ ] `MeResponse.phone` is returned
- [ ] `MeResponse.twoFactorEnabled` is returned
- [ ] `Organization.email` is returned
- [ ] `Organization.phone` is returned (or `phoneNumber` standardized)
- [ ] `Organization.industry` is returned (or `industryCategory` standardized)
- [ ] `SessionResponse.device` is returned
- [ ] `SessionResponse.browser` is returned
- [ ] `SessionResponse.location` is returned
- [ ] `SessionResponse.lastActive` is returned
- [ ] `SessionResponse.current` is returned
- [ ] `SessionResponse.iconType` is returned

### Medium Priority:
- [ ] `GET /organizations/:id/subscription` endpoint exists and returns subscription data
- [ ] `GET /organizations/:id/billing-history` endpoint exists and returns transaction history
- [ ] `GET /organizations/:id/billing-address` endpoint exists and returns billing address
- [ ] `PATCH /organizations/:id/billing-address` endpoint exists and updates billing address
- [ ] `GET /organizations/:id/payment-methods` endpoint exists and returns payment methods
- [ ] `GET /organizations/:id/plans` endpoint exists and returns available plans
- [ ] `POST /organizations/:id/subscription` endpoint exists and updates subscription

### Low Priority:
- [ ] `DeviceSession.device` is returned
- [ ] `DeviceSession.browser` is returned
- [ ] `DeviceSession.location` is returned
- [ ] `DeviceSession.lastActive` is returned
- [ ] `DeviceSession.iconType` is returned
- [ ] `POST /organizations/:organizationId/bank-accounts/:id/verify` is implemented
- [ ] `GET /organizations/:id/invitations` endpoint exists (or frontend uses correct namespace)

---

## 📝 Implementation Notes

### For Missing Fields in Existing Endpoints:

1. **Add fields to response types** in Encore backend
2. **Update database queries** to fetch new fields
3. **Update response mapping** to include new fields
4. **Regenerate Encore client** - Frontend will automatically get new types

### For New Endpoints:

1. **Create endpoint** in appropriate Encore service file
2. **Define request/response types** using Encore types
3. **Implement business logic** (database queries, validations, etc.)
4. **Add authentication/authorization** checks
5. **Regenerate Encore client** - Frontend will automatically get new endpoint

### Field Naming Standards:

- Prefer `phone` over `phoneNumber`
- Prefer `industry` over `industryCategory`
- Use consistent naming across all endpoints
- Use `| undefined` for optional fields, not empty strings or nulls

---

## 🔗 Related Frontend Files

### Files That Will Be Updated After Backend Fixes:

1. **`lib/ssr-data.ts`** - Remove workarounds for missing fields
2. **`app/(dashboard)/dashboard/settings/settings-client.tsx`** - Use real subscription/billing data
3. **`components/dashboard/settings-panel.tsx`** - Use real subscription/payment data
4. **`app/actions/settings.ts`** - Update to use new endpoints
5. **`hooks/use-settings.ts`** - Add hooks for new endpoints
6. **`app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx`** - Remove `as any` assertions

---

## 📋 Quick Reference

### Backend Files to Update:

1. **`Hypedrive Encore/auth/auth.ts`**
   - `me` endpoint - Add `phone`, `twoFactorEnabled`
   - `listSessions` endpoint - Add device info to SessionResponse
   - `listDeviceSessions` endpoint - Add device info to DeviceSession

2. **`Hypedrive Encore/organizations/organizations.ts`**
   - `getOrganization` endpoint - Add `email` field, standardize field names
   - **NEW:** `getSubscription` endpoint - Get current subscription
   - **NEW:** `getBillingHistory` endpoint - Get payment history
   - **NEW:** `getBillingAddress` endpoint - Get billing address
   - **NEW:** `updateBillingAddress` endpoint - Update billing address
   - **NEW:** `getPaymentMethods` endpoint - Get payment methods
   - **NEW:** `getPlans` endpoint - Get available plans
   - **NEW:** `updateSubscription` endpoint - Update subscription
   - `verifyBankAccount` endpoint - Implement RazorpayX integration (currently unimplemented)

---

## 🎯 Priority Order for Implementation

1. **First:** Fix missing fields in existing endpoints (High Priority)
2. **Second:** Create subscription/billing endpoints (Medium Priority)
3. **Third:** Implement bank account verification (Low Priority)
4. **Fourth:** Add optional config endpoint (Low Priority)

---

**Total Endpoints Requiring Backend Work:** 14

- **High Priority:** 1
- **Medium Priority:** 9
- **Low Priority:** 4

**Status:** ⚠️ **Frontend blocked on these endpoints** - Workarounds in place but proper backend data needed

---

## 📧 Contact & Questions

**Frontend Team Contact:**
- All endpoints are documented with exact specifications
- Response types match Encore client types
- After implementation, regenerate Encore client - frontend will automatically get new types

**Testing:**
- Frontend has workarounds in place, so backend can test endpoints independently
- Once endpoints are ready, frontend will remove workarounds and use real data

**Priority:**
- Start with HIGH PRIORITY endpoints first
- These are blocking frontend features (settings page, profile page)
- MEDIUM PRIORITY endpoints are for billing/subscription features
- LOW PRIORITY can be done later

---

**Document Version:** 1.0  
**Last Updated:** 2024-12-19  
**Next Review:** After backend implementation
