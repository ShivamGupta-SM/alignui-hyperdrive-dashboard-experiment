# Custom `me` Endpoint - Not Better Auth

**Important:** The `me` endpoint is a **custom Encore endpoint**, not from Better Auth!

## Custom Endpoint Details

### Location
- **Backend:** `Hypedrive Encore/auth/auth.ts` (line 272-301)
- **Path:** `GET /auth/me`
- **Type:** Custom Encore API endpoint

### Implementation
```typescript
// Hypedrive Encore/auth/auth.ts
export const me = api(
  { expose: true, auth: true, method: "GET", path: "/auth/me" },
  async (): Promise<MeResponse> => {
    const { getAuthData } = await import("~encore/auth");
    const authData = getAuthData()!;

    // Fetch name and image for frontend display
    const [userData] = await orm
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, authData.userID))
      .limit(1);

    return {
      userID: authData.userID,
      email: authData.email,
      name: userData?.name || "",
      image: userData?.image || undefined,
      emailVerified: authData.emailVerified,
      role: authData.role,
      activeOrganizationId: authData.activeOrganizationId, // ← Custom field
      organizationRole: authData.organizationRole,        // ← Custom field
      organizationIds: authData.organizationIds,           // ← Custom field
      shopperId: authData.shopperId,                      // ← Custom field
      adminId: authData.adminId,                          // ← Custom field
      isImpersonating: authData.isImpersonating,           // ← Custom field
      impersonatedBy: authData.impersonatedBy,            // ← Custom field
    };
  }
);
```

## MeResponse Structure

```typescript
export interface MeResponse {
  userID: string              // ← Note: userID, not id
  email: string
  name: string
  image?: string
  emailVerified: boolean
  role: string
  activeOrganizationId?: string  // ← Custom field (not in Better Auth)
  organizationRole?: string       // ← Custom field
  organizationIds?: string[]      // ← Custom field
  shopperId?: string             // ← Custom field
  adminId?: string               // ← Custom field
  isImpersonating?: boolean      // ← Custom field
  impersonatedBy?: string        // ← Custom field
}
```

## Better Auth vs Custom Endpoint

### Better Auth Endpoints
- `getSession()` → `GET /auth/get-session` → Returns `{ session, user }`
- User object has `id` field (not `userID`)
- No `activeOrganizationId` in user object

### Custom Encore Endpoint
- `me()` → `GET /auth/me` → Returns `MeResponse`
- User object has `userID` field (not `id`)
- Includes `activeOrganizationId` and other custom fields

## Current Usage

### In `app/actions/auth.ts`:
```typescript
export async function getCurrentUser() {
  const client = getEncoreClient()
  const user = await client.auth.me()  // ← Custom endpoint
  return { success: true, user }
}
```

### In `hooks/use-session.ts`:
```typescript
const userResult = await getCurrentUser()  // ← Calls custom me endpoint
const userWithId = {
  ...userResult.user,
  id: userResult.user.userID,  // ← Map userID to id for Better Auth compatibility
}
```

## Why This Matters

1. **Custom Fields Available:**
   - `activeOrganizationId` - Available directly in `MeResponse`
   - `organizationRole` - Available directly
   - `shopperId`, `adminId` - Available directly

2. **Better Auth Compatibility:**
   - We map `userID` → `id` for Better Auth compatibility
   - But we have access to custom fields that Better Auth doesn't provide

3. **Single Source of Truth:**
   - `me` endpoint is the source for current user info
   - Includes all custom business logic fields
   - Better than Better Auth's generic endpoints

## Benefits of Custom Endpoint

1. ✅ **Custom Fields** - `activeOrganizationId`, `shopperId`, etc.
2. ✅ **Business Logic** - Includes organization context
3. ✅ **Performance** - Single query for all user data
4. ✅ **Type Safety** - Typed `MeResponse` interface

## getSession() - Custom Encore Endpoint (Wraps Better Auth)

For comparison, `getSession()` is also a **custom Encore endpoint** that wraps Better Auth:
- Path: `GET /auth/get-session`
- Implementation: Wraps `auth.api.getSession()` from Better Auth
- Returns: `{ session: SessionResponse, user: UserResponse }`
- User has `id` field (not `userID`)
- No `activeOrganizationId` in user object (Better Auth doesn't have it)

## Current Implementation

We use **both custom endpoints**:
1. **Custom `me()` endpoint** - For user info with custom fields (`activeOrganizationId`, etc.)
2. **Custom `getSession()` endpoint** - Wraps Better Auth for session details

```typescript
// hooks/use-session.ts
const userResult = await getCurrentUser()  // ← Custom me endpoint (fully custom)
const sessionResult = await getSession()   // ← Custom endpoint (wraps Better Auth)

// Combine both:
// - userResult.user has activeOrganizationId (from custom me endpoint)
// - sessionResult.session has session details (from custom getSession endpoint)
```

**Key Point:** Both are custom Encore endpoints, not direct Better Auth endpoints!

## Conclusion

**The `me` endpoint is custom and better than Better Auth's endpoints for our use case!**

- ✅ Custom endpoint with business-specific fields
- ✅ `activeOrganizationId` available directly (not in Better Auth)
- ✅ No need to fetch separately
- ✅ Better for our multi-tenant architecture
- ✅ We combine it with custom `getSession()` endpoint for complete data
- ✅ Both endpoints are custom Encore endpoints, optimized for our needs

**We're using it correctly - custom endpoints are the right choice!**
