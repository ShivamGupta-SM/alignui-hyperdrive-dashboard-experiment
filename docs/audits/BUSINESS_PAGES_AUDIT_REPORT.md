# Business Pages Audit Report - Missing Endpoints & Incomplete Data

**Question:** "saare frontend k business pages audit kar batao report me kisi end point me kuch kami reh gyi kya? ya kisme kisme kya kya reh gyi?"

## 📊 Complete Audit of All Business Pages

---

## 1. **Dashboard Page** (`/dashboard`)

**File:** `app/(dashboard)/dashboard/dashboard-client.tsx`

### ✅ Data Sources (All Working):
- `GET /organizations/:id/dashboard` - Dashboard overview
- All data fields present and working

### ⚠️ Minor Issues:
- **High Value Threshold:** Hard-coded `25000` (Line 190)
  - **Current:** `const isEnrollmentOverdue = (hoursAgo: number) => hoursAgo > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS`
  - **Should be:** Configurable from backend or constants file
  - **Missing Endpoint:** `GET /organizations/:id/config` (optional - can use constants)

### Status: ✅ **COMPLETE** (Minor optimization possible)

---

## 2. **Campaigns List Page** (`/dashboard/campaigns`)

**File:** `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx`

### ✅ Data Sources (All Working):
- `GET /campaigns` - List campaigns
- `GET /organizations/:id/campaign-stats` - Campaign statistics
- `GET /campaigns/search` - Search campaigns (client-side, acceptable)

### Status: ✅ **COMPLETE**

---

## 3. **Campaign Detail Page** (`/dashboard/campaigns/[id]`)

**File:** `app/(dashboard)/dashboard/campaigns/[id]/campaign-detail-client.tsx`

### ✅ Data Sources (All Working):
- `GET /campaigns/:id` - Campaign details
- `GET /campaigns/:id/stats` - Campaign statistics
- `GET /campaigns/:id/pricing` - Campaign pricing
- `GET /campaigns/:id/deliverables` - Campaign deliverables
- `GET /campaigns/:id/performance` - Campaign performance
- `GET /enrollments` (filtered by campaign) - Campaign enrollments
- `GET /platforms` - Active platforms

### ⚠️ Minor Issues:
- **Example Cost Calculation:** Hard-coded "₹10,000 order" (Line 597)
  - **Context:** Just an example in UI, not critical
  - **Status:** Acceptable (UI example)

### Status: ✅ **COMPLETE**

---

## 4. **Campaign Create Page** (`/dashboard/campaigns/create`) ❌

**File:** `app/(dashboard)/dashboard/campaigns/create/page.tsx`

### ❌ Critical Issue:
- **Products Fetch:** Client-side using `useProducts()` hook (Line 55)
  - **Current:** `const { data: productsData } = useProducts()` - React Query hook
  - **Should be:** Server-side fetch in `page.tsx`, pass as props

### Missing Implementation:
- Need to split into Server Component (`page.tsx`) + Client Component (`create-campaign-client.tsx`)
- Server Component should fetch products using `getProductsData()`

### Status: ❌ **NEEDS FIX** (Pattern deviation, not missing endpoint)

---

## 5. **Enrollments List Page** (`/dashboard/enrollments`)

**File:** `app/(dashboard)/dashboard/enrollments/enrollments-client.tsx`

### ✅ Data Sources (All Working):
- `GET /enrollments` - List enrollments
- `GET /enrollments/stats` - Enrollment statistics

### Status: ✅ **COMPLETE**

---

## 6. **Enrollment Detail Page** (`/dashboard/enrollments/[id]`)

**File:** `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx`

### ✅ Data Sources (All Working):
- `GET /enrollments/:id/detail` - Enrollment detail (includes history, submissions, campaign info)
- `GET /platforms` - Active platforms
- `GET /campaigns/:id/deliverables` - Campaign deliverables

### ⚠️ Minor Issues:
- **Type Assertions:** Using `as any` for `lockedBillRate`, `lockedPlatformFee` (Lines 37, 39)
  - **Note:** Fields exist in type, just remove `as any`
  - **Status:** Frontend fix needed (not backend)

### Status: ✅ **COMPLETE** (Minor frontend cleanup)

---

## 7. **Products Page** (`/dashboard/products`)

**File:** `app/(dashboard)/dashboard/products/products-client.tsx`

