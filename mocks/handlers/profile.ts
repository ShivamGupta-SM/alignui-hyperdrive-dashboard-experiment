/**
 * Profile API Mock Handlers - DB Only
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreErrorResponse, encoreNotFoundResponse } from './utils'

// Static user (would come from auth in real app)
const mockUser = {
  id: '1',
  email: 'admin@hypedrive.io',
  name: 'Admin User',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  createdAt: new Date().toISOString(),
}

// Static sessions (would be managed by auth service in real app)
const mockSessions = [
  { id: 'sess-1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: new Date().toISOString(), isCurrent: true },
  { id: 'sess-2', device: 'Safari on iPhone', ip: '192.168.1.2', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
]

export const profileHandlers = [
  // GET /profile
  http.get(encoreUrl('/profile'), async () => {
    await delay(DELAY.FAST)
    return encoreResponse(mockUser)
  }),

  // PUT /profile
  http.put(encoreUrl('/profile'), async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return encoreResponse({ ...mockUser, ...body })
  }),

  // GET /profile/sessions
  http.get(encoreUrl('/profile/sessions'), async () => {
    return encoreResponse({ sessions: mockSessions })
  }),

  // DELETE /profile/sessions/:id
  http.delete(encoreUrl('/profile/sessions/:id'), async ({ params }) => {
    await delay(DELAY.MEDIUM)
    const { id } = params
    const session = mockSessions.find(s => s.id === id)
    if (!session) return encoreNotFoundResponse('Session')
    if (session.isCurrent) return encoreErrorResponse('Cannot revoke current session', 400)
    return encoreResponse({ revoked: true })
  }),

  // POST /profile/change-password
  http.post(encoreUrl('/profile/change-password'), async ({ request }) => {
    await delay(DELAY.MEDIUM)
    const body = await request.json() as { currentPassword: string; newPassword: string }
    if (!body.currentPassword || !body.newPassword) {
      return encoreErrorResponse('Current and new password are required', 400)
    }
    return encoreResponse({ success: true })
  }),

  // GET /users/me
  http.get(encoreUrl('/users/me'), async () => {
    await delay(DELAY.FAST)
    return encoreResponse(mockUser)
  }),

  // PUT /users/me
  http.put(encoreUrl('/users/me'), async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return encoreResponse({ ...mockUser, ...body })
  }),
]
