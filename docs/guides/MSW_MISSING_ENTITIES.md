# MSW Missing Entities Analysis

## Current MSW Database Collections ✅

### Core Business Entities
- ✅ `campaigns` - Campaigns
- ✅ `campaignDeliverables` - Campaign-specific deliverables
- ✅ `enrollments` - Enrollments
- ✅ `products` - Products
- ✅ `categories` - Product categories
- ✅ `platforms` - E-commerce platforms

### Financial Entities
- ✅ `invoices` - Invoices
- ✅ `transactions` - Wallet transactions
- ✅ `walletBalances` - Wallet balances (summary)
- ✅ `activeHolds` - Active holds on wallet

### Organization & Team
- ✅ `organizationSettings` - Organization details
- ✅ `teamMembers` - Team members
- ✅ `invitations` - Team invitations
- ✅ `bankAccounts` - Bank accounts
- ✅ `gstDetails` - GST verification details

### Analytics & Activity
- ✅ `dashboardStats` - Dashboard statistics (cached)
- ✅ `recentActivity` - Recent activity feed
- ✅ `notifications` - Notifications

---

## Missing Entities ❌

### 🔴 Critical Missing (Used in Frontend)

#### 1. **Deliverable Submissions** ❌
**Backend Table**: `deliverable_submission`  
**Used In**: `enrollment-detail-client.tsx` (line 395, 429)  
**Why Needed**: 
- Enrollment detail page shows deliverable submissions
- Users can view/edit submissions
- Required for enrollment workflow

**Fields Needed**:
- `id`, `enrollmentId`, `campaignDeliverableId`
- `proofLink`, `proofScreenshot`
- `lockedDeliverableName`, `lockedDeliverableDescription`
- `lockedQuantity`, `lockedIsRequired`, `lockedInstructions`
- `createdAt`, `updatedAt`

**Priority**: 🔴 **HIGH** - Used in enrollment detail page

---

#### 2. **Deliverables (Base Definitions)** ❌
**Backend Table**: `deliverable`  
**Used In**: Campaign creation, deliverable management  
**Why Needed**:
- Base deliverable templates (Order Screenshot, Product Review, etc.)
- Referenced by `campaignDeliverable`
- Used in deliverable type selection

**Fields Needed**:
- `id`, `name`, `description`
- `platformId`, `category`
- `requireLink`, `requireScreenshot`
- `status`, `metadata`
- `createdAt`, `updatedAt`

**Priority**: 🟡 **MEDIUM** - Needed for deliverable management

---

#### 3. **OCR Scans** ❌
**Backend Table**: `ocr_scan`  
**Used In**: Enrollment detail (OCR data shown)  
**Why Needed**:
- Enrollment detail shows OCR scan results
- Currently we have `ocrData` embedded in enrollments, but standalone scans might be needed
- For OCR verification workflow

**Fields Needed**:
- `id`, `campaignId`, `enrollmentId`, `shopperId`
- `screenshotUrl`, `status`
- `extractedOrderId`, `extractedOrderValue`, `extractedPurchaseDate`
- `extractedProductName`, `extractedSellerName`, `extractedPlatform`
- `productNameSimilarity`, `validationPassed`, `validationErrors`
- `confidence`, `rawResponse`
- `errorMessage`, `errorCode`
- `attemptCount`, `lastAttemptAt`
- `createdAt`, `completedAt`

**Priority**: 🟡 **MEDIUM** - Currently embedded in enrollments, but standalone might be useful

---

#### 4. **Enrollment Status History** ❌
**Backend Table**: `enrollment_status_history`  
**Used In**: Enrollment detail (status change history)  
**Why Needed**:
- Track status changes over time
- Audit trail for enrollments
- Show "who changed what and when"

**Fields Needed**:
- `id`, `enrollmentId`
- `fromStatus`, `toStatus`
- `changedBy`, `changedByRole`
- `reason`, `metadata`
- `changedAt`

**Priority**: 🟢 **LOW** - Nice to have for audit trail

---

### 🟡 Important Missing (Financial & Admin)

#### 5. **Withdrawals** ⚠️
**Backend Table**: `withdrawal`  
**Status**: Handler exists in `wallet.ts` but no database collection  
**Why Needed**:
- Wallet page shows withdrawal history
- Withdrawal requests and approvals
- Financial operations

