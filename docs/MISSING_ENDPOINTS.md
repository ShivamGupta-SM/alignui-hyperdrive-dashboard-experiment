# Missing Backend Endpoints

This document lists all backend endpoints that are **completely missing** and need to be created. These were identified when removing hard-coded/dummy UI elements from the frontend.

---

## 🚨 Critical: Subscription & Billing Endpoints (Completely Missing)

### 1. Subscription Plan Management

#### ❌ `GET /organizations/:organizationId/subscription`
**Purpose:** Get current subscription plan for an organization

**Request:**
```typescript
GET /organizations/:organizationId/subscription
```

**Response:**
```typescript
interface SubscriptionResponse {
  planId: string
  planName: string // e.g., "Pro Plan", "Starter", "Growth", "Enterprise"
  planType: "starter" | "growth" | "pro" | "enterprise"
  price: number // Monthly price in rupees
  currency: string // "INR"
  billingCycle: "monthly" | "yearly"
  status: "active" | "cancelled" | "expired" | "trial"
  startDate: string // ISO date
  endDate?: string // ISO date (if applicable)
  autoRenew: boolean
  features: {
    maxCampaigns?: number
    maxEnrollments?: number
    maxTeamMembers?: number
    advancedAnalytics?: boolean
    prioritySupport?: boolean
    customIntegrations?: boolean
    // ... other plan features
  }
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx` (Lines 561-573)
- `components/dashboard/settings-panel.tsx` (Lines 1100-1105)
- Currently shows hard-coded "Pro Plan" with "₹4,999/mo"

**Priority:** 🔴 **HIGH** - Critical for billing section

---

#### ❌ `GET /organizations/:organizationId/plans`
**Purpose:** Get available subscription plans for upgrade/downgrade

**Request:**
```typescript
GET /organizations/:organizationId/plans
```

**Response:**
```typescript
interface PlansResponse {
  plans: Array<{
    id: string
    name: string // "Starter", "Growth", "Pro", "Enterprise"
    type: "starter" | "growth" | "pro" | "enterprise"
    monthlyPrice: number
    yearlyPrice?: number
    currency: string
    features: {
      maxCampaigns?: number
      maxEnrollments?: number
      maxTeamMembers?: number
      advancedAnalytics?: boolean
      prioritySupport?: boolean
      customIntegrations?: boolean
      // ... other features
    }
    popular?: boolean // Highlight popular plan
    recommended?: boolean // Recommended for current org
  }>
  currentPlanId?: string
}
```

**Where Used:**
- Settings page "Upgrade" button (currently non-functional)
- Plan selection modal/page (to be created)

**Priority:** 🔴 **HIGH** - Required for upgrade flow

---

#### ❌ `POST /organizations/:organizationId/subscription/upgrade`
**Purpose:** Upgrade or change subscription plan

**Request:**
```typescript
POST /organizations/:organizationId/subscription/upgrade
Body: {
  planId: string
  billingCycle: "monthly" | "yearly"
  paymentMethodId?: string // If payment required immediately
}
```

**Response:**
```typescript
interface UpgradeResponse {
  success: boolean
  subscription: SubscriptionResponse
  invoiceId?: string // If immediate payment required
  message?: string
}
```

**Where Used:**
- Settings page "Upgrade" button action
- Plan selection flow

**Priority:** 🔴 **HIGH** - Required for upgrade functionality

---

#### ❌ `POST /organizations/:organizationId/subscription/cancel`
**Purpose:** Cancel subscription (at end of billing period)

**Request:**
```typescript
POST /organizations/:organizationId/subscription/cancel
Body: {
  reason?: string
  immediate?: boolean // Cancel immediately vs end of period
}
```

**Response:**
```typescript
interface CancelResponse {
  success: boolean
  cancelledAt: string
  effectiveEndDate: string
  message: string
}
```

**Where Used:**
- Settings page subscription cancellation (to be added)

**Priority:** 🟡 **MEDIUM** - Important for subscription management

---

### 2. Billing History & Payment Transactions

