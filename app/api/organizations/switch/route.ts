import { cookies } from 'next/headers'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse, ACTIVE_ORG_COOKIE } from '@/lib/auth-helpers'
import { mockOrganizations } from '@/lib/mocks'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const body = await request.json()
    const { organizationId } = body as { organizationId?: string }

    if (!organizationId) {
      return errorResponse('Organization ID is required', 400)
    }

    await delay(DELAY.MEDIUM)

    const org = mockOrganizations.find(o => o.id === organizationId)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // Set the active organization cookie
    const cookieStore = await cookies()
    cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return successResponse({
      message: 'Organization switched successfully',
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    })
  } catch (error) {
    console.error('Switch organization error:', error)
    return serverErrorResponse('Failed to switch organization')
  }
}
