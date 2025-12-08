# Invoices

## Purpose
View and manage invoices with detailed breakdown and download options.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  INVOICES                              [Export All]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ TOTAL  │ │ PAID   │ │PENDING │ │OVERDUE │             │
│  │₹4.85L  │ │₹4.35L  │ │₹50K    │ │₹0      │             │
│  │12 inv. │ │10 inv. │ │2 inv.  │ │0 inv.  │             │
│  └────────┘ └────────┘ └────────┘ └────────┘             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ FILTERS                                               │  │
│  │ ┌──────────┐ ┌──────────┐ ┌────────────────────────┐│  │
│  │ │Status:All│ │Period:All│ │🔍 Search invoice #...  ││  │
│  │ └──────────┘ └──────────┘ └────────────────────────┘│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ INVOICES LIST                                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │ Invoice#    │Period      │Enroll│Amount │Status     │  │
│  │ ────────────┼────────────┼──────┼───────┼──────────│  │
│  │ INV-2024-012│Dec 1-7     │45    │₹45K   │🟡Pending │  │
│  │             │            │      │       │[View][⬇] │  │
│  │ ────────────┼────────────┼──────┼───────┼──────────│  │
│  │ INV-2024-011│Nov 24-30   │38    │₹38.5K │🟢Paid    │  │
│  │             │            │      │       │[View][⬇] │  │
│  │ ────────────┼────────────┼──────┼───────┼──────────│  │
│  │ INV-2024-010│Nov 17-23   │52    │₹52K   │🟢Paid    │  │
│  │             │            │      │       │[View][⬇] │  │
│  │                                                        │  │
│  │ Showing 1-10 of 12  [◀Prev] [1][2] [Next▶]           │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Invoice Detail Modal

```
┌─────────────────────────────────────┐
│  Invoice: INV-2024-012              │
│          [Download PDF] [Print] [×] │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ FROM         │ │ TO           │ │
│  │ ────         │ │ ──           │ │
│  │ Hypedrive    │ │ Nike India   │ │
│  │ Technologies │ │ Pvt. Ltd.    │ │
│  │ GST:27AAB... │ │ GST:27AAA... │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ INVOICE DETAILS               │  │
│  │ ───────────────               │  │
│  │ Number: INV-2024-012          │  │
│  │ Date: Dec 8, 2024             │  │
│  │ Period: Dec 1-7, 2024         │  │
│  │ Due: Dec 15, 2024             │  │
│  │ Status: 🟡 Pending            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ LINE ITEMS                    │  │
│  ├───────────────────────────────┤  │
│  │Description  │Qty│Rate │Amount│  │
│  │─────────────┼───┼─────┼──────│  │
│  │Nike Summer  │   │     │      │  │
│  │-Bill(18%)   │25 │₹1.8K│₹45K  │  │
│  │-Platform Fee│25 │₹50  │₹1.25K│  │
│  │─────────────┼───┼─────┼──────│  │
│  │Samsung Fest │   │     │      │  │
│  │-Bill(18%)   │20 │₹2.2K│₹44K  │  │
│  │-Platform Fee│20 │₹50  │₹1K   │  │
│  │─────────────┴───┴─────┴──────│  │
│  │                               │  │
│  │         Subtotal: ₹91,250     │  │
│  │         GST(18%): ₹16,425     │  │
│  │         ───────────────────   │  │
│  │         Total: ₹1,07,675      │  │
│  │                               │  │
│  │ ⓘ Amount deducted from wallet │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ PAYMENT STATUS                │  │
│  │ ──────────────                │  │
│  │ Method: Wallet Deduction      │  │
│  │ Status: Pending               │  │
│  │ Note: Deducted on due date    │  │
│  │                               │  │
│  │ Wallet: ₹2.45L ✓ Sufficient   │  │
│  └───────────────────────────────┘  │
│                                     │
│              [Close]                │
│                                     │
└─────────────────────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────┐
│                                     │
│              📄                     │
│                                     │
│        No invoices yet              │
│                                     │
│  Invoices are generated weekly      │
│  based on approved enrollments.     │
│  Once campaigns have approved       │
│  enrollments, invoices will appear  │
│  here automatically.                │
│                                     │
│      [View Active Campaigns]        │
│                                     │
└─────────────────────────────────────┘
```

## API Endpoints
- `GET /invoices` - List invoices with filters
- `GET /invoices/:id` - Invoice details
- `GET /invoices/:id/line-items` - Line items breakdown
- `GET /invoices/:id/download` - Download PDF

---
