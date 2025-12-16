# Architecture Issues - Detailed Explanation with Examples

यह document उन 5 main issues को detail में explain करता है जो current codebase में हैं, actual code examples के साथ।

---

## 1. Mixed Patterns - Server Actions, Hooks, और Direct API Calls का Mix

### Problem क्या है?

एक ही functionality के लिए तीन अलग-अलग patterns use हो रहे हैं:
- **Server Actions** (`app/actions/*.ts`)
- **React Query Hooks** (`hooks/use-*.ts`)
- **Direct API Calls** (components में directly)

इससे confusion होती है कि कब क्या use करना है।

### Real Examples from Codebase:

#### Example 1: Campaign Fetching - 3 Different Ways

**Way 1: Server Action में**
```typescript
// app/actions/campaigns.ts
"use server"

export async function createCampaign(data: Partial<campaigns.CreateCampaignRequest>) {
  const client = getEncoreClient()  // ✅ Server-side client
  try {
    const response = await client.campaigns.createCampaign(data)
    revalidatePath("/dashboard/campaigns")
    return { success: true, campaign: response }
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

**Way 2: Hook में Direct API Call**
```typescript
// hooks/use-campaigns.ts
"use client"

export function useSearchCampaigns(params: CampaignSearchParams) {
  return useQuery({
    queryKey: ["campaigns", "search", params],
    queryFn: async () => {
      const client = getEncoreBrowserClient()  // ✅ Browser client
      return await client.campaigns.searchCampaigns({
        q: params.q,
        skip: params.skip,
        take: params.take,
        status: params.status,
      })
    },
  })
}
```

**Way 3: SSR Data में Direct Call**
```typescript
// lib/ssr-data.ts
export async function getCampaignsData() {
  const client = await getAuthClient()  // ✅ Server-side authenticated client
  try {
    const campaigns = await client.campaigns.listCampaigns({})
    return { campaigns }
  } catch (error) {
    logSSRError(error, "getCampaignsData", "campaigns-list")
    return null
  }
}
```

### Problem क्यों है?

1. **Confusion**: Developer को पता नहीं चलता कि कहाँ से data fetch करें
2. **Inconsistency**: Same functionality के लिए different patterns
3. **Maintenance**: एक जगह change करने पर दूसरी जगह update नहीं होता
4. **Testing**: हर pattern के लिए अलग testing approach

### Example 2: Settings Data - Multiple Sources

**Settings Hook में Direct API Calls:**
```typescript
// hooks/use-settings.ts
export function useOrganizationSettings(organizationId?: string) {
  return useQuery({
    queryKey: ["organization", organizationId, "settings"],
    queryFn: async () => {
      const client = getEncoreBrowserClient()  // ❌ Direct call in hook
      if (organizationId) {
        return client.organizations.getOrganization(organizationId)
      }
      // ... more direct calls
    },
  })
}

export function useBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => {
      const client = getEncoreBrowserClient()  // ❌ Another direct call
      return client.organizations.listBankAccounts()
    },
  })
}
```

**Settings Server Action में:**
```typescript
// app/actions/settings.ts
"use server"

export async function updateOrganizationSettings(data: UpdateSettingsData) {
  const client = getEncoreClient()  // ❌ Different pattern
  try {
    await client.organizations.updateOrganization(organizationId, data)
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    return handleAPIError(error)
  }
}
```

### Solution (Recommended):

**Single API Layer:**
```typescript
// features/settings/lib/api.ts
import { getEncoreBrowserClient } from '@/lib/encore/browser'

export const settingsAPI = {
  async getOrganization(id: string) {
    const client = getEncoreBrowserClient()
    return client.organizations.getOrganization(id)
  },
  
  async updateOrganization(id: string, data: UpdateData) {
    const client = getEncoreBrowserClient()
    return client.organizations.updateOrganization(id, data)
  },
}

// features/settings/hooks/use-settings.ts
export function useOrganizationSettings(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => settingsAPI.getOrganization(id),  // ✅ Single source
  })
}

