# RSC + Server Actions: Standard Patterns

**Question:** "kya jina kuch client par abhi handle kar rhe, itna hi kuch rsc + server actions me standard tarike se hota hai?"

## 📚 Research Summary

Based on official Next.js 14/15 documentation and React 19 patterns, here's what should be handled where:

---

## 🎯 Standard Architecture

### 1. **Server Components (RSC)** - Default, No `'use client'`
**Purpose:** Initial data fetching, SEO, security

**✅ Should Handle:**
- **Data Fetching** - All initial data from APIs/databases
- **Server-side rendering** - HTML generation
- **Security** - API keys, tokens, secrets
- **Caching** - Server-side cache management

**❌ Cannot Handle:**
- Hooks (`useState`, `useEffect`, `useQuery`, etc.)
- Event handlers (`onClick`, `onSubmit`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Interactive UI

**Example:**
```typescript
// app/(dashboard)/dashboard/campaigns/page.tsx
import { getCampaignsData } from '@/lib/ssr-data'
import { CampaignsClient } from './campaigns-client'

export default async function CampaignsPage() {
  // ✅ Server-side data fetching
  const data = await getCampaignsData()
  
  // ✅ Pass to Client Component
  return <CampaignsClient initialData={data} />
}
```

---

### 2. **Client Components** - `'use client'` directive
**Purpose:** Interactivity, user interactions, form state

**✅ Should Handle:**
- **Form State** - React Hook Form (RHF) for form management
- **UI State** - `useState` for local UI state
- **Event Handlers** - `onClick`, `onSubmit`, `onChange`
- **Real-time Search** - Debounced search queries
- **Optimistic Updates** - `useOptimistic` hook
- **Pending States** - `useFormStatus`, `useActionState`

**❌ Should NOT Handle:**
- Initial data fetching (should come from Server Component)
- Server-side validation (should be in Server Actions)
- Direct API calls for initial data

**Example:**
```typescript
// app/(dashboard)/dashboard/campaigns/campaigns-client.tsx
'use client'

import { useFormState } from 'react-dom'
import { createCampaign } from '@/app/actions/campaigns'

export function CampaignsClient({ initialData }) {
  // ✅ Use server data (passed from parent)
  const campaigns = initialData.campaigns
  
  // ✅ Form state for mutations
  const [state, formAction] = useFormState(createCampaign, { errors: {} })
  
  return (
    <form action={formAction}>
      {/* Form fields */}
    </form>
  )
}
```

---

### 3. **Server Actions** - `'use server'` directive
**Purpose:** Mutations, validation, server-side operations

**✅ Should Handle:**
- **All Mutations** - Create, Update, Delete operations
- **Server-side Validation** - Zod schema validation
- **Database Operations** - Direct database/API calls
- **Cache Revalidation** - `revalidatePath`, `revalidateTag`
- **Redirects** - `redirect()` after mutations
- **Error Handling** - Return error states to client

**Example:**
```typescript
// app/actions/campaigns.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getEncoreClient } from '@/lib/encore'

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  productId: z.string().min(1, 'Product is required'),
})

export async function createCampaign(
  prevState: any,
  formData: FormData
) {
  // ✅ Server-side validation
  const rawData = {
    title: formData.get('title'),
    productId: formData.get('productId'),
  }
  
  const validation = campaignSchema.safeParse(rawData)
  
  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
    }
  }
  
  // ✅ Database operation
  const client = getEncoreClient()
  const campaign = await client.campaigns.createCampaign(validation.data)
  
  // ✅ Cache revalidation
  revalidatePath('/dashboard/campaigns')
  
  return { success: true, campaign }
}
```

---

## 🔄 Standard Data Flow Patterns

### Pattern 1: Initial Data Fetching (RSC → Client)

```
Server Component (Page)
  ↓ fetches data on server
  ↓ passes as props
Client Component
  ↓ uses initialData
  ↓ displays UI
```

**Example:**
```typescript
// 1. Server Component
export default async function CampaignsPage() {
  const data = await getCampaignsData() // ✅ Server fetch
  return <CampaignsClient initialData={data} />
}

// 2. Client Component
'use client'
export function CampaignsClient({ initialData }) {
  // ✅ Use server data (no client-side fetch needed)
  const campaigns = initialData.campaigns
  return <div>{/* Render campaigns */}</div>
}
```

---

### Pattern 2: Form Submission (Client → Server Action)

```
Client Component (Form)
  ↓ user submits form
  ↓ calls Server Action
Server Action
  ↓ validates (Zod)
  ↓ mutates data
  ↓ revalidates cache
  ↓ returns result
Client Component
  ↓ shows success/error
```

**Example:**
```typescript
// 1. Client Component
'use client'
import { useActionState } from 'react'
import { createCampaign } from '@/app/actions/campaigns'

export function CreateCampaignForm() {
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

// 2. Server Action
'use server'
export async function createCampaign(prevState, formData) {
  // ✅ Validation, mutation, revalidation
}
```

---

### Pattern 3: React Hook Form + Server Actions

**For complex forms with multi-step validation:**

```typescript
// Client Component
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
import { createCampaign } from '@/app/actions/campaigns'

export function CampaignForm() {
  // ✅ RHF for client-side form management
  const form = useForm({
    resolver: zodResolver(campaignSchema),
  })
  
  // ✅ Server Action for submission
  const [state, formAction, pending] = useActionState(
    createCampaign,
    { errors: {} }
  )
  
  const onSubmit = async (data) => {
    // Convert RHF data to FormData
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    // Call server action
    await formAction(formData)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* RHF fields */}
    </form>
  )
}
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Fetching Initial Data in Client Component

```typescript
// ❌ WRONG
'use client'
export function CampaignsClient() {
  const { data } = useQuery({ queryKey: ['campaigns'] }) // ❌ Client fetch
  return <div>{/* ... */}</div>
}

// ✅ CORRECT
// Server Component
export default async function CampaignsPage() {
  const data = await getCampaignsData() // ✅ Server fetch
  return <CampaignsClient initialData={data} />
}

// Client Component
'use client'
export function CampaignsClient({ initialData }) {
  const campaigns = initialData.campaigns // ✅ Use server data
  return <div>{/* ... */}</div>
}
```

---

### ❌ Mistake 2: Client-side Validation Only

```typescript
// ❌ WRONG - Only client validation
'use client'
export function Form() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // ❌ Only client validation
    if (!title) {
      setError('Title required')
      return
    }
    // Submit...
  }
}

