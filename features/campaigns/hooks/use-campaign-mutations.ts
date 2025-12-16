/**
 * Campaign Mutation Hooks
 * 
 * @description
 * React Query mutation hooks for campaign operations.
 * Uses centralized server actions with Result pattern.
 */

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { campaignQueryKeys } from '../lib/query-keys'
import * as campaignActions from '../actions/campaigns'
import type {
  Campaign,
} from '../types'
import type { campaigns } from '@/lib/encore-client'

/**
 * Hook: Create campaign mutation
 * 
 * @description
 * Creates a new campaign and invalidates campaign lists.
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * function CreateCampaignForm() {
 *   const createCampaign = useCreateCampaign()
 *   
 *   const handleSubmit = (data) => {
 *     createCampaign.mutate(data, {
 *       onSuccess: (result) => {
 *         if (result.success) {
 *           toast.success("Campaign created!")
 *         } else {
 *           toast.error(result.error.message)
 *         }
 *       }
 *     })
 *   }
 * }
 * ```
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<campaigns.CreateCampaignRequest>) => 
      campaignActions.createCampaign(data),
    onSuccess: () => {
      // Invalidate all campaign lists
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() })
    },
  })
}

/**
 * Hook: Update campaign mutation
 * 
 * @description
 * Updates a campaign and invalidates related queries.
 * 
 * @returns Mutation object with mutate function
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<campaigns.UpdateCampaignRequest> }) =>
      campaignActions.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific campaign and lists
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() })
    },
  })
}

/**
 * Hook: Delete campaign mutation
 * 
 * @description
 * Deletes a campaign and invalidates related queries.
 * 
 * @returns Mutation object with mutate function
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => campaignActions.deleteCampaign(id),
    onSuccess: (_, id) => {
      // Invalidate specific campaign and lists
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() })
    },
  })
}

/**
 * Hook: Update campaign status mutation
 * 
 * @description
 * Updates campaign status and invalidates related queries.
 * 
 * @returns Mutation object with mutate function
 */
export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "submit" | "activate" | "cancel" | "end" | "complete" | "archive" | "unarchive" }) =>
      campaignActions.updateCampaignStatus(id, action),
    onSuccess: (_, variables) => {
      // Invalidate specific campaign and lists
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() })
    },
  })
}

