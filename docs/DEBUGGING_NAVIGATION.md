# Navigation Debugging Guide

## Issue: Can't Navigate Forward in Dashboard

### What I Added

1. **Navigation Debug Logger** (`lib/debug-navigation.ts`)
   - Logs all link clicks
   - Logs all router.push calls
   - Logs history changes
   - Shows if preventDefault/stopPropagation is blocking

2. **Fixed Mobile Overlay** 
   - Mobile sidebar close button was potentially blocking clicks
   - Added proper event handling

## How to Debug

### 1. Check Browser Console

After refreshing, you should see:
```
[Navigation Debug] Link clicked: /dashboard/campaigns {...}
```

### 2. Common Issues to Check

#### Issue 1: Link Not Clickable
**Symptoms:** Link doesn't respond to clicks
**Check:**
- Console for `[Navigation Debug] Link clicked` - if not showing, something is blocking
- Check if `preventDefault: true` in console
- Check z-index of overlays

#### Issue 2: Router Not Working
**Symptoms:** URL changes but page doesn't update
**Check:**
- Console for `[Navigation Debug] pushState` - should show URL
- Check for JavaScript errors
- Check if component is re-rendering

#### Issue 3: Error Blocking Navigation
**Symptoms:** Page freezes or shows error
**Check:**
- Console for errors (red text)
- Network tab for failed requests
- React DevTools for component errors

### 3. Quick Fixes

#### If Links Don't Work:
```typescript
// Check if Link component is imported correctly
import Link from "next/link" // ✅ Correct
import { Link } from "next/link" // ❌ Wrong
```

#### If Router.push Doesn't Work:
```typescript
// Make sure you're using useRouter from next/navigation
import { useRouter } from "next/navigation" // ✅ Correct (App Router)
import { useRouter } from "next/router" // ❌ Wrong (Pages Router)
```

#### If Navigation is Blocked:
```typescript
// Check for preventDefault in event handlers
onClick={(e) => {
  e.preventDefault() // ❌ This blocks navigation!
  router.push("/dashboard")
}}
```

### 4. Test Navigation

Try clicking these links and check console:
1. "New Campaign" button (top right)
2. Campaign cards (should go to `/dashboard/campaigns/:id`)
3. "View all" links
4. Sidebar navigation items

### 5. What to Look For in Console

**Good (Navigation Working):**
```
[Navigation Debug] Link clicked: /dashboard/campaigns/create
[Navigation Debug] pushState: /dashboard/campaigns/create
```

**Bad (Navigation Blocked):**
```
[Navigation Debug] Link clicked: /dashboard/campaigns/create
preventDefault: true  // ❌ Something is preventing navigation
```

**Error (JavaScript Error):**
```
Error: Cannot read property 'x' of undefined
at DashboardClient (dashboard-client.tsx:123)
```

## Common Causes

1. **Overlay Blocking Clicks**
   - Mobile sidebar overlay
   - Modal/drawer open
   - Loading spinner

2. **JavaScript Error**
   - Component crashes before navigation
   - Error in onClick handler
   - Missing data causing error

3. **Router Not Initialized**
   - useRouter called before mount
   - Router context missing

4. **Event Handler Issues**
   - preventDefault() called
   - stopPropagation() blocking
   - Return false in handler

## Next Steps

1. **Refresh browser** and check console
2. **Click a link** and see what logs appear
3. **Share console output** if navigation still doesn't work
4. **Check for errors** in red text

## Disable Debug Logging

To disable navigation debugging, remove the import from `app/providers.tsx`:

```typescript
// Remove this:
if (process.env.NODE_ENV === "development") {
	import("@/lib/debug-navigation").catch(() => {})
}
```
