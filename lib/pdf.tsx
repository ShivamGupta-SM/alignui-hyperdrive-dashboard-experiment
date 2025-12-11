import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import type { Invoice } from '@/lib/types'

// Register fonts (optional - use system fonts by default)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
// })

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    color: '#64748b',
    fontSize: 9,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 15,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableCell: {
    fontSize: 10,
  },
  col1: { width: '50%' },
  col2: { width: '25%', textAlign: 'right' },
  col3: { width: '25%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  totalLabel: {
    width: 120,
    color: '#64748b',
    fontSize: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 10,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  grandTotalLabel: {
    width: 120,
    fontWeight: 'bold',
    fontSize: 12,
  },
  grandTotalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  badge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
})

// Format currency
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface InvoicePDFProps {
  invoice: Invoice
  organization: {
    name: string
    gstNumber: string
    address?: string
  }
}

/**
 * Invoice PDF Document Component
 */
export function InvoicePDF({ invoice, organization }: InvoicePDFProps) {
  const cgst = Math.round(invoice.gstAmount / 2)
  const sgst = Math.round(invoice.gstAmount / 2)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Hypedrive</Text>
            <Text style={styles.subtitle}>Influencer Marketing Platform</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>TAX INVOICE</Text>
            <Text style={styles.subtitle}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* From / To Section */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.value}>Hypedrive Technologies Pvt. Ltd.</Text>
            <Text style={styles.label}>GSTIN: 27AABCH1234A1Z5</Text>
            <Text style={styles.label}>Mumbai, Maharashtra</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.value}>{organization.name}</Text>
            <Text style={styles.label}>GSTIN: {organization.gstNumber}</Text>
            {organization.address && (
              <Text style={styles.label}>{organization.address}</Text>
            )}
          </View>
        </View>

        {/* Invoice Details Box */}
        <View style={styles.infoBox}>
          <View style={styles.twoColumn}>
            <View>
              <Text style={styles.label}>Invoice Date</Text>
              <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Billing Period</Text>
              <Text style={styles.value}>
                {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.badge, invoice.status !== 'paid' ? { backgroundColor: '#fef3c7', color: '#d97706' } : {}]}>
                {invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.tableCell}>Campaign Enrollment Services</Text>
                <Text style={[styles.label, { marginTop: 2 }]}>
                  Approved enrollments for the billing period
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.col2]}>
                {invoice.enrollmentCount}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>CGST @ 9%</Text>
            <Text style={styles.totalValue}>{formatCurrency(cgst)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SGST @ 9%</Text>
            <Text style={styles.totalValue}>{formatCurrency(sgst)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        {invoice.status === 'paid' && invoice.paidAt && (
          <View style={[styles.infoBox, { backgroundColor: '#dcfce7', marginTop: 20 }]}>
            <Text style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 10 }}>
              ✓ Paid via Wallet on {formatDate(invoice.paidAt)}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 4 }}>
            Hypedrive Technologies Pvt. Ltd. | support@hypedrive.io | hypedrive.io
          </Text>
        </View>
      </Page>
    </Document>
  )
}

/**
 * Generate PDF buffer from invoice data
 * Use this in API routes to generate downloadable PDFs
 *
 * @example
 * ```ts
 * // In an API route
 * const pdfBuffer = await generateInvoicePDF(invoice, organization)
 * return new Response(pdfBuffer, {
 *   headers: {
 *     'Content-Type': 'application/pdf',
 *     'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
 *   },
 * })
 * ```
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  organization: { name: string; gstNumber: string; address?: string }
): Promise<Buffer> {
  return await renderToBuffer(
    <InvoicePDF invoice={invoice} organization={organization} />
  )
}

/**
 * Generate multiple invoice PDFs (batch)
 */
export async function generateInvoicesPDFBatch(
  invoices: Invoice[],
  organization: { name: string; gstNumber: string; address?: string }
): Promise<Map<string, Buffer>> {
  const results = new Map<string, Buffer>()

  for (const invoice of invoices) {
    const buffer = await generateInvoicePDF(invoice, organization)
    results.set(invoice.invoiceNumber, buffer)
  }

  return results
}
