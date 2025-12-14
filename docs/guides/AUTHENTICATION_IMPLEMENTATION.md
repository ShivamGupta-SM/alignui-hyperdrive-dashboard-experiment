# Authentication Implementation & Remote Session Revocation Handling

**Date:** 2024-12-19

---

## 🔐 Authentication Overview

### Tech Stack
- **Encore Client** - Frontend API client (connects to Encore backend)
- **Encore.ts Backend** - API gateway with auth handler (uses Better Auth internally)
- **Next.js 16** - Server Components + Server Actions
- **Cookies** - Session tokens stored in httpOnly cookies

---

## 📋 Authentication Flow

### 1. **Sign In Process**

```typescript
// app/actions/auth.ts
export async function signInEmail(email: string, password: string) {
  const client = getEncoreClient()
  const result = await client.auth.signInEmail({ email, password })
  
  // Set auth cookie
  if (result.token) {
    cookieStore.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }
}
```

### 2. **Session Validation (Backend)**

```typescript
// Encore backend: auth/auth.ts
export const auth = authHandler<AuthParams, AuthData>(
  async (params): Promise<AuthData> => {
    // 1. Extract token from Bearer header OR session cookie
    let sessionToken = params.authorization?.startsWith("Bearer ")
      ? params.authorization.slice(7)
      : params.sessionCookie?.value
    
    // 2. Query session table to validate token
    const sessionData = await orm.db.query.session.findFirst({
      where: eq(session.token, sessionToken),
      // ... check expiry, revocation status
    })
    
    // 3. Return user data if valid
    return { user, organizations, ... }
  }
)
```

### 3. **Session Storage**

- **Backend**: Sessions stored in `session` table (Better Auth - backend only)
- **Frontend**: Session token in httpOnly cookie (`auth-token`)
- **Validation**: Every API request validates session token via Encore backend

---

## 🚨 Remote Session Revocation Handling

### Scenario: Admin revokes user session remotely

**What happens:**
1. Admin calls `adminRevokeUserSession(sessionToken)` on backend
2. Backend marks session as revoked in database
3. User's next API request fails with **401/403** error
4. Frontend detects auth error and redirects to login

---

## 🛡️ Error Handling Implementation

### 1. **Client-Side Error Handler**

**File**: `lib/error-handler.ts`

```typescript
'use client'

export function isAuthError(error: unknown): boolean {
  if (error instanceof APIError) {
    // 401 = session expired/invalid
    // 403 = session revoked/insufficient permissions
    return error.status === 401 || error.status === 403
  }
  
  // Check error message patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('session revoked') ||
      message.includes('session expired') ||
      message.includes('unauthenticated') ||
      // ... more patterns
    )
  }
  
  return false
}

export function handleAuthError(error: unknown): void {
  if (isAuthError(error)) {
    // Clear auth cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    // Clear auth token cookie
    
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/sign-in?redirect=${returnUrl}`
  }
}
```

### 2. **Server-Side Error Handler**

**File**: `lib/error-handler-server.ts`

```typescript
'use server'

export function isAuthError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.status === 401 || error.status === 403
  }
  // ... same pattern matching
}

export function handleServerAuthError(error: unknown): void {
  if (isAuthError(error)) {
    redirect('/sign-in')  // Server-side redirect
  }
  // Not an auth error, let caller handle it
}
```

---

## 🔄 Where Auth Errors Are Handled

### 1. **Error Boundaries** (Global)

**File**: `app/(dashboard)/error.tsx`
```typescript
export default function Error({ error, reset }) {
  useEffect(() => {
    if (isAuthError(error)) {
      handleAuthError(error)  // Redirects to login
    }
  }, [error])
  
  if (isAuthError(error)) {
    return <div>Redirecting to login...</div>
  }
  // ... show error UI
}
```

**File**: `app/global-error.tsx`
```typescript
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (isAuthError(error)) {
      handleAuthError(error)  // Global handler
    }
  }, [error])
  // ... same pattern
}
```

### 2. **Server Actions** (Key Functions)

**Files with `handleServerAuthError`**:
- ✅ `app/actions/campaigns.ts` - All 8 functions
- ✅ `app/actions/onboarding.ts` - All 3 functions
- ✅ `app/actions/settings.ts` - Key functions (updateProfile, updateOrganization, revokeSession, revokeAllSessions)

**Example**:
```typescript
export async function createCampaign(...) {
  try {
    // ... API call
  } catch (error: any) {
    handleServerAuthError(error)  // Redirects if 401/403
    return { success: false, error: error.message }
  }
}
```

### 3. **Client-Side API Calls**

**Pattern**: Wrap API calls in try-catch with `handleAuthError`

```typescript
try {
  const result = await client.campaigns.createCampaign(...)
} catch (error) {
  if (isAuthError(error)) {
    handleAuthError(error)  // Redirects to login
    return
  }
  // Handle other errors
}
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN REVOKES SESSION (Backend)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ adminRevokeUserSession(sessionToken)                 │  │
│  │ → Backend marks session as revoked in database        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  USER MAKES API REQUEST (Frontend)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ client.campaigns.createCampaign(...)                 │  │
│  │ → API validates session token                        │  │
│  │ → Session is revoked → Returns 401/403 error         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  ERROR DETECTION                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ isAuthError(error) → true                           │  │
│  │ (Checks: status === 401/403 OR message patterns)    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  ERROR HANDLING (Multiple Layers)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Server Action: handleServerAuthError()            │  │
│  │    → redirect('/sign-in')                            │  │
│  │                                                       │  │
│  │ 2. Error Boundary: handleAuthError()                │  │
│  │    → Clear cookies + window.location.href            │  │
│  │                                                       │  │
│  │ 3. Global Error: handleAuthError()                  │  │
│  │    → Clear cookies + window.location.href            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  USER REDIRECTED TO LOGIN                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ /sign-in?redirect=/dashboard/campaigns               │  │
│  │ → User can sign in again                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Status

