'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { campaigns } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'

// Re-export types from Encore for convenience
export type Deliverable = campaigns.Deliverable
export type DeliverableStatus = campaigns.DeliverableStatus
export type CampaignDeliverableResponse = campaigns.CampaignDeliverableResponse

// ============================================
// Query Keys
// ============================================

export const deliverableKeys = {
  all: ['deliverables'] as const,
  lists: () => [...deliverableKeys.all, 'list'] as const,
  list: (filters?: { status?: DeliverableStatus }) => [...deliverableKeys.lists(), filters] as const,
  details: () => [...deliverableKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliverableKeys.details(), id] as const,
  campaign: (campaignId: string) => [...deliverableKeys.all, 'campaign', campaignId] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all deliverable types from catalog
 */
export function useDeliverableTypes(status?: DeliverableStatus) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: deliverableKeys.list({ status }),
    queryFn: async () => {
      const result = await client.campaigns.listDeliverables({
        status,
      })
      return result.data
    },
    staleTime: STALE_TIMES.STATIC, // Deliverable types rarely change
  })
}

/**
 * Fetch single deliverable type by ID
 */
export function useDeliverableType(id: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: deliverableKeys.detail(id),
    queryFn: () => client.campaigns.getDeliverable(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
  })
}

/**
 * Fetch deliverables for a campaign
 */
export function useCampaignDeliverables(campaignId: string) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: deliverableKeys.campaign(campaignId),
    queryFn: async () => {
      const result = await client.campaigns.listCampaignDeliverables(campaignId)
      return result.data
    },
    enabled: !!campaignId,
    staleTime: STALE_TIMES.STANDARD,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Add a deliverable to a campaign
 */
export function useAddCampaignDeliverable() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: campaigns.AddCampaignDeliverableRequest) =>
      client.campaigns.addCampaignDeliverable(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.campaign(variables.campaignId) })
    },
  })
}

/**
 * Add multiple deliverables to a campaign (batch operation)
 */
export function useAddCampaignDeliverablesBatch(campaignId: string) {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (deliverables: { deliverableId: string; quantity?: number; payout?: number }[]) =>
      client.campaigns.addCampaignDeliverablesBatch(campaignId, { deliverables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.campaign(campaignId) })
    },
  })
}

/**
 * Update a campaign deliverable
 */
export function useUpdateCampaignDeliverable() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: ({
      id,
      quantity,
      isRequired,
      instructions,
    }: {
      id: string
      quantity?: number
      isRequired?: boolean
      instructions?: string
    }) =>
      client.campaigns.updateCampaignDeliverable(id, { quantity, isRequired, instructions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.all })
    },
  })
}

/**
 * Remove a deliverable from a campaign
 */
export function useRemoveCampaignDeliverable() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) =>
      client.campaigns.removeCampaignDeliverable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliverableKeys.all })
    },
  })
}
