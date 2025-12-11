import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface ValidationError {
  field: string
  message: string
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.FAST)

    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Required field validations
    if (!campaign.title || campaign.title.length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' })
    }

    if (!campaign.productId) {
      errors.push({ field: 'productId', message: 'Product is required' })
    }

    if (!campaign.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required' })
    }

    if (!campaign.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required' })
    }

    if (campaign.startDate && campaign.endDate) {
      if (new Date(campaign.startDate) >= new Date(campaign.endDate)) {
        errors.push({ field: 'endDate', message: 'End date must be after start date' })
      }
    }

    if (!campaign.maxEnrollments || campaign.maxEnrollments < 1) {
      errors.push({ field: 'maxEnrollments', message: 'Maximum enrollments must be at least 1' })
    }

    // Warnings (non-blocking)
    if (campaign.maxEnrollments && campaign.maxEnrollments < 10) {
      warnings.push({ field: 'maxEnrollments', message: 'Consider increasing enrollment limit for better reach' })
    }

    if (!campaign.description) {
      warnings.push({ field: 'description', message: 'Adding a description helps shoppers understand your campaign' })
    }

    const isValid = errors.length === 0

    return successResponse({
      isValid,
      errors,
      warnings,
      canSubmit: isValid,
    })
  } catch (error) {
    console.error('Campaign validate error:', error)
    return serverErrorResponse('Failed to validate campaign')
  }
}