**Fields Needed**:
- `id`, `holderType`, `holderId`
- `shopperId`, `organizationId`
- `amount`, `status`
- `requestedAt`, `processedAt`
- `requiresApproval`, `approvedBy`, `approvedAt`
- `rejectionReason`, `rejectedBy`
- `withdrawalMethodId`, `bankAccountId`
- `notes`, `createdAt`, `updatedAt`

**Priority**: 🟡 **MEDIUM** - Handler exists but no persistence

---

#### 6. **Payouts** ❌
**Backend Table**: `payout`  
**Why Needed**:
- Track payout processing
- Link withdrawals to payouts
- Financial reconciliation

**Fields Needed**:
- `id`, `holderType`, `holderId`
- `shopperId`, `organizationId`
- `withdrawalMethodId`, `bankAccountId`
- `amount`, `gatewayPayoutId`
- `payoutStatus`, `retryCount`, `lastRetryAt`
- `processedAt`, `failureReason`, `utr`
- `metadata`, `blnkHoldTransactionId`, `blnkCommitTransactionId`, `blnkVoidTransactionId`
- `withdrawalId`, `createdAt`, `updatedAt`

**Priority**: 🟡 **MEDIUM** - Financial operations

---

#### 7. **Payments** ❌
**Backend Table**: `payment`  
**Why Needed**:
- Payment gateway records (Razorpay, etc.)
- Payment history
- Invoice payments

**Fields Needed**:
- `id`, `gatewayPaymentId`, `gateway`
- `amount`, `currency`, `status`, `method`
- `orderId`, `invoiceId`, `organizationId`
- `gatewayFee`, `gatewayTax`
- `metadata`, `failureReason`, `refundedAmount`
- `createdAt`, `updatedAt`

**Priority**: 🟢 **LOW** - Payment gateway integration

---

#### 8. **Withdrawal Methods** ❌
**Backend Table**: `withdrawal_method`  
**Why Needed**:
- Shopper withdrawal methods (bank, UPI, wallet)
- Withdrawal method verification
- Payment preferences

**Fields Needed**:
- `id`, `shopperId`, `accountType`
- `accountHolderName`, `accountNumber`, `bankName`, `ifscCode`
- `upiId`, `walletProvider`, `walletAddress`
- `isVerified`, `verificationMethod`, `verifiedAt`, `verificationDetails`
- `isDefault`, `createdAt`, `updatedAt`

**Priority**: 🟡 **MEDIUM** - Needed for withdrawals

---

#### 9. **Withdrawal Method Verification** ❌
**Backend Table**: `withdrawal_method_verification`  
**Why Needed**:
- Track verification attempts
- Penny-drop verification records
- Verification status

**Priority**: 🟢 **LOW** - Internal verification tracking

---

### 🟢 Nice to Have (Admin & System)

#### 10. **Coupons** ❌
**Backend Table**: `coupon`  
**Why Needed**:
- Bonus coupon codes
- Campaign-specific coupons
- Coupon management

**Fields Needed**:
- `id`, `code`, `createdBy`
- `bonusAmount`, `usageLimit`, `oneTimeUse`
- `specificCampaignId`, `status`
- `validFrom`, `validUntil`
- `timesUsed`, `createdAt`, `updatedAt`

**Priority**: 🟢 **LOW** - Not currently used in frontend

---

#### 11. **Coupon Redemptions** ❌
**Backend Table**: `coupon_redemption`  
**Why Needed**:
- Track coupon usage
- Link coupons to enrollments
- Redemption history

**Priority**: 🟢 **LOW** - Depends on coupons

---

#### 12. **Campaign Pause History** ❌
**Backend Table**: `campaign_pause_history`  
**Why Needed**:
- Track campaign pause/resume events
- Audit trail
- Campaign lifecycle

**Priority**: 🟢 **LOW** - Audit trail only

---

#### 13. **Admin Activity Log** ❌
**Backend Table**: `admin_activity_log`  
**Why Needed**:
- Admin action tracking
- Audit trail
- Security monitoring

**Priority**: 🟢 **LOW** - Admin-only feature

---

#### 14. **System Config** ❌
**Backend Table**: `system_config`  
**Why Needed**:
- System-wide configuration
- Feature flags
- Settings management

**Priority**: 🟢 **LOW** - System-level, not user-facing

---

#### 15. **Permission Rules** ❌
**Backend Table**: `permission_rule`  
**Why Needed**:
- RBAC permission management
- Custom permission rules
- Authorization system

**Priority**: 🟢 **LOW** - Backend authorization

---

