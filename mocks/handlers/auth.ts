/**
 * Auth API Mock Handlers - DB Only
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { encoreUrl, encoreResponse, encoreErrorResponse } from './utils'

// Static user for auth
const mockUser = {
  id: '1',
  email: 'admin@hypedrive.io',
  name: 'Admin User',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
}

export const authHandlers = [
  // POST /auth/login
  http.post(encoreUrl('/auth/login'), async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (!body.email || !body.password) {
      return encoreErrorResponse('Email and password are required', 400)
    }

    const orgs = db.organizationSettings.findMany({})

    return encoreResponse({
      user: mockUser,
      organizations: orgs.map(o => ({
        id: o.organizationId,
        name: o.name,
        slug: o.name.toLowerCase().replace(/\s+/g, '-'),
      })),
      token: 'mock-jwt-token',
    })
  }),

  // POST /auth/logout
  http.post(encoreUrl('/auth/logout'), async () => {
    return encoreResponse({ success: true })
  }),

  // POST /auth/register
  http.post(encoreUrl('/auth/register'), async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name: string }
    
    if (!body.email || !body.password || !body.name) {
      return encoreErrorResponse('Email, password, and name are required', 400)
    }

    return encoreResponse({
      user: { ...mockUser, email: body.email, name: body.name },
      token: 'mock-jwt-token',
    })
  }),

  // GET /auth/session
  http.get(encoreUrl('/auth/session'), async () => {
    const orgs = db.organizationSettings.findMany({})
    
    return encoreResponse({
      user: mockUser,
      organizations: orgs.map(o => ({
        id: o.organizationId,
        name: o.name,
        slug: o.name.toLowerCase().replace(/\s+/g, '-'),
      })),
    })
  }),

  // POST /auth/refresh
  http.post(encoreUrl('/auth/refresh'), async () => {
    return encoreResponse({ token: 'mock-refreshed-jwt-token' })
  }),

  // GET /shoppers/:id (shopper profile)
  http.get(encoreUrl('/shoppers/:id'), async ({ params }) => {
    const { id } = params
    
    // Find shopper from enrollments
    const enrollment = db.enrollments.findFirst((q) => q.where({ shopperId: id as string }))
    
    if (!enrollment?.shopper) {
      return encoreResponse({
        id,
        displayName: 'Unknown Shopper',
        avatarUrl: null,
        previousEnrollments: 0,
        approvalRate: 0,
      })
    }
    
    return encoreResponse(enrollment.shopper)
  }),

  // GET /deliverables/types
  http.get(encoreUrl('/deliverables/types'), async () => {
    const types = [
      { id: 'order_screenshot', name: 'Order Screenshot', description: 'Screenshot of confirmed order' },
      { id: 'delivery_photo', name: 'Delivery Photo', description: 'Photo of delivered product' },
      { id: 'product_review', name: 'Product Review', description: 'Written or video review' },
      { id: 'social_media_post', name: 'Social Media Post', description: 'Post on social platform' },
      { id: 'unboxing_video', name: 'Unboxing Video', description: 'Video of product unboxing' },
    ]
    
    return encoreResponse({ types })
  }),
]
