import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockInvoices } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const invoice = mockInvoices.find(
      i => i.id === id && i.organizationId === orgId
    )

    if (!invoice) {
      return notFoundResponse('Invoice')
    }

    await delay(DELAY.FAST)

    // Generate mock line items based on enrollment count
    const lineItems = Array.from({ length: Math.min(invoice.enrollmentCount, 10) }, (_, i) => ({
      id: `line-${id}-${i + 1}`,
      invoiceId: id,
      enrollmentId: `enr-${i + 1}`,
      description: `Enrollment #${i + 1} - Campaign Payout`,
      orderId: `ORD-${100000 + i}`,
      orderValue: Math.round(5000 + Math.random() * 15000),
      billAmount: Math.round(800 + Math.random() * 3000),
      platformFee: 50,
      gstAmount: Math.round(9 + Math.random() * 540),
      totalAmount: Math.round(859 + Math.random() * 3540),
      createdAt: new Date(invoice.createdAt).toISOString(),
    }))

    return successResponse(lineItems)
  } catch (error) {
    console.error('Invoice line items error:', error)
    return serverErrorResponse('Failed to fetch invoice line items')
  }
}