// ✅ CORRECT - Server validation with Zod
'use server'
export async function createCampaign(prevState, formData) {
  const validation = schema.safeParse({
    title: formData.get('title'),
  })
  
  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors }
  }
  
  // Proceed with mutation...
}
```

---

### ❌ Mistake 3: Using Hooks in Server Components

```typescript
// ❌ WRONG
export default async function Page() {
  const { data } = useQuery(...) // ❌ Cannot use hooks in Server Component
  return <div>{/* ... */}</div>
}

// ✅ CORRECT
export default async function Page() {
  const data = await getData() // ✅ Direct async fetch
  return <div>{/* ... */}</div>
}
```

---

## 📋 Current Codebase Analysis

### ✅ What's Already Correct:

1. **Dashboard Pages** - Using RSC pattern ✅
   - `dashboard/page.tsx` → `getDashboardData()` → `DashboardClient`
   - `campaigns/page.tsx` → `getCampaignsData()` → `CampaignsClient`
   - `products/page.tsx` → `getProductsData()` → `ProductsClient`

2. **Server Actions** - Properly structured ✅
   - All in `app/actions/` directory
   - Using `'use server'` directive
   - Validation with Zod
   - Cache revalidation

3. **Forms** - Using RHF + Zod ✅
   - Onboarding form: RHF + Zod + Server Action
   - Campaign form: RHF + Zod + Server Action (in progress)

---

### ⚠️ What Needs Improvement:

1. **Campaign Create Page** - Still fetching products in client
   ```typescript
   // ❌ Current (line 55)
   const { data: productsData } = useProducts() // Client fetch
   
   // ✅ Should be:
   // In page.tsx (Server Component)
   export default async function CreateCampaignPage() {
     const products = await getProductsData()
     return <CreateCampaignClient initialProducts={products} />
   }
   ```

2. **Real-time Search** - Can stay client-side ✅
   - Search queries are fine to be client-side
   - But initial data should come from server

---

## 🎯 Recommended Patterns

### For Data Fetching:

| Type | Where | How |
|------|-------|-----|
| **Initial Data** | Server Component | `await getData()` |
| **Real-time Search** | Client Component | `useQuery` with debounce |
| **Optimistic Updates** | Client Component | `useOptimistic` hook |
| **Cache Invalidation** | Server Action | `revalidatePath()` |

### For Forms:

| Type | Where | How |
|------|-------|-----|
| **Form State** | Client Component | React Hook Form (RHF) |
| **Client Validation** | Client Component | RHF + Zod (for UX) |
| **Server Validation** | Server Action | Zod schema (required) |
| **Submission** | Server Action | `'use server'` function |
| **Error Display** | Client Component | `useActionState` / `useFormState` |

---

## 📖 Key Takeaways

1. **Server Components (RSC)** = Initial data fetching, SEO, security
2. **Client Components** = Interactivity, form state, UI updates
3. **Server Actions** = Mutations, validation, database operations

**Rule of Thumb:**
- ✅ **Fetch on server, display on client**
- ✅ **Validate on server, manage on client**
- ✅ **Mutate on server, update UI on client**

---

## 🔗 References

- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [React useActionState](https://react.dev/reference/react/useActionState)
- [Zod Validation](https://zod.dev/)


