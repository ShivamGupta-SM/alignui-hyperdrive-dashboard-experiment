# Next.js 16 Patterns - Page, Server Actions, Hooks

**Question:** "page server action aur hook teeno use hoga ? next js 16 me? kisi ne bataya tha ki mutations ka hook use nahi hota server components me"

## ✅ Correct Understanding

**Yes, you're right!** Mutation hooks (`useMutation`) are **NOT used in Server Components**. Here's the correct pattern:

---

## 📊 Next.js 16 Architecture

### 1. **Page (Server Component)** ✅
- **Location:** `app/**/page.tsx`
- **Type:** Server Component (default, no `'use client'`)
- **Can use:**
  - ✅ Direct server-side data fetching
  - ✅ Server Actions (but only for initial data)
  - ❌ **NO hooks** (useQuery, useMutation, useState, etc.)
  - ❌ **NO event handlers** (onClick, onSubmit, etc.)

**Example:**
```typescript
// app/(dashboard)/dashboard/wallet/page.tsx
import { getWalletData } from '@/lib/ssr-data'
import { WalletClient } from './wallet-client'

export default async function WalletPage() {
  // ✅ Server-side data fetching (no hooks!)
  const data = await getWalletData()
  
  // ✅ Pass to Client Component
  return <WalletClient initialData={data} />
}
```

---

### 2. **Server Actions** ✅
- **Location:** `app/actions/**/*.ts`
- **Type:** Server-side functions (marked with `'use server'`)
- **Can be called from:**
  - ✅ Server Components (directly, for initial data)
  - ✅ Client Components (directly or via hooks)

**Example:**
```typescript
// app/actions/wallet.ts
'use server'

export async function requestCredit(data: { amount: number; reason: string }) {
  const client = getEncoreClient()
  // ... server-side logic
  revalidatePath('/dashboard/wallet')
  return { success: true }
}
```

---

### 3. **Hooks (Client Components Only)** ✅
- **Location:** `hooks/use-*.ts`
- **Type:** Client-side hooks (used in `'use client'` components)
- **Can use:**
  - ✅ `useQuery` - For data fetching (wraps Server Actions)
  - ✅ `useMutation` - For mutations (wraps Server Actions)
  - ✅ `useState`, `useEffect`, etc.

**Example:**
```typescript
// hooks/use-organizations.ts
'use client' // Not needed in hook file, but used in Client Components

import { useMutation } from '@tanstack/react-query'
import { switchOrganization as switchOrganizationAction } from '@/app/actions/organizations'

export function useSwitchOrganization() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      // ✅ Calls Server Action from Client Component
      return await switchOrganizationAction(organizationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
```

---

## 🎯 Correct Pattern Flow

### Pattern 1: Server Component → Client Component → Hook → Server Action

```
Page (Server Component)
  ↓ fetches initial data
Client Component ('use client')
  ↓ uses hook
Hook (useMutation/useQuery)
  ↓ calls
Server Action ('use server')
```

**Example:**
```typescript
// 1. Page (Server Component)
// app/(dashboard)/dashboard/wallet/page.tsx
export default async function WalletPage() {
  const data = await getWalletData() // Server-side fetch
  return <WalletClient initialData={data} />
}

// 2. Client Component
// app/(dashboard)/dashboard/wallet/wallet-client.tsx
'use client'
export function WalletClient({ initialData }) {
  // ✅ Can use hooks here
  const handleRequestCredit = async () => {
    const { requestCredit } = await import('@/app/actions/wallet')
    await requestCredit({ amount: 50000, reason: 'Need more credit' })
  }
  
  // OR use hook
  // const mutation = useRequestCredit()
  // mutation.mutate({ amount: 50000, reason: '...' })
}

// 3. Server Action
// app/actions/wallet.ts
'use server'
export async function requestCredit(data) {
  // Server-side logic
}
```

---

### Pattern 2: Direct Server Action Call (No Hook)

**For simple mutations without optimistic updates:**

```typescript
// Client Component
'use client'
export function SimpleForm() {
  const handleSubmit = async () => {
    // ✅ Direct Server Action call (no hook needed)
    const { createPost } = await import('@/app/actions/posts')
    await createPost({ title: '...', content: '...' })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### Pattern 3: Hook with Server Action (Recommended for Complex Mutations)

**For mutations needing optimistic updates, error handling, cache invalidation:**

```typescript
// Hook
// hooks/use-organizations.ts
export function useSwitchOrganization() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      return await switchOrganizationAction(organizationId)
    },
    // ✅ Optimistic updates
    onMutate: async (orgId) => {
      // Update UI instantly
    },
    // ✅ Error rollback
    onError: (err, orgId, context) => {
      // Rollback on error
    },
    // ✅ Cache invalidation
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

