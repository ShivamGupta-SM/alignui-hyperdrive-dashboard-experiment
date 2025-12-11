/**
 * Platforms API Mock Handlers
 */

import { http } from 'msw'
import { mockPlatforms } from '@/lib/mocks'
import {
  delay,
  DELAY,
  successResponse,
  notFoundResponse,
} from './utils'

export const platformsHandlers = [
  // GET /api/platforms - List all platforms
  http.get('/api/platforms', async () => {
    await delay(DELAY.FAST)

    return successResponse(mockPlatforms)
  }),

  // GET /api/platforms/active - List active platforms only
  http.get('/api/platforms/active', async () => {
    await delay(DELAY.FAST)

    const activePlatforms = mockPlatforms.filter(p => p.isActive)
    return successResponse(activePlatforms)
  }),

  // GET /api/platforms/:id - Get single platform by ID
  http.get('/api/platforms/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const platform = mockPlatforms.find(p => p.id === id)

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  }),

  // GET /api/platforms/name/:name - Get platform by name/slug
  http.get('/api/platforms/name/:name', async ({ params }) => {
    await delay(DELAY.FAST)

    const { name } = params
    const decodedName = decodeURIComponent(name as string).toLowerCase()

    const platform = mockPlatforms.find(
      p => p.name.toLowerCase() === decodedName || p.slug === decodedName
    )

    if (!platform) {
      return notFoundResponse('Platform')
    }

    return successResponse(platform)
  }),
]
