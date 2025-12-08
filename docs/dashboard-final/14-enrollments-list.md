# Enrollments Management

## Purpose
Review and manage campaign enrollments with filters and bulk actions.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ENROLLMENTS - Nike Summer Sale                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ FILTER & ACTIONS                                      │  │
│  │                                                        │  │
│  │ Status: [All ▼]  Search: [__________] [🔍]           │  │
│  │                                                        │  │
│  │ Selected: 5  [✓ Bulk Approve] [✗ Bulk Reject]        │  │
│  │              [Export CSV]                             │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ENROLLMENTS TABLE                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │ ☑️│Shopper  │Order ID   │Value   │Status   │Actions │  │
│  │ ─┼─────────┼───────────┼────────┼─────────┼────────│  │
│  │ ☑️│John Doe │AMZ-123456 │₹12,999 │🔵Review │[Review]│  │
│  │ ☑️│Sarah K. │FLK-789012 │₹8,499  │🔵Review │[Review]│  │
│  │ ☑️│Mike R.  │AMZ-345678 │₹15,999 │🔵Review │[Review]│  │
│  │ ⬜│Lisa M.  │AMZ-901234 │₹9,999  │🟢Approvd│[View]  │  │
│  │ ⬜│David P. │FLK-567890 │₹11,499 │🟢Approvd│[View]  │  │
│  │ ⬜│Emily T. │AMZ-234567 │₹7,999  │🟠Changes│[View]  │  │
│  │ ⬜│Chris B. │AMZ-890123 │₹14,999 │🟡Pending│[View]  │  │
│  │ ⬜│Anna W.  │FLK-456789 │₹6,999  │🔴Reject │[View]  │  │
│  │                                                        │  │
│  │ Showing 1-10 of 234   [◀ Prev] [1][2][3]...[Next ▶]  │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Filters
- **Status**: All, Pending, Under Review, Changes Requested, Approved, Rejected
- **Search**: By shopper name, order ID, or email
- **Date Range**: Filter by enrollment date
- **Order Value**: Min/max range filters

### Bulk Actions
- **Bulk Approve**: Approve multiple selected enrollments
- **Bulk Reject**: Reject multiple selected enrollments
- **Export CSV**: Download enrollment data

### Table Columns
- Checkbox for selection
- Shopper name
- Order ID
- Order value
- Status badge
- Action button (Review/View)

### Pagination
- Showing X-Y of Z
- Previous/Next navigation
- Page number links

## Status Indicators
- 🟡 **Pending**: Awaiting first review
- 🔵 **Under Review**: Being reviewed
- 🟠 **Changes Requested**: Needs shopper action
- 🟢 **Approved**: Approved for payout
- 🔴 **Rejected**: Permanently rejected

## API Endpoints
- `GET /campaigns/:campaignId/enrollments` - List enrollments
- `POST /enrollments/bulk-approve` - Bulk approve
- `POST /enrollments/bulk-reject` - Bulk reject
- `GET /campaigns/:campaignId/enrollments/export` - Export CSV

---
