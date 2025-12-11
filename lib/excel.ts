import * as XLSX from 'xlsx'
import type { campaigns, wallets, enrollments, invoices } from '@/lib/encore-browser'

/**
 * Generic Excel export utility
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = 'Sheet1',
  columns?: { key: keyof T; header: string; width?: number }[]
): void {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(
    columns
      ? data.map((row) =>
          columns.reduce(
            (acc, col) => ({
              ...acc,
              [col.header]: row[col.key],
            }),
            {}
          )
        )
      : data
  )

  // Set column widths if specified
  if (columns) {
    worksheet['!cols'] = columns.map((col) => ({
      wch: col.width || 15,
    }))
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate and download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Export data as CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  const worksheet = XLSX.utils.json_to_sheet(
    columns
      ? data.map((row) =>
          columns.reduce(
            (acc, col) => ({
              ...acc,
              [col.header]: row[col.key],
            }),
            {}
          )
        )
      : data
  )

  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Generate Excel buffer (for server-side generation)
 */
export function generateExcelBuffer<T extends Record<string, unknown>>(
  data: T[],
  sheetName = 'Sheet1',
  columns?: { key: keyof T; header: string; width?: number }[]
): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(
    columns
      ? data.map((row) =>
          columns.reduce(
            (acc, col) => ({
              ...acc,
              [col.header]: row[col.key],
            }),
            {}
          )
        )
      : data
  )

  if (columns) {
    worksheet['!cols'] = columns.map((col) => ({
      wch: col.width || 15,
    }))
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

// ============================================
// Pre-built export functions for common data
// ============================================

/**
 * Export campaigns to Excel
 */
export function exportCampaigns(campaignsList: campaigns.CampaignWithStats[]): void {
  const data = campaignsList.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    type: c.campaignType,
    billRate: c.billRate ?? 0,
    maxEnrollments: c.maxEnrollments,
    currentEnrollments: c.currentEnrollments,
    approvedCount: c.approvedCount,
    pendingCount: c.pendingCount,
    rejectedCount: c.rejectedCount,
    totalPayout: c.totalPayout,
    startDate: new Date(c.startDate).toLocaleDateString(),
    endDate: new Date(c.endDate).toLocaleDateString(),
    createdAt: new Date(c.createdAt).toLocaleDateString(),
  }))

  exportToExcel(data, `campaigns-${new Date().toISOString().split('T')[0]}`, 'Campaigns', [
    { key: 'id', header: 'Campaign ID', width: 15 },
    { key: 'title', header: 'Title', width: 30 },
    { key: 'status', header: 'Status', width: 15 },
    { key: 'type', header: 'Type', width: 12 },
    { key: 'billRate', header: 'Bill Rate (₹)', width: 12 },
    { key: 'maxEnrollments', header: 'Max Enrollments', width: 15 },
    { key: 'currentEnrollments', header: 'Current', width: 10 },
    { key: 'approvedCount', header: 'Approved', width: 10 },
    { key: 'pendingCount', header: 'Pending', width: 10 },
    { key: 'rejectedCount', header: 'Rejected', width: 10 },
    { key: 'totalPayout', header: 'Total Payout (₹)', width: 15 },
    { key: 'startDate', header: 'Start Date', width: 12 },
    { key: 'endDate', header: 'End Date', width: 12 },
    { key: 'createdAt', header: 'Created', width: 12 },
  ])
}

/**
 * Export enrollments to Excel
 */