// features/settings/actions/settings.ts
"use server"
export async function updateSettings(id: string, data: UpdateData) {
  const client = getEncoreClient()
  await client.organizations.updateOrganization(id, data)
  revalidatePath("/dashboard/settings")
}
```

---

## 2. File Organization - कुछ Files Scattered हैं

### Problem क्या है?

Related code अलग-अलग जगह scattered है:
- Types: `lib/types/`, `hooks/`, components में inline
- Hooks: `hooks/` folder में सभी mixed
- Components: `components/` में feature-wise नहीं organized
- Actions: `app/actions/` में सभी mixed

### Real Examples:

#### Example 1: Campaign Types - 3 Different Places

**Place 1: `lib/types/campaign.ts`**
```typescript
// lib/types/campaign.ts
export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignStatus = shared.CampaignStatus
export interface CampaignFormData {
  productId: string
  title: string
  // ...
}
```

**Place 2: `hooks/use-campaigns.ts`**
```typescript
// hooks/use-campaigns.ts
export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignStatus = shared.CampaignStatus
export interface CampaignFilters {
  status?: CampaignStatus
  search?: string
  // ...
}
```

**Place 3: Component में Inline**
```typescript
// app/(dashboard)/dashboard/campaigns/campaigns-client.tsx
import type { CampaignStatus } from "@/hooks/use-campaigns"  // ❌ Import from hook

type CampaignWithStats = campaigns.CampaignWithStats  // ❌ Inline type definition
```

### Problem क्यों है?

1. **Duplicate Definitions**: Same type multiple places पर define
2. **Import Confusion**: पता नहीं चलता कहाँ से import करें
3. **Maintenance**: एक जगह change करने पर दूसरी जगह update नहीं होता
4. **AI Confusion**: AI को समझने में मुश्किल होती है

#### Example 2: File Structure - Mixed Organization

**Current Structure:**
```
app/
├── actions/
│   ├── campaigns.ts      # Campaign actions
│   ├── organizations.ts  # Organization actions
│   ├── onboarding.ts     # 422 lines! Too big
│   └── ...
hooks/
├── use-campaigns.ts      # Campaign hooks
├── use-organizations.ts  # Organization hooks
├── use-settings.ts        # Settings hooks
└── ...
lib/
├── types/
│   ├── campaign.ts       # Campaign types
│   ├── organization.ts   # Organization types
│   └── ...
components/
├── dashboard/
│   ├── campaign-card.tsx
│   └── ...
└── ...
```

**Problem:**
- Campaign से related code 4 अलग folders में है
- Related files एक साथ नहीं हैं
- Feature-wise organization नहीं है

### Solution (Recommended):

**Feature-Based Organization:**
```
features/
├── campaigns/
│   ├── components/
│   │   ├── CampaignCard/
│   │   │   ├── CampaignCard.tsx
│   │   │   └── index.ts
│   │   └── CampaignList/
│   ├── hooks/
│   │   ├── use-campaigns.ts
│   │   └── use-create-campaign.ts
│   ├── actions/
│   │   └── campaigns.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
└── organizations/
    ├── components/
    ├── hooks/
    ├── actions/
    ├── lib/
    └── types/
```

**Benefits:**
- ✅ Related code एक साथ
- ✅ Easy to find
- ✅ Better code splitting
- ✅ AI को समझने में आसानी

---

## 3. Type Definitions - Multiple Places में Types Defined

### Problem क्या है?

Same type multiple places पर define हो रहा है, जिससे:
- Duplication
- Inconsistency
- Maintenance issues

### Real Examples:

#### Example 1: Campaign Types - Duplicate Definitions

**Definition 1: `lib/types/campaign.ts`**
```typescript
// lib/types/campaign.ts
export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats
export type CampaignStatus = shared.CampaignStatus
```

**Definition 2: `hooks/use-campaigns.ts`**
```typescript
// hooks/use-campaigns.ts
export type Campaign = campaigns.Campaign  // ❌ Duplicate!
export type CampaignWithStats = campaigns.CampaignWithStats  // ❌ Duplicate!
export type CampaignStatus = shared.CampaignStatus  // ❌ Duplicate!

