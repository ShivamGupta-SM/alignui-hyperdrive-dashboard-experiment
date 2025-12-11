import type { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { mockInvoices } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { errorResponse, serverErrorResponse } from '@/lib/api-utils'
import { InvoicePDF } from '@/lib/pdf/invoice-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params

    // Validate id
    if (!id) {
      return errorResponse('Invoice ID is required', 400)
    }

    // Find invoice
    const invoice = mockInvoices.find(i => i.id === id)
    if (!invoice) {
      return errorResponse('Invoice not found', 404)
    }

    await delay(DELAY.STANDARD)

    // Generate PDF using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(InvoicePDF({ invoice }))

    // Convert Node.js Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(pdfBuffer)

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice PDF error:', error)
    return serverErrorResponse('Failed to generate PDF')
  }
}
