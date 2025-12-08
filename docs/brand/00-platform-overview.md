# Brand Platform Overview

This document provides a comprehensive overview of the Hypedrive Brand Platform - the application used by organizations to create campaigns, manage enrollments, and track their cashback/rebate programs.

---

## What is the Brand Platform?

The Brand Platform is a dedicated web application for businesses (brands/organizations) to:

- Create and manage promotional cashback campaigns
- Review shopper enrollments and approve/reject submissions
- Manage their digital wallet and billing
- Invite team members and manage roles
- Track campaign performance and analytics

---

## Access & Authentication

### How Brands Access the Platform

| Method | Description |
|--------|-------------|
| **URL** | `https://brands.hypedrive.io` (separate domain) |
| **Login** | Email/Password or Social Login (Google) |
| **Multi-Org Support** | Users can belong to multiple organizations |

### User Roles within Brand Organizations

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Organization creator | Full access, billing, delete org |
| **Admin** | Full management access | All except billing & delete |
| **Manager** | Campaign & enrollment management | Create campaigns, review enrollments |
| **Viewer** | Read-only access | View campaigns, enrollments, reports |

---

## Core Features

### 1. Organization Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORGANIZATION LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐      ┌──────────────┐      ┌───────────┐      ┌──────────┐  │
│   │  CREATE  │ ───► │   PENDING    │ ───► │ APPROVED  │ ───► │  ACTIVE  │  │
│   │   ORG    │      │   REVIEW     │      │           │      │          │  │
│   └──────────┘      └──────────────┘      └───────────┘      └──────────┘  │
│                            │                                       │        │
│                            ▼                                       ▼        │
│                     ┌──────────────┐                       ┌───────────────┐│
│                     │   REJECTED   │                       │   SUSPENDED   ││
│                     │ (Can reapply)│                       │ (By admin)    ││
│                     └──────────────┘                       └───────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Organizations must be approved by Hypedrive admins before creating campaigns
- Credit limits can be set by admins for overdraft capabilities
- GST/PAN verification is required for Indian businesses

### 2. Campaign Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAMPAIGN LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► ACTIVE ──► COMPLETED         │
│                    │                              │                          │
│                    ▼                              ▼                          │
│               REJECTED                        PAUSED                         │
│               (With reason)                   (By brand)                     │
│                                                  │                           │
│                                                  ▼                           │
│                                              ARCHIVED                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Campaign Types:**
| Type | Description | Example |
|------|-------------|---------|
| **Barter** | Product exchange for reviews/content | Send product, get review |
| **Hybrid** | Partial cashback + product exchange | 50% cashback + free accessories |

**Campaign Configuration:**
- Product selection (from catalog)
- Enrollment capacity (max shoppers)
- Duration (start/end dates)
- Platform restrictions (Amazon, Flipkart, etc.)
- Deliverables (what shoppers must submit)

### 3. Enrollment Review

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENROLLMENT REVIEW FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Shopper Submits ──► OCR Verification ──► Brand Review ──► Decision        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  WHAT BRANDS SEE:                                                    │   │
│   │  • Shopper name & history                                           │   │
│   │  • Order screenshot (OCR verified)                                  │   │
│   │  • Order ID, value, date                                            │   │
│   │  • Campaign deliverables (photos, reviews)                          │   │
│   │  • Their billing breakdown (NOT shopper payout)                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  BRAND ACTIONS:                                                      │   │
│   │  ✓ Approve - Commits wallet hold, triggers shopper payout           │   │
│   │  ⟲ Request Changes - Asks shopper for corrections                   │   │
│   │  ✗ Reject - Releases wallet hold, notifies shopper                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. Wallet & Billing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WALLET OVERVIEW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                        │ │
│   │   AVAILABLE BALANCE          HELD AMOUNT           CREDIT LIMIT       │ │
│   │   ₹ 2,45,000                 ₹ 50,000              ₹ 1,00,000         │ │
│   │   Ready to use               For pending reviews   If approved        │ │
│   │                                                                        │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   HOW IT WORKS:                                                             │
│   1. Brand funds wallet via virtual bank account (NEFT/RTGS/IMPS)          │
│   2. When shopper enrolls, estimated cost is HELD from wallet              │
│   3. When brand approves, held amount is COMMITTED (deducted)              │
│   4. When brand rejects, held amount is RELEASED back to available        │
│                                                                             │
│   BILLING COMPONENTS:                                                       │
│   • Bill Rate (%) - Percentage of order value charged to brand             │
│   • Platform Fee - Fixed fee per enrollment                                 │
│   • GST - 18% on bill rate                                                 │
│                                                                             │
│   ⓘ Brands only see their billing - NOT what shoppers receive             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. Team Management

