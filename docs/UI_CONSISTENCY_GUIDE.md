# UI Consistency Guide - Dashboard Pages

**Requirement:** "ui consitent ho na chahiye tum jo bhi pages generate ka rhe o unka"

## 🎯 Goal

**All dashboard pages must follow consistent UI patterns** for:
- ✅ Page headers
- ✅ Typography
- ✅ Card styling
- ✅ Spacing
- ✅ Buttons
- ✅ Empty states
- ✅ Loading states
- ✅ Responsive design

---

## ✅ Standard UI Patterns

All dashboard pages should follow these consistent patterns:

---

## 📋 Page Structure

### 1. **Page Header** (Standard Pattern)

```typescript
{/* Page Header */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
  <div className="min-w-0">
    <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Page Title</h1>
    <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
      Page description or subtitle
    </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* Action buttons */}
  </div>
</div>
```

**Example:**
```typescript
// ✅ Consistent across all pages
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
  <div className="min-w-0">
    <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
    <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
      Manage your balance and transactions
    </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <Button.Root variant="basic" size="small">Action 1</Button.Root>
    <Button.Root variant="primary" size="small">Action 2</Button.Root>
  </div>
</div>
```

---

### 2. **Card/Container Styling**

**Standard Card:**
```typescript
<div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200">
  {/* Content */}
</div>
```

**Card with Hover:**
```typescript
<div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
  {/* Content */}
</div>
```

**Card with Gradient (Hero Section):**
```typescript
<div className="rounded-2xl bg-gradient-to-br from-primary-base to-primary-darker p-5 sm:p-8 text-white shadow-lg">
  {/* Content */}
</div>
```

---

### 3. **Spacing Patterns**

**Page Container:**
```typescript
<div className="space-y-5 sm:space-y-6">
  {/* Page Header */}
  {/* Content Sections */}
</div>
```

**Section Spacing:**
```typescript
<div className="space-y-3 sm:space-y-4">
  {/* Section Header */}
  {/* Section Content */}
</div>
```

**Grid Layout:**
```typescript
<div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
  {/* Grid Items */}
</div>
```

---

### 4. **Typography Scale**

| Element | Mobile | Desktop | Usage |
|---------|--------|---------|-------|
| **Page Title** | `text-title-h5` | `text-title-h4` | Main page heading |
| **Section Title** | `text-label-md` | `text-label-md` | Section headings |
| **Description** | `text-paragraph-xs` | `text-paragraph-sm` | Subtitles, descriptions |
| **Body Text** | `text-paragraph-sm` | `text-paragraph-md` | Regular content |
| **Label** | `text-label-sm` | `text-label-sm` | Form labels, small text |
| **Value** | `text-label-lg` | `text-title-h5` | Important numbers/values |

**Example:**
```typescript
<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Page Title</h1>
<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">Description</p>
<h2 className="text-label-md text-text-strong-950">Section Title</h2>
```

---

### 5. **Button Patterns**

**Primary Action:**
```typescript
<Button.Root variant="primary" size="small">
  <Button.Icon as={Plus} />
  <span className="sm:inline">Primary Action</span>
</Button.Root>
```

**Secondary Action:**
```typescript
<Button.Root variant="basic" size="small">
  <Button.Icon as={DownloadSimple} />
  <span className="sm:inline">Secondary Action</span>
</Button.Root>
```

**Button Group:**
```typescript
<div className="flex items-center gap-2 shrink-0">
  <Button.Root variant="basic" size="small">Action 1</Button.Root>
  <Button.Root variant="primary" size="small">Action 2</Button.Root>
</div>
```

---

### 6. **Empty States**

**Standard Empty State:**
```typescript
<div className="p-12 text-center">
  <div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
    <Icon weight="duotone" className="size-6 text-text-soft-400" />
  </div>
  <p className="text-label-sm text-text-strong-950">No items found</p>
  <p className="text-paragraph-xs text-text-sub-600 mt-1">
    Description of what should appear here
  </p>
</div>
```

---

### 7. **Loading States**

**Skeleton Loading:**
```typescript
<div className="flex items-center gap-3 p-3 rounded-lg">
  <div className="size-10 rounded-lg bg-bg-weak-50 animate-pulse" />
  <div className="flex-1 space-y-2">
    <div className="h-4 w-32 bg-bg-weak-50 rounded animate-pulse" />
    <div className="h-3 w-24 bg-bg-weak-50 rounded animate-pulse" />
  </div>
</div>
```

---

### 8. **List/Table Items**

**Standard List Item:**
```typescript
<div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group">
  {/* Icon */}
  <div className="flex size-10 sm:size-11 items-center justify-center rounded-full shrink-0">
    <Icon weight="bold" className="size-5" />
  </div>
  
  {/* Content */}
  <div className="flex-1 min-w-0">
    <p className="text-label-sm text-text-strong-950 truncate">Title</p>
    <p className="text-paragraph-xs text-text-soft-400 mt-0.5">Subtitle</p>
  </div>
  
  {/* Action/Value */}
  <div className="text-right shrink-0">
    <p className="text-label-md font-semibold">Value</p>
  </div>
</div>
```

---

## 🎨 Color & Styling Patterns

### Status Colors:
- **Success:** `bg-success-lighter text-success-base`
- **Warning:** `bg-warning-lighter text-warning-base`
- **Error:** `bg-error-lighter text-error-base`
- **Info:** `bg-information-lighter text-information-base`

