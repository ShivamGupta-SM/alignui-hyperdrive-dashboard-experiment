import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizations } from '@/lib/mocks'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    // Extended org type with optional verification status
    interface OrgWithVerification {
      verificationStatus?: string
    }

    // Return organizations the user has access to
    const orgs = mockOrganizations.map(org => {
      const orgData = org as typeof org & OrgWithVerification
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo || null,
        role: org.id === '1' ? 'owner' : 'member',
        status: org.status,
        verificationStatus: orgData.verificationStatus ?? 'pending',
      }
    })

    return successResponse(orgs)
  } catch (error) {
    console.error('My organizations error:', error)
    return serverErrorResponse('Failed to fetch organizations')
  }
}