#### ❌ `GET /organizations/:organizationId/billing-history`
**Purpose:** Get payment/transaction history for subscription and other charges

**Request:**
```typescript
GET /organizations/:organizationId/billing-history
Query: {
  skip?: number
  take?: number
  startDate?: string // ISO date
  endDate?: string // ISO date
}
```

**Response:**
```typescript
interface BillingHistoryResponse {
  transactions: Array<{
    id: string
    type: "subscription" | "one_time" | "refund" | "adjustment"
    description: string
    amount: number
    currency: string
    status: "completed" | "pending" | "failed" | "refunded"
    paymentMethod?: string // "credit_card", "wallet", "bank_transfer"
    invoiceId?: string
    invoiceNumber?: string
    createdAt: string
    paidAt?: string
    periodStart?: string // For subscription payments
    periodEnd?: string // For subscription payments
  }>
  total: number
  skip: number
  take: number
  hasMore: boolean
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx` (Lines 642-668)
- Currently shows hard-coded array: `['Nov 2024', 'Oct 2024', 'Sep 2024']` with "₹4,999" for all

**Priority:** 🔴 **HIGH** - Critical for billing history display

---

#### ❌ `GET /organizations/:organizationId/billing-history/:transactionId`
**Purpose:** Get details of a specific billing transaction

**Request:**
```typescript
GET /organizations/:organizationId/billing-history/:transactionId
```

**Response:**
```typescript
interface BillingTransactionDetail {
  id: string
  type: "subscription" | "one_time" | "refund" | "adjustment"
  description: string
  amount: number
  currency: string
  status: "completed" | "pending" | "failed" | "refunded"
  paymentMethod?: string
  paymentMethodDetails?: {
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
  }
  invoiceId?: string
  invoiceNumber?: string
  invoiceUrl?: string
  receiptUrl?: string
  createdAt: string
  paidAt?: string
  periodStart?: string
  periodEnd?: string
  metadata?: Record<string, unknown>
}
```

**Where Used:**
- Transaction detail view (to be created)
- Receipt download

**Priority:** 🟡 **MEDIUM** - Useful for transaction details

---

### 3. Payment Methods Management

#### ❌ `GET /organizations/:organizationId/payment-methods`
**Purpose:** Get saved payment methods (credit cards, bank accounts, etc.)

**Request:**
```typescript
GET /organizations/:organizationId/payment-methods
```

**Response:**
```typescript
interface PaymentMethodsResponse {
  paymentMethods: Array<{
    id: string
    type: "credit_card" | "debit_card" | "bank_account" | "wallet"
    isDefault: boolean
    // Credit/Debit Card
    last4?: string
    brand?: string // "visa", "mastercard", "rupay"
    expiryMonth?: number
    expiryYear?: number
    cardholderName?: string
    // Bank Account
    accountNumber?: string
    ifsc?: string
    bankName?: string
    accountHolderName?: string
    createdAt: string
  }>
}
```

**Where Used:**
- Settings page payment methods section (to be created)
- Subscription upgrade payment selection

**Priority:** 🟡 **MEDIUM** - Required for payment method management

---

#### ❌ `POST /organizations/:organizationId/payment-methods`
**Purpose:** Add a new payment method

**Request:**
```typescript
POST /organizations/:organizationId/payment-methods
Body: {
  type: "credit_card" | "debit_card" | "bank_account"
  // Card details (tokenized from payment gateway)
  token?: string
  // Or bank account details
  accountNumber?: string
  ifsc?: string
  bankName?: string
  accountHolderName?: string
  isDefault?: boolean
}
```

**Response:**
```typescript
interface AddPaymentMethodResponse {
  success: boolean
  paymentMethod: PaymentMethod
  message?: string
}
```

**Where Used:**
- Add payment method modal/form

**Priority:** 🟡 **MEDIUM** - Required for adding payment methods

---

#### ❌ `DELETE /organizations/:organizationId/payment-methods/:paymentMethodId`
**Purpose:** Remove a payment method

**Request:**
```typescript
DELETE /organizations/:organizationId/payment-methods/:paymentMethodId
```

