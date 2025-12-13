/**
 * Platforms API Mock Handlers
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { encoreUrl, encoreResponse, encoreListResponse, encoreNotFoundResponse } from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const platformsHandlers = [
  // GET /platforms - List platforms
  http.get(encoreUrl('/platforms'), async () => {
    const platforms = db.platforms.findMany()
    return encoreListResponse(platforms, platforms.length, 0, 50)
  }),

  // GET /platforms/active - Encore client uses this
  http.get(encoreUrl('/platforms/active'), async () => {
    const platforms = db.platforms.findMany()
    return encoreListResponse(platforms, platforms.length, 0, 50)
  }),

  // GET /platforms/all
  http.get(encoreUrl('/platforms/all'), async () => {
    const platforms = db.platforms.findMany()
    return encoreResponse({ platforms })
  }),

  // GET /platforms/:id
  http.get(encoreUrl('/platforms/:id'), async ({ params }) => {
    await delay(DELAY.FAST)
    const { id } = params
    const platform = db.platforms.findFirst((q) => q.where({ id }))
    if (!platform) return encoreNotFoundResponse('Platform')
    return encoreResponse(platform)
  }),
]
