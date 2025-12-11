import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockGstDetailsByOrg } from '@/lib/mocks'

const updateGstSchema = z.object({
  gstNumber: z.string().length(15, 'GST number must be 15 characters').regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format'),
})

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const gstDetails = mockGstDetailsByOrg[orgId] || mockGstDetailsByOrg['1']

    return successResponse(gstDetails)
  } catch (error) {
    console.error('GST GET error:', error)
    return serverErrorResponse('Failed to fetch GST details')
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, updateGstSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { gstNumber } = parsed.data

    await delay(DELAY.SLOW)

    // In production, verify GST with government API
    // For mock, simulate verification
    const isValid = gstNumber.startsWith('27') || gstNumber.startsWith('06') || gstNumber.startsWith('09')

    if (!isValid) {
      return errorResponse('GST verification failed. Please check the number and try again.', 400)
    }

    // Extract state code and determine state
    const stateCode = gstNumber.substring(0, 2)
    const stateMap: Record<string, string> = {
      '27': 'Maharashtra',
      '06': 'Haryana',
      '09': 'Uttar Pradesh',
      '29': 'Karnataka',
      '33': 'Tamil Nadu',
      '07': 'Delhi',
    }

    const gstDetails = {
      gstNumber,
      legalName: auth.context.organization.name,
      tradeName: auth.context.organization.name.replace(' Pvt. Ltd.', '').replace(' Private Limited', ''),
      state: stateMap[stateCode] || 'Unknown',
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    }

    return successResponse(gstDetails)
  } catch (error) {
    console.error('GST POST error:', error)
    return serverErrorResponse('Failed to verify GST')
  }
}