**Response:**
```typescript
interface DeletePaymentMethodResponse {
  success: boolean
  message: string
}
```

**Where Used:**
- Payment methods list delete action

**Priority:** 🟡 **MEDIUM** - Required for payment method management

---

#### ❌ `PATCH /organizations/:organizationId/payment-methods/:paymentMethodId/default`
**Purpose:** Set a payment method as default

**Request:**
```typescript
PATCH /organizations/:organizationId/payment-methods/:paymentMethodId/default
```

**Response:**
```typescript
interface SetDefaultPaymentMethodResponse {
  success: boolean
  message: string
}
```

**Where Used:**
- Payment methods list set default action

**Priority:** 🟡 **MEDIUM** - Required for payment method management

---

## ⚠️ Other Missing Endpoints

### 4. Organization Configuration

#### ❌ `GET /organizations/:organizationId/config`
**Purpose:** Get organization-level configuration settings

**Request:**
```typescript
GET /organizations/:organizationId/config
```

**Response:**
```typescript
interface OrganizationConfigResponse {
  highValueThreshold?: number // Threshold for "high value" enrollments (currently hard-coded as 25000)
  defaultCurrency?: string
  timezone?: string
  dateFormat?: string
  numberFormat?: string
  // ... other configurable settings
}
```

**Where Used:**
- `app/(dashboard)/dashboard/dashboard-client.tsx` (Line 505)
- `app/(dashboard)/dashboard/components/dashboard-client-islands.tsx` (Line 84)
- Currently uses hard-coded `25000` for high value threshold

**Priority:** 🟢 **LOW** - Can use constants for now, but configurable is better

---

#### ❌ `PATCH /organizations/:organizationId/config`
**Purpose:** Update organization configuration

**Request:**
```typescript
PATCH /organizations/:organizationId/config
Body: {
  highValueThreshold?: number
  defaultCurrency?: string
  timezone?: string
  // ... other settings
}
```

**Response:**
```typescript
interface UpdateConfigResponse {
  success: boolean
  config: OrganizationConfigResponse
}
```

**Where Used:**
- Settings page configuration section (to be created)

**Priority:** 🟢 **LOW** - Nice to have

---

## 📊 Summary

### 🔴 High Priority (Must Create):
1. ❌ `GET /organizations/:organizationId/subscription` - Get current subscription plan
2. ❌ `GET /organizations/:organizationId/plans` - Get available plans
3. ❌ `POST /organizations/:organizationId/subscription/upgrade` - Upgrade plan
4. ❌ `GET /organizations/:organizationId/billing-history` - Get payment history

### 🟡 Medium Priority (Should Create):
5. ❌ `POST /organizations/:organizationId/subscription/cancel` - Cancel subscription
6. ❌ `GET /organizations/:organizationId/billing-history/:transactionId` - Transaction details
7. ❌ `GET /organizations/:organizationId/payment-methods` - List payment methods
8. ❌ `POST /organizations/:organizationId/payment-methods` - Add payment method
9. ❌ `DELETE /organizations/:organizationId/payment-methods/:paymentMethodId` - Remove payment method
10. ❌ `PATCH /organizations/:organizationId/payment-methods/:paymentMethodId/default` - Set default payment method

### 🟢 Low Priority (Nice to Have):
11. ❌ `GET /organizations/:organizationId/config` - Get organization config
12. ❌ `PATCH /organizations/:organizationId/config` - Update organization config

---

## 🔧 Implementation Notes

### Database Schema Requirements:

