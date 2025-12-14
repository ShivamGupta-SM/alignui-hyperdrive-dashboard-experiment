# Next.js Route Protection - Complete Guide

## Overview

Next.js mein route protection ke **3 layers** hote hain:

1. **Middleware** (First line of defense) - Request se pehle check
2. **Server Components** (Second layer) - Page render se pehle check
3. **Client Components** (UX layer) - UI hide/show ke liye

## 🛡️ Layer 1: Middleware (Recommended)

**File**: `middleware.ts` (project root)

### Why Middleware?

- ✅ **Fastest** - Edge runtime, runs before page load
- ✅ **Centralized** - Ek jagah se sab routes protect
- ✅ **Early redirect** - Unauthenticated users ko pehle hi redirect
- ✅ **No page render** - Protected pages render hi nahi hote

### Implementation

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const sessionCookie = request.cookies.get("better-auth.session_token")
  const isAuthenticated = !!sessionCookie?.value

  // Protected routes
  const protectedRoutes = ["/dashboard", "/onboarding"]
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Auth routes (redirect if authenticated)
  const authRoutes = ["/sign-in", "/sign-up"]
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

### Matcher Configuration

**Important**: Matcher se static files exclude karo for performance:

```typescript
export const config = {
  matcher: [
    // Match all except:
    // - api routes
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - Static assets (images, fonts, etc.)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

## 🔒 Layer 2: Server Components

**File**: `app/(dashboard)/dashboard/page.tsx`

### Why Server Components?

- ✅ **Server-side validation** - Database queries, API calls
- ✅ **Organization checks** - User ke pass organization hai ya nahi
- ✅ **Data fetching** - Protected data fetch karo

### Implementation

```typescript
// app/(dashboard)/dashboard/page.tsx
import { getDashboardData, requireOrganization } from "@/lib/ssr-data"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  // CRITICAL: Access cookies FIRST (Next.js 16 requirement)
  const cookieStore = await cookies()
  cookieStore.toString()

  try {
    // Check organization (middleware already checked auth)
    await requireOrganization()
    
    // Fetch protected data
    const data = await getDashboardData()
    
    return <DashboardClient initialData={data} />
  } catch (error) {
    // Handle redirect errors
    if (error && typeof error === "object" && "digest" in error) {
      const digest = (error as { digest?: string }).digest
      if (digest?.startsWith("NEXT_REDIRECT")) {
        throw error // Re-throw redirect
      }
    }
    throw error
  }
}
```

### requireOrganization() Function

```typescript
// lib/ssr-data.ts
export async function requireOrganization() {
  const { redirect } = await import("next/navigation")
  const cookieStore = await cookies()
  cookieStore.toString()
  
  const client = getEncoreClient()

  try {
    // Check session (fallback - middleware should handle this)
    const sessionResult = await client.auth.getSession()
    if (!sessionResult.session) {
      redirect("/sign-in?redirect=/dashboard")
    }

    // Check organization
    const orgsResult = await client.auth.listOrganizations()
    if (orgsResult.organizations.length === 0) {
      redirect("/onboarding")
    }
  } catch (error) {
    // Handle auth errors
    if (error instanceof Error && error.message.includes("unauthenticated")) {
      redirect("/sign-in?redirect=/dashboard")
    }
    redirect("/onboarding")
  }
}
```

## 🎨 Layer 3: Client Components (UX Only)

**File**: `components/dashboard/dashboard-shell.tsx`

### Why Client Components?

- ✅ **Better UX** - Loading states, conditional rendering
- ✅ **Client-side checks** - UI hide/show
- ⚠️ **NOT for security** - Can be bypassed

### Implementation

```typescript
"use client"

import { useSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"

export function DashboardShell({ children }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  // Show loading while checking session
  if (isPending) {
    return <LoadingSpinner />
  }

  // Redirect if no session (UX only - middleware handles security)
  if (!session) {
    router.push("/sign-in")
    return null
  }

  // Show dashboard
  return <div>{children}</div>
}
```

## 📊 Protection Matrix

| Route Type | Middleware | Server Component | Client Component |
|------------|-----------|-----------------|------------------|
| **Protected** (`/dashboard/*`) | ✅ Check auth | ✅ Check org | ✅ Show/hide UI |
| **Auth** (`/sign-in`) | ✅ Redirect if auth | ❌ Not needed | ✅ Form handling |
| **Public** (`/`, `/privacy`) | ❌ Allow all | ❌ Not needed | ❌ Not needed |
| **Onboarding** (`/onboarding`) | ✅ Check auth | ✅ Check org exists | ✅ Form handling |

## 🔐 Security Best Practices

### 1. **Defense in Depth**

```typescript
// ✅ GOOD: Multiple layers
// Middleware → Server Component → Client Component

// ❌ BAD: Only client-side
if (!user) return <Login />
```

### 2. **Never Trust Client-Side**

```typescript
// ❌ BAD: Client-side only check
"use client"
if (!session) {
  return <Login />
}

// ✅ GOOD: Server-side check
export default async function Page() {
  await requireAuth()
  return <Content />
}
```

### 3. **Use HTTP-Only Cookies**

```typescript
// ✅ GOOD: HTTP-only cookie (XSS safe)
cookieStore.set("session_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
})

// ❌ BAD: localStorage (XSS vulnerable)
localStorage.setItem("token", token)
```

### 4. **Handle Redirects Properly**

```typescript
// ✅ GOOD: Preserve intended destination
const signInUrl = new URL("/sign-in", request.url)
signInUrl.searchParams.set("redirect", pathname)
return NextResponse.redirect(signInUrl)

// ❌ BAD: Always redirect to /dashboard
return NextResponse.redirect("/dashboard")
```

## 🚀 Complete Example

### File Structure

```
app/
├── middleware.ts              # Layer 1: Middleware
├── (dashboard)/
│   └── dashboard/
│       └── page.tsx           # Layer 2: Server Component
└── (auth)/
    └── sign-in/
        └── page.tsx           # Public route

lib/
└── ssr-data.ts                # requireOrganization() helper
```

### Flow Diagram

```
User Request
    ↓
Middleware (middleware.ts)
    ├─ No session? → Redirect to /sign-in
    ├─ Has session + auth route? → Redirect to /dashboard
    └─ Has session + protected route? → Continue
        ↓
Server Component (page.tsx)
    ├─ requireOrganization()
    │   ├─ No session? → Redirect to /sign-in
    │   └─ No org? → Redirect to /onboarding
    └─ Fetch data
        ↓
Client Component
    └─ Render UI (with loading states)
```

## ⚠️ Common Mistakes

### 1. **Forgetting Matcher**

```typescript
// ❌ BAD: Runs on ALL requests (slow)
export const config = {
  matcher: "/:path*",
}

// ✅ GOOD: Excludes static files
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### 2. **Heavy Operations in Middleware**

```typescript
// ❌ BAD: Database query in middleware
export async function middleware(request: NextRequest) {
  const user = await db.user.findFirst() // Too slow!
}

// ✅ GOOD: Cookie check only
export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session_token")
}
```

### 3. **Not Handling Redirect Errors**

```typescript
// ❌ BAD: Catching redirect errors
try {
  redirect("/onboarding")
} catch (error) {
  // This catches redirect() error!
}

// ✅ GOOD: Re-throw redirect errors
try {
  await requireOrganization()
} catch (error) {
  if (error.digest?.startsWith("NEXT_REDIRECT")) {
    throw error // Re-throw
  }
}
```

## 📝 Summary

1. **Middleware** - Fast, centralized, early redirect
2. **Server Components** - Organization checks, data fetching
3. **Client Components** - UX only, not for security

**Remember**: Security server-side honi chahiye, client-side sirf UX ke liye!
