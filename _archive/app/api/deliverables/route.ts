import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { mockDeliverableTypes } from '@/lib/mocks'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    // Return only active deliverable types
    const deliverables = mockDeliverableTypes.filter(d => d.isActive)

    return successResponse(deliverables)
  } catch (error) {
    console.error('Deliverables list error:', error)
    return serverErrorResponse('Failed to fetch deliverable types')
  }
}
