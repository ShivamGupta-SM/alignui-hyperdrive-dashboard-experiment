import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const verifyPanSchema = z.object({
  panNumber: z.string().length(10, 'PAN number must be 10 characters').regex(
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    'Invalid PAN number format'
  ),
  name: z.string().min(2, 'Name is required'),
})

// Mock PAN database
const mockPanData: Record<string, {
  panNumber: string
  registeredName: string
  panType: 'individual' | 'company' | 'trust' | 'other'
}> = {
  'AABCT1234M': {
    panNumber: 'AABCT1234M',
    registeredName: 'HYPRIVE TECHNOLOGIES PRIVATE LIMITED',
    panType: 'company',
  },
  'ABCDE1234F': {
    panNumber: 'ABCDE1234F',
    registeredName: 'RAHUL SHARMA',
    panType: 'individual',
  },
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, verifyPanSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { panNumber, name } = parsed.data

    await delay(DELAY.SLOW) // Simulate API call to PAN verification service

    // Check if we have mock data for this PAN number
    const panData = mockPanData[panNumber]

    if (panData) {
      // Check if name matches (case-insensitive, partial match)
      const normalizedName = name.toUpperCase().trim()
      const registeredName = panData.registeredName.toUpperCase()
      const nameMatch = registeredName.includes(normalizedName) || normalizedName.includes(registeredName.split(' ')[0])

      return successResponse({
        panNumber: panData.panNumber,
        name: panData.registeredName,
        nameMatch,
        isValid: true,
        panType: panData.panType,
      })
    }

    // For unknown PAN numbers, determine type from 4th character
    // A, B, C, F, G, H, L, J, P, T, E
    // P = Individual, C = Company, H = HUF, F = Firm, A = AOP, T = Trust
    const fourthChar = panNumber.charAt(3)
    const panTypeMap: Record<string, 'individual' | 'company' | 'trust' | 'other'> = {
      'P': 'individual',
      'C': 'company',
      'H': 'other', // HUF
      'F': 'other', // Firm
      'A': 'other', // AOP
      'T': 'trust',
    }

    return successResponse({
      panNumber,
      name: name.toUpperCase(),
      nameMatch: true, // Assume match for mock
      isValid: true,
      panType: panTypeMap[fourthChar] || 'other',
    })
  } catch (error) {
    console.error('PAN verification error:', error)
    return serverErrorResponse('Failed to verify PAN number')
  }
}
