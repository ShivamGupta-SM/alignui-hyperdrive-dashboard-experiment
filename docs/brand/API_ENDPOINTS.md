# Brand API Endpoints

API endpoints relevant to brands (organizations) on the Hypedrive platform.

**Note:** This is a subset of the [complete API reference](../API_ENDPOINTS.md) filtered for brand use cases.

---

## Access Control by Approval Status

Endpoints are gated based on organization approval status:

### Before Approval (Pending Status)

These endpoints work for unapproved organizations:

| Category | Allowed Actions |
|----------|-----------------|
| **Auth** | Sign up, sign in, manage sessions, 2FA |
| **Organization** | Create org, view org, update profile, verify GST/PAN |
| **View Only** | View dashboard, view platform features |

### After Approval Only ⚠️

These endpoints **require approved organization status**:

| Endpoint | Error if Not Approved |
|----------|----------------------|
| `inviteMember` | "Organization not yet approved. Please complete GST verification and wait for admin approval." |
| `addBankAccount` | "Organization not yet approved. Please complete GST verification and wait for admin approval." |
| `createCampaign` | "Organization not yet approved. Please complete GST verification and wait for admin approval." |
| All wallet operations | Wallet created at approval |
| All campaign operations | Campaign requires approved org |

### Approval Requirements

To get approved, organization must:

1. ✅ Complete organization profile
2. ✅ Verify GST number (mandatory)
3. ✅ Submit for admin review
4. ✅ Admin approves → Wallet + Deposit Account created

### Admin Inputs During Approval

When admin approves an organization, they can set:

| Field | Type | Description |
|-------|------|-------------|
| `creditLimit` | number | Credit limit for the organization (optional, default: 0) |
| `accountTier` | string | Account tier: `standard`, `premium`, `enterprise` (optional) |
| `notes` | string | Internal notes about the approval (optional) |

---

## Table of Contents

