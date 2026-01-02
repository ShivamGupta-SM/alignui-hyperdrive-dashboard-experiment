"use client"

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useCurrentOrganization } from '@/hooks/shared/use-current-organization'
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Modal from "@/components/ui/layout/modal"
import * as BottomSheet from "@/components/ui/layout/bottom-sheet"
import * as Tooltip from "@/components/ui/layout/tooltip"
import * as EmptyState from "@/components/ui/feedback/empty-state"
import { Logo } from "@/components/ui/branding/logo"
import {
  DownloadSimple,
  Printer,
  MagnifyingGlass,
  FileText,
  Calendar,
  CaretRight,
  Check,
  X,
  SpinnerGap,
} from '@phosphor-icons/react'
import { cn, formatCurrency, formatCurrencyCompact, formatDateShort, formatDateMedium as formatDateFull, getErrorMessage } from '@/lib/utils'
import { useInvoiceSearchParams } from '@/hooks'
import { useStableTime } from '@/hooks/ui'
import { useDebounceValue, useMediaQuery } from 'usehooks-ts'
import { exportInvoices } from '@/lib/utils/excel'
import { toast } from 'sonner'
import type { organizations } from "@/brand-client"
import { logError } from "@/lib/logging/error-logger-simple"
import { TIMEOUTS, PLATFORM_INFO } from '@/lib/constants'

type Invoice = organizations.Invoice

// Organization info for invoice display (passed from SSR)
interface OrganizationInfo {
  id: string
  name: string
  gstNumber?: string | null
  gstLegalName?: string | null
}

const periodFilters = [
  { value: 'all', label: 'All' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: '3 Months' },
]

interface InvoicesClientProps {
  initialData?: {
    invoices: Invoice[]
    organization?: OrganizationInfo | null
    stats?: {
      count: number
      totalAmount: number
      totalGst: number
      totalEnrollments: number
    }
  }
}

