# Mocking vs Real API - Configuration Guide

## Overview

Your setup uses **MSW (Mock Service Worker)** to intercept API requests. The behavior depends on the `NEXT_PUBLIC_API_MOCKING` environment variable.

## How It Works

### When `NEXT_PUBLIC_API_MOCKING=enabled` (Development Mocking)

✅ **All CRUD operations go to MSW mock database**
- Requests are intercepted by MSW Service Worker (browser) or MSW Server (Node.js)
- Data is stored in `@msw/data` collections (in-memory + IndexedDB persistence)
- **No requests reach the real Encore API**
- Perfect for development without backend

**Files Involved:**
- `mocks/handlers/*.ts` - API handlers
- `mocks/db/collections.ts` - Database collections
- `mocks/db/seed.ts` - Seed data

### When `NEXT_PUBLIC_API_MOCKING` is NOT set or disabled

✅ **All CRUD operations go to real Encore API**
- Requests bypass MSW
- Data goes to actual Encore backend
- MSW handlers are not called
- Perfect for production or testing with real backend

## Current Configuration Check

### 1. Check Environment Variable

**File:** `.env.local` or `.env`

```bash
# If this is set to "enabled", ALL requests go to MSW
NEXT_PUBLIC_API_MOCKING=enabled

# If this is NOT set or set to anything else, requests go to real API
# NEXT_PUBLIC_API_MOCKING=disabled
# or just remove the line
```

### 2. How Encore Client Decides

**Server-side** (`lib/encore.ts`):
```typescript
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  // Use MSW-patched fetch
  const currentFetch = globalThis.fetch // Patched by MSW
  clientInstance = new Client(getEncoreBaseUrl(), { fetcher: currentFetch })
} else {
  // Use normal fetch (goes to real API)
  clientInstance = new Client(getEncoreBaseUrl(), options)
}
```

**Browser-side** (`lib/encore-browser.ts`):
```typescript
// Always uses globalThis.fetch
// If MSW is active, fetch is patched → goes to MSW
// If MSW is not active, fetch is normal → goes to real API
```

### 3. How MSW Decides to Intercept

**File:** `mocks/index.ts`
```typescript
export async function initMocks() {
  // Only initialize if:
  // 1. NODE_ENV === "development"
  // 2. NEXT_PUBLIC_API_MOCKING === "enabled"
  
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") {
    console.log("[MSW] Mocking disabled")
    return // MSW doesn't start, fetch is not patched
  }
  
  // MSW starts and patches fetch
  server.listen() // or worker.start()
}
```

## Switching Between Mock and Real API

### Option 1: Use Environment Variable (Recommended)

**For Mocking (Development):**
```bash
# .env.local
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000
```

**For Real API (Production/Testing):**
```bash
# .env.local
# NEXT_PUBLIC_API_MOCKING=enabled  # Comment out or remove
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000  # Your real Encore API URL
```

**Restart dev server after changing:**
```bash
npm run dev
```

### Option 2: Conditional Logic (Not Recommended)

You could add conditional logic in components, but this is **not recommended** because:
- It adds complexity
- Easy to forget to update
- Environment variable is cleaner

## Verification

### Check if Mocking is Active

**Browser Console:**
```javascript
// Should see these logs if mocking is enabled:
[MSW] ✅ Browser mocking enabled
[MSW Browser] Worker started successfully
[Encore Browser Client] ✅ URLs match - MSW should intercept requests
```

**Network Tab:**
- Requests to `localhost:4000` should show **"mocked"** badge ✅
- If no badge, requests are going to real API

### Check if Real API is Active

**Browser Console:**
```javascript
// Should NOT see MSW logs
// Should see normal fetch requests
```

**Network Tab:**
- Requests to `localhost:4000` should show **no "mocked" badge**
- Requests go directly to Encore API

## Common Issues

### Issue 1: Operations Always Go to Mock

**Symptom:** All CRUD operations update mock database, never reach real API

**Cause:** `NEXT_PUBLIC_API_MOCKING=enabled` is set

**Fix:**
1. Remove or comment out `NEXT_PUBLIC_API_MOCKING=enabled` in `.env.local`
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: Operations Always Go to Real API

**Symptom:** MSW handlers never called, requests bypass mocking

**Cause:** `NEXT_PUBLIC_API_MOCKING` is not set to `"enabled"`

**Fix:**
1. Set `NEXT_PUBLIC_API_MOCKING=enabled` in `.env.local`
2. Restart dev server
3. Check browser console for MSW initialization logs

### Issue 3: Mixed Behavior (Some Mock, Some Real)

**Symptom:** Some requests go to MSW, others to real API

**Possible Causes:**
1. MSW not fully initialized (check console logs)
2. Service Worker not active (check DevTools → Application → Service Workers)
3. URL mismatch between Encore client and MSW handlers

**Fix:**
1. Check console for MSW initialization errors
2. Verify `NEXT_PUBLIC_ENCORE_URL` matches in both:
   - `lib/encore-browser.ts` (Encore client)
   - `mocks/handlers/utils.ts` (MSW handlers)
3. Regenerate service worker: `npx msw init public/ --save`

## Best Practices

### Development
✅ Use mocking (`NEXT_PUBLIC_API_MOCKING=enabled`)
- Fast iteration
- No backend dependency
- Consistent test data

### Production
✅ Use real API (remove or disable `NEXT_PUBLIC_API_MOCKING`)
- Real data
- Actual backend
- Production environment

### Testing
✅ Use real API or dedicated test backend
- Integration testing
- Real API validation
- End-to-end testing

## Summary

| Configuration | CRUD Operations Go To | Use Case |
|--------------|----------------------|----------|
| `NEXT_PUBLIC_API_MOCKING=enabled` | MSW Mock Database | Development |
| `NEXT_PUBLIC_API_MOCKING` not set | Real Encore API | Production/Testing |
| `NEXT_PUBLIC_API_MOCKING=disabled` | Real Encore API | Production/Testing |

**Current Status:** Check your `.env.local` file to see which mode you're in!
