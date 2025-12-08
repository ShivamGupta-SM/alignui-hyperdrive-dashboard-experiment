# Brand User Journey

This document outlines the complete user journey for brands (organizations) on the Hypedrive platform.

---

## Journey Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BRAND USER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ONBOARDING          2. SETUP             3. CAMPAIGN            4. MANAGE│
│  ────────────           ─────────            ────────────           ─────────│
│  • Sign Up              • Invite Team        • Create Campaign      • Review │
│  • Create Org           • Add Bank           • Add Deliverables     • Approve│
│  • Explore (limited)    • Fund Wallet        • Submit for Review    • Reject │
│  • Complete Form                             • Admin Sets Pricing   • Payout │
│  • Verify GST *                              • Activate             • Analyze│
│  • Admin Approval **                                                         │
│                                                                             │
│  * GST verification is MANDATORY to request admin approval                  │
│  ** Admin approval creates: Blnk wallet + Razorpay deposit account          │
│     Full platform access (team, bank, campaigns) requires approved status   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Onboarding Philosophy

**Limited access before approval** - Brands can explore, but cannot operate:

| Before Approval | After Approval |
|-----------------|----------------|
| ✅ Sign up, create org | ✅ Everything below |
| ✅ Explore dashboard UI | ✅ Invite team members |
| ✅ View how platform works | ✅ Add bank accounts |
| ✅ Complete onboarding form | ✅ Fund wallet |
| ✅ Verify GST (required) | ✅ Create campaigns |
| ❌ Cannot invite team | ✅ Manage enrollments |
| ❌ Cannot add bank | ✅ Process payouts |
| ❌ Cannot create campaigns | |

**GST is the gate** - Brands must verify GST before admin will review their application.

---

## Phase 1: Onboarding

### Step 1.1: Account Registration

**User Action:** Brand representative signs up on Hypedrive

**Flow:**
```
Visit Hypedrive → Sign Up → Enter Email & Password → Verify Email → Login
```

**API Endpoints:**
- `POST /auth/sign-up/email` - Create account
- `POST /auth/verify-email` - Verify email
- `POST /auth/sign-in/email` - Login

---

### Step 1.2: Create Organization

**User Action:** Create a new organization (brand account)

**Required Information:**

| Field | Description | Required | Validation |
|-------|-------------|----------|------------|
| Name | Organization/brand name | Yes | 1-255 chars |
| Description | About the brand | No | Max 2000 chars |
| Website | Company website | No | Valid URL |
| Business Type | Legal structure | No | pvt_ltd, llp, partnership, proprietorship, public_ltd, trust, society |
| Industry Category | Industry/sector | No | Max 100 chars |
| Contact Person | Primary contact name | No | Max 255 chars |
| Phone Number | Contact phone | No | Indian format (+91/10 digits) |
| Address | Registered address | No | Max 500 chars |
| City | City | No | Max 100 chars |
| State | State | No | Max 100 chars |
| PIN Code | Postal code | No | 6 digit Indian PIN |

**Company Registration:**

| Field | Description | Validation | Required |
|-------|-------------|------------|----------|
| GST Number | GSTIN | 15 char format (verified via Surepass) | **MANDATORY** |
| PAN Number | Company PAN | 10 char format (verified via Surepass) | Recommended |
| CIN Number | Company Identification Number | 21 char format (for Pvt Ltd/LLP) | Pvt Ltd/LLP only |

**IMPORTANT:** GST verification is **MANDATORY during onboarding**. Admin cannot approve your organization without verified GST. Complete GST verification in Step 2.2 before requesting approval.

**Flow:**
```
Dashboard → Create Organization → Fill Basic Details → Submit → Pending Approval
```

**API Endpoints:**
- `POST /organizations` - Create organization
- `POST /organizations/:id/logo` - Upload logo

**Status:** Organization enters `pending` approval status

---

### Step 1.3: Admin Approval (Wait)

**Prerequisites for Approval:**

- GST must be verified - **MANDATORY**

**What Happens:**

1. Admin reviews organization application
2. Admin verifies GST is verified
3. Admin sets credit limit and account tier (optional)
4. Admin approves → System automatically creates:
   - **Blnk Wallet** - For managing funds
   - **Razorpay Virtual Account** - For receiving deposits

**Admin Inputs During Approval:**

| Field | Type | Description |
|-------|------|-------------|
| `creditLimit` | number | Credit limit for the organization (optional) |
| `accountTier` | string | `standard`, `premium`, or `enterprise` (optional) |
| `notes` | string | Internal notes about approval (optional) |