### ✅ Data Sources (All Working):
- `GET /products` - List products
- `GET /products/categories` - All categories
- `GET /platforms` - Active platforms

### Status: ✅ **COMPLETE**

---

## 8. **Product Create Page** (`/dashboard/products/new`) ⚠️

**File:** `app/(dashboard)/dashboard/products/new/page.tsx`

### ⚠️ Issue:
- **Categories Fetch:** Client-side using React Query hook (Line 35)
  - **Current:** `const { data: categoriesData, isLoading: isLoadingCategories } = useCategories()`
  - **Should be:** Server-side fetch in `page.tsx`, pass as props

### Missing Implementation:
- Need to split into Server Component (`page.tsx`) + Client Component (`new-product-client.tsx`)
- Server Component should fetch categories using `getProductsData()` (categories included)

### Status: ⚠️ **NEEDS FIX** (Pattern deviation, not missing endpoint)

---

## 9. **Wallet Page** (`/dashboard/wallet`)

**File:** `app/(dashboard)/dashboard/wallet/wallet-client.tsx`

### ✅ Data Sources (All Working):
- `GET /organizations/:id/wallet` - Wallet balance
- `GET /organizations/:id/withdrawals` - Withdrawal history
- `GET /organizations/:id/wallet/transactions` - Transaction history
- `GET /organizations/:id/wallet/holds` - Active holds
- `GET /withdrawals/stats` - Withdrawal statistics

### ⚠️ Minor Issues:
- **Example Credit Limit:** Hard-coded "₹5,00,000" (Line 765)
  - **Context:** Just a placeholder/example in modal
  - **Status:** Acceptable (UI example)

### Status: ✅ **COMPLETE**

---

## 10. **Invoices Page** (`/dashboard/invoices`)

**File:** `app/(dashboard)/dashboard/invoices/invoices-client.tsx`

### ✅ Data Sources (All Working):
- `GET /invoices` - List invoices
- `GET /invoices/:id` - Invoice details
- `GET /invoices/:id/enrollments` - Invoice enrollments (via server action)

### Status: ✅ **COMPLETE**

---

## 11. **Team Page** (`/dashboard/team`)

**File:** `app/(dashboard)/dashboard/team/team-client.tsx`

### ✅ Data Sources (All Working):
- `GET /organizations/:id/members` - Team members
- `GET /auth/invitations` - Pending invitations (using correct namespace)

### Status: ✅ **COMPLETE**

---

## 12. **Settings Page** (`/dashboard/settings`) ❌

**File:** `app/(dashboard)/dashboard/settings/settings-client.tsx`

### ✅ Working Data Sources:
- `GET /organizations/:id` - Organization details
- `GET /organizations/:id/bank-accounts` - Bank accounts
- `GET /organizations/:id/gst-details` - GST details
- `GET /auth/me` - User details (partial - missing fields)
- `GET /auth/sessions` - User sessions (partial - missing device info)

### ❌ Missing Endpoints (Hard-coded Data):

#### 1. **Billing Section - Current Plan** (Lines 583-584)
- **Hard-coded:** `"Pro Plan"` (Line 583), `"₹4,999/mo"` (Line 584)
- **Missing Endpoint:** `GET /organizations/:id/subscription`
- **Priority:** 🔴 HIGH

#### 2. **Billing Section - Upgrade Button** (Lines 586-588)
- **Status:** Non-functional (no action handler)
- **Missing Endpoints:**
  - `GET /organizations/:id/plans` (for plan selection)
  - `POST /organizations/:id/subscription/upgrade`
- **Priority:** 🔴 HIGH

#### 3. **Billing Section - Payment History** (Lines 662-677)
- **Hard-coded:** 
  - Array: `['Nov 2024', 'Oct 2024', 'Sep 2024']` (Line 662)
  - Amount: `"₹4,999"` (Line 677)
  - Type: `"Subscription"` (Line 672)
- **Missing Endpoint:** `GET /organizations/:id/billing-history`
- **Priority:** 🔴 HIGH

#### 4. **Billing Section - Billing Address** (Lines 640-657)
- **Current:** Uses `organization.address` (Line 654) - may not be billing address
- **Edit Button:** Non-functional (Lines 644-647) - no action handler
- **Missing Endpoints:**
  - `GET /organizations/:id/billing-address`
  - `PATCH /organizations/:id/billing-address`
- **Priority:** 🟡 MEDIUM

