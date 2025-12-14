# Routing & Protection Analysis

## Current State

### ✅ What's Working

1. **Dashboard Pages Protection**
   - Each dashboard page calls `requireOrganization()` 
   - Redirects to `/onboarding` if no organization found
   - Examples: `dashboard/page.tsx`, `wallet/page.tsx`, `products/page.tsx`

2. **Error Handling**
   - `NEXT_REDIRECT` errors are properly re-thrown
   - Error boundaries exist for dashboard routes

3. **Layout Structure**
   - Route groups properly organized: `(dashboard)`, `(auth)`, `(onboarding)`
   - Layouts are in place for each section

### ❌ Issues Found

#### 1. **No Centralized Middleware**
- **Problem**: No `middleware.ts` file for route protection
- **Impact**: Each page manually checks authentication
- **Risk**: Easy to forget protection on new pages

#### 2. **No Session Validation**
- **Problem**: `requireOrganization()` doesn't check if user is authenticated first
- **Impact**: Unauthenticated users might see confusing errors
- **Current Flow**: 
  ```
  User → Dashboard → requireOrganization() → API call fails → Error
  ```
- **Should Be**:
  ```
  User → Dashboard → Check Session → Check Organization → Load Data
  ```

#### 3. **Auth Pages Not Protected**
- **Problem**: Authenticated users can still access `/sign-in`, `/sign-up`
- **Impact**: Confusing UX, users might create duplicate accounts
- **Should**: Redirect authenticated users to `/dashboard`

#### 4. **Onboarding Not Protected**
- **Problem**: Users with organizations can still access `/onboarding`
- **Impact**: Users might accidentally re-submit onboarding
- **Should**: Redirect users with organizations to `/dashboard`

#### 5. **No Root Page Protection**
- **Problem**: Root `/` is marketing page, but authenticated users see it
- **Impact**: Authenticated users should go directly to dashboard
- **Should**: Redirect authenticated users from `/` to `/dashboard`

## Recommended Improvements

### 1. Add Middleware for Route Protection

**File**: `middleware.ts` (root level)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Get session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  // Protected routes (require authentication)
  const protectedRoutes = ['/dashboard', '/onboarding']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Auth routes (should redirect if authenticated)
  const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if user is authenticated
  const isAuthenticated = !!sessionCookie
  
  // If accessing protected route without auth, redirect to sign-in
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // If accessing auth route while authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If accessing root while authenticated, redirect to dashboard
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2. Enhance `requireOrganization()` with Session Check

**File**: `lib/ssr-data.ts`

```typescript
export async function requireOrganization() {
  const { redirect } = await import("next/navigation")
  const client = getEncoreClient()

  try {
    // First check if user is authenticated
    const sessionResult = await client.auth.getSession()
    if (!sessionResult.session || !sessionResult.user) {
      redirect("/sign-in?redirect=/dashboard")
    }

    // Then check for organization
    const orgsResult = await client.auth.listOrganizations()
    const organizations = orgsResult.organizations || []

    if (organizations.length === 0) {
      redirect("/onboarding")
    }
  } catch (error) {
    // Handle redirect errors
    if (error && typeof error === "object" && "digest" in error) {
      const digest = (error as { digest?: string }).digest
      if (digest?.startsWith("NEXT_REDIRECT")) {
        throw error
      }
    }
    
    // Check if it's an auth error
    if (error instanceof Error && 
        (error.message.includes("unauthenticated") || 
         error.message.includes("Unauthorized"))) {
      redirect("/sign-in?redirect=/dashboard")
    }
    
    // Default to onboarding
    redirect("/onboarding")
  }
}
```

### 3. Add Onboarding Protection

**File**: `app/(onboarding)/onboarding/page.tsx`

Add at the top of the component (if server component) or in a useEffect (if client component):

```typescript
// In server component
export default async function OnboardingPage() {
  const client = getEncoreClient()
  
  try {
    const orgsResult = await client.auth.listOrganizations()
    const organizations = orgsResult.organizations || []
    
    // If user already has organization, redirect to dashboard
    if (organizations.length > 0) {
      redirect("/dashboard")
    }
  } catch (error) {
    // If not authenticated, redirect to sign-in
    if (error instanceof Error && error.message.includes("unauthenticated")) {
      redirect("/sign-in?redirect=/onboarding")
    }
  }
  
  // ... rest of component
}
```

### 4. Add Root Page Protection

**File**: `app/page.tsx`

```typescript
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("better-auth.session_token")
  
  // If authenticated, redirect to dashboard
  if (sessionToken) {
    redirect("/dashboard")
  }
  
  // Otherwise show marketing page
  return (
    // ... existing marketing page content
  )
}
```

## Route Protection Matrix

| Route | Unauthenticated | Authenticated (No Org) | Authenticated (Has Org) |
|-------|----------------|----------------------|------------------------|
| `/` | ✅ Marketing Page | ❌ → `/dashboard` | ❌ → `/dashboard` |
| `/sign-in` | ✅ Access | ❌ → `/dashboard` | ❌ → `/dashboard` |
| `/sign-up` | ✅ Access | ❌ → `/dashboard` | ❌ → `/dashboard` |
| `/onboarding` | ❌ → `/sign-in` | ✅ Access | ❌ → `/dashboard` |
| `/dashboard/*` | ❌ → `/sign-in` | ❌ → `/onboarding` | ✅ Access |
| `/privacy` | ✅ Access | ✅ Access | ✅ Access |
| `/terms` | ✅ Access | ✅ Access | ✅ Access |

## Implementation Priority

1. **High Priority**:
   - ✅ Add middleware.ts for basic route protection
   - ✅ Add session check in `requireOrganization()`
   - ✅ Protect onboarding from users with organizations

2. **Medium Priority**:
   - ✅ Redirect authenticated users from auth pages
   - ✅ Redirect authenticated users from root page

3. **Low Priority**:
   - ✅ Add loading states during redirects
   - ✅ Add return URL support for redirects

## Testing Checklist

- [ ] Unauthenticated user tries to access `/dashboard` → redirects to `/sign-in`
- [ ] Authenticated user (no org) tries to access `/dashboard` → redirects to `/onboarding`
- [ ] Authenticated user (has org) tries to access `/onboarding` → redirects to `/dashboard`
- [ ] Authenticated user tries to access `/sign-in` → redirects to `/dashboard`
- [ ] Authenticated user visits `/` → redirects to `/dashboard`
- [ ] Unauthenticated user can access `/sign-in`, `/sign-up`, `/privacy`, `/terms`
- [ ] All redirects preserve query parameters where appropriate
