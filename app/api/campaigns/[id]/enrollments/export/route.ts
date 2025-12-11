import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns, mockEnrollments } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    const status = url.searchParams.get('status')

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.MEDIUM)

    // Get enrollments for this campaign
    let enrollments = mockEnrollments.filter(e => e.campaignId === id)

    // Filter by status if provided
    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }

    // Extended enrollment type with optional fields
    interface EnrollmentWithExtras {
      notes?: string
      shopper?: { name: string; email: string; phone?: string }
    }

    // Transform to export format
    const exportData = enrollments.map(e => {
      const enrollmentData = e as typeof e & EnrollmentWithExtras
      return {
        id: e.id,
        orderId: e.orderId,
        shopperName: e.shopper?.name || 'N/A',
        shopperPhone: enrollmentData.shopper?.phone || 'N/A',
        status: e.status,
        orderValue: e.orderValue,
        billAmount: e.billAmount,
        submittedAt: e.createdAt,
        reviewedAt: e.updatedAt,
        notes: enrollmentData.notes || '',
      }
    })

    return successResponse({
      data: exportData,
      totalCount: exportData.length,
      campaignTitle: campaign.title,
      exportedAt: new Date().toISOString(),
      format,
      downloadUrl: `/api/campaigns/${id}/enrollments/download?format=${format}`,
    })
  } catch (error) {
    console.error('Export enrollments error:', error)
    return serverErrorResponse('Failed to export enrollments')
  }
}
