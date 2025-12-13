/**
 * Organizations API Mock Handlers - DB Only
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreNotFoundResponse,
} from './utils'

export const organizationsHandlers = [
  // GET /organizations/me - Get my organizations
  http.get(encoreUrl('/organizations/me'), async () => {
    const orgs = db.organizationSettings.findMany({})
    
    return encoreResponse({ 
      organizations: orgs.map(o => ({
        id: o.organizationId,
        name: o.name,
        slug: o.name.toLowerCase().replace(/\s+/g, '-'),
        logo: o.logo,
      }))
    })
  }),

  // GET /organizations/:id - Get organization
  http.get(encoreUrl('/organizations/:id'), async ({ params }) => {
    const { id } = params as { id: string }
    const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

    if (!org) {
      return encoreNotFoundResponse('Organization')
    }

    return encoreResponse({
      id: org.organizationId,
      name: org.name,
      slug: org.name.toLowerCase().replace(/\s+/g, '-'),
      logo: org.logo,
    })
  }),

  // GET /organizations/current - Get current organization
  http.get(encoreUrl('/organizations/current'), async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: auth.organizationId }))
      || db.organizationSettings.findFirst((q) => q.where({}))

    if (!org) {
      return encoreNotFoundResponse('Organization')
    }

    return encoreResponse({
      id: org.organizationId,
      name: org.name,
      slug: org.name.toLowerCase().replace(/\s+/g, '-'),
      logo: org.logo,
    })
  }),

  // PUT /organizations/:id - Update organization
  http.put(encoreUrl('/organizations/:id'), async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json() as Record<string, unknown>

    const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
    if (!org) {
      return encoreNotFoundResponse('Organization')
    }

    const updated = { ...org, ...body }
    
    return encoreResponse({
      id: updated.organizationId,
      name: updated.name,
      slug: String(updated.name).toLowerCase().replace(/\s+/g, '-'),
      logo: updated.logo,
    })
  }),

  // POST /organizations - Create organization
  http.post(encoreUrl('/organizations'), async ({ request }) => {
    const body = await request.json() as { name: string; logo?: string }
    
    const newOrg = {
      organizationId: `org-${Date.now()}`,
      name: body.name,
      logo: body.logo || null,
    }

    return encoreResponse({
      id: newOrg.organizationId,
      name: newOrg.name,
      slug: newOrg.name.toLowerCase().replace(/\s+/g, '-'),
      logo: newOrg.logo,
    })
  }),
]