**Organization Statuses:**

| Status | Description |
|--------|-------------|
| `pending` | Awaiting admin review |
| `approved` | Ready to operate (GST verified, wallet created) |
| `rejected` | Application denied |
| `suspended` | Account suspended |

**API Endpoints (Admin):**

- `POST /admin/organizations/:id/approve` - Approve organization (requires GST verified, creates wallet + deposit account)
- `POST /admin/organizations/:id/reject` - Reject organization with reason
- `POST /admin/organizations/:organizationId/credit-limit` - Update credit limit (post-approval)

---

## Phase 2: Account Setup (Requires Admin Approval)

> **Note:** All Phase 2 actions require your organization to be approved by admin first.

### Step 2.1: Invite Team Members

**User Action:** Owner invites team members to the organization

**Available Roles:**
| Role | Permissions |
|------|-------------|
| Owner | Full access, billing, delete org |
| Admin | Manage campaigns, enrollments, team |
| Member | View and basic operations |

**Flow:**
```
Organization Settings → Team → Invite Member → Enter Email → Select Role → Send Invite
```

**API Endpoints:**
- `POST /organizations/:id/invite` - Invite member
- `GET /organizations/:id/members` - List members
- `DELETE /organizations/:id/members/:memberId` - Remove member

---

### Step 2.2: Add Bank Account

**User Action:** Add bank account for receiving payouts

**Required Information:**
| Field | Description |
|-------|-------------|
| Account Holder Name | Name on bank account |
| Account Number | Bank account number |
| IFSC Code | Bank IFSC code |
| Account Type | Savings/Current |

**Flow:**
```
Settings → Bank Accounts → Add Account → Enter Details → Verify (Penny Drop) → Active
```

**Verification Process:**
1. System initiates penny drop (₹1 test transfer)
2. User confirms amount received
3. Account marked as verified

**API Endpoints:**
- `POST /organizations/:id/bank-accounts` - Add bank account
- `POST /organizations/:id/bank-accounts/:accountId/verify` - Verify account
- `POST /organizations/:id/bank-accounts/:accountId/set-default` - Set as default

---

### Step 2.2: GST & PAN Verification (MANDATORY FOR APPROVAL)

**User Action:** Verify GST and PAN numbers for compliance

**CRITICAL:** GST verification is **MANDATORY during onboarding**:

- Admin **CANNOT approve** your organization without verified GST
- You cannot create campaigns without GST verification
- GST is required for tax invoice generation

Without verified GST, admin will see: *"Cannot approve organization: GST verification is required."*

**GST Verification:**

| Field | Description |
|-------|-------------|
| GST Number | 15-character GSTIN |
| Legal Name | Auto-fetched from government records |
| Trade Name | Auto-fetched from government records |
| GST Status | Active/Inactive |
| Address | Registered address from GST |

**PAN Verification:**

| Field | Description |
|-------|-------------|
| PAN Number | 10-character PAN |
| Holder Name | Auto-fetched from government records |

**Verification Provider:** Surepass KYC API

**Flow:**
```
Settings → Compliance → Enter GST → Verify → Auto-fetch Details → GST Verified → Can Create Campaigns
```

**API Endpoints:**

- `POST /organizations/:id/verify-gst` - Verify GST (via Surepass) - **MANDATORY**
- `GET /organizations/:id/gst` - Get GST details
- `POST /organizations/:id/verify-pan` - Verify PAN (via Surepass) - Recommended
- `GET /organizations/:id/pan` - Get PAN details

---

### Step 2.3: Fund Organization Wallet

**User Action:** Add funds to organization wallet for campaign payouts

**Methods:**
- Bank transfer to platform account
- UPI payment
- Net banking

**Flow:**
```
Wallet → Add Funds → Select Amount → Choose Payment Method → Complete Payment → Funds Credited
```

**API Endpoints:**
- `GET /organizations/:organizationId/wallet` - View wallet
- `POST /organizations/:organizationId/wallet/fund` - Fund wallet (Admin)

---

## Phase 3: Product & Campaign Management

### Campaign Status State Machine

Campaigns use a **single `status` field** that follows this state machine:

