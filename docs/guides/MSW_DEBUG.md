# MSW Debug Guide - Request Not Reaching MSW

## Problem
MSW tak request pahuch hi nahi raha (requests not being intercepted by MSW).

## Quick Checks

### 1. Environment Variables
```bash
# Check if these are set in .env.local
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000  # Optional, defaults to localhost:4000
```

### 2. Browser Console
Open browser console and check for:
- `[MSW] ✅ Browser mocking enabled` - MSW worker started
- `[MSW] ✅ Database seeded` - Database initialized
- Any errors about MSW initialization

### 3. Network Tab
- Open DevTools → Network tab
- Make an API request
- Check if request shows as:
  - **Mocked** (MSW is intercepting) ✅
  - **Real request** (MSW not intercepting) ❌

### 4. Service Worker
- Open DevTools → Application → Service Workers
- Check if `mockServiceWorker.js` is registered and active

## Common Issues & Fixes

### Issue 1: MSW Worker Not Starting
**Symptoms:**
- No `[MSW] ✅ Browser mocking enabled` in console
- Service worker not registered

**Fix:**
1. Check if `public/mockServiceWorker.js` exists
2. If missing, run: `npx msw init public/ --save`
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console for errors

### Issue 2: URL Mismatch
**Symptoms:**
- MSW is initialized but requests bypass it
- Console shows "Unhandled request" warnings

**Fix:**
1. Check Encore client base URL:
   ```typescript
   // lib/encore-browser.ts
   return process.env.NEXT_PUBLIC_ENCORE_URL || Local  // Should be http://localhost:4000
   ```

2. Check MSW handler URLs:
   ```typescript
   // mocks/handlers/utils.ts
   export const ENCORE_BASE_URL = process.env.NEXT_PUBLIC_ENCORE_URL || "http://localhost:4000"
   ```

3. Ensure both match!

### Issue 3: Server-Side Requests Not Intercepted
**Symptoms:**
- Client-side works, but Server Actions/RSC fail
- Server console shows real API errors

**Fix:**
1. Check `instrumentation.ts` - MSW server should initialize
2. Check `app/layout.tsx` - MSW server re-initialization
3. Check server console for:
   - `[MSW Instrumentation] ✅ Server-side mocking initialized`
   - `[MSW RootLayout] ✅ Server re-initialized`

### Issue 4: Encore Client Created Before MSW
**Symptoms:**
- MSW initializes but client uses unpatched fetch

**Fix:**
1. Ensure MSW initializes BEFORE Encore client
2. In `lib/encore.ts`, check if fetch is patched:
   ```typescript
   const currentFetch = typeof globalThis.fetch !== "undefined" ? globalThis.fetch : undefined
   ```

3. Add logging:
   ```typescript
   console.log("[Encore Client] Fetch patched:", currentFetch?.toString().includes("msw"))
   ```

## Debug Steps

### Step 1: Verify MSW Setup
```bash
# Check files exist
ls public/mockServiceWorker.js
ls mocks/server.ts
ls mocks/browser.ts
ls mocks/handlers/index.ts
```

### Step 2: Check Environment
```bash
# In .env.local
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000
```

### Step 3: Check Browser Console
1. Open DevTools → Console
2. Look for MSW initialization messages
3. Check for any errors

### Step 4: Check Network Tab
1. Open DevTools → Network
2. Filter by "localhost:4000"
3. Make an API request
4. Check if request is mocked or real

### Step 5: Check Service Worker
1. Open DevTools → Application → Service Workers
2. Verify `mockServiceWorker.js` is registered
3. Status should be "activated and running"

### Step 6: Add Debug Logging
Add to `mocks/index.ts`:
```typescript
console.log("[MSW Debug] Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_ENCORE_URL: process.env.NEXT_PUBLIC_ENCORE_URL,
})
```

## Quick Fix Commands

```bash
# 1. Regenerate MSW worker
npx msw init public/ --save

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart dev server
npm run dev

# 4. Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Verification

After fixes, you should see:
1. ✅ Browser console: `[MSW] ✅ Browser mocking enabled`
2. ✅ Network tab: Requests show as "mocked" or have MSW badge
3. ✅ Service Worker: Active and running
4. ✅ API calls: Return mock data instead of real API

## Still Not Working?

1. Check browser console for specific errors
2. Verify MSW version: `npm list msw`
3. Check Next.js version compatibility
4. Try disabling other service workers
5. Check if requests are going to correct URL
