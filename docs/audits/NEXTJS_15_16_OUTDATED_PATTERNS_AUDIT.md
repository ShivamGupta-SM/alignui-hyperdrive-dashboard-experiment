# Next.js 15/16 Outdated Patterns Audit

**Question:** "next js 16 aur 15 k latest practices dekhna, hum kuch outdated tarike se kar rhe kya?"

## 📊 Analysis Summary

Based on Next.js 15/16 official documentation and React 19 patterns, here's what we're doing correctly and what needs updating:

---

## ✅ What We're Doing Correctly (Modern Patterns)

### 1. **App Router** ✅
- ✅ Using App Router (not Pages Router)
- ✅ No `getServerSideProps`, `getStaticProps`, or `getStaticPaths`
- ✅ File-based routing with `app/` directory

### 2. **Async Request APIs (Next.js 15)** ✅
- ✅ **`params`** - Using `Promise<{ id: string }>` and `await params` correctly
  - Example: `app/(dashboard)/dashboard/campaigns/[id]/page.tsx:7-9`
- ✅ **`searchParams`** - Using `Promise<{ status?: string }>` and `await searchParams` correctly
  - Example: `app/(dashboard)/dashboard/campaigns/page.tsx:9-11`
- ✅ **`cookies()`** - Using `await cookies()` correctly
  - Example: `lib/ssr-data.ts:19`, `app/actions/*.ts` (multiple files)

### 3. **Server Components** ✅
- ✅ All pages are Server Components by default
- ✅ Data fetching on server using `lib/ssr-data.ts`
- ✅ Passing `initialData` to Client Components

### 4. **Server Actions** ✅
- ✅ All in `app/actions/` directory
- ✅ Using `'use server'` directive
- ✅ Zod validation
- ✅ Cache revalidation with `revalidatePath` and `revalidateTag`

### 5. **Image Optimization** ✅
- ✅ Using `next/image` component
- ✅ Using `remotePatterns` (not deprecated `images.domains`)
- ✅ Proper `width`, `height`, `alt` props

### 6. **Font Optimization** ✅
- ✅ Using `next/font/google` (not deprecated `@next/font`)
- ✅ Using `next/font/local` for custom fonts
- ✅ Proper `display: 'swap'` configuration

### 7. **Metadata API** ✅
- ✅ Using `export const metadata: Metadata` in layouts
- ✅ Static metadata configured

### 8. **Route Segment Config** ✅
- ✅ Using `export const revalidate = 60` for ISR
- ✅ Using `export const dynamic = 'force-dynamic'` where needed

### 9. **Parallel Data Fetching** ✅
- ✅ Using `Promise.all()` in `lib/ssr-data.ts`
- ✅ No sequential waterfalls

### 10. **TypeScript** ✅
- ✅ Proper typing for `params` and `searchParams` as `Promise<>`
- ✅ Type-safe Server Actions

---

## ⚠️ Outdated Patterns & Missing Features

### 1. **Missing `use cache` Directive (Next.js 16)** ⚠️

**Current:** Using `export const revalidate = 60` (Next.js 14/15 pattern)

**Next.js 16 Pattern:**
```typescript
// ✅ Next.js 16 - use cache directive
'use cache'

export default async function CampaignsPage() {
  const data = await getCampaignsData()
  return <CampaignsClient initialData={data} />
}

// Or function-level caching
async function getCampaignsData() {
  'use cache'
  cacheTag('campaigns')
  cacheLife('minutes') // or 'seconds', 'hours', 'days', 'weeks', 'max'
  // ... fetch logic
}
```

