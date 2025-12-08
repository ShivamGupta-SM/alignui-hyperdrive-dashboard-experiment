# Mobile Dashboard

## Purpose
Mobile-optimized dashboard with bottom tab navigation and stacked card layout.

## Layout

```
┌─────────────────────────┐
│ [≡]  ◆ HYPEDRIVE  [🔔3] │
├─────────────────────────┤
│                         │
│  Good morning, John     │
│                         │
│  ┌─────────┐ ┌────────┐ │
│  │CAMPAIGNS│ │PENDING │ │
│  │    8    │ │   12   │ │
│  │ Active  │ │ Review │ │
│  └─────────┘ └────────┘ │
│  ┌─────────┐ ┌────────┐ │
│  │ WALLET  │ │ENROLLED│ │
│  │₹2,45,000│ │  245   │ │
│  └─────────┘ └────────┘ │
│                         │
│  PENDING REVIEWS        │
│  ┌─────────────────────┐│
│  │ Summer Sale         ││
│  │ Rahul M. • ₹2,499   ││
│  │ 2 hrs ago  [Review] ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Diwali Bonanza      ││
│  │ Priya S. • ₹5,200   ││
│  │ 4 hrs ago  [Review] ││
│  └─────────────────────┘│
│                         │
│  [View All Pending →]   │
│                         │
├─────────────────────────┤
│ [◇] [◈] [☰12] [💰] [⚙] │
│ Home Camp Enr  Wal Set  │
└─────────────────────────┘
```

## Mobile Features

### Header
- Hamburger menu [≡] for navigation drawer
- Logo (center or left)
- Notifications bell with badge count

### Greeting
- Personalized message based on time
- Uses user's first name

### Stat Cards (2x2 Grid)
- **Active Campaigns**: Current campaign count
- **Pending Reviews**: Enrollments awaiting action
- **Wallet Balance**: Available funds
- **Total Enrollments**: All-time count

### Pending Reviews List
- Scrollable list of recent enrollments
- Compact card view:
  - Campaign name
  - Shopper name
  - Order value
  - Time ago
  - Quick [Review] button

### Bottom Tab Navigation
- 5 primary tabs:
  - Home (Dashboard)
  - Campaigns
  - Enrollments (with badge count)
  - Wallet
  - Settings
- Always visible
- Active tab highlighted

## Responsive Behavior
- Breakpoint: < 768px
- Stacked card layout (2 columns)
- Touch-optimized tap targets (min 44x44px)
- Swipe gestures supported

## API Endpoints
- Same as desktop dashboard
- `GET /organizations/:id/dashboard` - Dashboard stats

---
