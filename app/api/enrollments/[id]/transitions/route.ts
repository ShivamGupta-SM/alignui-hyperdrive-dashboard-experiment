import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments, mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Enrollment status transition rules
const TRANSITION_RULES: Record<string, string[]> = {
  enrolled: ['approve', 'reject', 'request_changes', 'withdraw'],
  awaiting_submission: ['submit_deliverables', 'withdraw', 'expire'],
  awaiting_review: ['approve', 'reject', 'request_changes'],
  changes_requested: ['resubmit', 'withdraw', 'expire'],
  approved: [], // Terminal state
  rejected: [], // Terminal state
  withdrawn: [], // Terminal state
  expired: [], // Terminal state
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    // Find the enrollment
    const enrollment = mockEnrollments.find(e => e.id === id)
    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Verify the enrollment belongs to a campaign owned by this organization
    const campaign = mockCampaigns.find(
      c => c.id === enrollment.campaignId && c.organizationId === orgId
    )
    if (!campaign) {
      return notFoundResponse('Enrollment')
    }

    await delay(DELAY.FAST)

    // Get allowed transitions based on current status
    const allowedTransitions = TRANSITION_RULES[enrollment.status] || []

    // Generate transition history (mock data)
    const history = generateTransitionHistory(enrollment)

    return successResponse({
      enrollmentId: id,
      currentStatus: enrollment.status,
      allowedTransitions,
      history,
    })
  } catch (error) {
    console.error('Enrollment transitions error:', error)
    return serverErrorResponse('Failed to fetch enrollment transitions')
  }
}

function generateTransitionHistory(enrollment: typeof mockEnrollments[0]) {
  const history: Array<{
    id: string
    fromStatus: string | null
    toStatus: string
    triggeredBy: string
    triggeredByName: string
    reason: string | null
    createdAt: string
  }> = []

  // Always start with creation
  const createdAt = new Date(enrollment.createdAt)
  history.push({
    id: `${enrollment.id}-1`,
    fromStatus: null,
    toStatus: 'enrolled',
    triggeredBy: 'system',
    triggeredByName: 'System',
    reason: 'Enrollment created',
    createdAt: createdAt.toISOString(),
  })

  // Add more transitions based on current status
  if (enrollment.status !== 'enrolled') {
    const transitions: Array<{ status: string; minutesAfter: number; actor: string; actorName: string; reason?: string }> = []

    switch (enrollment.status) {
      case 'awaiting_submission':
        transitions.push({
          status: 'awaiting_submission',
          minutesAfter: 5,
          actor: 'system',
          actorName: 'System',
          reason: 'Order verified, awaiting deliverable submission',
        })
        break
      case 'awaiting_review':
        transitions.push({
          status: 'awaiting_submission',
          minutesAfter: 5,
          actor: 'system',
          actorName: 'System',
          reason: 'Order verified',
        })
        transitions.push({
          status: 'awaiting_review',
          minutesAfter: 120,
          actor: enrollment.shopperId,
          actorName: enrollment.shopper?.name || 'Shopper',
          reason: 'Deliverables submitted for review',
        })
        break
      case 'changes_requested':
        transitions.push({
          status: 'awaiting_submission',
          minutesAfter: 5,
          actor: 'system',
          actorName: 'System',
        })
        transitions.push({
          status: 'awaiting_review',
          minutesAfter: 120,
          actor: enrollment.shopperId,
          actorName: enrollment.shopper?.name || 'Shopper',
        })
        transitions.push({
          status: 'changes_requested',
          minutesAfter: 180,
          actor: 'brand',
          actorName: 'Brand Team',
          reason: 'Please provide clearer screenshot of the review',
        })
        break
      case 'approved':
        transitions.push({
          status: 'awaiting_submission',
          minutesAfter: 5,
          actor: 'system',
          actorName: 'System',
        })
        transitions.push({
          status: 'awaiting_review',
          minutesAfter: 120,
          actor: enrollment.shopperId,
          actorName: enrollment.shopper?.name || 'Shopper',
        })
        transitions.push({
          status: 'approved',
          minutesAfter: 240,
          actor: 'brand',
          actorName: 'Brand Team',
          reason: 'All deliverables verified successfully',
        })
        break
      case 'rejected':
        transitions.push({
          status: 'awaiting_submission',
          minutesAfter: 5,
          actor: 'system',
          actorName: 'System',
        })
        transitions.push({
          status: 'awaiting_review',
          minutesAfter: 120,
          actor: enrollment.shopperId,
          actorName: enrollment.shopper?.name || 'Shopper',
        })
        transitions.push({
          status: 'rejected',
          minutesAfter: 200,
          actor: 'brand',
          actorName: 'Brand Team',
          reason: 'Order does not match campaign requirements',
        })
        break
    }

    let prevStatus = 'enrolled'
    transitions.forEach((t, i) => {
      const transitionDate = new Date(createdAt.getTime() + t.minutesAfter * 60 * 1000)
      history.push({
        id: `${enrollment.id}-${i + 2}`,
        fromStatus: prevStatus,
        toStatus: t.status,
        triggeredBy: t.actor,
        triggeredByName: t.actorName,
        reason: t.reason || null,
        createdAt: transitionDate.toISOString(),
      })
      prevStatus = t.status
    })
  }

  return history
}