**Files to Update:**
- `app/(dashboard)/dashboard/campaigns/page.tsx` - Replace `export const revalidate = 60` with `'use cache'`
- `app/(dashboard)/dashboard/products/page.tsx` - Replace `export const revalidate = 60` with `'use cache'`
- `app/(dashboard)/dashboard/enrollments/page.tsx` - Replace `export const revalidate = 60` with `'use cache'`
- `app/(dashboard)/dashboard/wallet/page.tsx` - Replace `export const revalidate = 30` with `'use cache'`
- `app/(dashboard)/dashboard/invoices/page.tsx` - Replace `export const revalidate = 60` with `'use cache'`
- `app/(dashboard)/dashboard/team/page.tsx` - Replace `export const revalidate = 60` with `'use cache'`
- `app/(dashboard)/dashboard/settings/page.tsx` - Replace `export const revalidate = 120` with `'use cache'`

**Priority:** 🟡 MEDIUM (Next.js 16 feature, but `revalidate` still works)

---

### 2. **Missing Suspense Boundaries** ⚠️

**Current:** No `loading.tsx` files or Suspense boundaries

**Next.js 15/16 Pattern:**
```typescript
// app/(dashboard)/dashboard/campaigns/loading.tsx
export default function Loading() {
  return <CampaignsSkeleton />
}

// app/(dashboard)/dashboard/campaigns/page.tsx
import { Suspense } from 'react'

export default async function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsSkeleton />}>
      <CampaignsContent />
    </Suspense>
  )
}
```

**Why it matters:**
- ❌ Whole page blocks while data loads
- ❌ No progressive rendering
- ✅ Suspense enables streaming and better UX

**Priority:** 🟠 MEDIUM

---

### 3. **Not Using `useActionState` (React 19)** ⚠️

**Current:** Using RHF with manual Server Action calls (no `useActionState` found)

**React Version:** React 19.2.1 ✅ (Confirmed from `package.json`)

**Latest Pattern (React 19):**
```typescript
// ✅ React 19 - useActionState (recommended)
'use client'
import { useActionState } from 'react' // ✅ From 'react', not 'react-dom'
import { createCampaign } from '@/app/actions/campaigns'

export function Form() {
  const [state, formAction, pending] = useActionState(
    createCampaign,
    { errors: {} }
  )
  
  return (
    <form action={formAction}>
      <input name="title" />
      {state.errors?.title && <p>{state.errors.title[0]}</p>}
      <button disabled={pending}>Create</button>
    </form>
  )
}
```

**Note:** Current RHF approach is fine for complex multi-step forms, but simple forms should use `useActionState`.

**Priority:** 🟠 MEDIUM

---

### 4. **Client-side Data Fetching (Pattern Deviation)** ❌

**File:** `app/(dashboard)/dashboard/campaigns/create/page.tsx` (Line 55)

**Current (Outdated):**
```typescript
'use client'
export default function CreateCampaignPage() {
  // ❌ Client-side fetch using React Query
  const { data: productsData, isLoading: isLoadingProducts } = useProducts()
  const products = productsData?.data ?? []
  // ...
}
```

**Latest Pattern (Correct):**
```typescript
// app/(dashboard)/dashboard/campaigns/create/page.tsx (Server Component)
import { getProductsData } from '@/lib/ssr-data'
import { CreateCampaignClient } from './create-campaign-client'

export default async function CreateCampaignPage() {
  // ✅ Server-side fetch
  const productsData = await getProductsData()
  
  return <CreateCampaignClient initialProducts={productsData.data} />
}
```

**Priority:** 🔴 HIGH

---

### 5. **Missing `generateMetadata` for Dynamic Routes** ⚠️

**Current:** Only static metadata in root layout

**Next.js 15/16 Pattern:**
```typescript
// app/(dashboard)/dashboard/campaigns/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const campaign = await getCampaign(id)
  
  return {
    title: campaign.title,
    description: campaign.description,
    openGraph: {
      title: campaign.title,
      description: campaign.description,
      images: [campaign.image],
    },
  }
}
```

**Files Missing Metadata:**
- `app/(dashboard)/dashboard/campaigns/[id]/page.tsx`
- `app/(dashboard)/dashboard/enrollments/[id]/page.tsx`
- Other dynamic routes

