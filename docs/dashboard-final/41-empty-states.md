# Empty States

## Purpose
Guide users when no data exists yet, with clear next actions.

## Empty State Pattern

```
┌─────────────────────────────────────┐
│                                     │
│              [ICON]                 │
│                                     │
│          Headline Text              │
│                                     │
│  Descriptive text explaining why    │
│  this is empty and what to do next  │
│                                     │
│         [Primary Action]            │
│                                     │
└─────────────────────────────────────┘
```

## Dashboard Empty State (New Organization)

```
┌─────────────────────────────────────┐
│                                     │
│              🚀                     │
│                                     │
│      Welcome to Hypedrive!          │
│                                     │
│  Let's get started with your first  │
│  campaign. Create a campaign to     │
│  start receiving enrollments.       │
│                                     │
│  1. Fund your wallet                │
│  2. Add your products               │
│  3. Create your first campaign      │
│                                     │
│  [Fund Wallet] [+ Create Campaign]  │
│                                     │
└─────────────────────────────────────┘
```

## No Campaigns

```
┌─────────────────────────────────────┐
│                                     │
│              📋                     │
│                                     │
│        No campaigns yet             │
│                                     │
│  Create your first campaign to      │
│  start accepting enrollments from   │
│  shoppers.                          │
│                                     │
│      [+ Create First Campaign]      │
│                                     │
└─────────────────────────────────────┘
```

## No Pending Enrollments

```
┌─────────────────────────────────────┐
│                                     │
│              ✅                     │
│                                     │
│          All caught up!             │
│                                     │
│  No enrollments require your review │
│  right now. New submissions will    │
│  appear here automatically.         │
│                                     │
│      [View All Enrollments]         │
│                                     │
└─────────────────────────────────────┘
```

## No Products

```
┌─────────────────────────────────────┐
│                                     │
│              📦                     │
│                                     │
│          No products yet            │
│                                     │
│  Add your products to create        │
│  campaigns. Products help shoppers  │
│  understand what they're buying.    │
│                                     │
│       [+ Add First Product]         │
│                                     │
└─────────────────────────────────────┘
```

## No Team Members (Only Owner)

```
┌─────────────────────────────────────┐
│                                     │
│              👥                     │
│                                     │
│         Invite your team            │
│                                     │
│  Add team members to help manage    │
│  campaigns and review enrollments.  │
│  Each member can have different     │
│  permissions.                       │
│                                     │
│      [+ Invite First Member]        │
│                                     │
└─────────────────────────────────────┘
```

## No Search Results

```
┌─────────────────────────────────────┐
│                                     │
│              🔍                     │
│                                     │
│    No results match "keyword"       │
│                                     │
│  Try adjusting your search or       │
│  filters to find what you need.     │
│                                     │
│  [Clear Search]  [Reset Filters]    │
│                                     │
└─────────────────────────────────────┘
```

## Design Guidelines
- Use relevant emoji/icon (large, centered)
- Clear, friendly headline
- 1-2 sentences explaining why empty
- Prominent primary action button
- Optional secondary action
- Avoid negative language ("No data found" ❌ → "Get started" ✅)

---
