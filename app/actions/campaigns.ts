'use server'

import { revalidatePath } from 'next/cache'
import type { Campaign, CampaignStatus, CampaignActionResult } from '@/lib/types'
import {
  createCampaignBodySchema,
  updateCampaignBodySchema,
  campaignStatusSchema,
} from '@/lib/validations'
import { delay, DELAY } from '@/lib/utils/delay'
import { getServerActionAuth } from '@/lib/auth-helpers'

export async function createCampaign(data: unknown): Promise<CampaignActionResult> {
  // Authenticate
  const auth = await getServerActionAuth()
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  // Validate input
  const validation = createCampaignBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.SLOW)

  const validData = validation.data

  // In a real app, this would insert into database
  const newCampaign: Partial<Campaign> = {
    id: `camp_${Date.now()}`,
    organizationId: auth.context.organizationId,
    productId: validData.productId,
    title: validData.title,
    description: validData.description,
    type: validData.type,
    status: 'draft' as CampaignStatus,
    isPublic: validData.isPublic,
    maxEnrollments: validData.maxEnrollments,
    currentEnrollments: 0,
    submissionDeadlineDays: validData.submissionDeadlineDays,
    startDate: new Date(validData.startDate),
    endDate: new Date(validData.endDate),
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  revalidatePath('/dashboard/campaigns')

  return { success: true, campaign: newCampaign }
}

export async function updateCampaign(
  id: string,
  data: unknown
): Promise<CampaignActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Campaign ID is required' }
  }

  // Validate input
  const validation = updateCampaignBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would update the database
  revalidatePath('/dashboard/campaigns')
  revalidatePath(`/dashboard/campaigns/${id}`)

  return { success: true }
}

export async function deleteCampaign(id: string): Promise<CampaignActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Campaign ID is required' }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would delete from database
  revalidatePath('/dashboard/campaigns')

  return { success: true }
}

export async function updateCampaignStatus(id: string, status: unknown): Promise<CampaignActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Campaign ID is required' }
  }

  // Validate status
  const statusValidation = campaignStatusSchema.safeParse(status)
  if (!statusValidation.success) {
    return {
      success: false,
      error: statusValidation.error.issues[0]?.message || 'Invalid status',
    }
  }

  await delay(DELAY.STANDARD)

  // In a real app, this would update the status in database
  revalidatePath('/dashboard/campaigns')
  revalidatePath(`/dashboard/campaigns/${id}`)

  return { success: true, status: statusValidation.data }
}

export async function duplicateCampaign(id: string): Promise<CampaignActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Campaign ID is required' }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would duplicate the campaign
  const newId = `camp_${Date.now()}`

  revalidatePath('/dashboard/campaigns')

  return { success: true, newId }
}