export interface CampaignFilters {  // ❌ New type, but where should it be?
  status?: CampaignStatus
  search?: string
  page?: number
}
```

**Definition 3: Component में Inline**
```typescript
// app/(dashboard)/dashboard/campaigns/campaigns-client.tsx
import type { CampaignStatus } from "@/hooks/use-campaigns"  // ❌ Import from hook

type CampaignWithStats = campaigns.CampaignWithStats  // ❌ Inline definition
```

### Problem क्यों है?

1. **Single Source of Truth नहीं**: पता नहीं चलता कौन सा definition correct है
2. **Import Confusion**: कहाँ से import करें?
3. **Type Mismatches**: Different places पर slightly different types
4. **Maintenance**: एक जगह change करने पर दूसरी जगह update नहीं होता

#### Example 2: CampaignFormData - Multiple Definitions

**Definition 1: `lib/types/campaign.ts`**
```typescript
// lib/types/campaign.ts
export interface CampaignFormData {
  productId: string
  title: string
  description?: string
  type: CampaignType
  isPublic: boolean
  startDate: Date
  endDate: Date
  maxEnrollments: number
  // ...
}
```

**Definition 2: `lib/validations.ts`**
```typescript
// lib/validations.ts
export const campaignFormSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(3),
  // ...
})

export type CampaignFormInput = z.infer<typeof campaignFormSchema>  // ❌ Different name!
```

**Usage in Component:**
```typescript
// app/(dashboard)/dashboard/campaigns/create/create-campaign-client.tsx
import { campaignFormSchema, type CampaignFormInput } from "@/lib/validations"  // ❌ Using validation type
import type { CampaignType } from "@/hooks/use-campaigns"  // ❌ Import from hook

// Component में दोनों types use हो रहे हैं!
```

### Solution (Recommended):

**Single Source of Truth:**
```typescript
// features/campaigns/types/index.ts

// Re-export from Encore (source of truth)
export type {
  Campaign,
  CampaignWithStats,
  CampaignStatus,
  CampaignType,
} from '@/lib/encore/client'

// Feature-specific types
export interface CampaignFilters {
  status?: CampaignStatus
  search?: string
  page?: number
  limit?: number
}

