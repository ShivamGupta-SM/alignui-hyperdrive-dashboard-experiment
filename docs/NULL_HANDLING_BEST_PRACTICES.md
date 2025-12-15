# Null/Undefined Handling Best Practices

## Industry Standards (Based on Next.js 16 & React Query)

### 1. Use Context API Instead of Prop Drilling

**Problem:** Passing `hasOrganization` prop to every component
**Solution:** Use React Context API

```tsx
// ✅ GOOD: Context API
const { hasOrganization } = useOrganizationContext()

// ❌ BAD: Prop drilling
<Component hasOrganization={hasOrganization} />
```

**Reference:** [Next.js Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

### 2. React Query: Use Status Flags for Type Narrowing

**Problem:** `data` can be `undefined`, causing TypeScript errors
**Solution:** Use `isLoading`, `isError`, `isSuccess` flags

```tsx
// ✅ GOOD: Status flags
const query = useQuery({ queryKey: ['items'], queryFn: fetchItems })

if (query.isLoading) return <Loading />
if (query.isError) return <Error />
if (query.isSuccess) {
  // TypeScript knows data is defined here
  return <Items data={query.data} />
}

// ❌ BAD: Direct access
const { data } = useQuery(...)
return <Items data={data} /> // data might be undefined
```

**Reference:** [TanStack Query TypeScript Guide](https://tanstack.com/query/v5/docs/react/typescript)

### 3. Server Components: Handle Missing Data Gracefully

**Problem:** Server Component receives `null` data
**Solution:** Early return with fallback UI

```tsx
// ✅ GOOD: Early return
export default async function Page() {
  const data = await fetchData()
  
  if (!data) {
    return <EmptyState />
  }
  
  return <Content data={data} />
}

// ❌ BAD: Accessing properties on null
export default async function Page() {
  const data = await fetchData()
  return <Content data={data.name} /> // Error if data is null
}
```

**Reference:** [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### 4. Error Boundaries for Runtime Errors

**Problem:** Errors crash entire app
**Solution:** Use `error.tsx` files

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Reference:** [Next.js Error Boundaries](https://nextjs.org/docs/app/api-reference/file-conventions/error)

### 5. TypeScript: Enable Strict Null Checks

```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

This forces you to handle `null`/`undefined` explicitly.

### 6. Avoid Throwing null/undefined

```tsx
// ✅ GOOD
throw new Error('An unexpected error occurred')

// ❌ BAD
throw null
throw undefined
```

**Reference:** [Next.js Error Messages](https://nextjs.org/docs/messages/threw-undefined)

## Our Implementation

### Organization Context Pattern

```tsx
// ✅ Use Context (no prop drilling)
const { hasOrganization } = useOrganizationContext()

// ✅ Use Guard Component
<OrganizationGuard>
  <YourContent />
</OrganizationGuard>
```

### React Query Pattern

```tsx
// ✅ Use status flags
const query = useQuery(...)
if (query.isLoading) return <Loading />
if (query.isError) return <Error />
if (query.isSuccess) {
  // Safe to use query.data
}
```

### Server Component Pattern

```tsx
// ✅ Early return for null
export default async function Page() {
  const data = await fetchData()
  if (!data) return <EmptyState />
  return <Content data={data} />
}
```

## Migration Guide

1. Replace `hasOrganization` props with `useOrganizationContext()`
2. Replace direct `data` access with status flag checks
3. Add early returns for null data in Server Components
4. Use `OrganizationGuard` instead of manual checks
5. Enable `strictNullChecks` in TypeScript


