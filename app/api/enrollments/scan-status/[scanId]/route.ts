import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ scanId: string }>
}

// Mock scan results store (in production this would be a database)
const mockScanResults: Record<string, {
  scanId: string
  enrollmentId?: string
  campaignId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  extractedData?: {
    orderId?: string
    orderDate?: string
    totalAmount?: number
    productName?: string
    sellerName?: string
    platform?: string
  }
  confidence?: number
  errorMessage?: string
  createdAt: string
  completedAt?: string
}> = {
  'scan_001': {
    scanId: 'scan_001',
    enrollmentId: 'enr_001',
    campaignId: 'camp_001',
    status: 'completed',
    extractedData: {
      orderId: 'ORD-2024-12345',
      orderDate: '2024-12-01',
      totalAmount: 5499,
      productName: 'Samsung Galaxy Earbuds',
      sellerName: 'Samsung Official Store',
      platform: 'Amazon',
    },
    confidence: 0.95,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3500000).toISOString(),
  },
  'scan_002': {
    scanId: 'scan_002',
    enrollmentId: 'enr_002',
    campaignId: 'camp_001',
    status: 'processing',
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
  'scan_003': {
    scanId: 'scan_003',
    enrollmentId: 'enr_003',
    campaignId: 'camp_002',
    status: 'failed',
    errorMessage: 'Could not extract order details from image. Please upload a clearer receipt.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7100000).toISOString(),
  },
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { scanId } = await params

    await delay(DELAY.FAST)

    const scanResult = mockScanResults[scanId]

    if (!scanResult) {
      return notFoundResponse('Scan result')
    }

    return successResponse(scanResult)
  } catch (error) {
    console.error('Scan status error:', error)
    return serverErrorResponse('Failed to fetch scan status')
  }
}
