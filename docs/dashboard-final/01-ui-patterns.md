# UI Patterns

## Pattern Selection Guide

| Pattern | Use Case | Examples |
|---------|----------|----------|
| **Modal** | Quick focused actions, confirmations | Approve/Reject, Delete confirmation |
| **Slideout Panel** | Settings, details view | Profile settings, Enrollment details |
| **Multi-step Wizard** | Complex data entry | Create campaign (4 steps) |
| **Inline Edit** | Quick single-field updates | Edit campaign name |
| **Toast Notifications** | Status feedback | "Campaign saved" |

## Modal (Centered Overlay)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ┌───────────────────────────────┐              │
│              │                           [×] │              │
│              │  MODAL TITLE                  │              │
│              │  ─────────────────────────    │              │
│              │                               │              │
│              │  Modal content goes here.     │              │
│              │  Keep it focused on one task. │              │
│              │                               │              │
│              │  ───────────────────────────  │              │
│              │                               │              │
│              │    [Cancel]     [Confirm]     │              │
│              │                               │              │
│              └───────────────────────────────┘              │
│                                                             │
│                   (dimmed backdrop)                         │
└─────────────────────────────────────────────────────────────┘
```

**Use for:**
- Confirmation dialogs (Approve, Reject, Delete)
- Quick data entry (Add note, Request changes)
- View-only previews (Image viewer, Invoice preview)
- Simple single-step forms

---