#### 5. **Organization Data - Missing Fields** (Line 241)
- **Missing Field:** `email` in `GET /organizations/:id` response
- **Field Mismatch:** `phoneNumber` (backend) vs `phone` (frontend expects)
- **Field Mismatch:** `industryCategory` (backend) vs `industry` (frontend expects)
- **Priority:** 🟡 MEDIUM

#### 6. **User Data - Missing Fields** (Lines 265, 269)
- **Missing Field:** `phone` in `GET /auth/me` response
- **Missing Field:** `twoFactorEnabled` in `GET /auth/me` response
- **Priority:** 🔴 HIGH

#### 7. **Sessions Data - Missing Fields** (Line 271)
- **Missing Fields:** `device`, `browser`, `location`, `lastActive`, `current`, `iconType` in `GET /auth/sessions` response
- **Priority:** 🟡 MEDIUM

### Status: ❌ **INCOMPLETE** (Multiple missing endpoints)

---

## 13. **Settings Panel Component** (`components/dashboard/settings-panel.tsx`) ❌

**File:** `components/dashboard/settings-panel.tsx`

### ❌ Missing Endpoints (Hard-coded Data):

#### 1. **Billing Sub-Panel - Current Plan** (Lines 1103-1104)
- **Hard-coded:** `"Pro Plan"` (Line 1103), `"₹4,999/month"` (Line 1104)
- **Missing Endpoint:** `GET /organizations/:id/subscription`
- **Priority:** 🔴 HIGH

#### 2. **Billing Sub-Panel - Wallet Balance** (Line 1111)
- **Hard-coded:** `"₹25,000"` (Line 1111)
- **Note:** Endpoint exists (`GET /organizations/:id/wallet`), just not being used
- **Fix:** Use existing wallet endpoint from `getWalletData()`
- **Priority:** 🟡 MEDIUM

#### 3. **Billing Sub-Panel - Payment Method** (Lines 1128-1129)
- **Hard-coded:** `"•••• 4242"` (Line 1128), `"Expires 12/25"` (Line 1129)
- **Missing Endpoint:** `GET /organizations/:id/payment-methods`
- **Priority:** 🟡 MEDIUM

#### 4. **Billing Sub-Panel - Recent Invoices** (Lines 1140-1144)
- **Hard-coded:** 
  - Array: `['Nov 2024', 'Oct 2024', 'Sep 2024']` (Line 1140)
  - Amount: `"₹4,999"` (Line 1144)
- **Missing Endpoint:** `GET /organizations/:id/billing-history`
- **Priority:** 🔴 HIGH

### Status: ❌ **INCOMPLETE** (Multiple missing endpoints)

---

## 14. **Profile Page** (`/dashboard/profile`)

**File:** `app/(dashboard)/dashboard/profile/profile-client.tsx`

### ✅ Working Data Sources:
- `GET /auth/me` - User details (partial)

### ❌ Missing Fields in Existing Endpoint:
- **`GET /auth/me`** - Missing `phone` field
- **`GET /auth/me`** - Missing `twoFactorEnabled` field
- **Priority:** 🔴 HIGH

### Status: ⚠️ **INCOMPLETE DATA** (Backend needs to add fields)

---

## 📋 Summary by Page

| Page | Status | Missing Endpoints | Incomplete Data |
|------|--------|-------------------|-----------------|
| **Dashboard** | ✅ Complete | None | None |
| **Campaigns List** | ✅ Complete | None | None |
| **Campaign Detail** | ✅ Complete | None | None |
| **Campaign Create** | ❌ Pattern Issue | None | Products fetch client-side |
| **Enrollments List** | ✅ Complete | None | None |
| **Enrollment Detail** | ✅ Complete | None | None |
| **Products** | ✅ Complete | None | None |
| **Product Create** | ⚠️ Pattern Issue | None | Categories fetch client-side |
| **Wallet** | ✅ Complete | None | None |
| **Invoices** | ✅ Complete | None | None |
| **Team** | ✅ Complete | None | None |
| **Settings** | ❌ Incomplete | 5 missing endpoints | 3 missing fields |
| **Settings Panel** | ❌ Incomplete | 3 missing endpoints | 1 endpoint not used |
| **Profile** | ⚠️ Incomplete Data | None | 2 missing fields |

---

## 🔴 Critical Missing Endpoints (Must Create)

