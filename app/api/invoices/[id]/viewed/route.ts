import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockInvoices } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === orgId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    await delay(DELAY.FAST)

    return successResponse({
      id: invoice.id,
      viewedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Mark invoice viewed error:', error)
    return serverErrorResponse('Failed to mark invoice as viewed')
  }
}