### Background Colors:
- **Card:** `bg-bg-white-0`
- **Hover:** `hover:bg-bg-weak-50`
- **Skeleton:** `bg-bg-weak-50 animate-pulse`

### Border/Stroke:
- **Standard:** `ring-1 ring-inset ring-stroke-soft-200`
- **Hover:** `hover:ring-stroke-sub-300`
- **Divider:** `border-t border-stroke-soft-200`

---

## 📐 Responsive Patterns

### Mobile-First Approach:
- **Base:** Mobile styles (no prefix)
- **Desktop:** `sm:` prefix for larger screens

**Example:**
```typescript
// Mobile: single column, smaller padding
// Desktop: grid, larger padding
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 p-4 sm:p-5">
```

### Common Breakpoints:
- **Mobile:** Default (no prefix)
- **Tablet+:** `sm:` (640px+)
- **Desktop:** `lg:` (1024px+)

---

## ✅ Checklist for New Pages

When creating a new page, ensure:

- [ ] ✅ Page header follows standard pattern (title + description + actions)
- [ ] ✅ Typography uses consistent scale (text-title-h5 sm:text-title-h4)
- [ ] ✅ Cards use standard styling (rounded-xl, ring-1, etc.)
- [ ] ✅ Spacing follows patterns (space-y-5 sm:space-y-6)
- [ ] ✅ Buttons use consistent variants and sizes
- [ ] ✅ Empty states follow standard pattern
- [ ] ✅ Loading states use skeleton pattern
- [ ] ✅ Responsive design (mobile-first)
- [ ] ✅ Colors use design system tokens
- [ ] ✅ Icons use consistent sizing (size-4, size-5, size-6)

---

## 📝 Examples from Current Pages

### ✅ Wallet Page (Good Example):
```typescript
{/* Page Header */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
  <div className="min-w-0">
    <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
    <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
      Manage your balance and transactions
    </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <Button.Root variant="basic" size="small">Request Credit</Button.Root>
    <Button.Root variant="primary" size="small">Fund Wallet</Button.Root>
  </div>
</div>
```

### ✅ Settings Page (Good Example):
```typescript
<div className="mb-6">
  <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Settings</h1>
  <p className="text-paragraph-sm text-text-sub-600 mt-1">
    Manage your account and preferences
  </p>
</div>
```

---

## 🎯 Key Principles

1. **Consistency First:** Use the same patterns across all pages
2. **Mobile-First:** Design for mobile, enhance for desktop
3. **Design System:** Use design tokens (colors, spacing, typography)
4. **Accessibility:** Proper contrast, semantic HTML
5. **Responsive:** Works on all screen sizes

---

## 📚 Reference Files (Good Examples)

- **Wallet Page:** `app/(dashboard)/dashboard/wallet/wallet-client.tsx` ✅
- **Settings Page:** `app/(dashboard)/dashboard/settings/settings-client.tsx` ✅
- **Campaigns Page:** `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx` ✅
- **Products Page:** `app/(dashboard)/dashboard/products/products-client.tsx` ✅

---

## ⚠️ Current Inconsistencies Found

### 1. **Spacing Variations**

Some pages use `space-y-4 sm:space-y-5`, others use `space-y-5 sm:space-y-6`:

- ✅ **Wallet:** `space-y-5 sm:space-y-6` (preferred)
- ⚠️ **Campaigns:** `space-y-4 sm:space-y-5` (should be `space-y-5 sm:space-y-6`)
- ⚠️ **Products:** `space-y-4 sm:space-y-5` (should be `space-y-5 sm:space-y-6`)

**Recommendation:** Standardize to `space-y-5 sm:space-y-6` for all pages.

---

### 2. **Page Header Variations**

Most pages follow the pattern, but slight variations exist:

**Standard Pattern (Preferred):**
```typescript
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
  <div className="min-w-0">
    <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Title</h1>
    <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">Description</p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* Actions */}
  </div>
</div>
```

**Variations Found:**
- ⚠️ **Campaigns:** Uses `flex-1 min-w-0` instead of `min-w-0` (both work, but `min-w-0` is preferred)
- ⚠️ **Settings:** Uses `mb-6` wrapper instead of direct spacing (acceptable but inconsistent)

**Recommendation:** Use the standard pattern above for all pages.

---

## ✅ Checklist for New Pages

When creating a new page, ensure:

- [ ] ✅ Page header follows standard pattern (title + description + actions)
- [ ] ✅ Typography uses consistent scale (`text-title-h5 sm:text-title-h4`)
- [ ] ✅ Cards use standard styling (`rounded-xl`, `ring-1`, etc.)
- [ ] ✅ Spacing follows patterns (`space-y-5 sm:space-y-6`)
- [ ] ✅ Buttons use consistent variants and sizes
- [ ] ✅ Empty states follow standard pattern
- [ ] ✅ Loading states use skeleton pattern
- [ ] ✅ Responsive design (mobile-first)
- [ ] ✅ Colors use design system tokens
- [ ] ✅ Icons use consistent sizing (`size-4`, `size-5`, `size-6`)

---

## 🎯 Quick Copy-Paste Template

```typescript
'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'

interface PageClientProps {
  initialData?: {
    // Define your data structure
  }
}

export function PageClient({ initialData }: PageClientProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Page Title</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Page description
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button.Root variant="basic" size="small">
            <Button.Icon as={Plus} />
            <span className="sm:inline">Action</span>
          </Button.Root>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200">
        {/* Your content here */}
      </div>
    </div>
  )
}
```

**All new pages should follow these patterns!** 🎯