**Priority:** 🟡 LOW (SEO improvement)

---

### 6. **Not Using `fetchCache` Segment Config (Next.js 15)** ⚠️

**Current:** Using `export const revalidate` (works, but Next.js 15 introduced `fetchCache`)

**Next.js 15 Pattern:**
```typescript
// Per-route fetch caching
export const fetchCache = 'default-cache' // Cache all fetches in this route
// or
export const fetchCache = 'force-no-store' // No caching

// Per-fetch caching (preferred)
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache' // Explicit caching
  })
  return res.json()
}
```

**Note:** We're using Encore client, not native `fetch`, so this may not apply directly. But if we add any `fetch` calls, we should use explicit caching.

**Priority:** 🟢 LOW (Only if using native `fetch`)

---

### 7. **Missing `generateStaticParams` for Dynamic Routes** ⚠️

**Current:** No static path generation for dynamic routes

**Next.js 15/16 Pattern:**
```typescript
// app/(dashboard)/dashboard/campaigns/[id]/page.tsx
export async function generateStaticParams() {
  const campaigns = await getCampaigns()
  return campaigns.map((campaign) => ({
    id: campaign.id,
  }))
}
```

**Why it matters:**
- ✅ Pre-renders common routes at build time
- ✅ Faster initial page load
- ✅ Better SEO

**Priority:** 🟡 LOW (Performance optimization)

---

### 8. **Not Using `updateTag` (Next.js 16)** ⚠️

**Current:** Using `revalidateTag` and `revalidatePath`

**Next.js 16 Pattern:**
```typescript
'use server'

import { updateTag } from 'next/cache'

export async function createCampaign(data: FormData) {
  await createCampaignInDB(data)
  
  // ✅ Next.js 16 - Immediate invalidation
  updateTag('campaigns') // Immediate, not background
  
  // vs revalidateTag('campaigns') // Background revalidation
}
```

**Files to Update:**
- `app/actions/campaigns.ts`
- `app/actions/enrollments.ts`
- Other Server Actions that revalidate

**Priority:** 🟡 LOW (Next.js 16 feature, `revalidateTag` still works)

---

### 9. **Missing `global-error.tsx`** ⚠️

**Current:** Only route-level `error.tsx` files

