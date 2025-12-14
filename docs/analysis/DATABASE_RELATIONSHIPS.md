# Database Relationships Verification

## Overview
This document verifies all relationships in the MSW mock database are correctly established.

## ✅ Relationships Verified

### 1. Campaigns → Enrollments
**Status**: ✅ **CORRECT**

- **Schema**: `EnrollmentSchema` has `campaignId: z.string()`
- **Seed**: `seedEnrollments()` correctly sets `campaignId: campaign.id` (line 252)
- **Relationship**: One campaign can have many enrollments
- **Query Example**: 
  ```typescript
  const enrollments = db.enrollments.findMany((q) => 
    q.where({ campaignId: { equals: campaignId } })
  )
  ```

### 2. Campaigns → Campaign Deliverables
**Status**: ✅ **CORRECT** (Fixed)

- **Schema**: `CampaignDeliverableSchema` has `campaignId: z.string()`
- **Seed**: `seedCampaignDeliverables()` creates deliverables linked to campaigns via `campaignId`
- **Relationship**: One campaign can have many campaign deliverables
- **Query Example**:
  ```typescript
  const deliverables = db.campaignDeliverables.findMany((q) =>
    q.where({ campaignId: { equals: campaignId } })
  )
  ```

### 3. Enrollments → Deliverable Submissions
**Status**: ✅ **CORRECT**

- **Schema**: `DeliverableSubmissionSchema` has `enrollmentId: z.string()`
- **Seed**: `seedDeliverableSubmissions()` correctly sets `enrollmentId: enrollment.id` (line 871)
- **Relationship**: One enrollment can have many deliverable submissions
- **Query Example**:
  ```typescript
  const submissions = db.deliverableSubmissions.findMany((q) =>
    q.where({ enrollmentId: { equals: enrollmentId } })
  )
  ```

### 4. Campaign Deliverables → Deliverable Submissions
**Status**: ✅ **CORRECT**

- **Schema**: `DeliverableSubmissionSchema` has `campaignDeliverableId: z.string()`
- **Seed**: `seedDeliverableSubmissions()` correctly sets `campaignDeliverableId: cd.id` (line 872)
- **Relationship**: One campaign deliverable can have many submissions (via enrollments)
- **Query Example**:
  ```typescript
  const submissions = db.deliverableSubmissions.findMany((q) =>
    q.where({ campaignDeliverableId: { equals: deliverableId } })
  )
  ```

### 5. Organizations → Campaigns
**Status**: ✅ **CORRECT**

- **Schema**: `CampaignSchema` has `organizationId: z.string()`
- **Seed**: `seedCampaigns()` correctly sets `organizationId: orgId`
- **Relationship**: One organization can have many campaigns

### 6. Organizations → Enrollments
**Status**: ✅ **CORRECT**

- **Schema**: `EnrollmentSchema` has `organizationId: z.string()`
- **Seed**: `seedEnrollments()` correctly sets `organizationId: orgId` (line 251)
- **Relationship**: One organization can have many enrollments

### 7. Enrollments → Active Holds
**Status**: ✅ **CORRECT**

- **Schema**: `ActiveHoldSchema` has `enrollmentId: z.string()` and `campaignId: z.string()`
- **Seed**: `seedActiveHolds()` correctly sets both `enrollmentId` and `campaignId` (lines 358-359)
- **Relationship**: One enrollment can have one active hold

### 8. Invoices → Enrollments (via InvoiceLineItems)
**Status**: ✅ **CORRECT** (Fixed)

- **Schema**: `InvoiceLineItemSchema` has `enrollmentId: z.string().optional()`
- **Seed**: `seedInvoices()` now accepts enrollments and links line items to enrollments
- **Relationship**: Invoice line items can reference specific enrollments
- **Query Example**:
  ```typescript
  const invoice = db.invoices.findFirst((q) => q.where({ id: invoiceId }))
  const enrollmentLineItems = invoice?.lineItems?.filter((item) => item.enrollmentId)
  ```

