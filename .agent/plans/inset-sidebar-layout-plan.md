# Inset Sidebar Layout Implementation Plan (Option B)

## Overview

Transform the current flat dashboard layout into a modern "Inset Sidebar Layout" with a floating content card, inspired by Stripe, Attio, and Tailwind Catalyst.

**Target Design:**
```
┌─────────────────────────────────────────────────────┐
│  p-2                 (gray background)              │
│  ┌─────────┐  ┌──────────────────────────────────┐ │
│  │Sidebar  │  │                                  │ │
│  │(trans)  │  │   Content Card (white)           │ │
│  │         │  │   rounded-2xl                    │ │
│  │         │  │   shadow-lg                      │ │
│  │         │  │                                  │ │
│  └─────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Files to Modify

### 1. `app/layout.tsx` (Root Layout)
**Current:** `<body className="bg-bg-white-0 ...">`
**Change:** `<body className="bg-bg-weak-50 ...">`

**Purpose:** Set the gray shell background for the entire app.

---

### 2. `app/(dashboard)/layout.tsx` (Dashboard Layout) - MAJOR CHANGES
**Current Structure:**
```tsx
<div className="flex h-screen overflow-hidden bg-bg-white-0">
  <Sidebar />
  <div className="flex flex-1 flex-col overflow-hidden min-w-0">
    <Header />
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </main>
  </div>
</div>
```

**New Structure:**
```tsx
<div className="h-screen p-2 lg:p-3 bg-bg-weak-50">
  <div className="flex h-full gap-2 lg:gap-3">
    {/* Sidebar - Transparent, sits on gray background */}
    <Sidebar className="hidden lg:flex" />
    
    {/* Content Card - White floating sheet */}
    <div className="flex-1 flex flex-col bg-bg-white-0 rounded-2xl shadow-lg overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  </div>
</div>
```

**Key Changes:**
- Outer container: `p-2 lg:p-3` for inset padding
- Content wrapper: `gap-2 lg:gap-3` between sidebar and content
- Content card: `bg-bg-white-0 rounded-2xl shadow-lg overflow-hidden`
- Remove old `bg-bg-white-0` from outer container

---

### 3. `components/dashboard/sidebar.tsx` - MEDIUM CHANGES

**Current (line 203-209):**
```tsx
<aside
  className={cn(
    'flex h-screen flex-col border-r border-stroke-soft-200 bg-bg-white-0',
    'transition-all duration-300',
    collapsed ? 'w-[72px]' : 'w-[280px]'
  )}
>
```

**New:**
```tsx
<aside
  className={cn(
    'flex h-full flex-col',  // Remove bg, border-r, h-screen
    'transition-all duration-300',
    collapsed ? 'w-[72px]' : 'w-[280px]'
  )}
>
```

**Additional Changes:**
- Logo section: Remove `border-b border-stroke-soft-200`
- Organization switcher section: Remove `border-b border-stroke-soft-200`
- Footer section: Remove `border-t border-stroke-soft-200`
- All internal sections become borderless (floating in gray space)

**Optional Enhancements:**
- Add subtle rounded corners to nav items for hover: already have `rounded-10`
- Consider adding a very subtle semi-transparent background on hover

---

### 4. `components/dashboard/header.tsx` - SMALL CHANGES

**Current (line 44):**
```tsx
<header className="relative flex h-14 sm:h-16 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 sm:px-6">
```

**New:**
```tsx
<header className="relative flex h-14 sm:h-16 items-center justify-between border-b border-stroke-soft-200 px-4 sm:px-6">
```

**Changes:**
- Remove `bg-bg-white-0` (inherits from content card)
- Keep `border-b` for separation from content

**Alternative (Borderless):**
```tsx
<header className="relative flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
```
Then use a subtle shadow or gradient for separation instead.

---

### 5. `components/dashboard/loading-skeletons.tsx` - SMALL CHANGES

**`SidebarSkeleton` (line 224-258):**
Replace `border-r border-stroke-soft-200 bg-bg-white-0` with just the structural classes.

---

### 6. `app/globals.css` - NO CHANGES REQUIRED

The existing color tokens already support this:
- `--color-bg-weak-50` for the shell background
- `--color-bg-white-0` for the content card
- Dark mode variants are already defined

---

## Mobile Considerations

### Current Mobile Behavior:
- Sidebar is hidden by default
- Mobile menu button reveals sidebar as an overlay
- Sidebar uses `fixed inset-y-0 left-0 z-50`

### New Mobile Behavior (Keep Similar):
- Keep the fixed overlay approach for mobile
- Content card should fill the screen on mobile (remove padding)
- Use responsive classes: `p-0 lg:p-2` on outer container

**Mobile Layout:**
```tsx
<div className="h-screen p-0 lg:p-2 lg:p-3 bg-bg-weak-50">
  {/* On mobile: Content fills screen */}
  {/* On desktop: Content is inset card */}
