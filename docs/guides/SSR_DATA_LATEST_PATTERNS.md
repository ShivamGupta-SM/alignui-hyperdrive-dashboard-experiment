# SSR Data Fetching - Latest Next.js 15/16 Patterns (2024-2025)

## 🔍 Research Summary

Based on latest Next.js 15/16 documentation and community best practices (as of Dec 2024/Jan 2025):

---

## ✅ Current Implementation Status

**Your pattern: Centralized utilities (`lib/ssr-data.ts`)**

### What You're Doing Right ✅

1. **Server-side fetching** ✅
   - All functions are `async` and run on server
   - Uses Encore client (server-only)
   - No client-side initial data fetching

2. **Parallel fetching** ✅
   ```typescript
   const [wallet, withdrawals, transactions] = await Promise.all([...])
   ```

3. **Route-level revalidation** ✅
   ```typescript
   export const revalidate = 60 // In page.tsx
   ```

4. **Code organization** ✅
   - Centralized, reusable, testable

---

## 🆕 Latest Next.js 15/16 Patterns

### Pattern 1: Direct Fetch in Server Component (Recommended by Docs)

**Next.js 15/16 docs now recommend this as the primary pattern:**

```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  // ✅ Direct fetch in component
  const data = await client.organizations.getDashboardOverview(orgId, { days: 7 })
  
  return <DashboardClient initialData={data} />
}
```

**Pros:**
- ✅ Simpler, less abstraction
- ✅ Colocated with component
- ✅ Easier to see what data is fetched
- ✅ Better for streaming with Suspense

**Cons:**
- ❌ Code duplication if same data needed in multiple places
- ❌ Harder to test in isolation

---

### Pattern 2: Centralized Utilities (Your Current Pattern)

**Still valid, but considered "traditional" approach:**

```typescript
// lib/ssr-data.ts
export async function getDashboardData() { ... }

// app/(dashboard)/dashboard/page.tsx
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
- ⚠️ Slight abstraction layer
- ⚠️ Not the "latest" recommended pattern (but still valid)

---

## 🚀 Next.js 16 New Features

### 1. `"use cache"` Directive (Next.js 16)

**Explicit caching at component/function level:**

```typescript
// Option 1: Component-level caching
'use cache'

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductList products={products} />
}

// Option 2: Function-level caching with tags
import { cacheTag, cacheLife } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheTag('products')
  cacheLife('hours') // seconds, minutes, hours, days, weeks, max
  return await db.products.findMany()
}
```

**Cache Variants:**
- `'use cache'` - Standard caching
- `'use cache: remote'` - For caching after calling runtime APIs
- `'use cache: private'` - For user-specific cached data

**⚠️ Note:** Requires `cacheComponents: true` in `next.config.js`

---

### 2. Enhanced Caching APIs (Next.js 16)

```typescript
import { revalidateTag, updateTag } from 'next/cache'

// Background revalidation (stale-while-revalidate)
revalidateTag('products')

// Immediate invalidation (Server Actions only)
updateTag('products')
```

---

### 3. `unstable_cache` (Next.js 15+)

**For expensive operations:**

```typescript
import { unstable_cache } from 'next/cache'

export const getDashboardData = unstable_cache(
  async () => {
    const client = getEncoreClient()
    const orgId = await getOrganizationId()
    return await client.organizations.getDashboardOverview(orgId, { days: 7 })
  },
  ['dashboard-data'], // Cache key
  { 
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['dashboard'] // For tag-based invalidation
  }
)
```

---

## 📊 Comparison: Latest vs Your Current Pattern

| Aspect | Latest Pattern (Direct Fetch) | Your Pattern (Centralized) |
|--------|-------------------------------|---------------------------|
| **Simplicity** | ✅ Simpler | ⚠️ More abstraction |
| **Code Reuse** | ❌ Duplication risk | ✅ Reusable |
| **Testing** | ⚠️ Harder to test | ✅ Easier to test |
| **Streaming** | ✅ Better with Suspense | ⚠️ Works but less optimal |
| **Next.js Docs** | ✅ Recommended | ⚠️ Valid but not primary |
| **Maintainability** | ⚠️ Colocated | ✅ Centralized |

---

## 🎯 Recommendations

### Option A: Keep Current Pattern (Valid ✅)

**If you prefer code organization and reusability:**

1. **Add `unstable_cache` for expensive operations:**
   ```typescript
   // lib/ssr-data.ts
   import { unstable_cache } from 'next/cache'
   
   export const getDashboardData = unstable_cache(
     async () => {
       const client = getEncoreClient()
       const orgId = await getOrganizationId()
       return await client.organizations.getDashboardOverview(orgId, { days: 7 })
     },
     ['dashboard-data'],
     { revalidate: 60, tags: ['dashboard'] }
   )
   ```

2. **Add Suspense boundaries:**
   ```typescript
   // app/(dashboard)/dashboard/loading.tsx
   export default function DashboardLoading() {
     return <DashboardSkeleton />
   }
   ```

3. **Use cache tags for invalidation:**
   ```typescript
   // In Server Actions
   import { revalidateTag } from 'next/cache'
   
   export async function updateCampaign() {
     // ... update logic
     revalidateTag('campaigns')
   }
   ```

---

### Option B: Migrate to Direct Fetch (Latest Pattern 🆕)

**If you want to follow latest Next.js recommendations:**

1. **Move data fetching to Server Components:**
   ```typescript
   // app/(dashboard)/dashboard/page.tsx
   export default async function DashboardPage() {
     const client = getEncoreClient()
     const orgId = await getOrganizationId()
     const data = await client.organizations.getDashboardOverview(orgId, { days: 7 })
     return <DashboardClient initialData={data} />
   }
   ```

2. **Keep utilities for shared logic:**
   ```typescript
   // lib/ssr-data.ts - Keep only shared helpers
   export async function getOrganizationId() { ... }
   ```

3. **Use `"use cache"` for static data:**
   ```typescript
   'use cache'
   export default async function ProductsPage() {
     const products = await getProducts()
     return <ProductList products={products} />
   }
   ```

---

## ✅ Conclusion

### Your Current Pattern:
- ✅ **Valid and follows best practices**
- ✅ **Well-organized and maintainable**
- ⚠️ **Not the "latest" recommended pattern, but still acceptable**

### Latest Pattern (Direct Fetch):
- ✅ **Recommended by Next.js 15/16 docs**
- ✅ **Better for streaming and Suspense**
- ⚠️ **May lead to code duplication**

### Recommendation:
**Keep your current pattern** if:
- You value code reusability
- You have multiple components needing same data
- You prefer centralized testing

**Consider migrating** if:
- You want to follow latest Next.js recommendations
- You want better streaming support
- You're starting fresh

### Hybrid Approach (Best of Both):
- Use **direct fetch** for page-specific data
- Keep **centralized utilities** for shared/complex logic
- Add **`unstable_cache`** for expensive operations
- Use **`"use cache"`** for static data (Next.js 16)

---

## 📚 References

- [Next.js 15 Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
- [Next.js 16 Cache Components](https://nextjs.org/docs/app/building-your-application/caching)
- [React Server Components](https://react.dev/reference/rsc/server-components)


