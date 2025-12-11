import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'

const onboardingSchema = z.object({
  step: z.number(),
  basicInfo: z.object({
    name: z.string().min(2, 'Organization name is required'),
    description: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
  businessDetails: z.object({
    businessType: z.string(),
    industryCategory: z.string(),
    contactPerson: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pinCode: z.string(),
  }).optional(),
  verification: z.object({
    gstNumber: z.string().optional(),
    gstVerified: z.boolean().optional(),
    panNumber: z.string().optional(),
    panVerified: z.boolean().optional(),
    cinNumber: z.string().optional(),
  }).optional(),
})

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, onboardingSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { basicInfo, businessDetails, verification } = parsed.data

    // Validate required fields
    if (!basicInfo?.name) {
      return serverErrorResponse('Organization name is required')
    }

    if (!verification?.gstVerified) {
      return serverErrorResponse('GST verification is required')
    }

    // Simulate processing time
    await delay(DELAY.LONG_VERIFICATION)

    // In production, this would:
    // 1. Create organization record in database
    // 2. Create pending approval request
    // 3. Send notification to admin
    // 4. Send confirmation email to user

    const applicationId = `APP-${Date.now()}`

    return successResponse({
      applicationId,
      status: 'pending_review',
      message: 'Your application has been submitted successfully and is under review.',
      organization: {
        name: basicInfo.name,
        businessType: businessDetails?.businessType,
        gstNumber: verification?.gstNumber,
      },
      estimatedReviewTime: '24-48 hours',
    }, 201)
  } catch (error) {
    console.error('Onboarding submission error:', error)
    return serverErrorResponse('Failed to submit application')
  }
}