### 1. **Subscription Management**
- ❌ `GET /organizations/:id/subscription` - Get current subscription
- ❌ `GET /organizations/:id/plans` - Get available plans
- ❌ `POST /organizations/:id/subscription/upgrade` - Upgrade plan
- ❌ `POST /organizations/:id/subscription/cancel` - Cancel subscription

**Used In:**
- `settings-client.tsx` (Lines 583-584, 586-588)
- `settings-panel.tsx` (Lines 1103-1104)

**Priority:** 🔴 **HIGH**

---

### 2. **Billing History**
- ❌ `GET /organizations/:id/billing-history` - Get payment/transaction history

**Used In:**
- `settings-client.tsx` (Lines 662-677)
- `settings-panel.tsx` (Lines 1140-1144)

**Priority:** 🔴 **HIGH**

---

### 3. **Payment Methods**
- ❌ `GET /organizations/:id/payment-methods` - List payment methods
- ❌ `POST /organizations/:id/payment-methods` - Add payment method
- ❌ `DELETE /organizations/:id/payment-methods/:id` - Remove payment method
- ❌ `PATCH /organizations/:id/payment-methods/:id/default` - Set default

**Used In:**
- `settings-panel.tsx` (Lines 1128-1129)

**Priority:** 🟡 **MEDIUM**

---

### 4. **Billing Address**
- ❌ `GET /organizations/:id/billing-address` - Get billing address
- ❌ `PATCH /organizations/:id/billing-address` - Update billing address

**Used In:**
- `settings-client.tsx` (Lines 640-657)

**Priority:** 🟡 **MEDIUM**

---

## ⚠️ Incomplete Data in Existing Endpoints

### 1. **`GET /auth/me` - Missing Fields** ❌

**Missing Fields:**
- `phone: string | undefined`
- `twoFactorEnabled: boolean | undefined`

**Used In:**
- `lib/ssr-data.ts:265, 269` - Profile data
- `settings-client.tsx` - User phone display
- `profile-client.tsx` - 2FA status display

**Backend File:** `Hypedrive Encore/auth/auth.ts` (line 272-301)

**Priority:** 🔴 **HIGH**

---

### 2. **`GET /organizations/:id` - Missing/Incorrect Fields** ❌

**Missing Fields:**
- `email: string | undefined` - Organization contact email

**Field Name Mismatches:**
- Backend returns `phoneNumber`, frontend expects `phone`
- Backend returns `industryCategory`, frontend expects `industry`

**Used In:**
- `lib/ssr-data.ts:239-241` - Field mapping workaround
- `settings-client.tsx` - Organization details display

**Backend File:** `Hypedrive Encore/organizations/organizations.ts`

**Priority:** 🟡 **MEDIUM**

---

### 3. **`GET /auth/sessions` - Missing Device Info** ❌

**Missing Fields:**
- `device: string | undefined`
- `browser: string | undefined`
- `location: string | undefined`
- `lastActive: string | undefined`
- `current: boolean`
- `iconType: 'computer' | 'smartphone' | 'mac' | undefined`

**Used In:**
- `lib/ssr-data.ts:271` - Returns empty array (sessions not fetched)
- `settings-client.tsx:855-862` - Session interface expects these fields
- `profile-client.tsx` - Sessions display

**Backend File:** `Hypedrive Encore/auth/auth.ts`

**Priority:** 🟡 **MEDIUM**

---

## 📊 Complete Missing Endpoints List

### 🔴 High Priority (Must Create):

1. **`GET /organizations/:organizationId/subscription`**
   - **Purpose:** Get current subscription plan
   - **Response:** `{ planId, planName, planType, price, currency, billingCycle, status, startDate, endDate, autoRenew, features }`
   - **Used In:** Settings page, Settings panel

2. **`GET /organizations/:organizationId/plans`**
   - **Purpose:** Get available subscription plans
   - **Response:** `{ plans: Array<{ id, name, type, monthlyPrice, yearlyPrice, features, popular, recommended }>, currentPlanId }`
   - **Used In:** Settings page upgrade flow

3. **`POST /organizations/:organizationId/subscription/upgrade`**
   - **Purpose:** Upgrade or change subscription plan
   - **Request:** `{ planId, billingCycle, paymentMethodId? }`
   - **Response:** `{ success, subscription, invoiceId?, message? }`
   - **Used In:** Settings page upgrade button