1. [Authentication & User](#authentication--user)
2. [Organization Management](#organization-management)
3. [Campaign Management](#campaign-management)
4. [Enrollment Management](#enrollment-management)
5. [Products](#products)
6. [Categories](#categories)
7. [Deliverable Types](#deliverable-types)
8. [Platforms](#platforms)
9. [Shopper Profiles](#shopper-profiles)
10. [Wallet & Finance](#wallet--finance)
11. [Invoices](#invoices)
12. [Notifications](#notifications)
13. [Storage](#storage)

---

## Authentication & User

### Core Authentication
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `signUpEmail` | POST | `/auth/sign-up/email` | Sign up with email and password |
| `signInEmail` | POST | `/auth/sign-in/email` | Sign in with email and password |
| `signOut` | POST | `/auth/sign-out` | Sign out current session |
| `me` | GET | `/auth/me` | Get current user info |
| `getPermissions` | GET | `/auth/permissions` | Get CASL permissions for frontend |

### Session Management
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listSessions` | GET | `/auth/sessions` | List all sessions |
| `revokeSession` | POST | `/auth/revoke-session` | Revoke specific session |
| `revokeOtherSessions` | POST | `/auth/revoke-other-sessions` | Revoke other sessions |

### Two-Factor Authentication
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `twoFactorEnable` | POST | `/auth/two-factor/enable` | Enable 2FA |
| `twoFactorDisable` | POST | `/auth/two-factor/disable` | Disable 2FA |
| `twoFactorGetTotpUri` | POST | `/auth/two-factor/totp-uri` | Get TOTP URI for setup |
| `twoFactorGenerateBackupCodes` | POST | `/auth/two-factor/generate-backup-codes` | Generate backup codes |

---

## Organization Management

### Organization CRUD
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `createOrganization` | POST | `/organizations` | Create new organization |
| `getOrganization` | GET | `/organizations/:id` | Get organization details |
| `getMyOrganizations` | GET | `/organizations/me` | Get user's organizations |
| `updateOrganization` | PATCH | `/organizations/:id` | Update organization |
| `updateOrganizationLogo` | POST | `/organizations/:id/logo` | Update logo |
| `switchOrganization` | POST | `/organizations/switch` | Switch active organization |

### Better Auth Organization
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `createOrganization` | POST | `/auth/organization/create` | Create organization |
| `setActiveOrganization` | POST | `/auth/organization/set-active` | Set active organization |
| `getFullOrganization` | GET | `/auth/organization/full` | Get full organization details |
| `listOrganizations` | GET | `/auth/organization/list` | List user's organizations |
| `checkSlug` | POST | `/auth/organization/check-slug` | Check slug availability |

### Team Management
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listMembers` | GET | `/organizations/:id/members` | List members |
| `inviteMember` | POST | `/organizations/:id/invite` | Invite member |
| `removeMember` | DELETE | `/organizations/:id/members/:memberId` | Remove member |
| `inviteMemberAuth` | POST | `/auth/organization/invite-member` | Invite via Better Auth |
| `cancelInvitation` | POST | `/auth/organization/cancel-invitation` | Cancel invitation |
| `updateMemberRole` | POST | `/auth/organization/update-member-role` | Update role |
| `listMembersAuth` | GET | `/auth/organization/list-members` | List members |
| `listInvitations` | GET | `/auth/organization/list-invitations` | List invitations |

### Bank Accounts
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `addBankAccount` | POST | `/organizations/:id/bank-accounts` | Add bank account |
| `listBankAccounts` | GET | `/organizations/:id/bank-accounts` | List bank accounts |
| `getBankAccount` | GET | `/organizations/:id/bank-accounts/:accountId` | Get bank account |
| `updateBankAccount` | PATCH | `/organizations/:id/bank-accounts/:accountId` | Update bank account |
| `verifyBankAccount` | POST | `/organizations/:id/bank-accounts/:accountId/verify` | Verify via penny drop |
| `setDefaultBankAccount` | POST | `/organizations/:id/bank-accounts/:accountId/set-default` | Set default |
| `deleteBankAccount` | DELETE | `/organizations/:id/bank-accounts/:accountId` | Delete bank account |

### GST & PAN Verification

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `verifyGST` | POST | `/organizations/:id/verify-gst` | Verify GST via Surepass |
| `getGSTDetails` | GET | `/organizations/:id/gst` | Get GST details |
| `verifyPAN` | POST | `/organizations/:id/verify-pan` | Verify PAN via Surepass |
| `getPANDetails` | GET | `/organizations/:id/pan` | Get PAN details |

### Statistics
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `getOrganizationStats` | GET | `/organizations/:id/stats` | Get organization stats |
| `getOrganizationCampaignStats` | GET | `/organizations/:id/campaign-stats` | Get campaign stats |
| `getOrganizationActivity` | GET | `/organizations/:id/activity` | Get recent activity |
| `requestCreditIncrease` | POST | `/organizations/:id/request-credit-increase` | Request credit increase |

---

## Campaign Management

### Campaign Lifecycle
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `createCampaign` | POST | `/campaigns` | Create new campaign |
| `getCampaign` | GET | `/campaigns/:id` | Get campaign by ID |
| `listCampaigns` | GET | `/campaigns` | List campaigns (with CASL filtering + query filters) |
| `updateCampaign` | PATCH | `/campaigns/:id` | Update campaign (draft only) |
| `validateCampaign` | GET | `/campaigns/:id/validate` | Validate campaign |
| `submitForApproval` | POST | `/campaigns/:id/submit` | Submit for admin approval |
| `activateCampaign` | POST | `/campaigns/:id/activate` | Activate approved campaign |

**listCampaigns Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | number | Pagination offset (default: 0) |
| `take` | number | Results per page (1-100, default: 20) |
| `status` | string | Filter by campaign status |
| `organizationId` | string | Filter by organization |
| `productId` | string | Filter by product |
| `platformId` | string | Filter by product's e-commerce platform |
| `categoryId` | string | Filter by product's category |

### Campaign Status Control
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `pauseCampaign` | POST | `/campaigns/:id/pause` | Pause active campaign |
| `resumeCampaign` | POST | `/campaigns/:id/resume` | Resume paused campaign |
| `endCampaign` | POST | `/campaigns/:id/end` | End active/paused campaign |
| `cancelCampaign` | POST | `/campaigns/:id/cancel` | Cancel campaign (from draft, approved, or paused) |
| `completeCampaign` | POST | `/campaigns/:id/complete` | Complete campaign (from ended or expired) |
| `archiveCampaign` | POST | `/campaigns/:id/archive` | Archive ended/expired/completed campaign |
| `unarchiveCampaign` | POST | `/campaigns/:id/unarchive` | Unarchive campaign (restores pre-archive status) |
| `deleteCampaign` | DELETE | `/campaigns/:id` | Delete draft campaign (sets to cancelled) |
| `duplicateCampaign` | POST | `/campaigns/:id/duplicate` | Duplicate campaign |

### Campaign Analytics
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `getCampaignStats` | GET | `/campaigns/:id/stats` | Get campaign statistics |
| `getCampaignPerformance` | GET | `/campaigns/:id/performance` | Get performance over time |
| `getCampaignPricing` | GET | `/campaigns/:id/pricing` | Get pricing details |

### Campaign Deliverables
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `addCampaignDeliverablesBatch` | POST | `/campaigns/:campaignId/deliverables/batch` | Add deliverables batch |
| `addCampaignDeliverable` | POST | `/campaign-deliverables` | Add single deliverable |
| `listCampaignDeliverables` | GET | `/campaigns/:campaignId/deliverables` | List deliverables |
| `updateCampaignDeliverable` | PATCH | `/campaign-deliverables/:id` | Update deliverable |
| `removeCampaignDeliverable` | DELETE | `/campaign-deliverables/:id` | Remove deliverable |

---

## Enrollment Management

### Viewing Enrollments
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listCampaignEnrollments` | GET | `/campaigns/:campaignId/enrollments` | List campaign enrollments |
| `getEnrollment` | GET | `/enrollments/:id` | Get enrollment details |
| `getEnrollmentPricing` | GET | `/enrollments/:id/pricing` | Get pricing breakdown |
| `getEnrollmentStats` | GET | `/campaigns/:campaignId/enrollment-stats` | Get enrollment statistics |
| `exportEnrollments` | GET | `/campaigns/:campaignId/enrollments/export` | Export to CSV/XLSX |

### Enrollment Review
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `approveEnrollment` | POST | `/enrollments/:id/approve` | Approve enrollment |
| `rejectEnrollment` | POST | `/enrollments/:id/reject` | Reject enrollment |
| `requestChanges` | POST | `/enrollments/:id/request-changes` | Request changes |
| `extendDeadline` | POST | `/enrollments/:id/extend-deadline` | Extend deadline |

### Bulk Operations
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `bulkApproveEnrollments` | POST | `/enrollments/bulk-approve` | Bulk approve |
| `bulkRejectEnrollments` | POST | `/enrollments/bulk-reject` | Bulk reject |

### Deliverable Submissions
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listEnrollmentSubmissions` | GET | `/enrollments/:enrollmentId/submissions` | List submissions |
| `getDeliverableSubmission` | GET | `/deliverable-submissions/:id` | Get submission |
| `listPendingSubmissions` | GET | `/submissions/pending` | List pending for review |

---

## Products

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `createProduct` | POST | `/products` | Create product |
| `getProduct` | GET | `/products/:id` | Get product |
| `getProductBySlug` | GET | `/products/slug/:slug` | Get by slug |
| `listProducts` | GET | `/products` | List products |
| `listOrganizationProducts` | GET | `/organizations/:organizationId/products` | List org products |
| `updateProduct` | PATCH | `/products/:id` | Update product |
| `deleteProduct` | DELETE | `/products/:id` | Delete product |
| `bulkImportProducts` | POST | `/products/bulk-import` | Bulk import |

---

## Categories

Categories for organizing products. Used when creating products and filtering campaigns.

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listCategories` | GET | `/categories` | List all categories |
| `listAllCategories` | GET | `/categories/all` | List all categories (flat) |
| `getCategory` | GET | `/categories/:id` | Get category by ID |
| `getCategoryByName` | GET | `/categories/name/:name` | Get category by name |
| `getCategoryProducts` | GET | `/categories/:id/products` | Get products in category |

---

## Deliverable Types

Global deliverable types that can be added to campaigns. Used when configuring campaign requirements.

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listDeliverables` | GET | `/deliverables` | List all deliverable types |
| `getDeliverable` | GET | `/deliverables/:id` | Get deliverable type by ID |

---

## Platforms

E-commerce platforms where products can be purchased (Amazon, Flipkart, Myntra, etc.). Brands can optionally select a platform when creating products - if selected, shoppers must purchase from that specific platform to be eligible for cashback.

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listPlatforms` | GET | `/platforms` | List all platforms |
| `listActivePlatforms` | GET | `/platforms/active` | List active platforms only |
| `getPlatform` | GET | `/platforms/:id` | Get platform by ID |
| `getPlatformByName` | GET | `/platforms/name/:name` | Get platform by name |

---

## Shopper Profiles

View shopper information when reviewing enrollments.

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `getPublicShopperProfile` | GET | `/shoppers/:shopperId` | Get public shopper profile |

---

## Wallet & Finance

### Organization Wallet
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `getOrganizationWallet` | GET | `/organizations/:organizationId/wallet` | Get wallet |
| `getOrganizationWalletTransactions` | GET | `/organizations/:organizationId/wallet/transactions` | Get transactions |

### Withdrawals
| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `createOrganizationWithdrawal` | POST | `/organizations/:organizationId/wallet/withdrawals` | Create withdrawal |
| `listOrganizationWithdrawals` | GET | `/organizations/:organizationId/wallet/withdrawals` | List withdrawals |

---

## Invoices

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listInvoices` | GET | `/invoices` | List invoices |
| `getInvoice` | GET | `/invoices/:id` | Get invoice |
| `getInvoiceLineItems` | GET | `/invoices/:id/line-items` | Get line items |
| `markInvoiceViewed` | POST | `/invoices/:id/mark-viewed` | Mark as viewed |
| `generateInvoicePDF` | GET | `/invoices/:id/pdf` | Generate PDF |

---

## Notifications

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `listNotifications` | GET | `/notifications` | List notifications |
| `getNotification` | GET | `/notifications/:id` | Get notification |
| `markAsRead` | POST | `/notifications/:id/read` | Mark as read |
| `markAllAsRead` | POST | `/notifications/read-all` | Mark all as read |
| `getUnreadCount` | GET | `/notifications/unread-count` | Get unread count |
| `listPreferences` | GET | `/notifications/preferences` | List preferences |
| `updatePreference` | PATCH | `/notifications/preferences/:channel` | Update preference |

---

## Storage

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| `requestUploadUrl` | POST | `/storage/upload-url` | Get upload URL |
| `requestDownloadUrl` | POST | `/storage/download-url` | Get download URL |
| `deleteFile` | DELETE | `/storage/files/:key` | Delete file |
| `listFiles` | GET | `/storage/files` | List files |

---

## Summary

| Category | Endpoint Count |
|----------|----------------|
| Authentication & User | 12 |
| Organization Management | 30 |
| Campaign Management | 22 |
| Enrollment Management | 15 |
| Products | 8 |
| Categories | 5 |
| Deliverable Types | 2 |
| Platforms | 4 |
| Shopper Profiles | 1 |
| Wallet & Finance | 4 |
| Invoices | 5 |
| Notifications | 7 |
| Storage | 4 |
| **Total** | **119** |
