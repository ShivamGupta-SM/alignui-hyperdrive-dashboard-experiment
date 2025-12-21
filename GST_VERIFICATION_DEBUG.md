# GST Verification Debug Guide

## Issue
GST verification page par "the request does not have valid authentication credentials for the operation" error aa raha hai.

## Root Cause Analysis

**Error Source:** Backend se aa raha hai, kyunki:
1. Frontend unauthenticated requests bhej raha tha (pehle)
2. Ab authenticated client use ho raha hai, but detailed logging add kiya hai

## Fixes Applied

### 1. Authentication Check Added ✅
- `verifyGST()` function ab `requireAuth()` check karta hai pehle
- Agar user authenticated nahi hai, to error return karta hai

### 2. Token Handling Improved ✅
- Ab dono cookies check karte hain:
  - `auth-token` (Next.js custom cookie)
  - `better-auth.session_token` (Better Auth standard cookie)
- Jo bhi available hai, use karte hain

### 3. Enhanced Logging Added ✅
Ab detailed logs terminal mein dikhenge:

**Success Flow:**
```
ℹ️ [verifyGST] GST verification starting
  - hasAuthToken: true/false
  - hasBetterAuthToken: true/false
  - tokenLength: number
  - gstNumber: "27ABC***"
  - organizationId: "..."

ℹ️ [verifyGST] Set active organization for GST verification
  - organizationId: "..."

ℹ️ [verifyGST] Calling GST verification API
  - gstNumber: "27ABC***"
  - organizationId: "..."

ℹ️ [verifyGST] GST verification successful
  - gstNumber: "27ABC***"
  - hasResult: true
```

**Error Flow:**
```
⚠️ [verifyGST] User not authenticated for GST verification
  - authError: "Authentication required"
  - gstNumber: "27ABC***"
  - organizationId: "..."

OR

🚨 [verifyGST] Error message
  - errorMessage: "..."
  - errorStack: "..."
  - isAuthError: true/false
  - gstNumber: "27ABC***"
```

## Terminal Mein Kya Check Karein

### 1. Authentication Status
```
⚠️ [verifyGST] User not authenticated for GST verification
```
**Meaning:** User login nahi hai ya session expire ho gaya hai
**Fix:** User ko sign-in karna padega

### 2. Token Missing
```
⚠️ [verifyGST] No auth token found for GST verification
  - availableCookies: ["cookie1", "cookie2", ...]
```
**Meaning:** Cookies mein auth token nahi hai
**Fix:** Check karein ki:
- User properly sign-in hua hai
- Cookies set ho rahe hain
- Browser cookies enable hain

### 3. API Call Error
```
🚨 [verifyGST] the request does not have valid authentication credentials
  - isAuthError: true
  - errorMessage: "..."
```
**Meaning:** Backend ko token accept nahi ho raha
**Possible Causes:**
- Token format galat hai
- Token expire ho gaya hai
- Backend session validation fail ho rahi hai

### 4. Organization Setting Error
```
⚠️ [verifyGST] Failed to set active organization
  - organizationId: "..."
  - error: "..."
```
**Meaning:** Organization set karne mein problem hai
**Note:** Ye warning hai, verification continue hogi

## Testing Steps

1. **Terminal Open Karein** (Next.js dev server)
2. **GST Verification Page Open Karein**
3. **GST Number Enter Karein**
4. **Verify Button Click Karein**
5. **Terminal Mein Logs Check Karein**

## Expected Terminal Output

### Success Case:
```
ℹ️ [verifyGST] GST verification starting { hasAuthToken: true, ... }
ℹ️ [verifyGST] Set active organization for GST verification { organizationId: "..." }
ℹ️ [verifyGST] Calling GST verification API { gstNumber: "27ABC***", ... }
ℹ️ [verifyGST] GST verification successful { hasResult: true }
```

### Error Case:
```
⚠️ [verifyGST] User not authenticated for GST verification { authError: "...", ... }
```

OR

```
🚨 [verifyGST] the request does not have valid authentication credentials
  { errorMessage: "...", isAuthError: true, ... }
```

## Next Steps

Agar error abhi bhi aa raha hai:

1. **Terminal logs share karein** - exact error message dikhayega
2. **Check karein:**
   - User properly signed in hai?
   - Cookies set ho rahe hain?
   - Backend server running hai?
3. **Browser DevTools mein:**
   - Application > Cookies check karein
   - `auth-token` ya `better-auth.session_token` cookie hai?

## Files Modified

- `Hypedrive Brand/features/organizations/actions/onboarding.ts`
  - Enhanced authentication checks
  - Better token handling (both cookie types)
  - Detailed logging for debugging