// Client Component
'use client'
export function OrganizationSwitcher() {
  const switchOrg = useSwitchOrganization() // ✅ Hook in Client Component
  
  return (
    <button onClick={() => switchOrg.mutate(orgId)}>
      Switch Organization
    </button>
  )
}
```

---

## ❌ What Does NOT Work

### ❌ Mutation Hook in Server Component

```typescript
// ❌ WRONG - Server Component cannot use hooks
// app/(dashboard)/dashboard/wallet/page.tsx
export default async function WalletPage() {
  const mutation = useRequestCredit() // ❌ ERROR: Cannot use hooks in Server Component
  
  return <div>...</div>
}
```

**Error:** `useRequestCredit` is a hook and can only be used in Client Components.

---

### ❌ Direct Server Action in Server Component (for mutations)

```typescript
// ❌ WRONG - Server Components can't handle user interactions
// app/(dashboard)/dashboard/wallet/page.tsx
export default async function WalletPage() {
  // ❌ No onClick, onSubmit, etc. in Server Components
  return (
    <button onClick={() => requestCredit()}> // ❌ ERROR
      Request Credit
    </button>
  )
}
```

**Solution:** Use Client Component for interactive elements.

---

## ✅ Current Implementation in Our Codebase

### ✅ Correct Pattern (What We're Doing):

1. **Page (Server Component):**
   ```typescript
   // app/(dashboard)/dashboard/wallet/page.tsx
   export default async function WalletPage() {
     const data = await getWalletData() // ✅ Server-side fetch
     return <WalletClient initialData={data} />
   }
   ```

2. **Client Component:**
   ```typescript
   // app/(dashboard)/dashboard/wallet/wallet-client.tsx
   'use client'
   export function WalletClient({ initialData }) {
     // ✅ Direct Server Action call (simple case)
     const handleRequestCredit = async () => {
       const { requestCredit } = await import('@/app/actions/wallet')
       await requestCredit({ amount, reason })
     }
     
     return <button onClick={handleRequestCredit}>Request Credit</button>
   }
   ```

3. **Server Action:**
   ```typescript
   // app/actions/wallet.ts
   'use server'
   export async function requestCredit(data) {
     // ✅ Server-side mutation
   }
   ```

---

### ✅ Alternative Pattern (For Complex Mutations):

1. **Hook (Client-side):**
   ```typescript
   // hooks/use-organizations.ts
   export function useSwitchOrganization() {
     return useMutation({
       mutationFn: switchOrganizationAction, // ✅ Wraps Server Action
       onSuccess: () => queryClient.invalidateQueries(),
     })
   }
   ```

2. **Client Component:**
   ```typescript
   // components/organization-switcher.tsx
   'use client'
   export function OrganizationSwitcher() {
     const switchOrg = useSwitchOrganization() // ✅ Hook in Client Component
     return <button onClick={() => switchOrg.mutate(orgId)}>Switch</button>
   }
   ```

---

## 📋 Summary

| Component Type | Can Use Hooks? | Can Use Server Actions? | Use Case |
|---------------|----------------|------------------------|----------|
| **Server Component** (Page) | ❌ NO | ✅ YES (initial data only) | Initial data fetching |
| **Client Component** | ✅ YES | ✅ YES | Interactive UI, mutations |
| **Server Action** | ❌ NO | ❌ NO (self-contained) | Server-side mutations |

### When to Use What:

1. **Page (Server Component):**
   - ✅ Initial data fetching
   - ✅ SEO-friendly content
   - ❌ No hooks, no event handlers

2. **Server Action:**
   - ✅ All mutations (create, update, delete)
   - ✅ Server-side validation
   - ✅ Database operations

3. **Hook (useMutation):**
   - ✅ Complex mutations needing optimistic updates
   - ✅ Cache invalidation
   - ✅ Error handling with rollback
   - ❌ **ONLY in Client Components**

4. **Direct Server Action Call:**
   - ✅ Simple mutations (no optimistic updates needed)
   - ✅ Form submissions
   - ✅ **ONLY in Client Components**

---

## 🎯 Key Takeaway

**Mutation hooks (`useMutation`) are NOT used in Server Components!**

- ✅ **Server Components** → Fetch initial data, pass to Client Components
- ✅ **Client Components** → Use hooks (`useMutation`, `useQuery`) or call Server Actions directly
- ✅ **Server Actions** → Handle all mutations (called from Client Components)

**Your understanding is correct!** 🎯
