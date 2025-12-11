import { mockInvoices } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import type { Invoice } from '@/lib/types'

function getInvoiceStats(invoices: Invoice[]) {
  return {
    total: invoices.length,
    totalBilled: invoices.reduce((acc, i) => acc + i.totalAmount, 0),
    totalGst: invoices.reduce((acc, i) => acc + i.gstAmount, 0),
    totalEnrollments: invoices.reduce((acc, i) => acc + i.enrollmentCount, 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')
    const search = searchParams.get('search')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Get all invoices for this organization
    let allInvoices = mockInvoices
      .filter(i => i.organizationId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Filter by period
    let filteredInvoices = allInvoices
    if (period && period !== 'all') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

      switch (period) {
        case 'this_month':
          filteredInvoices = allInvoices.filter(i => new Date(i.createdAt) >= startOfMonth)
          break
        case 'last_month':
          filteredInvoices = allInvoices.filter(i => {
            const date = new Date(i.createdAt)
            return date >= startOfLastMonth && date < startOfMonth
          })
          break
        case 'last_3_months':
          filteredInvoices = allInvoices.filter(i => new Date(i.createdAt) >= startOf3MonthsAgo)
          break
      }
    }

    // Search by invoice number
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = filteredInvoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(searchLower)
      )
    }

    // Calculate stats from all invoices (not filtered)
    const stats = getInvoiceStats(allInvoices)

    return successResponse({
      invoices: filteredInvoices,
      allInvoices,
      stats,
    })
  } catch (error) {
    console.error('Invoices data GET error:', error)
    return serverErrorResponse('Failed to fetch invoices data')
  }
}
