'use server'

import { revalidatePath } from 'next/cache'
import { getEncoreClient } from '@/lib/encore'
import type { campaigns, shared } from '@/lib/encore-client'

// ===========================================
// CAMPAIGN CRUD ACTIONS
// ===========================================

export async function createCampaign(data: Partial<campaigns.CreateCampaignRequest>) {
  const client = getEncoreClient()

  try {
    const response = await client.campaigns.createCampaign(data as campaigns.CreateCampaignRequest)
    revalidatePath('/dashboard/campaigns')
    return { success: true, campaign: response }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create campaign' }
  }
}

export async function updateCampaign(id: string, data: Partial<campaigns.UpdateCampaignRequest>) {
  const client = getEncoreClient()

  try {
    await client.campaigns.updateCampaign(id, data as campaigns.UpdateCampaignRequest)
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update campaign' }
  }
}

export async function deleteCampaign(id: string) {
  const client = getEncoreClient()

  try {
    await client.campaigns.deleteCampaign(id)
    revalidatePath('/dashboard/campaigns')
    return { success: true, message: 'Campaign deleted' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete campaign' }
  }
}

// Duplicate campaign - Encore doesn't have a dedicated endpoint, so we:
// 1. Get the campaign data
// 2. Create a new campaign with same data (as draft)
export async function duplicateCampaign(id: string) {
  const client = getEncoreClient()

  try {
    const original = await client.campaigns.getCampaign(id)

    // Create new campaign with same data but as draft
    // Only use properties that exist on CreateCampaignRequest
    const newCampaign = await client.campaigns.createCampaign({
      productId: original.productId,
      title: `${original.title} (Copy)`,
      description: original.description || '',
      startDate: original.startDate,
      endDate: original.endDate,
      maxEnrollments: original.maxEnrollments,
      campaignType: original.campaignType,
      isPublic: original.isPublic,
    })

    revalidatePath('/dashboard/campaigns')
    return { success: true, campaign: newCampaign, message: 'Campaign duplicated as draft' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to duplicate campaign' }
  }
}

// ===========================================
// CAMPAIGN STATUS TRANSITIONS
// ===========================================

export async function updateCampaignStatus(id: string, action: 'submit' | 'activate' | 'cancel' | 'end' | 'complete' | 'archive' | 'unarchive') {
  const client = getEncoreClient()

  try {
    let result: campaigns.Campaign

    switch (action) {
      case 'submit':
        result = await client.campaigns.submitForApproval(id)
        break
      case 'activate':
        result = await client.campaigns.activateCampaign(id)
        break
      case 'cancel':
        result = await client.campaigns.cancelCampaign(id)
        break
      case 'end':
        result = await client.campaigns.endCampaign(id)
        break
      case 'complete':
        result = await client.campaigns.completeCampaign(id)
        break
      case 'archive':
        result = await client.campaigns.archiveCampaign(id)
        break
      case 'unarchive':
        result = await client.campaigns.unarchiveCampaign(id)
        break
      default:
        return { success: false, error: 'Invalid action' }
    }

    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, campaign: result }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : `Failed to ${action} campaign`
    return { success: false, error: errorMessage }
  }
}

// Pause campaign
export async function pauseCampaign(id: string, reason: string = 'Paused by user') {
  const client = getEncoreClient()

  try {
    await client.campaigns.pauseCampaign(id, { reason })
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, message: 'Campaign paused' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to pause campaign' }
  }
}

// Resume campaign
export async function resumeCampaign(id: string) {
  const client = getEncoreClient()

  try {
    await client.campaigns.resumeCampaign(id)
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, message: 'Campaign resumed' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to resume campaign' }
  }
}

// Legacy function - now uses endCampaign from Encore
export async function endCampaign(id: string) {
  const client = getEncoreClient()

  try {
    await client.campaigns.endCampaign(id)
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, message: 'Campaign ended' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to end campaign' }
  }
}

// ===========================================
// CAMPAIGN EXPORT
// ===========================================

export async function exportCampaignEnrollments(campaignId: string) {
  const client = getEncoreClient()

  try {
    // Use Encore's export endpoint - returns data array for client-side CSV generation
    const result = await client.enrollments.exportEnrollments(campaignId, {})
    return {
      success: true,
      message: 'Export ready',
      data: result.data,
      totalCount: result.totalCount,
      campaignTitle: result.campaignTitle,
      exportedAt: result.exportedAt,
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to export enrollments' }
  }
}
