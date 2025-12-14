# Mocking Setup - Complete Guide

## Overview

The mocking setup has been **perfected** to work seamlessly with:
- ✅ **Encore Client** (server-side and browser-side)
- ✅ **Server Actions** (Next.js 16)
- ✅ **React Server Components (RSC)**
- ✅ **All API endpoints** used by the application

## What Was Fixed

### 1. Auth Endpoints (Better Auth)

Added missing Better Auth endpoints:

- ✅ `POST /auth/organization/create` - Create organization
- ✅ `POST /auth/organization/set-active` - Set active organization
- ✅ `GET /auth/organization/list` - List user's organizations
- ✅ `GET /auth/get-session` - Get current session (used by `client.auth.me()`)

**File**: `mocks/handlers/auth.ts`

### 2. Organization Endpoints

Added missing organization management endpoints:

- ✅ `POST /organizations/:id/verify-gst` - Verify GST number
- ✅ `POST /organizations/:id/verify-pan` - Verify PAN number
- ✅ `POST /organizations/:id/submit-for-approval` - Submit for approval
- ✅ `GET /organizations/:id/gst` - Get GST details
- ✅ `PATCH /organizations/:id` - Update organization (corrected from PUT)
- ✅ `PUT /organizations/:id` - Legacy support (redirects to PATCH)

**File**: `mocks/handlers/organizations.ts`

### 3. Database Schema Updates

Added missing fields to `OrganizationSettingsSchema`:

- ✅ `gstVerified: boolean` - GST verification status
- ✅ `panVerified: boolean` - PAN verification status
- ✅ `approvalStatus: "draft" | "pending" | "approved" | "rejected"` - Approval status
- ✅ `industryCategory: string` - Industry category
- ✅ `contactPerson: string` - Contact person name
- ✅ `postalCode: string` - Postal code
- ✅ `country: string` - Country code
- ✅ `cinNumber: string` - CIN number
- ✅ `description: string` - Organization description

**File**: `mocks/db/schemas.ts`

## Endpoint Mapping

### Server Actions → Mock Handlers

| Server Action | Encore Client Method | Mock Endpoint | Handler File |
|--------------|---------------------|---------------|--------------|
| `submitOnboarding` | `client.auth.createOrganization` | `POST /auth/organization/create` | `auth.ts` |
| `submitOnboarding` | `client.auth.setActiveOrganization` | `POST /auth/organization/set-active` | `auth.ts` |
| `submitOnboarding` | `client.organizations.updateOrganization` | `PATCH /organizations/:id` | `organizations.ts` |
| `submitOnboarding` | `client.organizations.verifyGST` | `POST /organizations/:id/verify-gst` | `organizations.ts` |
| `submitOnboarding` | `client.organizations.verifyPAN` | `POST /organizations/:id/verify-pan` | `organizations.ts` |
| `submitOnboarding` | `client.organizations.submitOrganizationForApproval` | `POST /organizations/:id/submit-for-approval` | `organizations.ts` |
| `verifyGST` | `client.organizations.verifyGST` | `POST /organizations/:id/verify-gst` | `organizations.ts` |
| `verifyPAN` | `client.organizations.verifyPAN` | `POST /organizations/:id/verify-pan` | `organizations.ts` |
| `getOrganizationId` | `client.auth.me()` | `GET /auth/get-session` | `auth.ts` |
| `getOrganizationId` | `client.auth.listOrganizations` | `GET /auth/organization/list` | `auth.ts` |
| `requireOrganization` | `client.auth.listOrganizations` | `GET /auth/organization/list` | `auth.ts` |
| `getDashboardData` | `client.organizations.getDashboardOverview` | `GET /organizations/:id/dashboard` | `dashboard.ts` |
| `getGSTDetails` | `client.organizations.getGSTDetails` | `GET /organizations/:id/gst` | `organizations.ts` |

## How It Works

### 1. Server-Side Mocking (RSC + Server Actions)

```typescript
// lib/ssr-data.ts
import { getEncoreClient } from "@/lib/encore"

// Early MSW initialization
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  import("@/lib/init-mocks-server").catch(() => {})
}

// Server Actions use Encore client
export async function submitOnboarding(formData) {
  const client = getEncoreClient() // Uses MSW server worker
  await client.auth.createOrganization({ name: formData.name })
  // ✅ MSW intercepts this fetch call
}
```

### 2. Browser-Side Mocking (Client Components)

```typescript
// hooks/use-dashboard.ts
import { getEncoreBrowserClient } from "@/lib/encore-browser"

export function useDashboard() {
  const client = getEncoreBrowserClient() // Uses MSW browser worker
  return useQuery({
    queryFn: () => client.organizations.getDashboardOverview(orgId)
    // ✅ MSW intercepts this fetch call
  })
}
```

### 3. MSW Initialization

**Server-side** (`lib/init-mocks-server.ts`):
- Initializes MSW server worker early
- Intercepts `fetch` in Node.js environment
- Works with RSC and Server Actions

**Browser-side** (`components/msw-init.tsx`):
- Initializes MSW browser worker on mount
- Intercepts `fetch` in browser
- Works with client components and React Query

## Testing

### Enable Mocking

Set environment variable:
```bash
NEXT_PUBLIC_API_MOCKING=enabled
```

### Verify Mocking is Working

1. Check browser console for `[MSW] Mocking enabled`
2. Check server logs for `[MSW] Server mocking enabled`
3. Network tab should show requests to `localhost:4000` (mocked)

### Test Onboarding Flow

1. Navigate to `/onboarding`
2. Fill form and submit
3. Check that:
   - ✅ Organization is created
   - ✅ GST verification works
   - ✅ PAN verification works
   - ✅ Submission for approval works
   - ✅ Redirect to `/onboarding/pending` works

## Troubleshooting

### Issue: "Unhandled request" warnings

**Solution**: Add missing handler in `mocks/handlers/`

### Issue: Server Actions not using mocks

**Solution**: 
1. Ensure `lib/init-mocks-server.ts` is imported early
2. Check `NEXT_PUBLIC_API_MOCKING=enabled`
3. Restart dev server

### Issue: Type errors in handlers

**Solution**: Use typed response helpers from `mocks/handlers/utils.ts`:
- `encoreResponse<T>(data)`
- `encoreErrorResponse(message, status)`
- `encoreNotFoundResponse(entity)`

## Files Modified

1. ✅ `mocks/handlers/auth.ts` - Added Better Auth endpoints
2. ✅ `mocks/handlers/organizations.ts` - Added organization endpoints
3. ✅ `mocks/db/schemas.ts` - Added missing schema fields
4. ✅ `mocks/handlers/dashboard.ts` - Updated to handle query params

## Next Steps

- ✅ All server actions are now fully mocked
- ✅ All RSC data fetching is mocked
- ✅ All client-side queries are mocked
- ✅ Ready for development and testing

## Summary

The mocking setup is now **complete and perfect**! All Encore client methods used by server actions and RSC are properly mocked with correct endpoint paths, request/response types, and database integration.
