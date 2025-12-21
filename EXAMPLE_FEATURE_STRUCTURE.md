# Example: Campaigns Feature Structure

यह document दिखाता है कि **Campaigns** feature को कैसे organize करना चाहिए improved architecture के साथ।

---

## 📁 Complete Folder Structure

```
features/campaigns/
├── components/
│   ├── CampaignCard/
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignCard.test.tsx
│   │   └── index.ts
│   ├── CampaignList/
│   │   ├── CampaignList.tsx
│   │   └── index.ts
│   ├── CreateCampaignForm/
│   │   ├── CreateCampaignForm.tsx
│   │   ├── useCreateCampaignForm.ts
│   │   └── index.ts
│   └── CampaignFilters/
│       ├── CampaignFilters.tsx
│       └── index.ts
│
├── hooks/
│   ├── use-campaigns.ts          # List campaigns
│   ├── use-campaign.ts            # Single campaign
│   ├── use-create-campaign.ts    # Create mutation
│   ├── use-update-campaign.ts    # Update mutation
│   └── index.ts                   # Re-exports
│
├── lib/
│   ├── api.ts                     # API layer (single source)
│   ├── query-keys.ts              # React Query keys factory
│   ├── validation.ts              # Zod schemas
│   └── utils.ts                   # Feature-specific utilities
│
├── types/
│   └── index.ts                   # All campaign types
│
├── actions/                        # Server actions (if needed)
│   └── campaign-actions.ts
│
└── index.ts                        # Public API - what other features can import
```

---

## 📄 File Examples

### 1. `lib/api.ts` - API Layer

```typescript
/**
 * Campaign API Layer
 * 
 * Single source of truth for all campaign-related API calls.
 * This makes it easy for AI to understand data flow and for developers to find API calls.
 */

import { getEncoreBrowserClient } from '@/lib/encore/browser'
import type { campaigns, shared } from '@/lib/encore/client'
import type { CampaignFilters, CampaignSearchParams } from '../types'

export const campaignAPI = {
  /**
   * Search campaigns with filters
   */
  async search(params: CampaignSearchParams) {
    const client = getEncoreBrowserClient()
    return client.campaigns.searchCampaigns({
      q: params.q,
      skip: params.skip,
      take: params.take,
      status: params.status,
    })
  },

  /**
   * Get campaign by ID
   */
  async getById(id: string) {
    const client = getEncoreBrowserClient()
    return client.campaigns.getCampaign({ campaignId: id })
  },

  /**
   * Create new campaign
   */
  async create(data: campaigns.CreateCampaignRequest) {
    const client = getEncoreBrowserClient()
    return client.campaigns.createCampaign(data)
  },

  /**
   * Update campaign
   */
  async update(id: string, data: campaigns.UpdateCampaignRequest) {
    const client = getEncoreBrowserClient()
    return client.campaigns.updateCampaign({ campaignId: id, ...data })
  },

  /**
   * Delete campaign
   */
  async delete(id: string) {
    const client = getEncoreBrowserClient()
    return client.campaigns.deleteCampaign({ campaignId: id })
  },
} as const
```

---

### 2. `lib/query-keys.ts` - Query Keys Factory

```typescript
/**
 * React Query Keys Factory
 * 
 * Centralized query keys make it easy to invalidate related queries.
 * Pattern from: https://tkdodo.eu/blog/effective-react-query-keys
 */

export const campaignQueryKeys = {
  // Base key
  all: ['campaigns'] as const,

  // Lists
  lists: () => [...campaignQueryKeys.all, 'list'] as const,
  list: (filters: CampaignFilters) => 
    [...campaignQueryKeys.lists(), filters] as const,

  // Details
  details: () => [...campaignQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignQueryKeys.details(), id] as const,

  // Stats
  stats: () => [...campaignQueryKeys.all, 'stats'] as const,
  statsByCampaign: (id: string) => 
    [...campaignQueryKeys.stats(), id] as const,
} as const
```

---

### 3. `hooks/use-campaigns.ts` - React Query Hook

