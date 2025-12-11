/**
 * Onboarding API Mock Handlers
 *
 * Handles onboarding submission flow
 */

import { http } from 'msw'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  errorResponse,
} from './utils'

// GST number validation regex (Indian format)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export const onboardingHandlers = [
  // POST /api/onboarding/submit - Submit onboarding application
  // Schema matches app/api/onboarding/submit/route.ts
  http.post('/api/onboarding/submit', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const body = (await request.json()) as Record<string, unknown>

    const { step, basicInfo, businessDetails, verification } = body as {
      step?: number
      basicInfo?: {
        name?: string
        description?: string
        website?: string
      }
      businessDetails?: {
        businessType?: string
        industryCategory?: string
        contactPerson?: string
        phone?: string
        address?: string
        city?: string
        state?: string
        pinCode?: string
      }
      verification?: {
        gstNumber?: string
        gstVerified?: boolean
        panNumber?: string
        panVerified?: boolean
        cinNumber?: string
      }
    }

    // Validate required fields
    if (!basicInfo?.name || basicInfo.name.length < 2) {
      return errorResponse('Organization name is required', 400)
    }

    // Validate website URL if provided
    if (basicInfo.website && basicInfo.website !== '') {
      try {
        new URL(basicInfo.website)
      } catch {
        return errorResponse('Invalid website URL', 400)
      }
    }

    // Validate GST verification
    if (!verification?.gstVerified) {
      return errorResponse('GST verification is required', 400)
    }

    // Validate GST number format if provided
    if (verification.gstNumber && !GST_REGEX.test(verification.gstNumber)) {
      return errorResponse('Invalid GST number format', 400)
    }

    // Return successful submission response (matching Encore submitOnboardingApplication)
    return successResponse(
      {
        id: `onb-${Date.now()}`,
        organizationId: auth.organizationId,
        userId: auth.userId,
        status: 'pending_review',
        basicInfo: {
          name: basicInfo.name,
          description: basicInfo.description || null,
          website: basicInfo.website || null,
        },
        businessDetails: businessDetails
          ? {
              businessType: businessDetails.businessType,
              industryCategory: businessDetails.industryCategory,
              contactPerson: businessDetails.contactPerson,
              phone: businessDetails.phone,
              address: businessDetails.address,
              city: businessDetails.city,
              state: businessDetails.state,
              pinCode: businessDetails.pinCode,
            }
          : null,
        verification: {
          gstNumber: verification.gstNumber || null,
          gstVerified: verification.gstVerified,
          panNumber: verification.panNumber || null,
          panVerified: verification.panVerified || false,
          cinNumber: verification.cinNumber || null,
        },
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '1-2 business days',
        message: 'Application submitted successfully',
      },
      201
    )
  }),

  // GET /api/onboarding/status - Get onboarding status
  http.get('/api/onboarding/status', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()

    // Return mock onboarding status
    return successResponse({
      organizationId: auth.organizationId,
      status: 'pending_review', // pending_review, approved, rejected, incomplete
      completedSteps: ['basic_info', 'business_details', 'verification'],
      currentStep: 'review',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      estimatedReviewTime: '1-2 business days',
    })
  }),
]
