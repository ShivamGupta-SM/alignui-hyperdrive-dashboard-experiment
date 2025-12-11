// Invoice Types

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  organizationId: string

  periodStart: Date
  periodEnd: Date
  dueDate: Date

  status: InvoiceStatus

  subtotal: number
  gstAmount: number
  totalAmount: number

  enrollmentCount: number

  lineItems?: InvoiceLineItem[]

  pdfUrl?: string

  createdAt: Date
  paidAt?: Date
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  campaignId: string
  campaignName: string
  enrollmentCount: number
  billAmount: number
  platformFeeAmount: number
}
