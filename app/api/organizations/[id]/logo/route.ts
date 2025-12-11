import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizations } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

    await delay(DELAY.SLOW)

    // Handle both JSON body and FormData
    let logoUrl: string | null = null
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      logoUrl = (body.logoUrl as string) || null
    } else if (contentType?.includes('multipart/form-data')) {
      // For FormData, generate a mock URL
      logoUrl = `https://storage.example.com/logos/${id}/${Date.now()}.png`
    }

    return successResponse({
      id: org.id,
      logo: logoUrl,
      message: 'Logo updated successfully',
    })
  } catch (error) {
    console.error('Update organization logo error:', error)
    return serverErrorResponse('Failed to update organization logo')
  }
}