```text
┌─────────┐    submit    ┌──────────────────┐   admin    ┌──────────┐
│  draft  │ ──────────▶  │ pending_approval │ ─────────▶ │ approved │
└─────────┘              └──────────────────┘            └────┬─────┘
     │                           │                            │
     │ cancel                    │ reject                     │ activate
     ▼                           ▼                            ▼
┌───────────┐              ┌──────────┐                ┌──────────┐
│ cancelled │              │ rejected │                │  active  │
└───────────┘              └────┬─────┘                └────┬─────┘
                                │                          │
                                │ edit                ┌────┼────┐
                                ▼                     │    │    │
                          ┌─────────┐           pause │    │    │ end/expire
                          │  draft  │                 ▼    │    ▼
                          └─────────┘           ┌──────────┐│┌──────────┐
                                                │  paused  │││  ended   │
                                                └────┬─────┘│└────┬─────┘
                                                     │      │     │
                                                     │resume│     │ archive
                                                     └──────┘     ▼
                                                            ┌───────────┐
                                                            │ archived  │
                                                            └───────────┘
```

| Status | Description | Transitions |
|--------|-------------|-------------|
| `draft` | Brand editing | → pending_approval, cancelled |
| `pending_approval` | Waiting for admin | → approved, rejected |
| `approved` | Ready to activate | → active, cancelled |
| `rejected` | Admin rejected | → draft (edit & resubmit) |
| `active` | Campaign live | → paused, ended, expired |
| `paused` | Temporarily stopped | → active (resume), ended, cancelled |
| `ended` | Manually ended | → completed, archived |
| `expired` | Past end date | → completed, archived |
| `completed` | All enrollments processed | → archived (terminal before archive) |
| `cancelled` | Permanently cancelled | (terminal) |
| `archived` | Archived for records | → pre-archive status (unarchive) |

**New Status Transition Endpoints:**

| Endpoint | From States | To State | Description |
|----------|-------------|----------|-------------|
| `POST /campaigns/:id/cancel` | draft, approved, paused | cancelled | Cancel campaign before completion |
| `POST /campaigns/:id/complete` | ended, expired | completed | Mark as fully processed |

---

### Step 3.0: Manage Products (Optional Pre-step)

**User Action:** Create and manage products separately before campaigns

**Note:** This step is optional. Products can also be created inline during campaign creation.

**Product Information:**

| Field | Description | Validation |
|-------|-------------|------------|
| Name | Product name | Required |
| Platform | Where product is sold (Amazon, Flipkart, etc.) | Optional |
| Category | Product category | Optional |
| Price | Product price | Required |
| Product Link | URL to product page | Required |
| SKU | Product SKU/identifier | Required |
| Product Images | Product photos | Optional |

**Platform Selection:**

- If a platform is selected (e.g., "Amazon"), shoppers must purchase from that specific platform to be eligible for cashback
- If no platform is selected, shoppers can purchase from any marketplace and provide proof

**Flow:**

```text
Products → Add Product → Fill Details → Save
```

**API Endpoints:**

