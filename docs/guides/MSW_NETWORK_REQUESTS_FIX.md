# MSW Network Requests Not Intercepting - Fix Guide

## Problem
MSW dev tools me seeds dikh rahe hain (database seeded hai), but network requests me kuch nahi aa raha (MSW requests intercept nahi kar raha).

## Root Causes

### 1. Service Worker Not Active
- Service worker registered hai but active nahi hai
- Browser ne service worker disable kar diya ho

### 2. URL Mismatch
- Encore client different URL use kar raha hai
- MSW handlers different URL expect kar rahe hain

### 3. Fetch Not Patched
- MSW ne fetch properly patch nahi kiya
- Next.js ne fetch override kar diya

### 4. Request Timing
- Requests MSW initialization se pehle ho rahe hain
- MSW worker start hone se pehle client create ho gaya

## Quick Fixes

### Fix #1: Verify Service Worker
1. Open DevTools → Application → Service Workers
2. Check if `mockServiceWorker.js` is:
   - ✅ Registered
   - ✅ Activated
   - ✅ Running
3. If not, click "Unregister" and reload page

### Fix #2: Check URL Matching
Browser console me check karein:
```
[Encore Browser Client] Creating client with base URL: http://localhost:4000
[Encore Browser Client] MSW should intercept requests to: http://localhost:4000
[Encore Browser Client] MSW base URL: http://localhost:4000
[Encore Browser Client] ✅ URLs match - MSW should intercept requests
```

Agar mismatch dikhe:
```
[Encore Browser Client] ❌ URL MISMATCH!
  Encore Client: http://localhost:4000
  MSW Handlers: http://localhost:4000
```

### Fix #3: Check Request Logging
Browser console me yeh dikhna chahiye:
```
[Encore Browser Client] 🔵 Making request: POST http://localhost:4000/auth/sign-in
[MSW Browser] Request received: POST http://localhost:4000/auth/sign-in
[Encore Browser Client] ✅ Response: 200 http://localhost:4000/auth/sign-in
```

Agar `[MSW Browser] Request received` nahi dikh raha, matlab MSW intercept nahi kar raha.

### Fix #4: Force Service Worker Re-registration
Browser console me run karein:
```javascript
// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(r => r.unregister())
  console.log("Service workers unregistered")
  location.reload()
})
```

### Fix #5: Check MSW Worker Status
Browser console me run karein:
```javascript
// Check MSW worker
navigator.serviceWorker.getRegistrations().then(regs => {
  const msw = regs.find(r => r.active?.scriptURL?.includes('mockServiceWorker'))
  if (msw) {
    console.log("✅ MSW Worker found:", msw.active.scriptURL)
    console.log("State:", msw.active.state)
  } else {
    console.error("❌ MSW Worker NOT found")
    console.log("All workers:", regs.map(r => r.active?.scriptURL))
  }
})
```

## Debug Checklist

- [ ] Service Worker registered and active
- [ ] URLs match (Encore client = MSW handlers)
- [ ] Console shows `[MSW Browser] Request received` for API calls
- [ ] Network tab shows requests to `localhost:4000`
- [ ] Requests have "mocked" badge (if MSW working)
- [ ] No errors in browser console
- [ ] MSW worker started before first API call

## Expected Console Output

When working correctly:
```
[MSW Init] Starting MSW initialization...
[MSW Browser] Importing worker...
[MSW Browser] Starting worker...
[MSW Browser] Handler count: 140+
[MSW Browser] Base URL: http://localhost:4000
[MSW] ✅ Browser mocking enabled
[MSW Browser] Worker started successfully
[MSW Browser] ✅ Service Worker registered: http://localhost:3000/mockServiceWorker.js
[MSW Browser] ✅ Service Worker state: activated
[Encore Browser Client] Creating client with base URL: http://localhost:4000
[Encore Browser Client] ✅ URLs match - MSW should intercept requests
[Encore Browser Client] 🔵 Making request: POST http://localhost:4000/auth/sign-in
[MSW Browser] Request received: POST http://localhost:4000/auth/sign-in
[Encore Browser Client] ✅ Response: 200 http://localhost:4000/auth/sign-in
```

## Still Not Working?

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**: DevTools → Application → Clear storage
3. **Disable browser extensions**: Ad blockers, privacy tools
4. **Try different browser**: Chrome, Firefox, Edge
5. **Check network tab**: See actual request URLs
6. **Verify .env.local**: `NEXT_PUBLIC_API_MOCKING=enabled`
