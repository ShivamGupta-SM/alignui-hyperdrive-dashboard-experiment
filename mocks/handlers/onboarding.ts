/**
 * Onboarding API Mock Handlers
 */

import { http } from 'msw'
import { encoreUrl, encoreResponse, encoreErrorResponse } from './utils'

export const onboardingHandlers = [
  // POST /onboarding/submit
  http.post(encoreUrl('/onboarding/submit'), async ({ request }) => {
    const body = await request.json() as { organizationName: string; gstNumber?: string }
    
    if (!body.organizationName) {
      return encoreErrorResponse('Organization name is required', 400)
    }

    return encoreResponse({
      organizationId: `org-${Date.now()}`,
      status: 'pending_verification',
      message: 'Your organization has been submitted for verification.',
    })
  }),

  // GET /onboarding/status
  http.get(encoreUrl('/onboarding/status'), async () => {
    return encoreResponse({
      status: 'verified',
      completedSteps: ['basic_info', 'gst_verification', 'bank_account'],
      pendingSteps: [],
    })
  }),
]
