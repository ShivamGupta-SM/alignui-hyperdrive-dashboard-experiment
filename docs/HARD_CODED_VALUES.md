# Hard-Coded Values in Dashboard UI

This document lists all hard-coded values found in the dashboard UI that should eventually be replaced with backend data.

## 🚨 Critical: Subscription/Billing Data (No Backend Endpoints)

### 1. Settings Page - Billing Section
**File:** `app/(dashboard)/dashboard/settings/settings-client.tsx`

#### Current Plan Display (Lines 561-573)
- **Plan Name:** `"Pro Plan"` - Hard-coded
- **Price:** `"₹4,999/mo"` - Hard-coded
- **Upgrade Button:** Non-functional (no action handler)

```typescript
<h3 className="text-title-h5 sm:text-title-h4 font-semibold">Pro Plan</h3>
<p className="text-paragraph-sm opacity-80 mt-1">₹4,999/mo</p>
```

#### Payment History/Transactions (Lines 642-668)
- **Months:** `['Nov 2024', 'Oct 2024', 'Sep 2024']` - Hard-coded array
- **Amount:** `"₹4,999"` - Hard-coded for all transactions
- **Transaction Type:** Always shows "Subscription" - Hard-coded

```typescript
{['Nov 2024', 'Oct 2024', 'Sep 2024'].map((month) => (
  // ...
  <span className="text-label-sm text-text-strong-950">₹4,999</span>
))}
```

### 2. Settings Panel Component
**File:** `components/dashboard/settings-panel.tsx`

#### Current Plan (Lines 1100-1105)
- **Plan Name:** `"Pro Plan"` - Hard-coded
- **Price:** `"₹4,999/month"` - Hard-coded

#### Wallet Balance (Lines 1108-1117)
- **Balance:** `"₹25,000"` - Hard-coded
- **Note:** This should use actual wallet balance from backend

```typescript
<span className="text-title-h5 font-semibold text-text-strong-950">₹25,000</span>
```

---

## ⚠️ Other Hard-Coded Values

### 3. Wallet Page
**File:** `app/(dashboard)/dashboard/wallet/wallet-client.tsx`

#### Credit Limit Example (Line 765)
- **Example Amount:** `"₹5,00,000"` - Hard-coded example value
- **Context:** Used as placeholder/example in credit limit request modal

```typescript
<span className="text-label-md text-text-strong-950 font-semibold">₹5,00,000</span>
```

### 4. Dashboard Components
**Files:** 
- `app/(dashboard)/dashboard/dashboard-client.tsx` (Line 505)
- `app/(dashboard)/dashboard/components/dashboard-client-islands.tsx` (Line 84)

#### High Value Threshold
- **Threshold:** `25000` - Hard-coded threshold for "high value" enrollments
- **Usage:** Used to highlight enrollments with order value >= ₹25,000

```typescript
const highValue = (enrollment.orderValue || 0) >= 25000
```

### 5. Campaign Detail Page
**File:** `app/(dashboard)/dashboard/campaigns/[id]/campaign-detail-client.tsx`

#### Example Cost Calculation (Line 597)
- **Example Order Value:** `"₹10,000 order"` - Hard-coded example
- **Context:** Used in pricing breakdown section as example

```typescript
<h4 className="text-label-sm text-text-strong-950 mb-2 sm:mb-3">Example Cost (₹10,000 order)</h4>
```

---

## 📋 Marketing Pages (Acceptable - These are Static)

### Pricing Pages
**Files:**
- `app/page.tsx`
- `app/(marketing)/v1/page.tsx`
- `app/(marketing)/v2/page.tsx`

These contain hard-coded pricing plans (Starter, Growth, Enterprise) but this is **acceptable** as they are marketing/landing pages showing public pricing information.

---

## 🔧 Recommended Actions

### Priority 1: Subscription/Billing Data
1. **Create Backend Endpoints:**
   - `GET /organizations/:id/subscription` - Get current subscription plan
   - `GET /organizations/:id/billing-history` - Get payment/transaction history
   - `GET /organizations/:id/plans` - Get available plans (for upgrade flow)
   
   **📋 See `docs/MISSING_ENDPOINTS.md` for complete endpoint specifications and implementation details.**

2. **Update Frontend:**
   - Replace hard-coded "Pro Plan" with data from subscription endpoint
   - Replace hard-coded payment history with real transaction data
   - Make "Upgrade" button functional (connect to plan selection)

### Priority 2: Wallet Balance in Settings Panel
- Settings panel should fetch wallet balance from existing wallet endpoint
- Currently shows hard-coded ₹25,000

### Priority 3: High Value Threshold
- Consider making this configurable or moving to constants file
- Or fetch from backend configuration

### Priority 4: Example Values
- Example values (₹5,00,000, ₹10,000) can remain as they are just UI examples
- But consider moving to constants for easier maintenance

---

## 📝 Notes

- **Backend Status:** No subscription/plan endpoints exist in Encore backend currently
- **Campaign Pricing:** Backend has `getCampaignPricing` and `updateCampaignPricing` endpoints, but these are for individual campaign pricing, not subscription plans
- **Wallet:** Wallet balance endpoint exists (`/organizations/:organizationId/wallet`), but Settings Panel doesn't use it
- **📋 Missing Endpoints:** See `docs/MISSING_ENDPOINTS.md` for detailed specifications of all missing endpoints that need to be created

---

## ✅ Already Using Backend Data

- ✅ Wallet balance (in wallet page) - Uses real data
- ✅ Bank accounts - Uses real data from settings
- ✅ Organization details - Uses real data
- ✅ Campaign pricing - Uses real data from backend
