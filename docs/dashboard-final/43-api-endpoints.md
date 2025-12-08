# API Endpoints Reference

## Authentication
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

## Organizations
- `GET /organizations` - List user's organizations
- `GET /organizations/:id` - Get organization details
- `POST /organizations` - Create organization
- `PATCH /organizations/:id` - Update organization
- `GET /organizations/:id/wallet` - Get wallet balances
- `GET /organizations/:id/transactions` - Transaction history
- `GET /organizations/:id/holds` - Active holds breakdown
- `GET /organizations/:id/members` - List members
- `POST /organizations/:id/invite` - Invite member
- `PATCH /organizations/:id/members/:memberId/role` - Change role
- `DELETE /organizations/:id/members/:memberId` - Remove member

## Campaigns
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns` - Create campaign
- `PATCH /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete draft campaign
- `GET /campaigns/:id/validate` - Validate campaign
- `POST /campaigns/:id/submit` - Submit for approval
- `GET /campaigns/:id/stats` - Campaign statistics
- `GET /campaigns/:id/performance` - Performance metrics
- `POST /campaigns/:id/pause` - Pause campaign
- `POST /campaigns/:id/resume` - Resume campaign
- `POST /campaigns/:id/end` - End campaign
- `POST /campaigns/:id/archive` - Archive campaign
- `POST /campaigns/:id/duplicate` - Duplicate campaign

## Enrollments
- `GET /campaigns/:id/enrollments` - List enrollments
- `GET /enrollments/:id` - Get enrollment details
- `GET /enrollments/:id/history` - Enrollment history
- `POST /enrollments/:id/approve` - Approve enrollment
- `POST /enrollments/:id/reject` - Reject enrollment
- `POST /enrollments/:id/request-changes` - Request changes

## Products
- `GET /organizations/:organizationId/products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## Deliverables
- `POST /campaigns/:campaignId/deliverables/batch` - Add deliverables
- `GET /deliverables/:id` - Get deliverable details
- `PATCH /deliverables/:id` - Update deliverable
- `DELETE /deliverables/:id` - Delete deliverable

## Platforms & Categories
- `GET /platforms/active` - List active platforms
- `GET /categories` - List product categories

## Invoices
- `GET /organizations/:id/invoices` - List invoices
- `GET /invoices/:id` - Get invoice details
- `GET /invoices/:id/pdf` - Download invoice PDF

## Notifications
- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read

## Common Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field and direction (e.g., `created_at:desc`)
- `status` - Filter by status
- `search` - Search query string

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Campaign title is required",
    "field": "title"
  }
}
```

---
