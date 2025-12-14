# TypeScript Errors Found

**Date:** 2024-12-19  
**Command:** `pnpm check-types`

## Summary

Total TypeScript errors found: **100+ errors**

## Why These Don't Show at Build Time?

**By default, Next.js ignores TypeScript errors during build** to allow faster development. This is why:
- `next dev` - Runs without type checking
- `next build` - By default ignores TypeScript errors

**Solution:** I've updated `next.config.ts` to enable type checking:
```typescript
typescript: {
  ignoreBuildErrors: false,
}
```

Now `next build` will fail if there are TypeScript errors.

## Main Error Categories

### 1. **Import/Export Errors** (Critical)
- `useActiveOrganization` - Fixed ✅
- `useNotifications` hooks - Missing exports
- Duplicate exports in `actions/index.ts`

### 2. **Type Mismatches** (High Priority)
- `Campaign[]` vs `CampaignWithStats[]`
- `OrganizationResponse[]` vs `Organization[]`
- `SessionResponse` missing properties
- `Invoice` type mismatches

### 3. **Missing Properties** (High Priority)
- `handleServerAuthError` - Not imported
- `ProductFormInput` - Not defined
- `control` - Not defined in products
- `user` - Not defined in settings

### 4. **Null/Undefined Checks** (Medium Priority)
- Many `possibly 'null'` errors in invoices
- `Date | undefined` not handled
- Array access without null checks

### 5. **API/Backend Mismatches** (High Priority)
- `cancelCampaign` - Doesn't exist in client
- `completeCampaign` - Doesn't exist
- `removeBankAccount` - Doesn't exist
- `revokeOtherSessions` - Wrong property name

## Recommended Fix Order

1. **Fix Import/Export Errors** (Blocks other fixes)
2. **Fix Missing Functions/Imports** (handleServerAuthError, etc.)
3. **Fix Type Mismatches** (API response types)
4. **Fix Null Checks** (Add proper null handling)
5. **Fix API Method Names** (Backend mismatch)

## Quick Fixes Needed

### 1. Add Missing Imports
```typescript
// actions/onboarding.ts
import { handleServerAuthError } from '@/lib/error-handler-server'
```

### 2. Fix Duplicate Exports
```typescript
// actions/index.ts - Remove duplicate exports
export * from './settings' // Remove this if already exported
```

### 3. Fix Missing Hooks
```typescript
// hooks/use-notifications.ts - Add missing exports
export function useNotifications() { ... }
export function useUnreadNotificationCount() { ... }
```

## Next Steps

1. Run `pnpm check-types` before committing
2. Fix errors in priority order
3. Consider adding pre-commit hook for type checking

---

**Note:** With `ignoreBuildErrors: false`, builds will now fail on TypeScript errors. This is good for catching issues early!