#### 16. **Deposit Accounts** ❌
**Backend Table**: `deposit_account`  
**Why Needed**:
- Razorpay virtual accounts
- Organization deposit tracking
- Financial operations

**Priority**: 🟢 **LOW** - Backend financial integration

---

#### 17. **Processed Events** ❌
**Backend Table**: `processed_event`  
**Why Needed**:
- Event processing tracking
- Idempotency
- Event-driven architecture

**Priority**: 🟢 **LOW** - Backend infrastructure

---

#### 18. **Payout Transactions** ❌
**Backend Table**: `payout_transaction`  
**Why Needed**:
- Blnk transaction tracking
- Financial reconciliation
- Transaction history

**Priority**: 🟢 **LOW** - Backend financial integration

---

#### 19. **Email Suppression** ❌
**Backend Table**: `email_suppression`  
**Why Needed**:
- Email bounce tracking
- Unsubscribe management
- Email delivery optimization

**Priority**: 🟢 **LOW** - Email system

---

#### 20. **Notification Rate Limit** ❌
**Backend Table**: `notification_rate_limit`  
**Why Needed**:
- Notification throttling
- Rate limiting
- Notification delivery optimization

**Priority**: 🟢 **LOW** - Notification system

---

#### 21. **Document Verification** ❌
**Backend Table**: `document_verification`  
**Why Needed**:
- KYC document verification
- Document upload tracking
- Verification status

**Priority**: 🟢 **LOW** - KYC workflow

---

#### 22. **Admin Profiles** ❌
**Backend Table**: `admin`  
**Why Needed**:
- Admin user profiles
- Admin management
- Admin-specific data

**Priority**: 🟢 **LOW** - Admin-only feature

---

#### 23. **Shopper Profiles** ❌
**Backend Table**: `shopper`  
**Status**: Data embedded in enrollments (`shopper` object)  
**Why Needed**:
- Standalone shopper profiles
- Shopper management
- KYC data

**Priority**: 🟢 **LOW** - Currently embedded in enrollments

---

#### 24. **Wallet (Full Entity)** ⚠️
**Backend Table**: `wallet`  
**Status**: We have `walletBalances` (summary) but not full wallet entity  
**Why Needed**:
- Full wallet details
- Blnk integration data
- Wallet operations

**Priority**: 🟢 **LOW** - Summary data is sufficient for most use cases

---

## Summary

### Missing Collections by Priority

**🔴 HIGH Priority (Used in Frontend):**
1. ✅ **Deliverable Submissions** - Used in enrollment detail page

**🟡 MEDIUM Priority (Important Features):**
2. ✅ **Deliverables (Base)** - Needed for deliverable management
3. ✅ **OCR Scans** - Enrollment OCR data (currently embedded)
4. ✅ **Withdrawals** - Handler exists but no DB collection
5. ✅ **Payouts** - Financial operations
6. ✅ **Withdrawal Methods** - Needed for withdrawals

**🟢 LOW Priority (Nice to Have):**
7. Enrollment Status History
8. Payments
9. Coupons & Coupon Redemptions
10. Campaign Pause History
11. Admin Activity Log
12. System Config
13. Permission Rules
14. Deposit Accounts
15. Processed Events
16. Payout Transactions
17. Email Suppression
18. Notification Rate Limit
19. Document Verification
20. Admin Profiles
21. Shopper Profiles (standalone)
22. Wallet (full entity)

---

## Recommendation

### Must Add (High Priority):
1. **Deliverable Submissions** - Required for enrollment detail page

### Should Add (Medium Priority):
2. **Deliverables (Base)** - For deliverable management
3. **Withdrawals** - Add database collection (handler exists)
4. **Withdrawal Methods** - For withdrawal functionality

### Can Add Later (Low Priority):
- Everything else (admin features, audit trails, etc.)

---

## Implementation Notes

### Better Auth Tables (Not Needed)
These are handled by Better Auth and don't need MSW mocking:
- `user`, `session`, `account`, `verification`, `twoFactor`, `rateLimit`, `organizationRole`

### Embedded Data (May Not Need Standalone)
- **Shopper**: Currently embedded in enrollments (`shopper` object)
- **OCR Data**: Currently embedded in enrollments (`ocrData` object)
- **Wallet**: Summary data (`walletBalances`) is sufficient for most cases

### Handler Exists But No DB Collection
- **Withdrawals**: Handler in `wallet.ts` but no database collection for persistence