```typescript
"use client"

import { useQuery } from '@tanstack/react-query'
import { campaignAPI } from '../lib/api'
import { campaignQueryKeys } from '../lib/query-keys'
import type { CampaignFilters } from '../types'

/**
 * Hook: Fetch campaigns with filters
 * 
 * @description
 * Fetches campaigns from the API using React Query.
 * Automatically handles caching, refetching, and error states.
 * 
 * @param filters - Campaign filters (status, search, pagination)
 * @returns React Query result with campaigns data
 * 
 * @example
 * ```tsx
 * function CampaignsPage() {
 *   const { data, isLoading, error } = useCampaigns({ 
 *     status: 'active',
 *     page: 1 
 *   })
 *   
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message={error.message} />
 *   
 *   return <CampaignList campaigns={data?.campaigns} />
 * }
 * ```
 */
export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: campaignQueryKeys.list(filters),
    queryFn: () => campaignAPI.search({
      q: filters.search || '',
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      status: filters.status,
    }),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}
```

---

### 4. `hooks/use-campaign.ts` - Single Campaign Hook

```typescript
"use client"

import { useQuery } from '@tanstack/react-query'
import { campaignAPI } from '../lib/api'
import { campaignQueryKeys } from '../lib/query-keys'

/**
 * Hook: Fetch single campaign by ID
 * 
 * @param id - Campaign ID
 * @returns React Query result with campaign data
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignQueryKeys.detail(id),
    queryFn: () => campaignAPI.getById(id),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // 5 minutes (details change less often)
  })
}
```

---

### 5. `hooks/use-create-campaign.ts` - Mutation Hook

```typescript
"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignAPI } from '../lib/api'
import { campaignQueryKeys } from '../lib/query-keys'
import type { CreateCampaignInput } from '../types'

/**
 * Hook: Create new campaign
 * 
 * @description
 * Mutation hook for creating campaigns.
 * Automatically invalidates campaign lists after successful creation.
 * 
 * @example
 * ```tsx
 * function CreateCampaignPage() {
 *   const createCampaign = useCreateCampaign()
 *   
 *   const handleSubmit = async (data: CreateCampaignInput) => {
 *     try {
 *       const result = await createCampaign.mutateAsync(data)
 *       router.push(`/campaigns/${result.id}`)
 *     } catch (error) {
 *       toast.error('Failed to create campaign')
 *     }
 *   }
 *   
 *   return <CreateCampaignForm onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignInput) => campaignAPI.create(data),
    onSuccess: () => {
      // Invalidate all campaign lists to refetch
      queryClient.invalidateQueries({ 
        queryKey: campaignQueryKeys.lists() 
      })
    },
    onError: (error) => {
      // Error handling can be done here or in component
      console.error('Failed to create campaign:', error)
    },
  })
}
```

---

### 6. `types/index.ts` - Type Definitions

```typescript
/**
 * Campaign Feature Types
 * 
 * Single source of truth for all campaign-related types.
 * Re-exports from Encore client and defines feature-specific types.
 */

// Re-export from Encore client
export type {
  Campaign,
  CampaignWithStats,
  CampaignStats,
  CampaignPricing,
  CampaignPerformance,
} from '@/lib/encore/client'

export type { CampaignStatus, CampaignType } from '@/lib/encore/client'

// Feature-specific types
export interface CampaignFilters {
  status?: CampaignStatus
  search?: string
  page?: number
  limit?: number
  organizationId?: string
  productId?: string
  platformId?: string
  categoryId?: string
}

export interface CampaignSearchParams {
  q: string
  skip?: number
  take?: number
  status?: CampaignStatus
}

export interface CreateCampaignInput {
  name: string
  description: string
  productId: string
  // ... other fields
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  // ... other fields
}
```

---

### 7. `lib/validation.ts` - Zod Schemas

```typescript
import { z } from 'zod'
import type { CreateCampaignInput, UpdateCampaignInput } from '../types'

/**
 * Campaign validation schemas
 * 
 * Single source of truth for all campaign-related validation.
 * Types are inferred from schemas for type safety.
 */

export const createCampaignSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  productId: z.string().uuid('Invalid product ID'),
  
  // ... other fields
})

export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>

export const updateCampaignSchema = createCampaignSchema.partial()

export type UpdateCampaignFormData = z.infer<typeof updateCampaignSchema>