1. **Subscription Table:**
   ```sql
   CREATE TABLE subscriptions (
     id UUID PRIMARY KEY,
     organization_id UUID REFERENCES organizations(id),
     plan_id VARCHAR NOT NULL,
     plan_name VARCHAR NOT NULL,
     plan_type VARCHAR NOT NULL,
     price DECIMAL NOT NULL,
     currency VARCHAR DEFAULT 'INR',
     billing_cycle VARCHAR NOT NULL, -- 'monthly' | 'yearly'
     status VARCHAR NOT NULL, -- 'active' | 'cancelled' | 'expired' | 'trial'
     start_date TIMESTAMP NOT NULL,
     end_date TIMESTAMP,
     auto_renew BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Billing Transactions Table:**
   ```sql
   CREATE TABLE billing_transactions (
     id UUID PRIMARY KEY,
     organization_id UUID REFERENCES organizations(id),
     type VARCHAR NOT NULL, -- 'subscription' | 'one_time' | 'refund' | 'adjustment'
     description TEXT,
     amount DECIMAL NOT NULL,
     currency VARCHAR DEFAULT 'INR',
     status VARCHAR NOT NULL, -- 'completed' | 'pending' | 'failed' | 'refunded'
     payment_method VARCHAR,
     invoice_id UUID REFERENCES invoices(id),
     invoice_number VARCHAR,
     period_start TIMESTAMP,
     period_end TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     paid_at TIMESTAMP
   );
   ```

3. **Payment Methods Table:**
   ```sql
   CREATE TABLE payment_methods (
     id UUID PRIMARY KEY,
     organization_id UUID REFERENCES organizations(id),
     type VARCHAR NOT NULL, -- 'credit_card' | 'debit_card' | 'bank_account' | 'wallet'
     is_default BOOLEAN DEFAULT false,
     -- Card fields (tokenized)
     token VARCHAR, -- Payment gateway token
     last4 VARCHAR,
     brand VARCHAR,
     expiry_month INTEGER,
     expiry_year INTEGER,
     cardholder_name VARCHAR,
     -- Bank account fields
     account_number VARCHAR, -- Encrypted
     ifsc VARCHAR,
     bank_name VARCHAR,
     account_holder_name VARCHAR,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Plans Table:**
   ```sql
   CREATE TABLE plans (
     id UUID PRIMARY KEY,
     name VARCHAR NOT NULL,
     type VARCHAR NOT NULL UNIQUE, -- 'starter' | 'growth' | 'pro' | 'enterprise'
     monthly_price DECIMAL NOT NULL,
     yearly_price DECIMAL,
     currency VARCHAR DEFAULT 'INR',
     features JSONB, -- Store plan features as JSON
     popular BOOLEAN DEFAULT false,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

---

## 📝 Frontend Integration Notes

### Current Hard-Coded Values to Replace:

1. **Settings Page - Billing Section:**
   - `"Pro Plan"` → `subscription.planName`
   - `"₹4,999/mo"` → `subscription.price` + `subscription.currency`
   - `['Nov 2024', 'Oct 2024', 'Sep 2024']` → `billingHistory.transactions`

2. **Settings Panel:**
   - `"Pro Plan"` → `subscription.planName`
   - `"₹4,999/month"` → `subscription.price` + `subscription.currency`
   - `"₹25,000"` → Use existing wallet endpoint (already available)

3. **Dashboard:**
   - `25000` threshold → `organizationConfig.highValueThreshold` or constant

---

## ✅ Endpoints That Already Exist (Don't Need to Create)

- ✅ `GET /organizations/:organizationId/wallet` - Wallet balance (exists, Settings Panel should use this)
- ✅ `GET /invoices` - Invoice list (exists)
- ✅ `GET /invoices/:id` - Invoice details (exists)
- ✅ `GET /invoices/:id/line-items` - Invoice line items (exists)

---

## 🎯 Recommendation

**Backend Priority:**
1. **First Phase:** Create subscription and billing history endpoints (High Priority)
   - This will allow frontend to replace all hard-coded subscription/billing data
   
2. **Second Phase:** Create payment methods management endpoints (Medium Priority)
   - Required for subscription upgrades and payment management

3. **Third Phase:** Create organization config endpoints (Low Priority)
   - Nice to have for making thresholds configurable

**Frontend Status:**
- ✅ Hard-coded values have been removed/identified
- ⏳ Waiting for backend endpoints to be created
- ⏳ Frontend will integrate once endpoints are available

---

**Note:** This document focuses on **completely missing endpoints**. For endpoints that exist but return incomplete data, see `docs/INCOMPLETE_ENDPOINT_DATA.md`.
