# Organization Switcher

## Switcher Dropdown

Clicking the organization dropdown in the header allows users to switch between multiple organizations they have access to.

```
┌────────────────────────────────────┐
│  ▼  Nike India                     │ ← Click to expand
│     nike@example.com               │
└────────────────────────────────────┘
```

## Expanded View

```
┌────────────────────────────────────┐
│  YOUR ORGANIZATIONS                │
│  ──────────────────────────────────│
│                                    │
│  ┌────┐  Nike India           ✓   │ ← Currently selected
│  │ N  │  nike@example.com         │
│  └────┘  Active • 8 campaigns     │
│                                    │
│  ┌────┐  Samsung Electronics      │
│  │ S  │  samsung@example.com      │
│  └────┘  Active • 3 campaigns     │
│                                    │
│  ┌────┐  Sony India               │
│  │ S  │  sony@example.com         │
│  └────┘  Pending Approval         │ ← Status badge
│                                    │
│  ──────────────────────────────────│
│                                    │
│  [+ Create New Organization]      │
│                                    │
└────────────────────────────────────┘
```

## Features
- Avatar circle with first letter of organization name
- Organization email displayed
- Status indicator (Active, Pending Approval)
- Campaign count for context
- Checkmark on currently selected organization
- Create new organization action at bottom

## Organization States
- **Active**: Fully operational organization
- **Pending Approval**: Awaiting admin approval
- **Suspended**: Temporarily disabled (not shown in switcher)

---
