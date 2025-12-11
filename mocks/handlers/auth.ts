/**
 * Auth API Mock Handlers
 *
 * Note: Most auth is handled by Better-Auth library.
 * These handlers are for custom auth-related endpoints.
 */

import { http } from 'msw'
import { mockUser, mockOrganizations, mockShopperProfiles, mockDeliverableTypes } from '@/lib/mocks'
import {
  delay,
  DELAY,
  successResponse,
  notFoundResponse,
} from './utils'

export const authHandlers = [
  // GET /api/shoppers/:id
  http.get('/api/shoppers/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const shopper = mockShopperProfiles.find(s => s.id === id)

    if (!shopper) {
      return notFoundResponse('Shopper')
    }

    return successResponse(shopper)
  }),

  // GET /api/deliverables
  http.get('/api/deliverables', async ({ request }) => {
    await delay(DELAY.FAST)

    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('activeOnly') === 'true'

    let deliverables = [...mockDeliverableTypes]

    if (activeOnly) {
      deliverables = deliverables.filter(d => d.isActive)
    }

    return successResponse(deliverables)
  }),

  // GET /api/deliverables/:id
  http.get('/api/deliverables/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const deliverable = mockDeliverableTypes.find(d => d.id === id)

    if (!deliverable) {
      return notFoundResponse('Deliverable type')
    }

    return successResponse(deliverable)
  }),

  // Storage handlers (mock file uploads)
  // POST /api/storage/upload-url
  http.post('/api/storage/upload-url', async ({ request }) => {
    await delay(DELAY.FAST)

    const body = await request.json() as Record<string, unknown>
    const { filename, contentType } = body as {
      filename?: string
      contentType?: string
    }

    const key = `uploads/${Date.now()}-${filename}`

    return successResponse({
      uploadUrl: `https://storage.example.com/${key}?signed=true`,
      key,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
  }),

  // GET /api/storage/download-url
  http.get('/api/storage/download-url', async ({ request }) => {
    await delay(DELAY.FAST)

    const url = new URL(request.url)
    const key = url.searchParams.get('key')

    if (!key) {
      return notFoundResponse('File')
    }

    return successResponse({
      downloadUrl: `https://storage.example.com/${key}?signed=true&download=true`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
  }),

  // GET /api/storage/files/:key
  http.get('/api/storage/files/:key', async ({ params }) => {
    await delay(DELAY.FAST)

    const { key } = params

    return successResponse({
      key,
      url: `https://storage.example.com/${key}`,
      contentType: 'image/png',
      size: 102400,
      createdAt: new Date().toISOString(),
    })
  }),

  // DELETE /api/storage/files/:key
  http.delete('/api/storage/files/:key', async () => {
    await delay(DELAY.FAST)
    return successResponse({ message: 'File deleted successfully' })
  }),

  // Onboarding
  // POST /api/onboarding/submit
  http.post('/api/onboarding/submit', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = await request.json() as Record<string, unknown>

    return successResponse({
      status: 'pending_review',
      message: 'Your onboarding submission has been received and is being reviewed.',
      submittedData: body,
    })
  }),
]