</div>
```

**Content Card Mobile:**
```tsx
<div className="flex-1 flex flex-col bg-bg-white-0 lg:rounded-2xl lg:shadow-lg overflow-hidden">
```

---

## Implementation Order

### Phase 1: Layout Shell (Low Risk)
1. Update `app/layout.tsx` body background color
2. Update `app/(dashboard)/layout.tsx` outer structure

### Phase 2: Content Card (Medium Risk)
3. Wrap content area with card styling
4. Add responsive padding/rounding

### Phase 3: Sidebar Cleanup (Medium Risk)
5. Remove sidebar background and borders
6. Update SidebarSkeleton

### Phase 4: Header Integration (Low Risk)
7. Remove header background (inherits from card)
8. Optional: Adjust border styling

### Phase 5: Polish (Low Risk)
9. Test mobile overlay sidebar
10. Fine-tune shadows and rounding
11. Verify dark mode works correctly

---

## CSS Tokens to Use

```css
/* Shell Background */
bg-bg-weak-50  /* Light gray background */

/* Content Card */
bg-bg-white-0  /* White card background */
rounded-2xl    /* 16px border radius */
shadow-lg      /* Or use custom: shadow-custom-md */

/* Spacing */
p-2 lg:p-3     /* Inset padding */
gap-2 lg:gap-3 /* Gap between sidebar and content */
```

---

## Potential Issues & Solutions

### Issue 1: Mobile Sidebar Overlay
**Risk:** Mobile sidebar may look odd with new layout
**Solution:** Keep `fixed` positioning for mobile, only apply inset on `lg:` breakpoint

### Issue 2: Content Height
**Risk:** Content card might not fill properly
**Solution:** Use `h-full` on flex containers, `overflow-hidden` on card

### Issue 3: Dark Mode
**Risk:** Colors might not invert properly
**Solution:** Test dark mode - existing tokens should handle this

### Issue 4: Shadows in Dark Mode
**Risk:** Shadows might look wrong
**Solution:** May need to adjust shadow opacity for dark mode

---

## Before/After Visual Comparison

**Before (Current):**
- Sidebar: White, border-right, full height
- Header: White, border-bottom
- Content: White background, no visible separation
- Overall: Flat, one-layer look

**After (Inset Layout):**
- Shell: Gray background visible around edges
- Sidebar: Transparent, nav items float on gray
- Content: White card with rounded corners & shadow
- Header: Inside the card, subtle border
- Overall: Layered, depth-based hierarchy

---

## Estimated Changes

| File | Lines Changed | Risk Level |
|------|---------------|------------|
| `app/layout.tsx` | ~2 | Low |
| `app/(dashboard)/layout.tsx` | ~30 | Medium |
| `components/dashboard/sidebar.tsx` | ~15 | Medium |
| `components/dashboard/header.tsx` | ~5 | Low |
| `components/dashboard/loading-skeletons.tsx` | ~5 | Low |

**Total: ~57 lines of code changes**

---

## Ready to Implement?

This plan provides a complete roadmap. When you're ready, I can implement these changes in the following order:

1. **Step 1:** Root layout background
2. **Step 2:** Dashboard layout structure
3. **Step 3:** Sidebar transparency
4. **Step 4:** Header cleanup
5. **Step 5:** Skeleton updates
6. **Step 6:** Testing & Polish
