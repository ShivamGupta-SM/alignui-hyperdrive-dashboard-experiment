import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizations } from '@/lib/mocks'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const org = mockOrganizations.find(o => o.id === orgId)

    if (!org) {
      return notFoundResponse('Organization')
    }

    return successResponse(org)
  } catch (error) {
    console.error('Current organization error:', error)
    return serverErrorResponse('Failed to fetch current organization')
  }
}