export function InvoicesClient({ initialData }: InvoicesClientProps = {}) {
  const { organizationId } = useCurrentOrganization()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [isExportingEnrollments, setIsExportingEnrollments] = useState(false)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Hydration-safe: Reference date for period filtering (set after mount to avoid SSR mismatch)
  const referenceTime = useStableTime()
  const referenceDate = referenceTime ? new Date(referenceTime) : null

  // nuqs: URL state management for filters
  const [searchParams, setSearchParams] = useInvoiceSearchParams()
  const periodFilter = searchParams.period
  const [search, setSearch] = useState(searchParams.search)

  // Use initialData directly - type-safe with Encore types
  const invoicesList: Invoice[] = (initialData?.invoices ?? [])
  const allInvoices = invoicesList
  const organization = initialData?.organization ?? null

  // usehooks-ts: Debounce search input to avoid excessive URL updates
  const [debouncedSearch] = useDebounceValue(search, 300)

  // Bidirectional URL <-> local state sync
  // Uses refs to prevent infinite loops and unnecessary updates
  const isUpdatingFromUrl = useRef(false)
  const isUpdatingToUrl = useRef(false)

  useEffect(() => {
    // Skip if we're currently updating from URL
    if (isUpdatingFromUrl.current) {
      isUpdatingFromUrl.current = false
      return
    }

    // Update URL when debounced value changes
    if (debouncedSearch !== searchParams.search) {
      isUpdatingToUrl.current = true
      setSearchParams({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch, searchParams.search, setSearchParams])

  useEffect(() => {
    // Skip if we're currently updating to URL
    if (isUpdatingToUrl.current) {
      isUpdatingToUrl.current = false
      return
    }

    // Sync local state when URL changes (browser back/forward)
    if (searchParams.search !== search) {
      isUpdatingFromUrl.current = true
      setSearch(searchParams.search || "")
    }
  }, [searchParams.search, search])

  // Excel export handler
  const handleExport = useCallback(() => {
    try {
      exportInvoices(allInvoices)
      toast.success('Invoices exported to Excel')
    } catch {
      toast.error('Failed to export invoices')
    }
  }, [allInvoices])

  // Export invoice enrollments handler
  const handleExportEnrollments = useCallback(async (invoiceId: string) => {
    setIsExportingEnrollments(true)
    try {
      const { getInvoiceEnrollmentIds } = await import('@/app/actions')
      const invoiceResult = await getInvoiceEnrollmentIds({ organizationId, invoiceId })

      if (!invoiceResult?.data?.enrollmentIds || invoiceResult.data.enrollmentIds.length === 0) {
        toast.error('No enrollments found for this invoice')
        return
      }

      const invoiceData = invoiceResult.data

      // Fetch enrollments using server action (batch fetch)
      const { getEnrollmentsByIds } = await import('@/features/invoices')
      const enrollmentsResult = await getEnrollmentsByIds({ organizationId, enrollmentIds: invoiceData.enrollmentIds })

      if (!enrollmentsResult?.data || enrollmentsResult.data.length === 0) {
        toast.error('Failed to fetch enrollment data')
        return
      }

      const enrollments = enrollmentsResult.data

      // Export to CSV
      const { exportToCSV } = await import('@/lib/utils/excel')
      exportToCSV(
        enrollments.map((e: {
          id: string
          orderId: string | null
          orderValue: number
          lockedBillRate: number | null
          lockedPlatformFee: number | null
          lockedRebatePercentage: number | null
          lockedBonusAmount: number | null
          status: string
          shopperId: string
          purchaseDate: string | null
          submittedAt: string | null
          approvedAt: string | null
          createdAt: string
        }) => {
          const billAmount = e.orderValue * ((e.lockedBillRate ?? 0) / 100)
          const gstAmount = billAmount * 0.18
          const platformFee = e.orderValue * ((e.lockedPlatformFee ?? 0) / 100)
          const totalCost = billAmount + gstAmount + platformFee
          const rebatePercentage = e.lockedRebatePercentage ?? 0
          const bonusAmount = e.lockedBonusAmount ?? 0
          const shopperPayout = e.orderValue * (rebatePercentage / 100) + bonusAmount

          return {
            enrollmentId: e.id,
            orderId: e.orderId,
            orderValue: e.orderValue,
            purchaseDate: e.purchaseDate ? new Date(e.purchaseDate).toLocaleDateString() : '',
            shopperId: e.shopperId,
            status: e.status,
            rebatePercentage,
            bonusAmount,
            shopperPayout: Math.round(shopperPayout * 100) / 100,
            billAmount: Math.round(billAmount * 100) / 100,
            platformFee: Math.round(platformFee * 100) / 100,
            gstAmount: Math.round(gstAmount * 100) / 100,
            totalCost: Math.round(totalCost * 100) / 100,
            submittedAt: e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : '',
            approvedAt: e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '',
            createdAt: new Date(e.createdAt).toLocaleDateString(),
          }
        }),
        `invoice-${invoiceData.invoiceNumber}-enrollments-${referenceDate ? referenceDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`,
        [
          { key: 'enrollmentId', header: 'Enrollment ID' },
          { key: 'orderId', header: 'Order ID' },
          { key: 'orderValue', header: 'Order Value (₹)' },
          { key: 'purchaseDate', header: 'Purchase Date' },
          { key: 'shopperId', header: 'Shopper ID' },
          { key: 'status', header: 'Status' },
          { key: 'rebatePercentage', header: 'Rebate %' },
          { key: 'bonusAmount', header: 'Bonus Amount (₹)' },
          { key: 'shopperPayout', header: 'Shopper Payout (₹)' },
          { key: 'billAmount', header: 'Bill Amount (₹)' },
          { key: 'platformFee', header: 'Platform Fee (₹)' },
          { key: 'gstAmount', header: 'GST (₹)' },
          { key: 'totalCost', header: 'Total Cost (₹)' },
          { key: 'submittedAt', header: 'Submitted At' },
          { key: 'approvedAt', header: 'Approved At' },
          { key: 'createdAt', header: 'Created At' },
        ]
      )

      toast.success(`Exported ${enrollments.length} enrollments to CSV`)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to export enrollments'))
    } finally {
      setIsExportingEnrollments(false)
    }
  }, [organizationId, referenceDate])

  // PDF download handler - direct fetch for one-time downloads
  const handleDownloadPDF = useCallback(async (invoice: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDownloadingId(invoice.id)
    try {
      const { generateInvoicePDF } = await import('@/app/actions')
      const result = await generateInvoicePDF({ organizationId, invoiceId: invoice.id })
      const pdfUrl = result?.data?.pdfUrl
      if (!pdfUrl) {
        throw new Error('PDF not yet generated')
      }

      // Fetch the PDF from the URL
      // Note: Direct fetch is acceptable for file downloads (blob responses)
      // Could be wrapped in React Query for caching if needed
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
        // Add error handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Use React ref instead of direct DOM manipulation
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = `${invoice.invoiceNumber}.pdf`
        downloadLinkRef.current.click()
      }

      // Clean up object URL after a short delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, TIMEOUTS.FILE_DOWNLOAD_CLEANUP)
      toast.success(`Downloaded ${invoice.invoiceNumber}.pdf`)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to download invoice PDF'))
      logError(error, { source: "InvoicesClient", data: { action: "downloadPDF", invoiceId: invoice.id } })
    } finally {
      setDownloadingId(null)
    }
  }, [organizationId])

  // nuqs: Update URL when period filter changes
  const handlePeriodChange = useCallback((value: string) => {
    setSearchParams({ period: value as "all" | "this_month" | "last_month" | "last_3_months", page: 1 })
  }, [setSearchParams])

  // Null-safe date formatting - uses SSOT from @/lib/utils/format
  const safeFormatDate = (date: Date | string | undefined) => date ? formatDateShort(date) : '-'
  const safeFormatDateFull = (date: Date | string | undefined) => date ? formatDateFull(date) : '-'

  const filteredInvoices = useMemo(() => {
    let result = allInvoices

    // Only apply period filters after hydration (when referenceDate is set)
    if (referenceDate && periodFilter !== 'all') {
      if (periodFilter === 'this_month') {
        result = result.filter((i) =>
          new Date(i.createdAt).getMonth() === referenceDate.getMonth() &&
          new Date(i.createdAt).getFullYear() === referenceDate.getFullYear()
        )
      } else if (periodFilter === 'last_month') {
        const lastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1)
        result = result.filter((i) =>
          new Date(i.createdAt).getMonth() === lastMonth.getMonth() &&
          new Date(i.createdAt).getFullYear() === lastMonth.getFullYear()
        )
      } else if (periodFilter === 'last_3_months') {
        const threeMonthsAgo = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 3, 1)
        result = result.filter((i) => new Date(i.createdAt) >= threeMonthsAgo)
      }
    }

    if (search) {
      result = result.filter((i) => i.invoiceNumber.toLowerCase().includes(search.toLowerCase()))
    }

    return result
  }, [allInvoices, periodFilter, search, referenceDate])

  const stats = useMemo(() => ({
    count: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0),
    totalGst: filteredInvoices.reduce((acc, i) => acc + i.gstAmount, 0),
    totalEnrollments: filteredInvoices.reduce((acc, i) => acc + (i.enrollmentCount || 0), 0),
  }), [filteredInvoices])

  return (
    <Tooltip.Provider>
    <div className="space-y-5 sm:space-y-6">
      {/* Hidden download link for PDF downloads - programmatically triggered */}
      <a
        ref={downloadLinkRef}
        href="about:blank"
        download
        style={{ position: 'absolute', left: '-9999px' }}
        aria-label="Download invoice PDF"
        tabIndex={-1}
      >
        Download
      </a>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Invoices</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Weekly billing records
          </p>
        </div>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="basic" size="small" onClick={handleExport} className="shrink-0">
              <Button.Icon><DownloadSimple className="size-5" /></Button.Icon>
              <span className="hidden sm:inline">Export</span>
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Export invoices to Excel</Tooltip.Content>
        </Tooltip.Root>
      </div>

      {/* Stats Row - Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
        <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
          {[
            { label: 'Invoices', value: stats.count.toString() },
            { label: 'Billed', value: formatCurrencyCompact(stats.totalAmount) },
            { label: 'GST', value: formatCurrencyCompact(stats.totalGst) },
            { label: 'Enrollments', value: stats.totalEnrollments.toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 px-3 py-2.5 min-w-[95px] sm:min-w-0"
            >
              <span className="text-label-xs text-text-soft-400 uppercase tracking-wide">{stat.label}</span>
              <span className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold mt-0.5">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {periodFilters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              onClick={() => handlePeriodChange(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-label-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                periodFilter === filter.value
                  ? 'bg-primary-base text-white shadow-sm'
                  : 'text-text-sub-600 hover:bg-bg-weak-50 active:scale-95'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-48">
          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Icon as={MagnifyingGlass} />
              <Input.El placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <EmptyState.Root size="medium">
          <EmptyState.Header>
            <EmptyState.Icon color="gray"><FileText className="size-full" /></EmptyState.Icon>
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>No invoices</EmptyState.Title>
            <EmptyState.Description>
              {search ? `No results for "${search}"` : 'No invoices for this period'}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <div className="space-y-2 sm:space-y-0 sm:rounded-xl sm:bg-bg-white-0 sm:ring-1 sm:ring-inset sm:ring-stroke-soft-200 sm:divide-y sm:divide-stroke-soft-200 sm:overflow-hidden">
          {filteredInvoices.map((invoice) => (
            <InvoiceItem
              key={invoice.id}
              invoice={invoice}
              formatCurrency={formatCurrency}
              formatDate={safeFormatDate}
              onView={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        organization={organization}
        onClose={() => setSelectedInvoice(null)}
        formatCurrency={formatCurrency}
        formatDate={safeFormatDateFull}
        onDownloadPDF={handleDownloadPDF}
        downloadingId={downloadingId}
        onExportEnrollments={handleExportEnrollments}
        isExportingEnrollments={isExportingEnrollments}
      />
    </div>
    </Tooltip.Provider>
  )
}

// Invoice Item - Card on mobile, row on desktop
function InvoiceItem({
  invoice,
  formatCurrency,
  formatDate,
  onView
}: {
  invoice: Invoice
  formatCurrency: (n: number) => string
  formatDate: (d: Date | string | undefined) => string
  onView: () => void
}) {
  return (
    <>
      {/* Mobile: Card layout */}
      <button
        type="button"
        onClick={onView}
        className="w-full rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 text-left hover:bg-bg-weak-50 active:scale-[0.99] transition-all duration-200 sm:hidden"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-bg-weak-50 flex items-center justify-center">
              <FileText weight="duotone" className="size-5 text-text-soft-400" />
            </div>
            <div>
              <p className="text-label-sm text-text-strong-950 font-mono">{invoice.invoiceNumber}</p>
              <p className="text-paragraph-xs text-text-soft-400">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>
          <CaretRight className="size-4 text-text-soft-400 mt-1" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200">
          <div className="flex items-center gap-3 text-paragraph-xs text-text-sub-600">
            <span>{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</span>
            <span className="text-text-soft-400">•</span>
            <span>{invoice.enrollmentCount} enrollments</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-title-h5 text-text-strong-950 font-semibold">{formatCurrency(invoice.totalAmount)}</p>
            <p className="text-paragraph-xs text-text-soft-400">incl. {formatCurrency(invoice.gstAmount)} GST</p>
          </div>
          <div className="flex items-center gap-1 text-paragraph-xs text-success-base">
            <Check weight="bold" className="size-3.5" />
            Paid
          </div>
        </div>
      </button>

      {/* Desktop: Row layout */}
      <button
        type="button"
        className="hidden sm:flex w-full items-center gap-4 p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group text-left"
        onClick={onView}
      >
        <div className="size-11 rounded-xl bg-bg-weak-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary-lighter">
          <FileText weight="duotone" className="size-6 text-text-soft-400 transition-colors group-hover:text-primary-base" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-label-sm text-text-strong-950 font-mono">{invoice.invoiceNumber}</span>
            <span className="flex items-center gap-1 text-paragraph-xs text-success-base">
              <Check weight="bold" className="size-3" />
              Paid
            </span>
          </div>
          <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-0.5">
            <Calendar className="size-3 text-text-soft-400" />
            <span>{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</span>
            <span className="text-text-soft-400">•</span>
            <span>{invoice.enrollmentCount} enrollments</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-label-md text-text-strong-950 font-semibold">{formatCurrency(invoice.totalAmount)}</p>
          <p className="text-paragraph-xs text-text-soft-400">GST {formatCurrency(invoice.gstAmount)}</p>
        </div>

        <Button.Root variant="ghost" size="xsmall" onClick={(e) => { e.stopPropagation() }} aria-label="Download invoice">
          <Button.Icon><DownloadSimple className="size-5" /></Button.Icon>
        </Button.Root>
      </button>
    </>
  )
}

// Shared Invoice Content Component
function InvoiceContent({
  invoice,
  organization,
  formatCurrency,
  formatDate,
  onDownloadPDF,
  isDownloading,
  onExportEnrollments,
  isExportingEnrollments,
}: {
  invoice: Invoice
  organization: OrganizationInfo | null
  formatCurrency: (n: number) => string
  formatDate: (d: Date | string | undefined) => string
  onDownloadPDF: (invoice: Invoice) => Promise<void>
  isDownloading: boolean
  onExportEnrollments: (invoiceId: string) => Promise<void>
  isExportingEnrollments: boolean
}) {
  // Organization display name (prefer legal name for invoices)
  const orgDisplayName = organization?.gstLegalName || organization?.name || "—"
  const orgGstin = organization?.gstNumber || "—"

  return (
    <>
      {/* Invoice Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Tax Invoice Title */}
        <div className="text-center">
          <p className="text-label-xs text-text-soft-400 uppercase tracking-widest mb-0.5">Tax Invoice</p>
          <p className="text-sm font-semibold text-text-strong-950 font-mono">{invoice.invoiceNumber}</p>
        </div>

        {/* From / To Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-label-xs text-text-soft-400 uppercase tracking-wide">From</p>
            <p className="text-xs font-medium text-text-strong-950">{PLATFORM_INFO.name}</p>
            <p className="text-label-xs text-text-sub-600">GSTIN: {PLATFORM_INFO.gstin}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-label-xs text-text-soft-400 uppercase tracking-wide">Bill To</p>
            <p className="text-xs font-medium text-text-strong-950">{orgDisplayName}</p>
            <p className="text-label-xs text-text-sub-600">GSTIN: {orgGstin}</p>
          </div>
        </div>

        {/* Dates - 2x2 grid to prevent wrapping */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2.5 px-3 bg-bg-weak-50 rounded-md">
          <div>
            <p className="text-label-xs text-text-soft-400 mb-0.5">Invoice Date</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.createdAt)}</p>
          </div>
          <div>
            <p className="text-label-xs text-text-soft-400 mb-0.5">Due Date</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-label-xs text-text-soft-400 mb-0.5">Billing Period</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex justify-between text-label-xs text-text-soft-400 uppercase tracking-wide pb-1.5 border-b border-stroke-soft-200">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-xs text-text-strong-950">Campaign Enrollments</p>
              <p className="text-label-xs text-text-sub-600">{invoice.enrollmentCount} enrollments</p>
            </div>
            <p className="text-xs font-medium text-text-strong-950">{formatCurrency(invoice.subtotal)}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-stroke-soft-200 pt-2 space-y-1.5">
          <div className="flex justify-between text-[11px] text-text-sub-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-text-sub-600">
            <span>CGST @ 9%</span>
            <span>{formatCurrency(Math.round(invoice.gstAmount / 2))}</span>
          </div>
          <div className="flex justify-between text-[11px] text-text-sub-600">
            <span>SGST @ 9%</span>
            <span>{formatCurrency(Math.round(invoice.gstAmount / 2))}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stroke-soft-200">
            <span className="text-xs font-medium text-text-strong-950">Total</span>
            <span className="text-sm font-bold text-text-strong-950">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Status */}
        {invoice.status === 'paid' && (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-success-lighter rounded-md">
            <Check weight="bold" className="size-3.5 text-success-base" />
            <span className="text-[11px] font-medium text-success-base">Paid via Wallet</span>
            {invoice.paidAt && (
              <span className="text-label-xs text-success-base">• {formatDate(invoice.paidAt)}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="px-4 py-3 bg-bg-weak-50 border-t border-stroke-soft-200">
        <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
          <Button.Root
            variant="basic"
            size="xsmall"
            onClick={() => onDownloadPDF(invoice)}
            disabled={isDownloading}
          >
            <Button.Icon>
              {isDownloading ? (
                <SpinnerGap className="size-5 animate-spin" />
              ) : (
                <DownloadSimple className="size-5" />
              )}
            </Button.Icon>
            Download PDF
          </Button.Root>
          <Button.Root variant="basic" size="xsmall" onClick={() => window.print()}>
            <Button.Icon><Printer className="size-5" /></Button.Icon>
            Print
          </Button.Root>
          {invoice.enrollmentCount > 0 && (
            <Button.Root
              variant="basic"
              size="xsmall"
              onClick={() => onExportEnrollments(invoice.id)}
              disabled={isExportingEnrollments}
            >
              <Button.Icon>
                {isExportingEnrollments ? (
                  <SpinnerGap className="size-5 animate-spin" />
                ) : (
                  <DownloadSimple className="size-5" />
                )}
              </Button.Icon>
              Export Enrollments
            </Button.Root>
          )}
        </div>
        <p className="text-label-xs text-text-sub-600 text-center">Thank you for your business!</p>
        <p className="text-label-xs text-text-soft-400 mt-0.5 text-center">{PLATFORM_INFO.email} • {PLATFORM_INFO.website}</p>
      </div>
    </>
  )
}

// Responsive Invoice Modal - Bottom Sheet on mobile, Modal on desktop
function InvoiceModal({
  invoice,
  organization,
  onClose,
  formatCurrency,
  formatDate,
  onDownloadPDF,
  downloadingId,
  onExportEnrollments,
  isExportingEnrollments,
}: {
  invoice: Invoice | null
  organization: OrganizationInfo | null
  onClose: () => void
  formatCurrency: (n: number) => string
  formatDate: (d: Date | string | undefined) => string
  onDownloadPDF: (invoice: Invoice, e?: React.MouseEvent) => Promise<void>
  downloadingId: string | null
  onExportEnrollments: (invoiceId: string) => Promise<void>
  isExportingEnrollments: boolean
}) {
  const isMobile = useMediaQuery('(max-width: 639px)')

  if (!invoice) return null

  const isDownloading = downloadingId === invoice.id

  // Mobile: Use vaul BottomSheet for swipe-to-dismiss
  if (isMobile) {
    return (
      <BottomSheet.Root open={!!invoice} onOpenChange={(open) => !open && onClose()}>
        <BottomSheet.Content showClose={false}>
          {/* Header with logo */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Logo forceTheme="light" width={90} height={22} />
            <BottomSheet.Close asChild>
              <Button.Root variant="ghost" size="xsmall" aria-label="Close invoice preview">
                <Button.Icon><X className="size-5" /></Button.Icon>
              </Button.Root>
            </BottomSheet.Close>
          </div>
          <InvoiceContent
            invoice={invoice}
            organization={organization}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onDownloadPDF={onDownloadPDF}
            isDownloading={isDownloading}
            onExportEnrollments={onExportEnrollments}
            isExportingEnrollments={isExportingEnrollments}
          />
        </BottomSheet.Content>
      </BottomSheet.Root>
    )
  }

  // Desktop: Use Modal
  return (
    <Modal.Root open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content
        showClose={false}
        className="sm:max-w-[380px] p-0 overflow-hidden rounded-xl!"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
          <Logo forceTheme="light" width={90} height={22} />
          <Modal.Close asChild>
            <Button.Root variant="ghost" size="xsmall" aria-label="Close invoice preview">
              <Button.Icon><X className="size-5" /></Button.Icon>
            </Button.Root>
          </Modal.Close>
        </div>
        <InvoiceContent
          invoice={invoice}
          organization={organization}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onDownloadPDF={onDownloadPDF}
          isDownloading={isDownloading}
          onExportEnrollments={onExportEnrollments}
          isExportingEnrollments={isExportingEnrollments}
        />
      </Modal.Content>
    </Modal.Root>
  )
}
