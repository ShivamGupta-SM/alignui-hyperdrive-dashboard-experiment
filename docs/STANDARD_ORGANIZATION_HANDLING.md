# Standard Organization State Handling

## Problem
Previously, we were doing patchwork by:
- Passing `hasOrganization` prop to every component
- Duplicating onboarding alert logic on every page
- Checking `null` and organization state everywhere
- Inconsistent error handling

## Solution: Centralized State Management

### 1. `useOrganizationContext` Hook
Single source of truth for organization state:

```tsx
import { useOrganizationContext } from "@/contexts/organization-context"

function MyComponent() {
  const { organization, organizationId, hasOrganization, isLoading } = useOrganizationContext()
  
  // No prop drilling needed!
  if (!hasOrganization) {
    // Handle no org state
  }
}
```

### 2. `OrganizationGuard` Component
Standard wrapper for pages that require organization:

```tsx
import { OrganizationGuard } from "@/components/dashboard/organization-guard"

export default function MyPage() {
  return (
    <OrganizationGuard message="Custom message here">
      <MyPageContent />
    </OrganizationGuard>
  )
}
```

**Features:**
- ✅ Automatic organization state checking
- ✅ Standard onboarding alert
- ✅ Loading states
- ✅ Empty states
- ✅ No prop drilling

### 3. Migration Pattern

**Before (Patchwork):**
```tsx
// page.tsx
const orgId = await getOrganizationIdOrNull()
const hasOrganization = !!orgId
return <Client hasOrganization={hasOrganization} />

// client.tsx
if (!hasOrganization) {
  return <OnboardingAlert /> // Duplicated everywhere
}
```

**After (Standard):**
```tsx
// page.tsx
return (
  <OrganizationGuard>
    <Client />
  </OrganizationGuard>
)

// client.tsx
// No organization checks needed - guard handles it!
```

## Benefits

1. **No Prop Drilling** - State managed centrally
2. **Consistent UX** - Same alert/empty state everywhere
3. **Less Code** - Remove duplicate logic
4. **Type Safe** - React Query handles types
5. **Cached** - Organization state cached automatically
6. **Reactive** - Updates when organization changes

## Migration Checklist

- [ ] Replace `hasOrganization` props with `OrganizationGuard`
- [ ] Remove duplicate onboarding alert code
- [ ] Use `useOrganization` hook instead of props
- [ ] Remove `getOrganizationIdOrNull` checks from client components
- [ ] Keep server-side checks for conditional data fetching only