export const campaignFiltersSchema = z.object({
  status: z.enum(['active', 'draft', 'completed', 'cancelled']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})
```

---

### 8. `components/CampaignCard/CampaignCard.tsx` - Component

```typescript
"use client"

import type { Campaign } from '../../types'
import { formatCurrency } from '@/shared/lib/format'
import { formatDateShort } from '@/shared/lib/format'

/**
 * CampaignCard Component
 * 
 * @description
 * Displays a single campaign in a card format.
 * Used in campaign lists and grids.
 * 
 * @param campaign - Campaign data to display
 * @param onClick - Optional click handler
 */
interface CampaignCardProps {
  campaign: Campaign
  onClick?: (campaign: Campaign) => void
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  return (
    <div 
      className="campaign-card"
      onClick={() => onClick?.(campaign)}
    >
      <h3>{campaign.name}</h3>
      <p>{campaign.description}</p>
      <div className="campaign-stats">
        <span>Budget: {formatCurrency(campaign.budget)}</span>
        <span>Created: {formatDateShort(campaign.createdAt)}</span>
      </div>
    </div>
  )
}
```

---

### 9. `components/CreateCampaignForm/CreateCampaignForm.tsx` - Form Component

```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCampaignSchema, type CreateCampaignFormData } from '../../lib/validation'
import { useCreateCampaign } from '../../hooks/use-create-campaign'

/**
 * CreateCampaignForm Component
 * 
 * @description
 * Form for creating new campaigns.
 * Uses React Hook Form with Zod validation.
 */
export function CreateCampaignForm() {
  const createCampaign = useCreateCampaign()
  
  const form = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      // ...
    },
  })

  const onSubmit = async (data: CreateCampaignFormData) => {
    try {
      await createCampaign.mutateAsync(data)
      form.reset()
      // Navigate or show success message
    } catch (error) {
      // Error handling
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

### 10. `index.ts` - Public API

```typescript
/**
 * Campaigns Feature - Public API
 * 
 * This file exports only what other features should use.
 * Internal implementation details are kept private.
 */

// Components
export { CampaignCard } from './components/CampaignCard'
export { CampaignList } from './components/CampaignList'
export { CreateCampaignForm } from './components/CreateCampaignForm'

// Hooks
export { useCampaigns } from './hooks/use-campaigns'
export { useCampaign } from './hooks/use-campaign'
export { useCreateCampaign } from './hooks/use-create-campaign'
export { useUpdateCampaign } from './hooks/use-update-campaign'

// Types
export type {
  Campaign,
  CampaignFilters,
  CreateCampaignInput,
} from './types'

// Server Actions (if needed)
export { createCampaignAction } from './actions/campaign-actions'
```

---

## 🔄 Usage in App Router

### `app/(dashboard)/dashboard/campaigns/page.tsx`

```typescript
import { Suspense } from 'react'
import { CampaignsClient } from './campaigns-client'
import { getCampaignsData } from '@/lib/ssr-data' // SSR data fetching

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'

  // Fetch initial data on server
  const initialData = await getCampaignsData(statusFilter)

  return (
    <Suspense fallback={<Loading />}>
      <CampaignsClient 
        initialData={initialData}
        initialStatus={statusFilter}
      />
    </Suspense>
  )
}
```

### `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx`

```typescript
"use client"

import { useCampaigns } from '@/features/campaigns'
import { CampaignList } from '@/features/campaigns'
import { CampaignFilters } from '@/features/campaigns'

export function CampaignsClient({
  initialData,
  initialStatus,
}: {
  initialData: CampaignSearchResponse
  initialStatus: string
}) {
  // Use the hook - it will use initialData for SSR hydration
  const { data, isLoading } = useCampaigns({
    status: initialStatus as CampaignStatus,
  })

  // Use data from hook (includes initialData on first render)
  const campaigns = data?.campaigns || initialData.campaigns

  return (
    <div>
      <CampaignFilters />
      <CampaignList campaigns={campaigns} />
    </div>
  )
}
```

---

## ✅ Benefits of This Structure

1. **Clear Boundaries** - Everything related to campaigns is in one place
2. **Easy to Find** - Know exactly where to look for campaign code
3. **Type Safety** - Single source of truth for types
4. **Reusable** - Components and hooks can be easily reused
5. **Testable** - Easy to test in isolation
6. **AI-Friendly** - Clear structure helps AI understand the codebase
7. **Scalable** - Easy to add new features following the same pattern

---

## 🎯 Key Takeaways

1. **Feature-based organization** - Related code एक साथ
2. **Public API via index.ts** - Clean exports
3. **Single source of truth** - Types, API calls, validation
4. **Documentation** - JSDoc comments everywhere
5. **Consistent patterns** - Same structure across all features

---

यह structure follow करने से codebase maintainable और AI-friendly हो जाता है! 🚀




