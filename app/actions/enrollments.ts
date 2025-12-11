'use server'

import { revalidatePath } from 'next/cache'
import type { EnrollmentActionResult } from '@/lib/types'
import {
  updateEnrollmentBodySchema,
  bulkUpdateEnrollmentBodySchema,
} from '@/lib/validations'
import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'

// Schema for export parameters
const exportEnrollmentsSchema = z.object({
  status: z.string().optional(),
  campaignId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  format: z.enum(['csv', 'xlsx']),
})

export async function updateEnrollmentStatus(
  id: string,
  status: unknown,
  reason?: string
): Promise<EnrollmentActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Enrollment ID is required' }
  }

  // Validate input
  const validation = updateEnrollmentBodySchema.safeParse({ status, reason })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would update the database
  revalidatePath('/dashboard/enrollments')
  revalidatePath(`/dashboard/enrollments/${id}`)
  revalidatePath('/dashboard') // Dashboard shows pending count

  return { success: true, status: validation.data.status }
}

export async function bulkUpdateEnrollments(
  ids: unknown,
  status: unknown,
  reason?: string
): Promise<EnrollmentActionResult> {
  // Validate input
  const validation = bulkUpdateEnrollmentBodySchema.safeParse({ ids, status, reason })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.LONG)

  // In a real app, this would batch update in database
  revalidatePath('/dashboard/enrollments')
  revalidatePath('/dashboard')

  return { success: true, updatedCount: validation.data.ids.length }
}

export async function requestEnrollmentChanges(
  id: string,
  message: string
): Promise<EnrollmentActionResult> {
  // Validate id
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Enrollment ID is required' }
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.length < 10) {
    return { success: false, error: 'Please provide a detailed message (at least 10 characters)' }
  }

  if (message.length > 1000) {
    return { success: false, error: 'Message must be less than 1000 characters' }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would update status and send notification
  revalidatePath('/dashboard/enrollments')
  revalidatePath(`/dashboard/enrollments/${id}`)

  return { success: true }
}

export async function exportEnrollments(params: unknown): Promise<EnrollmentActionResult> {
  // Validate input
  const validation = exportEnrollmentsSchema.safeParse(params)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid export parameters',
    }
  }

  await delay(DELAY.EXPORT)

  // In a real app, this would generate and return a download URL
  const exportId = `export_${Date.now()}`

  return {
    success: true,
    downloadUrl: `/api/exports/${exportId}.${validation.data.format}`,
  }
}