export function exportEnrollments(enrollmentsList: enrollments.Enrollment[]): void {
  const data = enrollmentsList.map((e) => {
    // Calculate costs from locked rates
    const billAmount = e.orderValue * (e.lockedBillRate / 100)
    const gstAmount = billAmount * 0.18
    const platformFee = e.orderValue * (e.lockedPlatformFee / 100)
    const totalCost = billAmount + gstAmount + platformFee

    return {
      id: e.id,
      shopperId: e.shopperId,
      campaignId: e.campaignId,
      status: e.status,
      orderId: e.orderId,
      orderValue: e.orderValue,
      rebatePercentage: e.lockedRebatePercentage,
      billRate: e.lockedBillRate,
      billAmount: Math.round(billAmount),
      platformFee: Math.round(platformFee),
      gstAmount: Math.round(gstAmount),
      totalCost: Math.round(totalCost),
      rejectionCount: e.rejectionCount,
      canResubmit: e.canResubmit ? 'Yes' : 'No',
      purchaseDate: e.purchaseDate ? new Date(e.purchaseDate).toLocaleDateString() : '',
      expiresAt: e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : '',
      createdAt: new Date(e.createdAt).toLocaleDateString(),
    }
  })

  exportToExcel(
    data,
    `enrollments-${new Date().toISOString().split('T')[0]}`,
    'Enrollments',
    [
      { key: 'id', header: 'Enrollment ID', width: 15 },
      { key: 'shopperId', header: 'Shopper ID', width: 15 },
      { key: 'campaignId', header: 'Campaign ID', width: 15 },
      { key: 'status', header: 'Status', width: 15 },
      { key: 'orderId', header: 'Order ID', width: 20 },
      { key: 'orderValue', header: 'Order Value (₹)', width: 15 },
      { key: 'rebatePercentage', header: 'Rebate %', width: 10 },
      { key: 'billRate', header: 'Bill Rate %', width: 10 },
      { key: 'billAmount', header: 'Bill Amount (₹)', width: 15 },
      { key: 'platformFee', header: 'Platform Fee (₹)', width: 15 },
      { key: 'gstAmount', header: 'GST (₹)', width: 12 },
      { key: 'totalCost', header: 'Total Cost (₹)', width: 12 },
      { key: 'rejectionCount', header: 'Rejections', width: 10 },
      { key: 'canResubmit', header: 'Can Resubmit', width: 12 },
      { key: 'purchaseDate', header: 'Purchase Date', width: 12 },
      { key: 'expiresAt', header: 'Expires At', width: 12 },
      { key: 'createdAt', header: 'Created', width: 12 },
    ]
  )
}

/**
 * Export invoices to Excel
 */
export function exportInvoices(invoicesList: invoices.Invoice[]): void {
  const data = invoicesList.map((i) => ({
    invoiceNumber: i.invoiceNumber,
    status: i.status,
    periodStart: i.periodStart ? new Date(i.periodStart).toLocaleDateString() : '',
    periodEnd: i.periodEnd ? new Date(i.periodEnd).toLocaleDateString() : '',
    enrollmentCount: i.enrollmentCount,
    subtotal: i.subtotal,
    gstAmount: i.gstAmount,
    totalAmount: i.totalAmount,
    dueDate: new Date(i.dueDate).toLocaleDateString(),
    createdAt: new Date(i.createdAt).toLocaleDateString(),
    paidAt: i.paidAt ? new Date(i.paidAt).toLocaleDateString() : '',
  }))

  exportToExcel(data, `invoices-${new Date().toISOString().split('T')[0]}`, 'Invoices', [
    { key: 'invoiceNumber', header: 'Invoice #', width: 15 },
    { key: 'status', header: 'Status', width: 12 },
    { key: 'periodStart', header: 'Period Start', width: 12 },
    { key: 'periodEnd', header: 'Period End', width: 12 },
    { key: 'enrollmentCount', header: 'Enrollments', width: 12 },
    { key: 'subtotal', header: 'Subtotal (₹)', width: 15 },
    { key: 'gstAmount', header: 'GST (₹)', width: 12 },
    { key: 'totalAmount', header: 'Total (₹)', width: 15 },
    { key: 'dueDate', header: 'Due Date', width: 12 },
    { key: 'createdAt', header: 'Created', width: 12 },
    { key: 'paidAt', header: 'Paid On', width: 12 },
  ])
}

/**
 * Export transactions to Excel
 */
export function exportTransactions(transactions: wallets.WalletTransaction[]): void {
  const data = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    description: t.description,
    amount: t.amount,
    reference: t.reference || '',
    createdAt: new Date(t.createdAt).toLocaleString(),
  }))

  exportToExcel(
    data,
    `transactions-${new Date().toISOString().split('T')[0]}`,
    'Transactions',
    [
      { key: 'id', header: 'Transaction ID', width: 15 },
      { key: 'type', header: 'Type', width: 15 },
      { key: 'description', header: 'Description', width: 35 },
      { key: 'amount', header: 'Amount (₹)', width: 15 },
      { key: 'reference', header: 'Reference', width: 15 },
      { key: 'createdAt', header: 'Date & Time', width: 20 },
    ]
  )
}

/**
 * Read Excel/CSV file and return data
 */
export function parseExcelFile<T = Record<string, unknown>>(
  file: File
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}