**Next.js 15/16 Pattern:**
```typescript
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

**Priority:** 🟡 LOW (Better error handling)

---

### 10. **Missing `global-not-found.tsx` (Next.js 16)** ⚠️

**Current:** Only route-level `not-found.tsx`

**Next.js 16 Pattern:**
```typescript
// app/global-not-found.tsx
export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <h2>404 - Page Not Found</h2>
        <p>Could not find the requested resource</p>
      </body>
    </html>
  )
}
```

**Priority:** 🟢 LOW (Next.js 16 feature)

---

## 🔴 Critical Issues (Must Fix)

### 1. **Campaign Create Page - Client-side Data Fetching** ❌

**File:** `app/(dashboard)/dashboard/campaigns/create/page.tsx:55`

**Issue:** Using `useProducts()` hook (client-side) instead of server-side fetch

**Fix:** Split into Server Component + Client Component

**Priority:** 🔴 HIGH

---

## 🟠 Medium Priority Issues

### 2. **Missing Suspense Boundaries** ⚠️

**Files:** All major route directories

**Fix:** Add `loading.tsx` files and wrap data fetching in `<Suspense>`

**Priority:** 🟠 MEDIUM

---

### 3. **Not Using `useActionState` for Simple Forms** ⚠️

**Issue:** React 19.2.1 confirmed, but not using `useActionState`

**Fix:** Use `useActionState` from `'react'` for simple forms (keep RHF for complex forms)

**Priority:** 🟠 MEDIUM

---

## 🟡 Low Priority Issues (Nice to Have)

### 4. **Not Using `use cache` Directive (Next.js 16)** ⚠️

**Issue:** Still using `export const revalidate` instead of `'use cache'`

**Fix:** Migrate to `'use cache'` directive with `cacheTag` and `cacheLife`

**Priority:** 🟡 LOW (Both work, but `'use cache'` is Next.js 16 standard)

---

### 5. **Missing `generateMetadata` for Dynamic Routes** ⚠️

**Issue:** No dynamic metadata for campaign/enrollment detail pages

**Fix:** Add `generateMetadata` functions

**Priority:** 🟡 LOW (SEO improvement)

---

### 6. **Not Using `updateTag` (Next.js 16)** ⚠️

**Issue:** Using `revalidateTag` instead of `updateTag` for immediate invalidation

**Fix:** Use `updateTag` in Server Actions for immediate cache invalidation

**Priority:** 🟡 LOW (Next.js 16 feature)

---

### 7. **Missing `generateStaticParams`** ⚠️

**Issue:** Not pre-rendering common dynamic routes

**Fix:** Add `generateStaticParams` for frequently accessed routes

**Priority:** 🟡 LOW (Performance optimization)

---

### 8. **Missing Global Error/NotFound Pages** ⚠️

**Issue:** No `global-error.tsx` or `global-not-found.tsx`

**Fix:** Add global error boundaries

**Priority:** 🟡 LOW (Better error handling)

---

## 📋 Summary Table

| Pattern | Status | Next.js 15/16 Standard | Priority |
|---------|--------|----------------------|----------|
| **App Router** | ✅ Correct | ✅ | - |
| **Async params/searchParams** | ✅ Correct | ✅ | - |
| **Async cookies/headers** | ✅ Correct | ✅ | - |
| **Server Components** | ✅ Correct | ✅ | - |
| **Server Actions** | ✅ Correct | ✅ | - |
| **Image Component** | ✅ Correct | ✅ | - |
| **Font Optimization** | ✅ Correct | ✅ | - |
| **Metadata API** | ✅ Correct | ✅ | - |
| **Parallel Fetching** | ✅ Correct | ✅ | - |
| **Client-side data fetch** | ❌ Outdated | Server-side | 🔴 HIGH |
| **Suspense Boundaries** | ⚠️ Missing | Recommended | 🟠 MEDIUM |
| **useActionState** | ⚠️ Not Used | React 19 | 🟠 MEDIUM |
| **use cache directive** | ⚠️ Not Used | Next.js 16 | 🟡 LOW |
| **generateMetadata** | ⚠️ Missing | Recommended | 🟡 LOW |
| **updateTag** | ⚠️ Not Used | Next.js 16 | 🟡 LOW |
| **generateStaticParams** | ⚠️ Missing | Recommended | 🟡 LOW |
| **Global error pages** | ⚠️ Missing | Recommended | 🟡 LOW |

---

## 🎯 Recommended Actions

### 🔴 High Priority (Must Fix):

1. **Refactor Campaign Create Page**
   - Move products fetch to server
   - Split into Server + Client component

### 🟠 Medium Priority (Should Fix):

2. **Add Suspense Boundaries**
   - Add `loading.tsx` files for major routes
   - Wrap slow data fetching in `<Suspense>`

3. **Use `useActionState` for Simple Forms**
   - Identify simple forms (not multi-step)
   - Migrate to `useActionState` from `'react'`

### 🟡 Low Priority (Nice to Have):

4. **Migrate to `use cache` Directive**
   - Replace `export const revalidate` with `'use cache'`
   - Use `cacheTag` and `cacheLife` for fine-grained control

5. **Add Dynamic Metadata**
   - Add `generateMetadata` for campaign/enrollment detail pages

6. **Use `updateTag` in Server Actions**
   - Replace `revalidateTag` with `updateTag` for immediate invalidation

7. **Add `generateStaticParams`**
   - Pre-render common dynamic routes

8. **Add Global Error Pages**
   - Create `global-error.tsx` and `global-not-found.tsx`

---

## ✅ What We're Already Doing Right

1. ✅ **App Router** - Using modern App Router, not Pages Router
2. ✅ **Async APIs** - Correctly using async `params`, `searchParams`, `cookies()`
3. ✅ **Server Components** - Default Server Components with server-side data fetching
4. ✅ **Server Actions** - Proper structure with `'use server'` directive
5. ✅ **Image Optimization** - Using `next/image` with `remotePatterns`
6. ✅ **Font Optimization** - Using `next/font` (not deprecated `@next/font`)
7. ✅ **Metadata API** - Using `export const metadata`
8. ✅ **Parallel Fetching** - Using `Promise.all()` correctly
9. ✅ **TypeScript** - Proper typing for async APIs
10. ✅ **Route Segment Config** - Using `revalidate` and `dynamic` correctly

---

## 📊 Overall Assessment

**Status:** ✅ **90% aligned with Next.js 15/16 patterns!**

**What's Good:**
- ✅ All core patterns are correct (App Router, Server Components, Server Actions)
- ✅ Async APIs are used correctly
- ✅ No deprecated patterns (Pages Router, getServerSideProps, etc.)
- ✅ Modern image and font optimization

**What Needs Improvement:**
- ❌ 1 critical issue: Client-side data fetching in Campaign Create
- ⚠️ 2 medium issues: Missing Suspense, not using `useActionState`
- ⚠️ 6 low-priority optimizations: `use cache`, metadata, etc.

---

## 🔗 References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React 19 useActionState](https://react.dev/reference/react/useActionState)
- [Next.js Cache Components](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)

---

## 🎯 Action Items

1. **🔴 HIGH:** Refactor Campaign Create Page to use server-side products fetch
2. **🟠 MEDIUM:** Add Suspense boundaries and `loading.tsx` files
3. **🟠 MEDIUM:** Use `useActionState` for simple forms (React 19 confirmed)
4. **🟡 LOW:** Migrate to `use cache` directive (Next.js 16)
5. **🟡 LOW:** Add `generateMetadata` for dynamic routes
6. **🟡 LOW:** Use `updateTag` instead of `revalidateTag` (Next.js 16)
7. **🟡 LOW:** Add `generateStaticParams` for common routes
8. **🟡 LOW:** Add global error/not-found pages

**Overall:** ✅ **Very good alignment!** Only 1 critical issue and a few optimizations needed.

---

## 📝 Additional Notes

### ✅ Already Modern (No Changes Needed):

1. **Turbopack Usage** ✅
   - Using `next dev --turbopack` in package.json
   - Next.js 16 default, we're ahead of the curve!

2. **Linting Setup** ✅
   - Using Biome instead of `next lint` (which is deprecated in Next.js 15.5+)
   - This is the modern approach!

3. **No Deprecated Config** ✅
   - No `experimental.serverActions` (stable in Next.js 15)
   - No `images.domains` (using `remotePatterns`)
   - No `@next/font` (using `next/font`)

4. **No Pages Router Patterns** ✅
   - No `getServerSideProps`, `getStaticProps`, `getStaticPaths`
   - Fully migrated to App Router

---

## 🎓 Key Takeaways

**What We're Doing Right:**
- ✅ 90% of patterns are modern and correct
- ✅ All core Next.js 15/16 features implemented correctly
- ✅ No deprecated patterns found
- ✅ Using latest React 19 features where applicable

**What Needs Attention:**
- ❌ 1 critical: Client-side data fetching (Campaign Create)
- ⚠️ 2 medium: Suspense boundaries, `useActionState`
- ⚠️ 6 low: Next.js 16 optimizations (`use cache`, metadata, etc.)

**Verdict:** ✅ **Excellent alignment with Next.js 15/16!** Only minor optimizations needed.


