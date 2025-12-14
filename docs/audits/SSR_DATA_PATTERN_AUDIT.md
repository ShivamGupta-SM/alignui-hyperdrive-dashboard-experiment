# SSR Data Pattern Audit

## Current Implementation

**File:** `lib/ssr-data.ts`

### Pattern Used
Centralized data fetching utilities that are called from Server Components.

```typescript
// lib/ssr-data.ts
export async function getDashboardData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  const response = await client.organizations.getDashboardOverview(orgId, { days: 7 })
  return response
}

// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient initialData={data} />
}
```

## ✅ Is This Standard Practice?

**YES, this is a valid and standard pattern!** However, there are some considerations:

### ✅ What's Good

1. **Server-side fetching** ✅
   - All functions are `async` and run on the server
   - Uses Encore client (server-side only)
   - No client-side data fetching for initial load

2. **Code organization** ✅
   - Centralized utilities reduce duplication
   - Easy to maintain and test
   - Clear separation of concerns

3. **Parallel fetching** ✅
   - Uses `Promise.all()` for parallel requests (e.g., `getWalletData`, `getCampaignDetailData`)
   - Optimizes performance

4. **Error handling** ✅
   - Uses `.catch()` for optional data
   - Graceful fallbacks

### ⚠️ Areas for Improvement

1. **Missing cache configuration**
   - Next.js 15/16 allows explicit cache control
   - Currently relies on default behavior
   - Should add `cache` or `revalidate` options where appropriate

2. **Hardcoded fallback in `getOrganizationId()`**
   ```typescript
   return cookieStore.get(ACTIVE_ORG_COOKIE)?.value || '1' // ⚠️ Hardcoded fallback
   ```
   - Should throw error or handle missing org ID properly

3. **No explicit error boundaries**
   - Errors are caught but not always handled consistently
   - Should use Next.js error boundaries

4. **Missing Suspense boundaries**
   - No `loading.tsx` files for progressive rendering
   - Could improve UX with Suspense

## 📊 Comparison with Next.js Standard Patterns

### Pattern A: Direct Fetch in Component (Next.js Docs Example)
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  const data = await client.organizations.getDashboardOverview(orgId, { days: 7 })
  return <DashboardClient initialData={data} />
}
```

**Pros:**
- Simpler, less abstraction
- Colocated with component
- Easier to see what data is fetched

**Cons:**
- Code duplication if same data needed in multiple places
- Harder to test in isolation

### Pattern B: Centralized Utilities (Current Pattern)
```typescript
// lib/ssr-data.ts
export async function getDashboardData() { ... }

// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient initialData={data} />
}
```

**Pros:**
- ✅ Reusable across components
- ✅ Easier to test
- ✅ Better code organization
- ✅ Consistent data transformation

**Cons:**
- Slight abstraction layer
- Need to maintain separate file

## 🎯 Recommendation

**Your current pattern is VALID and follows best practices!** Both patterns are acceptable in Next.js 15/16.

### Recommended Improvements

1. **Add explicit cache configuration** (Next.js 15/16 feature)
   ```typescript
   export async function getDashboardData() {
     const client = getEncoreClient()
     const orgId = await getOrganizationId()
     
     // For dynamic data, use no-store
     const response = await client.organizations.getDashboardOverview(orgId, { days: 7 })
     return response
   }
   
   // In page.tsx, add revalidate
   export const revalidate = 60 // Revalidate every 60 seconds
   ```

2. **Improve error handling in `getOrganizationId()`**
   ```typescript
   async function getOrganizationId(): Promise<string> {
     const cookieStore = await cookies()
     const orgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value
     
     if (!orgId) {
       // Redirect to organization selection or throw error
       throw new Error('Organization ID not found')
     }
     
     return orgId
   }
   ```

3. **Add loading states with Suspense**
   ```typescript
   // app/(dashboard)/dashboard/loading.tsx
   export default function DashboardLoading() {
     return <DashboardSkeleton />
   }
   ```

4. **Consider adding `unstable_cache` for expensive operations** (Next.js 15+)
   ```typescript
   import { unstable_cache } from 'next/cache'
   
   export const getDashboardData = unstable_cache(
     async () => {
       // ... fetch logic
     },
     ['dashboard-data'],
     { revalidate: 60 }
   )
   ```

## ✅ Conclusion

**Your SSR data pattern is standard and follows Next.js best practices!**

The centralized utility pattern is:
- ✅ Valid for code organization
- ✅ Maintainable and testable
- ✅ Consistent with Next.js RSC patterns
- ✅ Allows for code reuse

**Minor improvements:**
- Add explicit cache/revalidate configuration
- Improve error handling
- Add Suspense boundaries for better UX

The pattern itself is **not a deviation** from Next.js standards. Both direct fetching and centralized utilities are acceptable patterns.

---

## 📖 See Also

For latest Next.js 15/16 patterns and recommendations, see:
- [`docs/SSR_DATA_LATEST_PATTERNS.md`](./SSR_DATA_LATEST_PATTERNS.md) - Latest patterns research (2024-2025)


