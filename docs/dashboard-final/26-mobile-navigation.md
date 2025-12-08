# Mobile Navigation Drawer

## Purpose
Side drawer navigation for mobile with org switcher and all menu items.

## Layout

```
┌─────────────────────────┐
│ [←]  ◆ HYPEDRIVE        │
├─────────────────────────┤
│ ┌─────┐                 │
│ │ 👤  │ Acme Corporation│
│ └─────┘ john@acme.com   │
│         [Switch Org ▾]  │
├─────────────────────────┤
│                         │
│ ◇  Dashboard            │
│ ◈  Campaigns            │
│ ☰  Enrollments   (12)   │
│ 📦  Products            │
│ 💰  Wallet              │
│ 📄  Invoices            │
│                         │
│ ─────────────────────   │
│                         │
│ 👥  Team                │
│ ⚙  Settings             │
│ ❓  Help & Support      │
│                         │
│ ─────────────────────   │
│                         │
│ 🌙  Dark Mode     [○━●] │
│                         │
│ [Sign Out]              │
│                         │
└─────────────────────────┘
```

## Drawer Features

### User Profile Section
- Profile avatar
- Organization name
- User email
- Organization switcher dropdown

### Primary Navigation
- Dashboard
- Campaigns
- Enrollments (with pending count badge)
- Products
- Wallet
- Invoices

### Secondary Navigation
- Team
- Settings
- Help & Support

### Additional Features
- **Dark Mode Toggle**: Switch theme
- **Sign Out Button**: Log out action

## Interaction

### Opening Drawer
- Tap hamburger menu [≡]
- Swipe right from left edge
- Overlay backdrop appears

### Closing Drawer
- Tap close button [←]
- Tap backdrop overlay
- Swipe left to close
- Navigate to any page

### Animations
- Slide-in from left (300ms)
- Backdrop fade-in
- Smooth transitions

## Responsive Breakpoint
- Visible: < 768px (mobile)
- Hidden: >= 768px (desktop sidebar shown instead)

---