// Form types (from validation schema)
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
```

**Usage:**
```typescript
// ✅ Always import from single source
import type { Campaign, CampaignFilters, CreateCampaignInput } from '@/features/campaigns/types'
```

---

## 4. Error Handling - Inconsistent Patterns

### Problem क्या है?

Different places पर different error handling patterns:
- Some places: `try-catch` with `handleAPIError`
- Some places: `try-catch` with custom error handling
- Some places: Direct error throwing
- Some places: Silent error swallowing

### Real Examples:

#### Example 1: Server Actions - Different Patterns

**Pattern 1: `handleAPIError` use कर रहा है**
```typescript
// app/actions/campaigns.ts
export async function createCampaign(data: Partial<campaigns.CreateCampaignRequest>) {
  const client = getEncoreClient()
  try {
    const response = await client.campaigns.createCampaign(data)
    revalidatePath("/dashboard/campaigns")
    return { success: true, campaign: response }
  } catch (error: unknown) {
    handleServerAuthError(error)  // ✅ Auth error handling
    return handleAPIError(error)  // ✅ Standard error handler
  }
}
```

**Pattern 2: Custom Error Handling**
```typescript
// app/actions/campaigns.ts (same file में!)
export async function updateCampaignStatus(id: string, action: string) {
  const client = getEncoreClient()
  try {
    // ... logic
    return { success: true, campaign: result }
  } catch (error: unknown) {
    handleServerAuthError(error)  // ✅ Auth error handling
    const errorMessage = error instanceof Error ? error.message : `Failed to ${action} campaign`  // ❌ Custom handling
    return { success: false, error: errorMessage }  // ❌ Different return format!
  }
}
```

**Problem:** Same file में दो different patterns!

#### Example 2: SSR Data - Different Error Handling

**Pattern 1: Logging + Null Return**
```typescript
// lib/ssr-data.ts
export async function getCampaignsData() {
  try {
    const client = await getAuthClient()
    const campaigns = await client.campaigns.listCampaigns({})
    return { campaigns }
  } catch (error) {
    logSSRError(error, "getCampaignsData", "campaigns-list")  // ✅ Logging
    return null  // ✅ Null return
  }
}
```

**Pattern 2: Error Throwing**
```typescript
// lib/ssr-data.ts (same file में!)
async function getOrganizationId(): Promise<string> {
  const sessionResult = await getSession()
  
  if (!sessionResult.success || !sessionResult.user) {
    throw new Error("Session not found. Please sign in.")  // ❌ Throwing error
  }

  const activeOrgId = sessionResult.user.activeOrganizationId
  
  if (!activeOrgId) {
    throw new Error("Organization ID not found.")  // ❌ Throwing error
  }

  return activeOrgId
}
```

**Problem:** Same file में different patterns - कुछ null return, कुछ throw!

#### Example 3: Client Components - Inconsistent Patterns

**Pattern 1: Try-Catch with Toast**
```typescript
// app/(dashboard)/dashboard/settings/settings-client.tsx
const handleUpdate = async () => {
  try {
    await updateSettings(data)
    toast.success("Settings updated")
  } catch (error) {
    toast.error("Failed to update settings")  // ❌ Generic error message
  }
}
```

**Pattern 2: Direct Server Action Call**
```typescript
// app/(dashboard)/dashboard/profile/profile-client.tsx
const handleSubmit = async (formData: FormData) => {
  try {
    const result = await updateProfile(formData)
    if (result.success) {
      toast.success("Profile updated")
    } else {
      toast.error(result.error)  // ❌ Different pattern - checking result.success
    }
  } catch (error) {
    toast.error("An error occurred")  // ❌ Another pattern
  }
}
```

### Problem क्यों है?

1. **Inconsistent User Experience**: Different error messages
2. **Debugging Difficult**: Different patterns = difficult to debug
3. **Maintenance**: हर जगह अलग pattern maintain करना
4. **AI Confusion**: AI को pattern समझने में मुश्किल

### Solution (Recommended):

**Consistent Result Pattern:**
```typescript
// shared/lib/errors/types.ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// shared/lib/errors/handler.ts
export function handleAPIError(error: unknown): Error {
  if (error instanceof APIError) {
    return new Error(error.message)
  }
  if (error instanceof Error) {
    return error
  }
  return new Error('An unknown error occurred')
}

// Usage in Server Actions
export async function createCampaign(data: CreateCampaignInput): Promise<Result<Campaign>> {
  try {
    const client = getEncoreClient()
    const campaign = await client.campaigns.createCampaign(data)
    return { success: true, data: campaign }
  } catch (error) {
    return { success: false, error: handleAPIError(error) }
  }
}

