/**
 * Deliverables API Mock Handlers
 */

import { http } from 'msw'
import { mockDeliverableTypes } from '@/lib/mocks'
import {
  delay,
  DELAY,
  successResponse,
  notFoundResponse,
} from './utils'

export const deliverablesHandlers = [
  // GET /api/deliverables - List all active deliverable types
  http.get('/api/deliverables', async () => {
    await delay(DELAY.FAST)

    const activeDeliverables = mockDeliverableTypes.filter(d => d.isActive)
    return successResponse(activeDeliverables)
  }),

  // GET /api/deliverables/:id - Get single deliverable type
  http.get('/api/deliverables/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const deliverable = mockDeliverableTypes.find(d => d.id === id)

    if (!deliverable) {
      return notFoundResponse('Deliverable type')
    }

    return successResponse(deliverable)
  }),
]
