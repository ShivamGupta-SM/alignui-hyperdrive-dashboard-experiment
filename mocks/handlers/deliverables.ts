/**
 * Deliverables API Mock Handlers - DB Only
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { encoreUrl, encoreResponse, encoreNotFoundResponse } from './utils'

// Static deliverable types
const deliverableTypes = [
  { id: 'order_screenshot', name: 'Order Screenshot', description: 'Screenshot of confirmed order', icon: '📸' },
  { id: 'delivery_photo', name: 'Delivery Photo', description: 'Photo of delivered product', icon: '📦' },
  { id: 'product_review', name: 'Product Review', description: 'Written or video review', icon: '⭐' },
  { id: 'social_media_post', name: 'Social Media Post', description: 'Post on social platform', icon: '📱' },
  { id: 'unboxing_video', name: 'Unboxing Video', description: 'Video of product unboxing', icon: '🎬' },
]

export const deliverablesHandlers = [
  // GET /deliverables
  http.get(encoreUrl('/deliverables'), async () => {
    return encoreResponse({ deliverables: deliverableTypes })
  }),

  // GET /deliverables/:id
  http.get(encoreUrl('/deliverables/:id'), async ({ params }) => {
    const { id } = params
    const deliverable = deliverableTypes.find(d => d.id === id)
    if (!deliverable) return encoreNotFoundResponse('Deliverable')
    return encoreResponse(deliverable)
  }),

  // GET /campaigns/:campaignId/deliverables
  http.get(encoreUrl('/campaigns/:campaignId/deliverables'), async ({ params }) => {
    const { campaignId } = params
    
    // Get from db
    const deliverables = db.campaignDeliverables.findMany((q) => q.where({ campaignId: campaignId as string }))
    
    if (deliverables.length === 0) {
      // Return default types if none configured
      return encoreResponse({ deliverables: deliverableTypes })
    }
    
    return encoreResponse({ deliverables })
  }),
]
