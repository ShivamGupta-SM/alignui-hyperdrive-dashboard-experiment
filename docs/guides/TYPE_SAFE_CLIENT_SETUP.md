# Type-Safe Encore Client Setup

This document describes the type-safe setup for working with the Encore generated client.

## Overview

The codebase now uses a fully type-safe approach for:
- ✅ API calls with proper TypeScript types
- ✅ Error handling with `APIError` type checking
- ✅ Consistent error responses
- ✅ Type-safe utilities for error extraction

## File Structure

```
lib/
├── encore-client.ts          # Generated Encore client (DO NOT EDIT)
├── encore.ts                  # Server-side client wrapper
├── encore-browser.ts          # Browser-side client wrapper
├── encore-error-handler.ts    # Type-safe error handling utilities
└── encore-types.ts            # Type exports for convenience
```

## Usage

### 1. Import Client

```typescript
// Server-side (Server Components, Server Actions)
import { getEncoreClient } from "@/lib/encore"

// Browser-side (Client Components)
import { getEncoreBrowserClient } from "@/lib/encore-browser"
```

### 2. Make API Calls

```typescript
// Type-safe API call
const client = getEncoreClient()
const result = await client.auth.signInEmail({
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
})

// result is fully typed based on the endpoint
// TypeScript will autocomplete and type-check everything
```

### 3. Handle Errors Type-Safely

```typescript
import { handleAPIError, getErrorDetails } from "@/lib/encore-error-handler"

try {
  const result = await client.auth.signInEmail({ ... })
  return { success: true, data: result }
} catch (error: unknown) {
  // Type-safe error handling
  const errorDetails = getErrorDetails(error)
  console.error("Error:", errorDetails)
  
  // Return consistent error format
  return handleAPIError(error)
}
```

### 4. Check Error Types

```typescript
import {
  isAuthenticationError,
  isNotFoundError,
  isValidationError,
  extractErrorMessage,
} from "@/lib/encore-error-handler"

try {
  await client.organizations.getOrganization(orgId)
} catch (error: unknown) {
  if (isAuthenticationError(error)) {
    // Handle 401 errors
    redirect("/sign-in")
  } else if (isNotFoundError(error)) {
    // Handle 404 errors
    return { error: "Organization not found" }
  } else if (isValidationError(error)) {
    // Handle 400 errors
    return { error: extractErrorMessage(error) }
  }
  
  // Generic error handling
  return handleAPIError(error)
}
```

## Error Handling Utilities

### `handleAPIError(error: unknown)`

Returns a consistent error format:
```typescript
{
  success: false
  error: string
  code?: ErrCode
  status?: number
}
```

### `getErrorDetails(error: unknown)`

Returns detailed error information:
```typescript
{
  message: string
  code?: ErrCode
  status?: number
  details?: any
  isAPIError: boolean
}
```

### `extractErrorMessage(error: unknown)`

Safely extracts error message from any error type.

### `isAuthenticationError(error: unknown)`

Checks if error is a 401/unauthenticated error.

### `isNotFoundError(error: unknown)`

Checks if error is a 404/not_found error.

### `isValidationError(error: unknown)`

Checks if error is a 400/invalid_argument error.

## Type Exports

All types are available from `@/lib/encore-types`:

```typescript
import type {
  auth,
  organizations,
  campaigns,
  // ... all other namespaces
} from "@/lib/encore-types"
```

## Regenerating Client

When backend API changes:

```bash
# In backend directory
cd "Hypedrive Encore"
encore gen client --lang=typescript

# Copy to frontend
Copy-Item "generated-client.ts" -Destination "..\Hypedrive Brand\lib\encore-client.ts" -Force
```

## Best Practices

1. **Always use `unknown` for error types** - Never use `any`
   ```typescript
   // ✅ Good
   catch (error: unknown)
   
   // ❌ Bad
   catch (error: any)
   ```

2. **Use type-safe error handlers** - Don't manually check error properties
   ```typescript
   // ✅ Good
   return handleAPIError(error)
   
   // ❌ Bad
   return { error: error?.message || "Unknown error" }
   ```

3. **Import from centralized locations** - Use `@/lib/encore` for client, `@/lib/encore-error-handler` for errors
   ```typescript
   // ✅ Good
   import { getEncoreClient, handleAPIError } from "@/lib/encore"
   
   // ❌ Bad
   import Client from "@/lib/encore-client"
   ```

4. **Use type guards** - Check error types before accessing properties
   ```typescript
   // ✅ Good
   if (isAPIError(error)) {
     console.log(error.status, error.code)
   }
   
   // ❌ Bad
   console.log(error.status) // TypeScript error!
   ```

## Migration Guide

### Before (Non-Type-Safe)

```typescript
try {
  const result = await client.auth.signInEmail({ ... })
  return { success: true, data: result }
} catch (error: any) {
  return {
    success: false,
    error: error?.message || "Unknown error",
  }
}
```

### After (Type-Safe)

```typescript
import { handleAPIError } from "@/lib/encore-error-handler"

try {
  const result = await client.auth.signInEmail({ ... })
  return { success: true, data: result }
} catch (error: unknown) {
  return handleAPIError(error)
}
```

## Benefits

1. **Type Safety** - TypeScript catches errors at compile time
2. **Consistency** - All errors follow the same format
3. **Maintainability** - Centralized error handling logic
4. **Developer Experience** - Autocomplete and type checking
5. **Error Details** - Proper error codes and status codes preserved