4. **`GET /organizations/:organizationId/billing-history`**
   - **Purpose:** Get payment/transaction history
   - **Query:** `{ skip?, take?, startDate?, endDate? }`
   - **Response:** `{ transactions: Array<{ id, type, description, amount, currency, status, paymentMethod, invoiceId, createdAt, paidAt, periodStart?, periodEnd? }>, total, skip, take, hasMore }`
   - **Used In:** Settings page, Settings panel

---

### 🟡 Medium Priority (Should Create):

5. **`POST /organizations/:organizationId/subscription/cancel`**
   - **Purpose:** Cancel subscription
   - **Request:** `{ reason?, immediate? }`
   - **Response:** `{ success, cancelledAt, effectiveEndDate, message }`

6. **`GET /organizations/:organizationId/payment-methods`**
   - **Purpose:** List saved payment methods
   - **Response:** `{ paymentMethods: Array<{ id, type, isDefault, last4?, brand?, expiryMonth?, expiryYear?, cardholderName?, accountNumber?, ifsc?, bankName?, accountHolderName?, createdAt }> }`
   - **Used In:** Settings panel

7. **`POST /organizations/:organizationId/payment-methods`**
   - **Purpose:** Add payment method
   - **Request:** `{ type, token?, accountNumber?, ifsc?, bankName?, accountHolderName?, isDefault? }`
   - **Response:** `{ success, paymentMethod, message? }`

8. **`DELETE /organizations/:organizationId/payment-methods/:paymentMethodId`**
   - **Purpose:** Remove payment method
   - **Response:** `{ success, message }`

9. **`PATCH /organizations/:organizationId/payment-methods/:paymentMethodId/default`**
   - **Purpose:** Set default payment method
   - **Response:** `{ success, message }`

10. **`GET /organizations/:organizationId/billing-address`**
    - **Purpose:** Get billing address
    - **Response:** `{ address: string, city: string, state: string, postalCode: string, country: string }`
    - **Used In:** Settings page

11. **`PATCH /organizations/:organizationId/billing-address`**
    - **Purpose:** Update billing address
    - **Request:** `{ address, city, state, postalCode, country }`
    - **Response:** `{ success, billingAddress, message? }`
    - **Used In:** Settings page edit button

---

### 🟢 Low Priority (Nice to Have):

12. **`GET /organizations/:organizationId/config`**
    - **Purpose:** Get organization configuration
    - **Response:** `{ highValueThreshold?, defaultCurrency?, timezone?, dateFormat?, numberFormat? }`
    - **Used In:** Dashboard (high value threshold)

13. **`PATCH /organizations/:organizationId/config`**
    - **Purpose:** Update organization configuration
    - **Request:** `{ highValueThreshold?, defaultCurrency?, timezone? }`
    - **Response:** `{ success, config }`

---

## 📋 Incomplete Data Summary

### 🔴 High Priority (Must Fix):

1. **`GET /auth/me`**
   - Missing: `phone`, `twoFactorEnabled`
   - **Files:** `lib/ssr-data.ts:265, 269`, `settings-client.tsx`, `profile-client.tsx`

---

### 🟡 Medium Priority (Should Fix):

2. **`GET /organizations/:id`**
   - Missing: `email`
   - Field mismatch: `phoneNumber` → `phone`
   - Field mismatch: `industryCategory` → `industry`
   - **Files:** `lib/ssr-data.ts:239-241`, `settings-client.tsx`

3. **`GET /auth/sessions`**
   - Missing: `device`, `browser`, `location`, `lastActive`, `current`, `iconType`
   - **Files:** `lib/ssr-data.ts:271`, `settings-client.tsx`, `profile-client.tsx`

---

## 🎯 Action Items by Priority

### 🔴 Critical (Must Fix Immediately):

1. **Settings Page - Subscription Data**
   - Create `GET /organizations/:id/subscription`
   - Create `GET /organizations/:id/plans`
   - Create `POST /organizations/:id/subscription/upgrade`
   - Create `GET /organizations/:id/billing-history`

2. **Profile/Settings - User Data**
   - Add `phone` to `GET /auth/me` response
   - Add `twoFactorEnabled` to `GET /auth/me` response

---

### 🟡 Medium Priority:

3. **Settings Panel - Payment Methods**
   - Create `GET /organizations/:id/payment-methods`
   - Use existing `GET /organizations/:id/wallet` for wallet balance

