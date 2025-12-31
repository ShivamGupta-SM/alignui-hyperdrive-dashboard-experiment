# Resilient Error Handling - Always Keep App Running

## Goal
**Backend aur frontend hamesha kaam kare, chahe errors aaye ya na aaye.**

## Principles

1. **Never Break the Page** - Pages should always render, even with partial data
2. **Graceful Degradation** - Show what you can, hide what you can't
3. **User Can Always Logout** - Logout should work even if backend is down
4. **Partial Data is Better Than No Data** - Return empty arrays/objects instead of errors

## Implementation Patterns

### 1. Server-Side Data Fetching (`lib/ssr-data.ts`)

#### ✅ CORRECT - Always Return Valid Data

```typescript
export async function getSettingsData() {
  const [organization, bankAccounts, userData] = await Promise.allSettled([
    client.organizations.getOrganization(orgId).catch(() => ({
      // Minimal fallback organization
      id: orgId,
      name: "Organization",
      // ... other required fields with defaults
    })),
    client.organizations.listBankAccounts(orgId).catch(() => ({ data: [] })),
    client.auth.me().catch(() => null),
  ])

  // Extract values from Promise.allSettled
  const orgResult = organization.status === "fulfilled" 
    ? organization.value 
    : organization.reason

  // Always return valid structure
  return {
    user: userDataResult ? mapUser(userDataResult) : getDefaultUser(),
    organization: orgResult || getDefaultOrganization(),
    bankAccounts: bankAccountsResult.data || [],
    gstDetails: null, // Optional data
  }
}
```

#### ❌ WRONG - Throws Errors

```typescript
export async function getSettingsData() {
  // This will break the page if any call fails
  const [organization, bankAccounts] = await Promise.all([
    client.organizations.getOrganization(orgId), // Throws on error
    client.organizations.listBankAccounts(orgId), // Throws on error
  ])
  return { organization, bankAccounts }
}
```

### 2. Page Components

#### ✅ CORRECT - Handle Errors at Page Level

```typescript
export default async function SettingsPage() {
  await requireOrganization()

  let data
  try {
    data = await getSettingsData()
  } catch (error) {
    // Provide minimal data so page can render
    console.error("[SettingsPage] Failed to fetch data:", error)
    data = {
      user: getDefaultUser(),
      organization: getDefaultOrganization(),
      bankAccounts: [],
      gstDetails: null,
    }
  }

  return <SettingsClient initialData={data} />
}
```

#### ❌ WRONG - Let Errors Propagate

```typescript
export default async function SettingsPage() {
  await requireOrganization()
  // This will crash the page if getSettingsData fails
  const data = await getSettingsData()
  return <SettingsClient initialData={data} />
}
```

### 3. Backend Endpoints

#### ✅ CORRECT - Never Throw on Data Issues

```typescript
function mapOrganization(row: typeof organization.$inferSelect): Organization {
  // Handle all potential errors gracefully
  let panNumber: string | undefined = undefined
  if (row.panNumber) {
    const decrypted = safeDecrypt(row.panNumber) // Handles legacy data
    panNumber = decrypted || undefined // Never throw
  }

  let creditLimit: number | undefined = undefined
  if (row.creditLimit) {
    try {
      creditLimit = toMajorUnit(fromDatabaseDecimal(row.creditLimit))
    } catch (error) {
      // Log but continue - don't break entire response
      log.warn("Failed to convert creditLimit", { error })
      creditLimit = undefined
    }
  }

  // Always return valid Organization object
  return {
    id: row.id,
    name: row.name,
    // ... all fields with safe defaults
    panNumber,
    creditLimit,
  }
}
```

#### ❌ WRONG - Throws on Data Conversion

```typescript
function mapOrganization(row: typeof organization.$inferSelect): Organization {
  // This will throw if decryption fails
  const panNumber = row.panNumber ? decrypt(row.panNumber) : undefined
  
  // This will throw if conversion fails
  const creditLimit = row.creditLimit 
    ? toMajorUnit(fromDatabaseDecimal(row.creditLimit)) 
    : undefined

  return { ...row, panNumber, creditLimit }
}
```

### 4. Logout - Always Works

#### ✅ CORRECT - Clear Cookies First

```typescript
export async function signOut() {
  // ALWAYS clear cookies first, even before backend call
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/", "layout")

  try {
    const client = getEncoreClient()
    await client.auth.signOut()
  } catch (error) {
    // Log but don't fail - cookies already cleared
    console.error("[SignOut] Backend call failed, but cookies cleared:", error)
  }

  // Always return success since cookies are cleared
  return { success: true }
}
```

#### ❌ WRONG - Backend Call Required

```typescript
export async function signOut() {
  // If backend fails, user can't logout!
  await client.auth.signOut()
  cookieStore.delete("auth-token")
  return { success: true }
}
```

## Error Handling Checklist

### Frontend (Server Actions & SSR)

- [ ] Use `Promise.allSettled` instead of `Promise.all`
- [ ] Always provide fallback data structures
- [ ] Catch errors at page level, not just in data functions
- [ ] Log errors but don't break the page
- [ ] Return empty arrays/objects instead of null/undefined when possible

### Backend (API Endpoints)

- [ ] Use `safeDecrypt` for encrypted fields
- [ ] Wrap data conversions in try-catch
- [ ] Provide default values for all optional fields
- [ ] Log errors but return valid responses
- [ ] Never throw errors from data mapping functions

### Critical Paths

- [ ] **Logout** - Always works, clears cookies first
- [ ] **Settings Page** - Always renders, even with partial data
- [ ] **Dashboard** - Shows empty state if data fails
- [ ] **Campaigns** - Shows empty list if fetch fails
- [ ] **Organization Fetch** - Returns minimal org if full fetch fails

## Benefits

1. **Better UX** - Users can always navigate and logout
2. **Easier Debugging** - Errors logged but don't break app
3. **Production Ready** - App works even with partial failures
4. **Progressive Enhancement** - Show what works, hide what doesn't

## Migration Guide

### Before (Brittle)

```typescript
// ❌ Breaks if any call fails
const [org, accounts] = await Promise.all([
  client.organizations.getOrganization(id),
  client.organizations.listBankAccounts(id),
])
```

### After (Resilient)

```typescript
// ✅ Always works, even with partial failures
const [org, accounts] = await Promise.allSettled([
  client.organizations.getOrganization(id).catch(() => getDefaultOrg()),
  client.organizations.listBankAccounts(id).catch(() => ({ data: [] })),
])

const orgResult = org.status === "fulfilled" ? org.value : getDefaultOrg()
const accountsResult = accounts.status === "fulfilled" ? accounts.value : { data: [] }
```








