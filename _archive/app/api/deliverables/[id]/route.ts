import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { mockDeliverableTypes } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    await delay(DELAY.FAST)

    const deliverable = mockDeliverableTypes.find(d => d.id === id)

    if (!deliverable) {
      return notFoundResponse('Deliverable type')
    }

    return successResponse(deliverable)
  } catch (error) {
    console.error('Deliverable get error:', error)
    return serverErrorResponse('Failed to fetch deliverable type')
  }
}
