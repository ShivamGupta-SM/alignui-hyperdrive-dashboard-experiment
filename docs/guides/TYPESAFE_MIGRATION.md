# Type-Safe Migration Guide

## Current Status

✅ **Completed:**
- `app/actions/auth.ts` - All `error: any` → `error: unknown` + `handleAPIError`

⏳ **Remaining:**
- `app/actions/onboarding.ts` - 5 instances
- `app/actions/wallet.ts` - 3 instances  
- `app/actions/settings.ts` - 16 instances
- `app/actions/team.ts` - 2 instances
- `app/actions/organizations.ts` - 2 instances
- `app/actions/enrollments.ts` - 2 instances
- `app/actions/invoices.ts` - 2 instances
- `app/actions/campaigns.ts` - 8 instances
- Components - `as any` casts (need proper Encore types)

## Migration Pattern

### Before (Not Type-Safe)
```typescript
try {
  const result = await client.organizations.getOrganization(id)
  return { success: true, data: result }
} catch (error: any) {
  return {
    success: false,
    error: error.message || "Unknown error",
  }
}
```

### After (Type-Safe)
```typescript
import { handleAPIError } from "@/lib/encore"

try {
  const result = await client.organizations.getOrganization(id)
  return { success: true, data: result }
} catch (error: unknown) {
  return handleAPIError(error)
}
```

## Quick Fix Script

Run this to find all remaining `error: any`:

```bash
grep -r "catch.*error.*any" app/actions
```

## Step-by-Step Migration

1. **Import handleAPIError**
   ```typescript
   import { handleAPIError } from "@/lib/encore"
   ```

2. **Replace catch blocks**
   ```typescript
   // Before
   catch (error: any) {
     return { success: false, error: error.message || "..." }
   }
   
   // After
   catch (error: unknown) {
     return handleAPIError(error)
   }
   ```

3. **Special cases** - If you need additional fields:
   ```typescript
   catch (error: unknown) {
     return {
       ...handleAPIError(error),
       valid: false, // or other fields
     }
   }
   ```

## Component Type Safety

For components using `as any`, import proper types:

```typescript
// Before
const data = initialData as any

// After
import type { organizations } from "@/lib/encore-client"
const data = initialData as organizations.DashboardOverviewResponse
```

## Benefits

1. **Type Safety** - TypeScript catches errors at compile time
2. **Consistency** - All errors follow same format
3. **Better DX** - Autocomplete and type checking
4. **Maintainability** - Centralized error handling