| Feature | Description |
|---------|-------------|
| **Invite Members** | Add team members via email |
| **Role Assignment** | Owner, Admin, Manager, Viewer |
| **Access Control** | Permissions based on role |
| **Activity Logs** | Track who did what |

---

## App Structure

### Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌──────────────────────┐                                                  │
│   │  ◇  Dashboard        │  Overview, metrics, pending actions             │
│   │  ◈  Campaigns        │  Create, manage, view campaigns                 │
│   │  ☰  Enrollments  (45)│  Review submissions (badge = pending)           │
│   │  📦  Products        │  Product catalog                                │
│   │  💰  Wallet          │  Balance, transactions, funding                 │
│   │  📄  Invoices        │  Monthly invoices, download                     │
│   │  👥  Team            │  Invite, manage members                         │
│   │  ─────────────────── │                                                 │
│   │  ⚙  Settings         │  Organization settings                         │
│   │  ❓  Help & Support  │  Documentation, contact                        │
│   └──────────────────────┘                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Summary

| Page | Purpose | Key Actions |
|------|---------|-------------|
| **Dashboard** | Overview of performance | Quick stats, pending enrollments |
| **Campaigns** | Campaign management | Create, edit, pause, view |
| **Campaign Detail** | Single campaign view | Edit, enrollments, performance |
| **Enrollments** | Campaign enrollments | Filter, bulk actions |
| **Enrollment Review** | Review submission | Approve, reject, request changes |
| **Products** | Product catalog | Add, edit, delete products |
| **Wallet** | Financial management | View balance, transactions |
| **Invoices** | Billing history | View, download invoices |
| **Team** | Member management | Invite, change roles, remove |
| **Settings** | Organization settings | Profile, notifications, integrations |

---

## Key Workflows

### 1. Getting Started

```
1. Sign Up         → Create account with email
2. Create Org      → Enter business details (name, GST, PAN)
3. Await Approval  → Admin reviews and approves
4. Fund Wallet     → Transfer funds to virtual account
5. Add Products    → Create product catalog
6. Create Campaign → Set up first campaign
7. Go Live!        → Campaign approved by admin
```

### 2. Daily Operations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TYPICAL BRAND WORKFLOW                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Morning:                                                                  │
│   └─► Check Dashboard → Review pending enrollments → Approve/Reject         │
│                                                                             │
│   Throughout Day:                                                           │
│   └─► Notifications for new enrollments → Quick review via mobile          │
│                                                                             │
│   Weekly:                                                                   │
│   └─► Check wallet balance → Fund if needed → Review campaign performance  │
│                                                                             │
│   Monthly:                                                                  │
│   └─► Download invoices → Reconcile billing → Create new campaigns         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Used

### Core Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Auth** | `POST /auth/login` | Email/password login |
| **Auth** | `POST /auth/register` | New user registration |
| **Org** | `GET /organizations/me` | Get current organization |
| **Org** | `POST /organizations` | Create new organization |
| **Campaigns** | `GET /campaigns` | List campaigns |
| **Campaigns** | `POST /campaigns` | Create campaign |
| **Campaigns** | `PATCH /campaigns/:id` | Update campaign |
| **Enrollments** | `GET /campaigns/:id/enrollments` | List enrollments |
| **Enrollments** | `POST /enrollments/:id/approve` | Approve enrollment |
| **Enrollments** | `POST /enrollments/:id/reject` | Reject enrollment |
| **Wallet** | `GET /organizations/:id/wallet` | Get wallet details |
| **Wallet** | `GET /wallets/:id/transactions` | Transaction history |

---

## Technical Notes

### Separate Application

The Brand Platform is a **separate frontend application** from Shopper and Admin:

| Aspect | Details |
|--------|---------|
| **Domain** | `brands.hypedrive.io` |
| **Framework** | Next.js (recommended) |
| **Auth** | Shared auth system with role/org context |
| **API** | Same backend, different authorization |

### Multi-Organization Support

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER CAN BELONG TO MULTIPLE ORGANIZATIONS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User: john@example.com                                                    │
│   ├── Nike India (Owner)                                                    │
│   ├── Samsung Electronics (Admin)                                           │
│   └── Sony India (Viewer)                                                   │
│                                                                             │
│   Organization Switcher in header allows quick switching                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Desktop (1200px+) | Full sidebar, multi-column |
| Tablet (768-1199px) | Collapsible sidebar, 2-column |
| Mobile (<768px) | Bottom nav, single column |

---

## Related Documentation

- [User Journey](./01-user-journey.md) - Complete brand user journey
- [Dashboard Design](./02-dashboard-design.md) - Detailed wireframes for all pages
- [API Endpoints](../API_ENDPOINTS.md) - Complete API reference
- [State Machines](../../state-machines.md) - Campaign & enrollment lifecycles
