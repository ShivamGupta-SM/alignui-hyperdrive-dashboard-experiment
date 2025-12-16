/**
 * Campaign Server Actions
 * 
 * @description
 * Server-side actions for campaign mutations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath, updateTag } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/encore"
import { handleServerAuthError } from "@/lib/error-handler"
import type { campaigns } from "@/lib/encore-client"
import type { Result } from "@/shared/lib/errors/types"
import type { Campaign } from "../types"

/**
 * Create a new campaign
 * 
 * @description
 * Creates a new campaign and invalidates related cache.
 * 
 * @param data - Campaign creation data
 * @returns Result with created campaign or error
 * 
 * @example
 * ```ts
 * const result = await createCampaign({ title: "New Campaign", ... })
 * if (result.success) {
 *   console.log("Created:", result.data)
 * } else {
 *   console.error("Error:", result.error)
 * }
 * ```
 */
export async function createCampaign(
  data: Partial<campaigns.CreateCampaignRequest>
): Promise<Result<Campaign>> {
  const client = getEncoreClient()

  try {
    const response = await client.campaigns.createCampaign(data as campaigns.CreateCampaignRequest)
    // Immediate invalidation (Next.js 16)
    updateTag("campaigns")
    updateTag("dashboard")
    // Also revalidate paths for compatibility
    revalidatePath("/dashboard/campaigns")
    return { success: true, data: response }
  } catch (error: unknown) {
    // Handle auth errors (session revoked) - redirects to login if 401/403
    handleServerAuthError(error)
    // If not auth error, return error response
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Update an existing campaign
 * 
 * @description
 * Updates a campaign and invalidates related cache.
 * 
 * @param id - Campaign ID
 * @param data - Campaign update data
 * @returns Result indicating success or error
 */
export async function updateCampaign(
  id: string,
  data: Partial<campaigns.UpdateCampaignRequest>
): Promise<Result<void>> {
  const client = getEncoreClient()

  try {
    await client.campaigns.updateCampaign(id, data as campaigns.UpdateCampaignRequest)
    revalidatePath("/dashboard/campaigns")
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, data: undefined }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Delete a campaign
 * 
 * @description
 * Deletes a campaign and invalidates related cache.
 * 
 * @param id - Campaign ID
 * @returns Result indicating success or error
 */
export async function deleteCampaign(id: string): Promise<Result<void>> {
  const client = getEncoreClient()

  try {
    await client.campaigns.deleteCampaign(id)
    // Immediate invalidation (Next.js 16)
    updateTag("campaigns")
    updateTag(`campaign-${id}`)
    updateTag("dashboard")
    // Also revalidate paths for compatibility
    revalidatePath("/dashboard/campaigns")
    return { success: true, data: undefined }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Duplicate a campaign
 * 
 * @description
 * Creates a copy of an existing campaign as a draft.
 * 
 * @param id - Campaign ID to duplicate
 * @returns Result with new campaign or error
 */
export async function duplicateCampaign(id: string): Promise<Result<Campaign>> {
  const client = getEncoreClient()

  try {
    const original = await client.campaigns.getCampaign(id)

    // Create new campaign with same data but as draft
    const newCampaign = await client.campaigns.createCampaign({
      productId: original.productId,
      title: `${original.title} (Copy)`,
      description: original.description || "",
      startDate: original.startDate,
      endDate: original.endDate,
      maxEnrollments: original.maxEnrollments,
      campaignType: original.campaignType,
      isPublic: original.isPublic,
    })

    revalidatePath("/dashboard/campaigns")
    return { success: true, data: newCampaign }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Update campaign status
 * 
 * @description
 * Updates campaign status with appropriate state transitions.
 * 
 * @param id - Campaign ID
 * @param action - Status transition action
 * @returns Result with updated campaign or error
 */
export async function updateCampaignStatus(
  id: string,
  action: "submit" | "activate" | "cancel" | "end" | "complete" | "archive" | "unarchive"
): Promise<Result<Campaign>> {
  const client = getEncoreClient()

  try {
    let result: Campaign

    switch (action) {
      case "submit":
        result = await client.campaigns.submitForApproval(id)
        break
      case "activate":
        result = await client.campaigns.activateCampaign(id)
        break
      case "cancel":
        await client.campaigns.updateCampaignStatus(id, { targetStatus: "cancelled" })
        result = await client.campaigns.getCampaign(id)
        break
      case "end":
        result = await client.campaigns.endCampaign(id)
        break
      case "complete":
        await client.campaigns.updateCampaignStatus(id, { targetStatus: "completed" })
        result = await client.campaigns.getCampaign(id)
        break
      case "archive":
        result = await client.campaigns.archiveCampaign(id)
        break
      case "unarchive":
        result = await client.campaigns.unarchiveCampaign(id)
        break
      default:
        return { success: false, error: new Error("Invalid action") }
    }

    revalidatePath("/dashboard/campaigns")
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, data: result }
  } catch (error: unknown) {
    handleServerAuthError(error)
    const errorMessage = error instanceof Error ? error.message : `Failed to ${action} campaign`
    return { success: false, error: new Error(errorMessage) }
  }
}

/**
 * Pause a campaign
 * 
 * @description
 * Pauses an active campaign.
 * 
 * @param id - Campaign ID
 * @param reason - Optional pause reason
 * @returns Result indicating success or error
 */
export async function pauseCampaign(
  id: string,
  reason: string = "Paused by user"
): Promise<Result<void>> {
  const client = getEncoreClient()

  try {
    await client.campaigns.pauseCampaign(id, { reason })
    revalidatePath("/dashboard/campaigns")
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, data: undefined }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Resume a paused campaign
 * 
 * @description
 * Resumes a paused campaign.
 * 
 * @param id - Campaign ID
 * @returns Result indicating success or error
 */
export async function resumeCampaign(id: string): Promise<Result<void>> {
  const client = getEncoreClient()

  try {
    await client.campaigns.resumeCampaign(id)
    revalidatePath("/dashboard/campaigns")
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, data: undefined }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * End a campaign
 * 
 * @description
 * Ends an active campaign.
 * 
 * @param id - Campaign ID
 * @returns Result indicating success or error
 */
export async function endCampaign(id: string): Promise<Result<void>> {
  const client = getEncoreClient()

  try {
    await client.campaigns.endCampaign(id)
    revalidatePath("/dashboard/campaigns")
    revalidatePath(`/dashboard/campaigns/${id}`)
    return { success: true, data: undefined }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

/**
 * Export campaign enrollments
 * 
 * @description
 * Exports campaign enrollment data for CSV generation.
 * 
 * @param campaignId - Campaign ID
 * @returns Result with export data or error
 */
export async function exportCampaignEnrollments(
  campaignId: string
): Promise<Result<{
  data: unknown[]
  totalCount: number
  campaignTitle: string
  exportedAt: string
}>> {
  const client = getEncoreClient()

  try {
    const result = await client.enrollments.exportEnrollments(campaignId, {})
    return {
      success: true,
      data: {
        data: result.data,
        totalCount: result.totalCount,
        campaignTitle: result.campaignTitle,
        exportedAt: result.exportedAt,
      },
    }
  } catch (error: unknown) {
    handleServerAuthError(error)
    return { success: false, error: handleAPIError(error) }
  }
}

