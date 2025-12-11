import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockProducts, mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const product = mockProducts.find(
      p => p.id === id && p.organizationId === orgId
    )

    if (!product) {
      return notFoundResponse('Product')
    }

    await delay(DELAY.FAST)

    // Generate mock campaign summaries for this product
    const productCampaigns = mockCampaigns
      .filter(c => c.organizationId === orgId)
      .slice(0, product.campaignCount || 3)
      .map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        enrollmentCount: Math.floor(Math.random() * 50) + 5,
        approvalCount: Math.floor(Math.random() * 30) + 2,
        totalPayout: Math.round(Math.random() * 100000) + 10000,
        startDate: c.startDate,
        endDate: c.endDate,
      }))

    return successResponse(productCampaigns)
  } catch (error) {
    console.error('Product campaigns error:', error)
    return serverErrorResponse('Failed to fetch product campaigns')
  }
}
