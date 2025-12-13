'use server'

import { revalidatePath } from 'next/cache'
import { getEncoreClient } from '@/lib/encore'
import type { EnrollmentActionResult } from '@/lib/types'
import type { shared } from '@/lib/encore-client'
import {
  updateEnrollmentBodySchema,
  bulkUpdateEnrollmentBodySchema,
} from '@/lib/validations'
import { z } from 'zod'

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
  status: string,
  reason?: string
): Promise<EnrollmentActionResult> {
  const client = getEncoreClient()

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

  try {
    if (status === 'approved') {
       await client.enrollments.approveEnrollment(id, { remarks: reason })
    } else if (status === 'rejected') {
       await client.enrollments.rejectEnrollment(id, { reason: reason || 'Rejected' })
    } else if (status === 'withdrawn') {
       await client.enrollments.withdrawEnrollment(id)
    } else {
      throw new Error('Invalid status transition')
    }

    revalidatePath('/dashboard/enrollments')
    revalidatePath(`/dashboard/enrollments/${id}`)
    revalidatePath('/dashboard') 
    
    return { success: true, status: status as shared.EnrollmentStatus }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update enrollment status'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function bulkUpdateEnrollments(
  ids: string[],
  status: string,
  reason?: string
): Promise<EnrollmentActionResult> {
  const client = getEncoreClient()

  // Validate input
  const validation = bulkUpdateEnrollmentBodySchema.safeParse({ ids, status, reason })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  try {
    if (status === 'approved') {
      await client.enrollments.bulkApproveEnrollments({
        enrollmentIds: ids,
        remarks: reason,
      })
    } else if (status === 'rejected') {
      await client.enrollments.bulkRejectEnrollments({
        enrollmentIds: ids,
        reason: reason || 'Rejected',
      })
    } else {
      throw new Error(`Bulk ${status} not supported`)
    }

    revalidatePath('/dashboard/enrollments')
    revalidatePath('/dashboard')

    return { success: true, updatedCount: ids.length }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to bulk update enrollments',
    }
  }
}

export async function requestEnrollmentChanges(
  id: string,
  message: string
): Promise<EnrollmentActionResult> {
  const client = getEncoreClient()

  // Validate input
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Enrollment ID is required' }
  }
  if (!message || typeof message !== 'string' || message.length < 10) {
    return { success: false, error: 'Please provide a detailed message (at least 10 characters)' }
  }

  try {
    await client.enrollments.requestChanges(id, {
      feedback: message,
    })

    revalidatePath('/dashboard/enrollments')
    revalidatePath(`/dashboard/enrollments/${id}`)

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to request changes',
    }
  }
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

  // Use Encore's export endpoint
  const client = getEncoreClient()
  
  try {
    // Encore exportEnrollments only accepts campaignId and status
    // Date filters would need to be applied client-side or via a different endpoint
    if (!validation.data.campaignId) {
      return {
        success: false,
        error: 'Campaign ID is required for export',
      }
    }
    
    const result = await client.enrollments.exportEnrollments(validation.data.campaignId, {
      status: validation.data.status as shared.EnrollmentStatus | undefined,
    })
    
    // ExportResponse doesn't have downloadUrl, so we return the data for client-side CSV generation
    return {
      success: true,
      data: result.data,
      totalCount: result.totalCount,
      campaignTitle: result.campaignTitle,
      exportedAt: result.exportedAt,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to export enrollments'
    return {
      success: false,
      error: errorMessage,
    }
  }
}
