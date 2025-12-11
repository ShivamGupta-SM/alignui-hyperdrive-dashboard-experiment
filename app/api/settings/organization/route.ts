import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizationSettingsByOrg, mockOrganizations } from '@/lib/mocks'

const updateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50).regex(/^@?[a-z0-9-]+$/, 'Invalid slug format').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Invalid phone number').max(15).optional(),
  address: z.string().max(500).optional(),
  industry: z.string().optional(),
  description: z.string().max(1000).optional(),
})

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const settings = mockOrganizationSettingsByOrg[orgId] || mockOrganizationSettingsByOrg['1']
    const organization = mockOrganizations.find(o => o.id === orgId) || mockOrganizations[0]

    return successResponse({
      ...settings,
      id: organization.id,
      status: organization.status,
      businessType: organization.businessType,
      industryCategory: organization.industryCategory,
      gstVerified: organization.gstVerified,
      panVerified: organization.panVerified,
      creditLimit: organization.creditLimit,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    })
  } catch (error) {
    console.error('Organization GET error:', error)
    return serverErrorResponse('Failed to fetch organization settings')
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, updateOrganizationSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const orgId = auth.context.organizationId
    const updates = parsed.data

    await delay(DELAY.MEDIUM)

    // In production, update in database
    const currentSettings = mockOrganizationSettingsByOrg[orgId] || mockOrganizationSettingsByOrg['1']
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
    }

    return successResponse(updatedSettings)
  } catch (error) {
    console.error('Organization PATCH error:', error)
    return serverErrorResponse('Failed to update organization settings')
  }
}
