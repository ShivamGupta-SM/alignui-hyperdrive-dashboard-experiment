# Modals

## Purpose
Centered overlays for quick focused actions, confirmations, and simple forms.

## Standard Modal Structure

```
┌─────────────────────────────────┐
│                             [×] │
│  MODAL TITLE                    │
│  ─────────────────────────────  │
│                                 │
│  Modal content goes here.       │
│  Keep it focused on one task.   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│      [Cancel]     [Confirm]     │
│                                 │
└─────────────────────────────────┘
```

## Modal Types

### Confirmation Modal
```
┌─────────────────────────────────┐
│  Delete Campaign           [×]  │
├─────────────────────────────────┤
│                                 │
│  ⚠️ Are you sure you want to   │
│     delete "Summer Sale 2024"?  │
│                                 │
│  This action cannot be undone.  │
│  All enrollments will be lost.  │
│                                 │
│      [Cancel]     [Delete]      │
│                                 │
└─────────────────────────────────┘
```

### Data Entry Modal
```
┌─────────────────────────────────┐
│  Fund Wallet               [×]  │
├─────────────────────────────────┤
│                                 │
│  Amount to Add (₹)              │
│  ┌───────────────────────────┐  │
│  │ 50,000                    │  │
│  └───────────────────────────┘  │
│                                 │
│  Payment Method                 │
│  ○ Bank Transfer (Recommended)  │
│  ○ UPI                          │
│  ○ Card                         │
│                                 │
│      [Cancel]     [Continue]    │
│                                 │
└─────────────────────────────────┘
```

### Information Modal
```
┌─────────────────────────────────┐
│  Order Details             [×]  │
├─────────────────────────────────┤
│                                 │
│  Order ID: #AMZ-12345           │
│  Date: Dec 5, 2024              │
│  Total: ₹12,999                 │
│  Platform: Amazon               │
│                                 │
│  Items:                         │
│  • Nike Air Max 2024 (₹12,999)  │
│                                 │
│               [Close]           │
│                                 │
└─────────────────────────────────┘
```

### Image Viewer Modal
```
┌─────────────────────────────────┐
│  Order Screenshot          [×]  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      [FULL IMAGE]       │   │
│  │                         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│      [Previous]  [Next]         │
│                                 │
└─────────────────────────────────┘
```

## Modal Behavior
- **Backdrop**: Dimmed overlay (60% opacity)
- **Close**: X button + click outside + ESC key
- **Focus**: Auto-focus first input or primary action
- **Scrolling**: Content scrolls if too tall, header/footer fixed
- **Animation**: Fade in with slight scale

## When to Use Modals
✅ **Use for:**
- Confirmation dialogs
- Quick data entry (1-3 fields)
- View-only previews
- Simple single-step forms

❌ **Don't use for:**
- Complex multi-step workflows (use wizard)
- Settings pages (use slideout panel)
- Detailed views (use slideout panel)
- Large amounts of content

---
