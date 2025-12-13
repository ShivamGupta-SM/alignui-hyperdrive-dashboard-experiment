'use server'

import { getEncoreClient } from '@/lib/encore'
import { revalidatePath } from 'next/cache'

/**
 * Generate invoice PDF and return download URL
 */
export async function generateInvoicePDF(invoiceId: string) {
  const client = getEncoreClient()

  try {
    const result = await client.invoices.generateInvoicePDF(invoiceId)
    
    if (!result.pdfUrl) {
      return { 
        success: false, 
        error: 'PDF not yet generated. Please try again later.' 
      }
    }

    return { 
      success: true, 
      pdfUrl: result.pdfUrl 
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to generate invoice PDF' 
    }
  }
}

/**
 * Download invoice PDF as blob
 * This fetches the PDF from the URL and returns it as a blob
 */
export async function downloadInvoicePDF(invoiceId: string) {
  const client = getEncoreClient()

  try {
    // First get the PDF URL
    const result = await client.invoices.generateInvoicePDF(invoiceId)
    
    if (!result.pdfUrl) {
      return { 
        success: false, 
        error: 'PDF not yet generated. Please try again later.' 
      }
    }

    // Fetch the PDF from the URL
    const pdfResponse = await fetch(result.pdfUrl)
    if (!pdfResponse.ok) {
      return { 
        success: false, 
        error: 'Failed to download PDF' 
      }
    }

    const blob = await pdfResponse.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return { 
      success: true, 
      buffer,
      filename: `invoice-${invoiceId}.pdf`,
      contentType: 'application/pdf'
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to download invoice PDF' 
    }
  }
}

/**
 * Get invoice line items with enrollment IDs for export
 * Frontend will fetch enrollments and export to CSV
 */
export async function getInvoiceEnrollmentIds(invoiceId: string) {
  const client = getEncoreClient()

  try {
    // Get invoice for metadata
    const invoice = await client.invoices.getInvoice(invoiceId)
    
    // Get invoice line items which contain enrollment IDs
    const lineItems = await client.invoices.getInvoiceLineItems(invoiceId)
    
    // Extract unique enrollment IDs from line items
    const enrollmentIds = lineItems.lineItems
      .map(item => item.enrollmentId)
      .filter((id): id is string => Boolean(id))
    
    if (enrollmentIds.length === 0) {
      return {
        success: false,
        error: 'No enrollments found for this invoice',
      }
    }

    return {
      success: true,
      enrollmentIds,
      invoiceNumber: invoice.invoiceNumber,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      organizationId: invoice.organizationId,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get invoice enrollment IDs'
    return {
      success: false,
      error: errorMessage,
    }
  }
}