4. **Settings Page - Billing Address**
   - Create `GET /organizations/:id/billing-address`
   - Create `PATCH /organizations/:id/billing-address`

5. **Organization Data**
   - Add `email` to `GET /organizations/:id` response
   - Standardize field names (`phoneNumber` → `phone`, `industryCategory` → `industry`)

6. **Sessions Data**
   - Add device info fields to `GET /auth/sessions` response

---

### 🟢 Low Priority:

7. **Organization Config**
   - Create `GET /organizations/:id/config` (optional - can use constants)

---

## 📝 Page-by-Page Breakdown

### ✅ Complete Pages (No Issues):
1. Dashboard
2. Campaigns List
3. Campaign Detail
4. Enrollments List
5. Enrollment Detail
6. Products
7. Wallet
8. Invoices
9. Team

### ⚠️ Pattern Issues (Not Missing Endpoints):
10. Campaign Create - Products fetch should be server-side
11. Product Create - Categories fetch should be server-side

### ❌ Incomplete Pages (Missing Endpoints/Data):
12. Settings - 5 missing endpoints, 3 missing fields
13. Settings Panel - 3 missing endpoints, 1 endpoint not used
14. Profile - 2 missing fields in existing endpoint

---

## 🔗 Related Documents

- **Missing Endpoints:** `docs/MISSING_ENDPOINTS.md` - Complete specifications
- **Incomplete Data:** `docs/BROKEN_APIS_MISSING_DATA.md` - Missing fields in existing endpoints
- **Hard-coded Values:** `docs/HARD_CODED_VALUES.md` - Hard-coded UI elements

---

## 📊 Summary Statistics

- **Total Business Pages:** 14
- **Complete Pages:** 9 (64%) ✅
- **Pattern Issues:** 2 (14%) ⚠️
- **Incomplete Pages:** 3 (22%) ❌

- **Missing Endpoints:** 13
  - High Priority: 4
  - Medium Priority: 7
  - Low Priority: 2

- **Incomplete Data:** 3 endpoints
  - High Priority: 1 (`/auth/me`)
  - Medium Priority: 2 (`/organizations/:id`, `/auth/sessions`)

---

## 🎯 Recommendation

**Backend Priority:**
1. **Phase 1 (Critical):** Create subscription and billing endpoints
2. **Phase 2 (High):** Add missing fields to `/auth/me`
3. **Phase 3 (Medium):** Create payment methods and billing address endpoints
4. **Phase 4 (Medium):** Add missing fields to `/organizations/:id` and `/auth/sessions`

**Frontend Status:**
- ✅ All pages using RSC pattern correctly (except Campaign Create, Product Create)
- ✅ Server Actions properly structured
- ⏳ Waiting for backend endpoints to replace hard-coded values
- ⏳ Frontend will integrate once endpoints are available

---

## 📋 Quick Reference Table

### Missing Endpoints by Page

| Page | Missing Endpoints | Priority |
|------|------------------|----------|
| **Settings** | `GET /subscription`, `GET /plans`, `POST /subscription/upgrade`, `GET /billing-history`, `GET /billing-address`, `PATCH /billing-address` | 🔴 HIGH |
| **Settings Panel** | `GET /subscription`, `GET /billing-history`, `GET /payment-methods` | 🔴 HIGH |
| **Profile** | None (fields missing in existing endpoint) | - |

### Incomplete Data by Endpoint

| Endpoint | Missing Fields | Used In | Priority |
|----------|---------------|---------|----------|
| `GET /auth/me` | `phone`, `twoFactorEnabled` | Settings, Profile | 🔴 HIGH |
| `GET /organizations/:id` | `email` (field name: `phoneNumber`→`phone`, `industryCategory`→`industry`) | Settings | 🟡 MEDIUM |
| `GET /auth/sessions` | `device`, `browser`, `location`, `lastActive`, `current`, `iconType` | Settings, Profile | 🟡 MEDIUM |

---

## 🎯 Final Summary

**Total Issues Found:**
- **Missing Endpoints:** 13
- **Incomplete Data:** 3 endpoints
- **Pattern Deviations:** 2 pages

**Action Required:**
- **Backend:** Create 13 missing endpoints, add 5 missing fields
- **Frontend:** Fix 2 pattern deviations (server-side fetch), remove `as any` assertions