- `GET /organizations/:organizationId/products` - List products
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/bulk-import` - Bulk import products
- `GET /platforms/active` - List available platforms
- `GET /categories` - List categories

---

### Step 3.1: Create Campaign

**User Action:** Create a new promotional campaign

**Required Information:**
| Field | Description | Validation |
|-------|-------------|------------|
| Product | Select existing or create new product | Required |
| Title | Campaign name | 1-255 chars |
| Description | Campaign details | Max 5000 chars |
| Start Date | Campaign start | Future date |
| End Date | Campaign end | After start |
| Max Enrollments | Capacity limit | 1-1,000,000 |
| Campaign Type | cashback/rebate/giveaway | Required |
| Is Public | Show to all shoppers | Default: true |
| Terms & Conditions | Legal terms | Max 50000 chars |

**Product Selection Options:**

1. **Select Existing Product** - Choose from previously created products
2. **+ Create New Product** - Create product inline during campaign creation

**Creating New Product (Inline):**

| Field | Description | Validation |
|-------|-------------|------------|
| Name | Product name | Required |
| Platform | Where product is sold (Amazon, Flipkart, etc.) | Optional |
| Category | Product category | Optional |
| Price | Product price | Required |
| Product Link | URL to product page | Required |
| SKU | Product SKU/identifier | Required |
| Product Images | Product photos | Optional |

**Platform Selection:**

- If a platform is selected (e.g., "Amazon"), shoppers must purchase from that specific platform to be eligible for cashback
- If no platform is selected, shoppers can purchase from any marketplace and provide proof

**Flow:**

```text
Campaigns → Create New → Select Product (or + Create New) → Fill Campaign Details → Save Draft
```

**API Endpoints:**

- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - View campaign
- `GET /organizations/:organizationId/products` - List org products
- `POST /products` - Create product (inline)
- `GET /platforms/active` - List available platforms
- `GET /categories` - List categories

**Status:** Campaign created in `draft` status

---

### Step 3.2: Configure Pricing (Set by Admin)

**Note:** Pricing is set by admin during approval, not by brand

**Pricing Components:**
| Component | Description | Example |
|-----------|-------------|---------|
| Rebate Percentage | % returned to shopper | 10% |
| Bill Rate | % charged to brand | 12% |
| Platform Fee | Fixed fee per enrollment | ₹50 |
| Bonus Amount | Additional bonus to shopper | ₹100 |

**Payout Calculation:**
```
Shopper Payout = (Order Value × Rebate %) + Bonus
GST = Shopper Payout × 18%
Brand Cost = Shopper Payout + GST + Platform Fee
Platform Margin = Platform Fee + (Order Value × (Bill Rate - Rebate %))
```

---

### Step 3.3: Add Deliverables

**User Action:** Define additional proofs for the campaign

**Note:** Order screenshot is automatically required for all enrollments (used for OCR verification). Deliverables are *additional* proofs you can configure.

**Available Deliverable Types:**

| Type | Description | Example |
|------|-------------|---------|
| Delivery Photo | Product received | Unboxing photo |
| Product Review | Written review on platform | Amazon/Flipkart review |
| Social Media Post | Promotional content | Instagram reel, YouTube video |
| Review Link | Link to product review | Amazon review URL |

**Flow:**

```text
Campaign → Deliverables → Add Deliverable → Select Type → Set as Required → Save
```

**API Endpoints:**
- `POST /campaigns/:campaignId/deliverables/batch` - Add multiple deliverables
- `GET /campaigns/:campaignId/deliverables` - List deliverables
- `DELETE /campaign-deliverables/:id` - Remove deliverable

---

### Step 3.4: Submit for Approval

**User Action:** Submit campaign for admin review

**Pre-submission Validation:**
- Product linked
- Start/end dates valid
- At least one deliverable added
- Terms accepted

**Flow:**
```
Campaign → Validate → Submit for Approval → Wait for Admin Review
```

**API Endpoints:**
- `GET /campaigns/:id/validate` - Validate campaign
- `POST /campaigns/:id/submit` - Submit for approval

**Status Changes:** `draft` → `pending_approval`

---

### Step 3.5: Admin Review (Wait)

**What Happens:**
- Admin reviews campaign details
- Admin sets pricing (rebate %, platform fee, etc.)
- Admin approves or rejects with feedback

**API Endpoints (Admin):**
- `POST /admin/campaigns/:id/approve` - Approve with pricing
- `POST /admin/campaigns/:id/reject` - Reject with reason

**Status Changes:** `pending_approval` → `approved` or `rejected`

---

### Step 3.6: Activate Campaign

**User Action:** Activate approved campaign to start receiving enrollments

**Conditions:**
- Campaign must be approved
- Start date reached (or manual activation)
- Sufficient wallet balance

**Flow:**
```
Campaign → Activate → Confirm → Campaign Live
```

**API Endpoints:**
- `POST /campaigns/:id/activate` - Activate campaign

**Status Changes:** `approved` → `active`

---

## Phase 4: Enrollment Management

### Step 4.1: View Enrollments

**User Action:** Monitor incoming enrollments from shoppers

**Enrollment List View:**
| Column | Description |
|--------|-------------|
| Shopper | Shopper name/ID |
| Order ID | Purchase order number |
| Order Value | Purchase amount |
| Status | Current status |
| Submitted | Submission date |
| Actions | Approve/Reject/View |

**Flow:**
```
Campaign → Enrollments → Filter by Status → View List
```

**API Endpoints:**
- `GET /campaigns/:campaignId/enrollments` - List enrollments
- `GET /campaigns/:campaignId/enrollment-stats` - Get statistics

---

### Step 4.2: Review Submission

**User Action:** Review shopper's submitted proofs

**Review Checklist:**

- [ ] Order ID matches screenshot
- [ ] Order value is accurate
- [ ] Purchase date is within campaign period
- [ ] All required deliverables submitted
- [ ] Proofs are genuine and clear
- [ ] Platform matches product requirement (if specified - e.g., purchased from Amazon)

**Flow:**

```text
Enrollment → View Details → Check Proofs → Make Decision
```

**API Endpoints:**
- `GET /enrollments/:id` - View enrollment details
- `GET /enrollments/:id/pricing` - View pricing breakdown

---

### Step 4.3: Approve Enrollment

**User Action:** Approve valid enrollment

**What Happens:**
1. Blnk hold is committed via centralized wallet function (atomic status update)
2. `blnkHoldStatus` atomically updated to `committed`
3. Shopper receives payout in wallet
4. Enrollment status → `approved`
5. Notification sent to shopper

**Hold Commit Process:**
The platform uses a centralized `commitEnrollmentHoldWithStatus()` function that:
- Validates hold is still active (not voided/expired)
- Verifies hold status in Blnk before committing
- Atomically updates both Blnk ledger AND enrollment `blnkHoldStatus`
- Returns detailed error if commit fails (e.g., hold expired)

**Flow:**
```
Enrollment → Review → Approve → Add Remarks (optional) → Confirm
```

**API Endpoints:**
- `POST /enrollments/:id/approve` - Approve single
- `POST /enrollments/bulk-approve` - Bulk approve

---

### Step 4.4: Request Changes

**User Action:** Request corrections from shopper

**When to Use:**
- Proof is unclear or cropped
- Missing information
- Minor issues that can be fixed

**Flow:**
```
Enrollment → Request Changes → Enter Feedback → Send → Shopper Notified
```

**API Endpoints:**
- `POST /enrollments/:id/request-changes` - Request changes

**Status Changes:** `awaiting_review` → `changes_requested`

**Note:** Shopper can resubmit up to max rejection attempts (campaign's `maxRejectionAttempts` setting). When `rejectionCount >= maxRejectionAttempts`, the brand must use the reject endpoint to permanently reject. Atomic counter increment prevents race conditions.

---

### Step 4.5: Reject Enrollment

**User Action:** Permanently reject invalid enrollment

**When to Use:**
- Fraudulent submission
- Max rejection attempts exceeded
- Order not eligible

**What Happens:**
1. Blnk hold is voided via centralized wallet function (atomic status update)
2. Enrollment status → `permanently_rejected`
3. `blnkHoldStatus` atomically updated to `voided`
4. Notification sent to shopper

**Hold Void Process:**
The platform uses a centralized `voidEnrollmentHoldWithStatus()` function that:
- Validates hold exists and is not already voided/committed
- Retries up to 3 times with exponential backoff
- Atomically updates both Blnk ledger AND enrollment `blnkHoldStatus`
- Marks as `void_failed` if all retries fail (for manual reconciliation)

**Flow:**
```
Enrollment → Reject → Enter Reason → Confirm → Funds Released
```

**API Endpoints:**
- `POST /enrollments/:id/reject` - Reject single
- `POST /enrollments/bulk-reject` - Bulk reject

---

### Step 4.6: Extend Deadline

**User Action:** Give shopper more time to submit

**Flow:**
```
Enrollment → Extend Deadline → Select New Date → Confirm
```

**API Endpoints:**
- `POST /enrollments/:id/extend-deadline` - Extend deadline

---

## Phase 5: Campaign Management

### Step 5.1: Pause Campaign

**User Action:** Temporarily stop new enrollments

**When to Use:**
- Budget concerns
- Product stock issues
- Campaign optimization needed

**Flow:**
```
Campaign → Pause → Enter Reason → Confirm → No New Enrollments
```

**API Endpoints:**
- `POST /campaigns/:id/pause` - Pause campaign

**Status Changes:** `active` → `paused`

---

### Step 5.2: Resume Campaign

**User Action:** Restart paused campaign

**Flow:**
```
Campaign → Resume → Confirm → Campaign Active Again
```

**API Endpoints:**
- `POST /campaigns/:id/resume` - Resume campaign

**Status Changes:** `paused` → `active`

---

### Step 5.3: End Campaign

**User Action:** Permanently close campaign

**What Happens:**
- No new enrollments accepted
- Existing enrollments can still be processed
- Campaign moves to ended status

**Flow:**
```
Campaign → End Campaign → Confirm → Campaign Closed
```

**API Endpoints:**
- `POST /campaigns/:id/end` - End campaign

**Status Changes:** `active`/`paused` → `ended`

---

### Step 5.4: Archive Campaign

**User Action:** Archive ended campaign

**Flow:**
```
Campaign → Archive → Campaign Archived
```

**API Endpoints:**
- `POST /campaigns/:id/archive` - Archive campaign

---

### Step 5.5: Duplicate Campaign

**User Action:** Create copy of existing campaign

**What's Copied:**
- Campaign details
- Deliverable requirements
- Terms and conditions

**What's Reset:**
- Status → draft
- Dates → new dates
- Enrollments → zero

**Flow:**
```
Campaign → Duplicate → Edit Details → Save as New Campaign
```

**API Endpoints:**
- `POST /campaigns/:id/duplicate` - Duplicate campaign

---

## Phase 6: Analytics & Reporting

### Step 6.1: View Campaign Statistics

**Available Metrics:**
| Metric | Description |
|--------|-------------|
| Total Enrollments | All enrollments count |
| Pending Enrollments | Awaiting submission/review |
| Approved Enrollments | Successfully approved |
| Rejected Enrollments | Permanently rejected |
| Withdrawn Enrollments | Shopper cancelled |
| Total Order Value | Sum of all order values |
| Average Order Value | Mean order value |
| Total Payouts | Sum of shopper payouts |
| Total Brand Cost | Total spent by brand |
| Enrollment Rate | Enrollments / Capacity |
| Approval Rate | Approved / Total |

**API Endpoints:**
- `GET /campaigns/:id/stats` - Get campaign statistics
- `GET /campaigns/:id/performance` - Get performance over time

---

### Step 6.2: Export Data

**User Action:** Export enrollment data for analysis

**Export Formats:**
- CSV
- XLSX (Excel)

**Exported Fields:**
- Enrollment ID
- Order ID
- Order Value
- Shopper Details
- Status
- Payout Amount
- Timestamps

**Flow:**
```
Campaign → Enrollments → Export → Select Format → Download
```

**API Endpoints:**
- `GET /campaigns/:campaignId/enrollments/export` - Export enrollments

---

## Phase 7: Financial Management

### Step 7.1: View Wallet Balance

**Information Displayed:**

| Field | Description |
|-------|-------------|
| Available Balance | Funds available for use |
| Held Amount | Funds locked in enrollment holds |
| Credit Limit | Max overdraft allowed (from `organization.creditLimit`, set by admin) |
| Total Balance | Available + Held |

**Note:** Credit settings are managed by admin via `organization.creditLimit`. If `creditLimit > 0`, the organization can use credit up to that limit.

**API Endpoints:**
- `GET /organizations/:organizationId/wallet` - Get wallet details

---

### Step 7.2: View Transactions

**Transaction Types:**
| Type | Description |
|------|-------------|
| Credit | Funds added to wallet |
| Debit | Funds withdrawn |
| Hold | Funds locked for enrollment |
| Release | Hold released (rejection) |
| Commit | Hold committed (approval) |

**API Endpoints:**
- `GET /organizations/:organizationId/wallet/transactions` - Get transactions

---

### Step 7.3: Request Withdrawal

**User Action:** Withdraw funds from organization wallet

**Flow:**
```
Wallet → Withdraw → Enter Amount → Select Bank Account → Confirm → Processing
```

**API Endpoints:**
- `POST /organizations/:organizationId/wallet/withdrawals` - Create withdrawal
- `GET /organizations/:organizationId/wallet/withdrawals` - List withdrawals

---

### Step 7.4: View Invoices

**Invoice Contents:**
- Campaign enrollments
- Payout amounts
- Platform fees
- GST breakdown
- Total charges

**API Endpoints:**
- `GET /invoices` - List invoices
- `GET /invoices/:id` - View invoice details
- `GET /invoices/:id/line-items` - View line items

---

## Key Success Metrics

### For Campaign Performance
- **Enrollment Rate**: % of capacity filled
- **Approval Rate**: % of enrollments approved
- **Average Order Value**: Mean purchase amount
- **Time to Approval**: Average review time

### For Financial Health
- **Wallet Utilization**: % of funds in use
- **Cost per Enrollment**: Total cost / Approved enrollments
- **ROI**: (Sales Generated - Total Cost) / Total Cost

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Low enrollment rate | Improve campaign visibility, increase rebate |
| High rejection rate | Clarify requirements, improve instructions |
| Slow approvals | Use bulk approve, set up auto-approval |
| Budget exceeded | Contact admin to increase `creditLimit`, or fund wallet |
| Fraudulent submissions | Implement stricter verification |
