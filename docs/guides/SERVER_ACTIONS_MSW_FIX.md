# Server Actions MSW Interception Fix

## Problem
Server actions (like `signInEmail`) are not being intercepted by MSW, causing sign-in to fail.

## Root Cause
The Encore client was using a **singleton pattern** which cached the fetch function at creation time. If the client was created before MSW patched `globalThis.fetch`, it would use the unpatched fetch forever.

## Solution

### 1. Force New Client Instance (Fixed)
**File:** `lib/encore.ts`

**Change:** Instead of using a singleton when mocking is enabled, always create a new client instance to ensure it uses the current (patched) fetch.

```typescript
// OLD (WRONG - uses cached singleton)
if (!clientInstance) {
  clientInstance = new Client(getEncoreBaseUrl(), patchedOptions)
}
return clientInstance

// NEW (CORRECT - always creates fresh instance)
const client = new Client(getEncoreBaseUrl(), patchedOptions)
return client
```

### 2. Enhanced Logging
Added detailed logging to verify:
- MSW initialization status
- Fetch patching status
- Client creation with patched fetch
- Request URLs being called

## Verification Steps

### 1. Check Server Console Logs
When you try to sign in, you should see:

```
[SignIn] 🔧 Initializing MSW before API call...
[MSW Init] Starting server mocks initialization...
[MSW] ✅ Server mocking enabled (RSC + Server Actions)
[MSW] Fetch has been patched - all requests to localhost:4000 will be intercepted
[SignIn] ✅ globalThis.fetch is patched by MSW
[Encore Client] ✅ Using globalThis.fetch (should be patched by MSW)
[Encore Client] ✅ Created NEW client instance with MSW-patched fetch
[SignIn] Encore client created, making signInEmail API call...
[SignIn] Request URL will be: http://localhost:4000/auth/sign-in/email
```

### 2. Check for Errors
If you see:
- `❌ CRITICAL: globalThis.fetch is undefined!` → MSW not initialized
- `⚠️ globalThis.fetch may not be fully patched` → MSW patching incomplete
- No `[MSW] ✅ Server mocking enabled` → MSW not starting

### 3. Check MSW Handler
Verify the handler is registered:
- Handler: `POST /auth/sign-in/email`
- URL: `http://localhost:4000/auth/sign-in/email`
- Should return mock user data

## Common Issues

### Issue 1: Client Created Before MSW
**Symptom:** Requests go to real API, not MSW

**Fix:** ✅ **FIXED** - Client now always creates new instance when mocking is enabled

### Issue 2: Next.js Overrides Fetch
**Symptom:** MSW patches fetch, but Next.js overrides it later

**Fix:** MSW is re-initialized in `app/layout.tsx` as workaround

### Issue 3: Environment Variable Not Set
**Symptom:** MSW doesn't initialize

**Fix:** Check `.env.local`:
```bash
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_ENCORE_URL=http://localhost:4000
```

## Testing

1. **Clear browser cache and restart dev server:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Try to sign in:**
   - Email: any email
   - Password: any password
   - Should succeed and redirect to dashboard

3. **Check console logs:**
   - Should see MSW initialization logs
   - Should see "Request URL will be: http://localhost:4000/auth/sign-in/email"
   - Should see successful sign-in

## Expected Behavior

✅ **Before Fix:**
- Client uses cached singleton
- Fetch not patched → requests fail
- Sign-in fails

✅ **After Fix:**
- Client creates new instance each time
- Uses current `globalThis.fetch` (patched by MSW)
- Requests intercepted → sign-in succeeds
