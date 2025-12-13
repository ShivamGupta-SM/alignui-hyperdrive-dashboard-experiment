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