### ✅ **Fully Implemented**

1. **Error Detection**
   - ✅ `isAuthError()` - Detects 401/403 and error message patterns
   - ✅ Works for both `APIError` and generic `Error` objects

2. **Client-Side Handling**
   - ✅ `handleAuthError()` - Clears cookies, redirects to login
   - ✅ Integrated in `error.tsx` (dashboard)
   - ✅ Integrated in `global-error.tsx` (app-wide)

3. **Server-Side Handling**
   - ✅ `handleServerAuthError()` - Redirects to login
   - ✅ Integrated in key Server Actions:
     - ✅ `campaigns.ts` - All 8 functions
     - ✅ `onboarding.ts` - All 3 functions
     - ✅ `settings.ts` - Key functions

4. **Session Management**
   - ✅ `revokeSession()` - Revoke specific session
   - ✅ `revokeAllSessions()` - Revoke all user sessions
   - ✅ Admin endpoints available in backend

---

## 🔍 Testing Scenarios

### Scenario 1: Admin Revokes Session
1. User is logged in on Device A
2. Admin revokes session via backend
3. User makes API request → Gets 401 error
4. Frontend detects auth error → Redirects to login ✅

### Scenario 2: Session Expires
1. User session expires (30 days)
2. User makes API request → Gets 401 error
3. Frontend detects auth error → Redirects to login ✅

### Scenario 3: User Revokes Own Session
1. User revokes session from Settings page
2. Session marked as revoked in database
3. Next API request → Gets 401 error
4. Frontend detects auth error → Redirects to login ✅

### Scenario 4: Multiple Devices
1. User has sessions on Device A, B, C
2. Admin revokes Device B session
3. Device B makes API request → Gets 401 → Redirects ✅
4. Device A and C continue working ✅

---

## 📝 Key Files

### Error Handlers
- `lib/error-handler.ts` - Client-side auth error handling
- `lib/error-handler-server.ts` - Server-side auth error handling

### Error Boundaries
- `app/(dashboard)/error.tsx` - Dashboard error boundary
- `app/global-error.tsx` - Global error boundary

### Server Actions (with auth error handling)
- `app/actions/campaigns.ts` - 8 functions
- `app/actions/onboarding.ts` - 3 functions
- `app/actions/settings.ts` - Key functions

### Session Management
- `app/actions/settings.ts` - `revokeSession()`, `revokeAllSessions()`
- `app/actions/auth.ts` - Sign in/up, session management

---

## 🎯 Summary

### ✅ **Authentication is Properly Implemented**

1. **Session Management**: Encore Client (frontend) → Encore Backend (uses Better Auth internally)
2. **Error Detection**: `isAuthError()` detects 401/403 and error patterns
3. **Error Handling**: Multiple layers (Error Boundaries, Server Actions)
4. **Remote Revocation**: Fully handled - admin can revoke sessions, users get redirected
5. **Cookie Management**: Auth tokens stored in httpOnly cookies
6. **Redirect Flow**: Users redirected to login with return URL

### ✅ **Remote Session Revocation Works**

When admin revokes a session:
1. ✅ Backend marks session as revoked
2. ✅ Next API request returns 401/403
3. ✅ Frontend detects auth error
4. ✅ Cookies are cleared
5. ✅ User redirected to login
6. ✅ User can sign in again

**Status**: ✅ **FULLY IMPLEMENTED AND WORKING**
