# Create Organization - Step 4: Review & Submit

## Purpose
Final review of all organization details before submission for approval.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ◆ HYPEDRIVE                           [Step 4 of 4]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Review & Submit                                    │   │
│  │  Please verify all details before submitting        │   │
│  │                                                     │   │
│  │  ○ Basic Info  ○ Business  ○ Verification  ● Review│   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │                                                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ BASIC INFORMATION                     [Edit] │ │   │
│  │  │                                               │ │   │
│  │  │ Organization:  Acme Corporation               │ │   │
│  │  │ Website:       https://acmecorp.com           │ │   │
│  │  │ Description:   Leading electronics brand...   │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ BUSINESS DETAILS                      [Edit] │ │   │
│  │  │                                               │ │   │
│  │  │ Business Type:    Private Limited             │ │   │
│  │  │ Industry:         Electronics                 │ │   │
│  │  │ Contact Person:   John Doe                    │ │   │
│  │  │ Phone:            +91 9876543210              │ │   │
│  │  │ Address:          123, Tech Park, Sector 5    │ │   │
│  │  │                   Bengaluru, KA - 560001      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ VERIFICATION STATUS                   [Edit] │ │   │
│  │  │                                               │ │   │
│  │  │ GST:  29AABCU9603R1ZM    ✓ Verified          │ │   │
│  │  │ PAN:  AABCU9603R         ✓ Verified          │ │   │
│  │  │ CIN:  U72200KA2020...    ○ Not Provided      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  [✓] I confirm that all information provided is    │   │
│  │      accurate and I agree to the Terms of Service  │   │
│  │      and Privacy Policy                            │   │
│  │                                                     │   │
│  │                   [← Back]  [Submit for Approval]  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Edit Links
- Each section has [Edit] link
- Returns to specific step in wizard
- Preserves all entered data

### Review Sections
1. **Basic Information**: Org name, website, description
2. **Business Details**: Type, industry, contact, address
3. **Verification Status**: GST, PAN, CIN verification badges

### Terms Acceptance
- Checkbox for terms agreement
- Required before submission
- Links to Terms of Service and Privacy Policy

### Submit Action
- Creates organization in "Pending Approval" status
- Sends notification to Hypedrive admins
- Redirects to pending approval screen

## API Endpoints
- `POST /organizations` - Create organization for approval
- `GET /organizations/draft/:id` - Retrieve draft data

## Post-Submission
User sees "Pending Approval" screen with:
- Estimated review time (24-48 hours)
- Contact information for support
- Option to edit submission if needed

---
