import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizations } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const body = await request.json()

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    const { requestedAmount, reason, documents } = body as {
      requestedAmount?: number
      reason?: string
      documents?: string[]
    }

    if (!requestedAmount || requestedAmount <= org.creditLimit) {
      return errorResponse('Requested amount must be greater than current credit limit', 400)
    }

    if (!reason || reason.length < 10) {
      return errorResponse('Please provide a detailed reason for the credit increase', 400)
    }

    await delay(DELAY.MEDIUM)

    const requestId = `cr-${Date.now()}`

    return successResponse({
      requestId,
      organizationId: id,
      currentCreditLimit: org.creditLimit,
      requestedAmount,
      reason,
      documents: documents || [],
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '3-5 business days',
      message: 'Credit increase request submitted successfully',
    })
  } catch (error) {
    console.error('Credit increase request error:', error)
    return serverErrorResponse('Failed to submit credit increase request')
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    await delay(DELAY.FAST)

    // Mock credit increase request history
    const requests = [
      {
        id: 'cr-1',
        organizationId: id,
        previousLimit: 300000,
        requestedAmount: 500000,
        approvedAmount: 500000,
        reason: 'Expanding marketing campaigns for Q4',
        status: 'approved' as const,
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'Admin User',
        notes: 'Approved based on payment history',
      },
      {
        id: 'cr-2',
        organizationId: id,
        previousLimit: 500000,
        requestedAmount: 750000,
        approvedAmount: null,
        reason: 'Planning major campaign expansion',
        status: 'pending_review' as const,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        notes: null,
      },
    ]

    return successResponse(requests)
  } catch (error) {
    console.error('Credit increase history error:', error)
    return serverErrorResponse('Failed to fetch credit increase history')
  }
}
