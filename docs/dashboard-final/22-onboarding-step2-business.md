# Create Organization - Step 2: Business Details

## Purpose
Collect detailed business information and contact details.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ◆ HYPEDRIVE                           [Step 2 of 4]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Business Details                                   │   │
│  │                                                     │   │
│  │  ○ Basic Info  ● Business  ○ Verification  ○ Review│   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │                                                     │   │
│  │  ┌───────────────────┐  ┌───────────────────────┐  │   │
│  │  │ Business Type *   │  │ Industry Category *   │  │   │
│  │  │ ┌───────────────┐ │  │ ┌───────────────────┐ │  │   │
│  │  │ │ Pvt Limited ▾ │ │  │ │ Electronics     ▾ │ │  │   │
│  │  │ └───────────────┘ │  │ └───────────────────┘ │  │   │
│  │  └───────────────────┘  └───────────────────────┘  │   │
│  │                                                     │   │
│  │  ┌───────────────────┐  ┌───────────────────────┐  │   │
│  │  │ Contact Person *  │  │ Phone Number *        │  │   │
│  │  │ ┌───────────────┐ │  │ ┌───────────────────┐ │  │   │
│  │  │ │ John Doe      │ │  │ │ +91 9876543210    │ │  │   │
│  │  │ └───────────────┘ │  │ └───────────────────┘ │  │   │
│  │  └───────────────────┘  └───────────────────────┘  │   │
│  │                                                     │   │
│  │  Address *                                          │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ 123, Tech Park, Sector 5                      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │ City *      │ │ State *     │ │ PIN Code *  │  │   │
│  │  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │  │   │
│  │  │ │Bengaluru│ │ │ │Karnataka│ │ │ │560001   │ │  │   │
│  │  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │                                                     │   │
│  │                             [← Back]  [Next →]     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Fields

### Business Type (Required)
- Dropdown options:
  - Sole Proprietorship
  - Partnership
  - LLP
  - Private Limited
  - Public Limited

### Industry Category (Required)
- Dropdown with categories:
  - Electronics, Fashion, FMCG, Beauty, etc.

### Contact Person (Required)
- Primary contact name
- Full name validation

### Phone Number (Required)
- Indian format: +91 XXXXXXXXXX
- 10-digit validation

### Address (Required)
- Street address
- 200 char max

### City, State, PIN Code (Required)
- City: Text input
- State: Dropdown (Indian states)
- PIN: 6-digit numerical

## API Endpoints
- `PATCH /organizations/draft/:id` - Update business details

---
