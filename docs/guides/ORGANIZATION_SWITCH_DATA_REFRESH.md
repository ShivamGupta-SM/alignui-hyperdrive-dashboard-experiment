# Organization Switch - Data Refresh Flow

**Question:** "organisation change karne par saare page aa jayege na dursre wale organisation par?"

## ✅ Yes - All Pages Will Show New Organization Data

When you switch organization, **all pages automatically update** with the new organization's data.

## 🔄 Complete Flow

### 1. **User Switches Organization**
```typescript
// User clicks organization in switcher
handleOrganizationChange(org)
  ↓
// Update Zustand store (instant UI)
setActiveOrganization(org)
  ↓
// Call server action
switchOrganization.mutate(org.id)
```

### 2. **Server Action Updates Backend & Cookie**
```typescript
// app/actions/organizations.ts
await client.auth.setActiveOrganization({ organizationId })
cookieStore.set('active-organization-id', organizationId)
revalidatePath('/', 'layout')  // ← Triggers Next.js revalidation
```

### 3. **React Query Invalidates All Queries**
```typescript
// hooks/use-organizations.ts
onSuccess: () => {
  queryClient.invalidateQueries()  // ← All queries invalidated
  router.refresh()  // ← Router refresh
}
```

### 4. **Next.js Revalidates Server Components**
```typescript
// revalidatePath('/', 'layout') triggers:
// - All RSC pages refetch
// - All server components re-render
// - New data fetched with new cookie
```

### 5. **SSR Data Functions Read New Cookie**
```typescript
// lib/ssr-data.ts
async function getOrganizationId() {
  const cookieStore = await cookies()
  return cookieStore.get('active-organization-id')?.value  // ← New org ID
}

// All SSR functions use this:
getDashboardData()  // ← Uses new org ID
getCampaignsData()  // ← Uses new org ID
getWalletData()     // ← Uses new org ID
getEnrollmentsData() // ← Uses new org ID
getInvoicesData()   // ← Uses new org ID
getTeamData()       // ← Uses new org ID
```

### 6. **Client Components Receive New Data**
```typescript
// app/(dashboard)/dashboard/page.tsx
const data = await getDashboardData()  // ← Fetched with new org ID
return <DashboardClient initialData={data} />  // ← New data passed

// app/(dashboard)/dashboard/campaigns/page.tsx
const data = await getCampaignsData()  // ← Fetched with new org ID
return <CampaignsClient initialData={data} />  // ← New data passed
```

## ✅ Verification - All Pages Update

### Server-Side Pages (RSC):
- ✅ **Dashboard** - `getDashboardData()` reads cookie
- ✅ **Campaigns** - `getCampaignsData()` reads cookie
- ✅ **Enrollments** - `getEnrollmentsData()` reads cookie
- ✅ **Wallet** - `getWalletData()` reads cookie
- ✅ **Invoices** - `getInvoicesData()` reads cookie
- ✅ **Team** - `getTeamData()` reads cookie
- ✅ **Settings** - `getSettingsData()` reads cookie

### Client-Side Hooks:
- ✅ **React Query queries** - Invalidated, refetch with new org context
- ✅ **Session query** - Invalidated, refetches with new `activeOrganizationId`
- ✅ **All data hooks** - Refetch after invalidation

## 🔍 How It Works

### Server-Side (RSC Pages):
```typescript
// 1. Organization switched → Cookie updated
cookieStore.set('active-organization-id', newOrgId)

// 2. revalidatePath() triggers Next.js revalidation
revalidatePath('/', 'layout')

// 3. Next.js refetches all RSC pages
// 4. Each page calls SSR data function
const data = await getCampaignsData()

// 5. getCampaignsData() reads cookie
const orgId = await getOrganizationId()  // ← New org ID from cookie

// 6. Fetches data with new org ID
client.campaigns.listCampaigns({ organizationId: orgId })

// 7. New data passed to client component
return <CampaignsClient initialData={data} />
```

### Client-Side (React Query):
```typescript
// 1. Organization switched → Queries invalidated
queryClient.invalidateQueries()

// 2. Router refreshed
router.refresh()

// 3. All useQuery hooks refetch
// 4. Session refetches → New activeOrganizationId
const { data: session } = useSession()  // ← Refetches

// 5. All data hooks refetch with new context
const { data: campaigns } = useCampaigns()  // ← Refetches
```

## ✅ Result

**All pages automatically show new organization's data!**

1. ✅ **Server Components** - Refetch with new cookie
2. ✅ **Client Components** - Receive new `initialData`
3. ✅ **React Query** - All queries invalidated and refetched
4. ✅ **Session** - Updated with new `activeOrganizationId`
5. ✅ **Router** - Refreshed to update all pages

## 🎯 Flow Summary

```
User Switches Org
    ↓
Backend Updated (setActiveOrganization)
    ↓
Cookie Updated (active-organization-id)
    ↓
revalidatePath() → Next.js revalidation
    ↓
All RSC Pages Refetch
    ↓
SSR Functions Read New Cookie
    ↓
New Data Fetched for New Org
    ↓
Client Components Receive New Data
    ↓
React Query Queries Invalidated
    ↓
All Queries Refetch
    ↓
All Pages Show New Org Data ✅
```

## ✅ Conclusion

**Haan, organisation change karne par saare pages automatically dusre organization ka data dikhayenge!**

- ✅ Server components refetch with new cookie
- ✅ Client components get new initialData
- ✅ React Query queries invalidated and refetched
- ✅ Session updated with new activeOrganizationId
- ✅ Router refreshed

**Everything works automatically - no manual updates needed!**
