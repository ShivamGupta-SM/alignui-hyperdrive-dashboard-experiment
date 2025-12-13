/**
 * Settings API Mock Handlers
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreErrorResponse } from './utils'

export const settingsHandlers = [
  // GET /organizations/:orgId/settings
  http.get(encoreUrl('/organizations/:orgId/settings'), async ({ params }) => {
    const { orgId } = params as { orgId: string }
    const settings = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId || '1' }))
    if (!settings) return encoreErrorResponse('Settings not found', 404)
    return encoreResponse(settings)
  }),

  // PUT /organizations/:orgId/settings
  http.put(encoreUrl('/organizations/:orgId/settings'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const body = await request.json()
    const settings = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId || '1' }))
    if (!settings) return encoreErrorResponse('Settings not found', 404)
    return encoreResponse({ ...settings, ...body })
  }),

  // GET /organizations/:orgId/bank-accounts
  http.get(encoreUrl('/organizations/:orgId/bank-accounts'), async ({ params }) => {
    const { orgId } = params as { orgId: string }
    const accounts = db.bankAccounts.findMany((q) => q.where({ organizationId: orgId || '1' }))
    return encoreResponse({ accounts })
  }),

  // POST /organizations/:orgId/bank-accounts
  http.post(encoreUrl('/organizations/:orgId/bank-accounts'), async ({ request }) => {
    const body = await request.json() as { accountNumber: string; ifscCode: string; accountName: string }
    
    if (!body.accountNumber || !body.ifscCode) {
      return encoreErrorResponse('Account number and IFSC code are required', 400)
    }

    return encoreResponse({
      id: `bank-${Date.now()}`,
      ...body,
      isPrimary: false,
      isVerified: false,
    })
  }),

  // GET /organizations/:orgId/gst
  http.get(encoreUrl('/organizations/:orgId/gst'), async ({ params }) => {
    const { orgId } = params as { orgId: string }
    const gst = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || '1' }))
    if (!gst) return encoreErrorResponse('GST details not found', 404)
    return encoreResponse({
      ...gst,
      registrationDate: gst.registrationDate instanceof Date ? gst.registrationDate.toISOString() : gst.registrationDate,
    })
  }),

  // PUT /organizations/:orgId/gst
  http.put(encoreUrl('/organizations/:orgId/gst'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const body = await request.json()
    const gst = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || '1' }))
    if (!gst) return encoreErrorResponse('GST details not found', 404)
    return encoreResponse({ ...gst, ...body })
  }),
]