// Usage in Client Components
const { mutate } = useCreateCampaign()
mutate(data, {
  onSuccess: (result) => {
    if (result.success) {
      toast.success("Campaign created")
    } else {
      toast.error(result.error.message)  // ✅ Consistent error handling
    }
  }
})
```

---

## 5. Documentation - Limited Inline Docs for AI Understanding

### Problem क्या है?

Code में limited documentation है, जिससे:
- AI को context समझने में मुश्किल
- New developers को onboarding difficult
- Function purpose unclear

### Real Examples:

#### Example 1: Hook without Documentation

**Current:**
```typescript
// hooks/use-campaigns.ts
export function useSearchCampaigns(params: CampaignSearchParams) {
  return useQuery({
    queryKey: ["campaigns", "search", params],
    queryFn: async () => {
      const client = getEncoreBrowserClient()
      return await client.campaigns.searchCampaigns({
        q: params.q,
        skip: params.skip,
        take: params.take,
        status: params.status,
      })
    },
    enabled: params.q.length >= 2,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
```

**Problems:**
- ❌ No JSDoc comments
- ❌ No explanation of `enabled` condition
- ❌ No explanation of `staleTime` choice
- ❌ No usage examples

#### Example 2: Server Action without Documentation

**Current:**
```typescript
// app/actions/campaigns.ts
export async function updateCampaignStatus(
  id: string,
  action: "submit" | "activate" | "cancel" | "end" | "complete" | "archive" | "unarchive"
) {
  const client = getEncoreClient()
  try {
    let result: campaigns.Campaign
    switch (action) {
      case "submit":
        result = await client.campaigns.submitForApproval(id)
        break
      // ... more cases
    }
    revalidatePath("/dashboard/campaigns")
    return { success: true, campaign: result }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: errorMessage }
  }
}
```

**Problems:**
- ❌ No explanation of what this function does
- ❌ No explanation of valid actions
- ❌ No explanation of return format
- ❌ No usage examples

#### Example 3: Complex Function without Context

**Current:**
```typescript
// lib/ssr-data.ts
async function getOrganizationId(): Promise<string> {
  const sessionResult = await getSession()
  
  if (!sessionResult.success || !sessionResult.user) {
    throw new Error("Session not found. Please sign in.")
  }

  const activeOrgId = sessionResult.user.activeOrganizationId
  
  if (!activeOrgId) {
    throw new Error("Organization ID not found. Please select an organization.")
  }

  return activeOrgId
}
```

**Problems:**
- ❌ No explanation of why this function exists
- ❌ No explanation of when to use vs `getOrganizationIdOrNull`
- ❌ No explanation of error handling strategy

### Solution (Recommended):

**Well-Documented Code:**
```typescript
/**
 * Hook: Search campaigns with filters
 * 
 * @description
 * Fetches campaigns from the API using React Query.
 * Automatically refetches when filters change.
 * Only searches if query is at least 2 characters (to avoid too many API calls).
 * 
 * @param params - Search parameters (query, pagination, status filter)
 * @returns React Query result with campaigns data
 * 
 * @example
 * ```tsx
 * function CampaignsPage() {
 *   const { data, isLoading } = useSearchCampaigns({ 
 *     q: "laptop", 
 *     status: "active" 
 *   })
 *   
 *   if (isLoading) return <Loading />
 *   return <CampaignList campaigns={data?.campaigns} />
 * }
 * ```
 */
export function useSearchCampaigns(params: CampaignSearchParams) {
  return useQuery({
    queryKey: ["campaigns", "search", params],
    queryFn: async () => {
      const client = getEncoreBrowserClient()
      return await client.campaigns.searchCampaigns({
        q: params.q,
        skip: params.skip,
        take: params.take,
        status: params.status,
      })
    },
    enabled: params.q.length >= 2, // Only search if query is at least 2 characters
    staleTime: 60 * 1000, // 1 minute - search results don't need frequent updates
    refetchOnWindowFocus: false, // Don't refetch on focus - user might be reading results
  })
}
```

**Benefits:**
- ✅ AI को better context
- ✅ Self-documenting code
- ✅ Better IDE autocomplete
- ✅ Easier onboarding

---

## Summary

### Main Issues:

1. **Mixed Patterns** - 3 different ways to do same thing
2. **File Organization** - Related code scattered
3. **Type Definitions** - Duplicate definitions
4. **Error Handling** - Inconsistent patterns
5. **Documentation** - Limited inline docs

### Impact:

- 🔴 **Developer Confusion** - पता नहीं चलता क्या use करें
- 🔴 **Maintenance Issues** - Changes difficult
- 🔴 **AI Confusion** - AI को code समझने में मुश्किल
- 🔴 **Testing Difficult** - Different patterns = different tests

### Quick Wins:

1. Add JSDoc comments to existing hooks/functions
2. Create single API layer for one feature (e.g., campaigns)
3. Organize types - move to feature-specific type files
4. Standardize error handling with Result pattern
5. Document complex logic with inline comments

---

**Note:** ये issues gradual improvement के लिए हैं। सभी changes एक साथ करने की जरूरत नहीं है। Start with quick wins और gradually improve करते रहें।

