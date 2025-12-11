import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockShopperProfiles } from '@/lib/mocks'

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

    await delay(DELAY.FAST)

    const shopper = mockShopperProfiles.find(s => s.id === id)

    if (!shopper) {
      return notFoundResponse('Shopper')
    }

    // Return public profile (without sensitive information)
    return successResponse({
      id: shopper.id,
      name: shopper.name,
      avatar: shopper.avatar,
      totalEnrollments: shopper.totalEnrollments,
      approvedEnrollments: shopper.approvedEnrollments,
      approvalRate: shopper.approvalRate,
      joinedAt: shopper.joinedAt,
    })
  } catch (error) {
    console.error('Shopper profile error:', error)
    return serverErrorResponse('Failed to fetch shopper profile')
  }
}
