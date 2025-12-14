# MSW Quick Fix - Request Not Reaching MSW

## Immediate Steps

### 1. Check Browser Console
Open DevTools → Console and look for:
- `[MSW Init] Starting MSW initialization...`
- `[MSW] ✅ Browser mocking enabled`
- `[MSW Browser] Worker started successfully`

If you DON'T see these, MSW is not initializing.

### 2. Check Service Worker
1. Open DevTools → Application → Service Workers
2. Look for `mockServiceWorker.js`
3. Status should be "activated and running"
4. If not registered, see Fix #1 below

### 3. Check Network Tab
1. Open DevTools → Network tab
2. Make an API request (e.g., login)
3. Look for requests to `localhost:4000`
4. Check if they show:
   - **"mocked"** badge ✅ (MSW is working)
   - **No badge** ❌ (MSW not intercepting)

### 4. Verify Environment Variables
Check `.env.local`:
```bash
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000
```

## Quick Fixes

### Fix #1: Regenerate Service Worker
```bash
# Stop dev server first
# Then run:
npx msw init public/ --save

# Restart dev server
npm run dev

# Hard refresh browser (Ctrl+Shift+R)
```

### Fix #2: Clear Cache & Restart
```bash
# Clear Next.js cache
rm -rf .next

# Clear browser cache
# Chrome: DevTools → Application → Clear storage → Clear site data

# Restart dev server
npm run dev

# Hard refresh browser
Ctrl+Shift+R
```

### Fix #3: Check URL Matching
The Encore client and MSW handlers must use the SAME base URL:

**Encore Client** (`lib/encore-browser.ts`):
```typescript
return process.env.NEXT_PUBLIC_ENCORE_URL || Local  // "http://localhost:4000"
```

**MSW Handlers** (`mocks/handlers/utils.ts`):
```typescript
export const ENCORE_BASE_URL = process.env.NEXT_PUBLIC_ENCORE_URL || "http://localhost:4000"
```

Both should match! Check console logs:
- `[Encore Browser Client] Creating client with base URL: http://localhost:4000`
- `[MSW Handler] Registering handler for: http://localhost:4000/...`

### Fix #4: Force MSW Re-initialization
Add to browser console:
```javascript
// Check if MSW is active
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log("Service Workers:", regs)
  const msw = regs.find(r => r.scope.includes('mockServiceWorker'))
  console.log("MSW Worker:", msw)
})

// Unregister and reload
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(r => r.unregister())
  location.reload()
})
```

## Debug Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_API_MOCKING=enabled`
- [ ] `public/mockServiceWorker.js` exists
- [ ] Browser console shows MSW initialization messages
- [ ] Service Worker is registered and active
- [ ] Network tab shows requests to `localhost:4000`
- [ ] Requests have "mocked" badge (if MSW is working)
- [ ] Encore client base URL matches MSW handler URL
- [ ] No errors in browser console
- [ ] Hard refresh after changes (Ctrl+Shift+R)

## Still Not Working?

1. **Check browser console for specific errors**
2. **Verify MSW version**: `npm list msw` (should be ^2.x)
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Disable browser extensions** (ad blockers, privacy tools)
5. **Check if other service workers are interfering**

## Expected Console Output

When MSW is working correctly, you should see:
```
[MSW Init] Starting MSW initialization...
[MSW Init] Environment check: { NODE_ENV: 'development', NEXT_PUBLIC_API_MOCKING: 'enabled', ... }
[MSW Browser] Importing worker...
[MSW Browser] Starting worker...
[MSW] ✅ Browser mocking enabled
[MSW Browser] Worker started successfully
[MSW Browser] Service worker should be active - check DevTools → Application → Service Workers
[MSW] ✅ Database seeded with multiple organizations and complete data
[Encore Browser Client] Creating client with base URL: http://localhost:4000
[Encore Browser Client] MSW should intercept requests to: http://localhost:4000
```

If you see errors instead, share them for further debugging.
