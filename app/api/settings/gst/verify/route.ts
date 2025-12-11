import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const verifyGstSchema = z.object({
  gstNumber: z.string().length(15, 'GST number must be 15 characters').regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GST number format'
  ),
})

// Mock GST database for different GST numbers
const mockGstData: Record<string, {
  gstNumber: string
  legalName: string
  tradeName: string
  state: string
  status: 'active' | 'inactive' | 'cancelled'
  registrationDate: string
  businessType: string
}> = {
  '27AABCT1234M1Z5': {
    gstNumber: '27AABCT1234M1Z5',
    legalName: 'HYPRIVE TECHNOLOGIES PRIVATE LIMITED',
    tradeName: 'Hyprive',
    state: 'Maharashtra',
    status: 'active',
    registrationDate: '2020-07-01',
    businessType: 'Private Limited Company',
  },
  '29AABCU9603R1ZM': {
    gstNumber: '29AABCU9603R1ZM',
    legalName: 'URBAN MARKETING SOLUTIONS PVT LTD',
    tradeName: 'Urban Solutions',
    state: 'Karnataka',
    status: 'active',
    registrationDate: '2019-04-15',
    businessType: 'Private Limited Company',
  },
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, verifyGstSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { gstNumber } = parsed.data

    await delay(DELAY.SLOW) // Simulate API call to GST verification service

    // Check if we have mock data for this GST number
    const gstData = mockGstData[gstNumber]

    if (gstData) {
      return successResponse({
        ...gstData,
        isVerified: true,
      })
    }

    // For unknown GST numbers, generate mock data based on the GST number
    const stateCode = gstNumber.substring(0, 2)
    const stateNames: Record<string, string> = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '27': 'Maharashtra',
      '29': 'Karnataka',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '36': 'Telangana',
    }

    return successResponse({
      gstNumber,
      legalName: 'VERIFIED BUSINESS ENTITY',
      tradeName: 'Verified Business',
      state: stateNames[stateCode] || 'Unknown',
      status: 'active' as const,
      isVerified: true,
      registrationDate: '2021-01-01',
      businessType: 'Private Limited Company',
    })
  } catch (error) {
    console.error('GST verification error:', error)
    return serverErrorResponse('Failed to verify GST number')
  }
}