## Relationship Chain

The complete relationship chain is:

```
Organization
  └── Campaigns (organizationId)
      └── Campaign Deliverables (campaignId)
  └── Enrollments (organizationId, campaignId)
      └── Deliverable Submissions (enrollmentId, campaignDeliverableId)
      └── Active Holds (enrollmentId, campaignId)
```

## Seeding Order

The correct seeding order ensures relationships are established:

1. ✅ Organizations (`seedOrganizationSettings`)
2. ✅ Products (`seedProducts`)
3. ✅ Campaigns (`seedCampaigns`) - requires products
4. ✅ **Campaign Deliverables** (`seedCampaignDeliverables`) - requires campaigns ⚠️ **FIXED**
5. ✅ Enrollments (`seedEnrollments`) - requires campaigns
6. ✅ Deliverable Submissions (`seedDeliverableSubmissions`) - requires enrollments AND campaign deliverables
7. ✅ Active Holds (`seedActiveHolds`) - requires enrollments
8. ✅ **Invoices** (`seedInvoices`) - requires enrollments ⚠️ **FIXED** (now links line items to enrollments)

## Issues Fixed

### Issue 1: Campaign Deliverables Not Seeded
**Problem**: Campaign deliverables were referenced in `seedDeliverableSubmissions()` but never created.

**Solution**: 
- Added `seedCampaignDeliverables()` function
- Integrated into seeding flow before enrollments
- Each campaign gets 2-4 deliverables linked via `campaignId`

### Issue 2: Invoice-Enrollment Relationship Missing
**Problem**: Invoice line items were missing `enrollmentId` relationship to enrollments (as per backend schema).

**Solution**:
- Added `enrollmentId` and `invoiceId` to `InvoiceLineItemSchema`
- Updated `seedInvoices()` to accept enrollments parameter
- Invoice line items now link to specific enrollments when applicable
- Seeding order updated to pass enrollments to `seedInvoices()`

## Verification Queries

### Get all enrollments for a campaign
```typescript
const enrollments = db.enrollments.findMany((q) =>
  q.where({ campaignId: { equals: "campaign-123" } })
)
```

### Get all deliverable submissions for an enrollment
```typescript
const submissions = db.deliverableSubmissions.findMany((q) =>
  q.where({ enrollmentId: { equals: "enrollment-456" } })
)
```

### Get all campaign deliverables for a campaign
```typescript
const deliverables = db.campaignDeliverables.findMany((q) =>
  q.where({ campaignId: { equals: "campaign-123" } })
)
```

### Get deliverable submissions for a campaign deliverable
```typescript
const submissions = db.deliverableSubmissions.findMany((q) =>
  q.where({ campaignDeliverableId: { equals: "cd-789" } })
)
```

### Get enrollments for an invoice (via line items)
```typescript
const invoice = db.invoices.findFirst((q) => q.where({ id: { equals: "inv-123" } }))
const enrollmentIds = invoice?.lineItems
  ?.filter((item) => item.enrollmentId)
  .map((item) => item.enrollmentId) || []
const enrollments = db.enrollments.findMany((q) =>
  q.where({ id: { in: enrollmentIds } })
)
```

### Get invoices for an enrollment
```typescript
const allInvoices = db.invoices.findMany()
const enrollmentInvoices = allInvoices.filter((invoice) =>
  invoice.lineItems?.some((item) => item.enrollmentId === "enrollment-456")
)
```

## Conclusion

✅ **All relationships are correctly established in the database schemas and seeding functions.**

The database now properly supports:
- Campaigns with multiple enrollments
- Campaigns with multiple campaign deliverables
- Enrollments with multiple deliverable submissions
- Proper linking between campaign deliverables and their submissions
- **Invoices linked to enrollments via invoice line items** ✅ **FIXED**
