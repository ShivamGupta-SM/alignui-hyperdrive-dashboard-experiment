'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Modal from '@/components/ui/modal'
import * as BottomSheet from '@/components/ui/bottom-sheet'
import * as Tooltip from '@/components/ui/tooltip'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import { Logo } from '@/components/ui/logo'
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
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import { useInvoiceSearchParams } from '@/hooks'
import { useInvoicesData } from '@/hooks/use-invoices'
import { useDebounceValue, useMediaQuery } from 'usehooks-ts'
import { exportInvoices } from '@/lib/excel'
import { toast } from 'sonner'
import type { invoices } from '@/lib/encore-browser'

type Invoice = invoices.Invoice

const periodFilters = [
  { value: 'all', label: 'All' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: '3 Months' },
]

export function InvoicesClient() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)

  // Hydration-safe: Reference date for period filtering (set after mount to avoid SSR mismatch)
  const [referenceDate, setReferenceDate] = React.useState<Date | null>(null)
  React.useEffect(() => {
    setReferenceDate(new Date())
  }, [])

  // nuqs: URL state management for filters
  const [searchParams, setSearchParams] = useInvoiceSearchParams()
  const periodFilter = searchParams.period
  const [search, setSearch] = React.useState(searchParams.search)

  // React Query hook - data is already hydrated from server
  const { data } = useInvoicesData()

  // Extract data with fallbacks
  const initialInvoices = data?.invoices ?? []
  const allInvoices = data?.allInvoices ?? []
  const initialStats = data?.stats ?? {
    count: 0,
    totalAmount: 0,
    totalGst: 0,
    totalEnrollments: 0,
  }

  // usehooks-ts: Debounce search input to avoid excessive URL updates
  const [debouncedSearch] = useDebounceValue(search, 300)

  // Sync debounced search to URL
  React.useEffect(() => {
    if (debouncedSearch !== searchParams.search) {
      setSearchParams({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch, searchParams.search, setSearchParams])

  // Excel export handler
  const handleExport = () => {
    try {
      exportInvoices(allInvoices)
      toast.success('Invoices exported to Excel')
    } catch {
      toast.error('Failed to export invoices')
    }
  }

  // PDF download handler
  const handleDownloadPDF = async (invoice: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDownloadingId(invoice.id)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      if (!response.ok) throw new Error('Failed to download PDF')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${invoice.invoiceNumber}.pdf`)
    } catch {
      toast.error('Failed to download invoice PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  // nuqs: Update URL when period filter changes
  const handlePeriodChange = (value: string) => {
    setSearchParams({ period: value as typeof periodFilter, page: 1 })
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  const formatCurrencyCompact = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return formatCurrency(amount)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const formatDateFull = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredInvoices = React.useMemo(() => {
    let result = initialInvoices

    // Only apply period filters after hydration (when referenceDate is set)
    if (referenceDate && periodFilter !== 'all') {
      if (periodFilter === 'this_month') {
        result = result.filter(i =>
          new Date(i.createdAt).getMonth() === referenceDate.getMonth() &&
          new Date(i.createdAt).getFullYear() === referenceDate.getFullYear()
        )
      } else if (periodFilter === 'last_month') {
        const lastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1)
        result = result.filter(i =>
          new Date(i.createdAt).getMonth() === lastMonth.getMonth() &&
          new Date(i.createdAt).getFullYear() === lastMonth.getFullYear()
        )
      } else if (periodFilter === 'last_3_months') {
        const threeMonthsAgo = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 3, 1)
        result = result.filter(i => new Date(i.createdAt) >= threeMonthsAgo)
      }
    }

    if (search) {
      result = result.filter((i) => i.invoiceNumber.toLowerCase().includes(search.toLowerCase()))
    }

    return result
  }, [initialInvoices, periodFilter, search, referenceDate])

  const stats = React.useMemo(() => ({
    count: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0),
    totalGst: filteredInvoices.reduce((acc, i) => acc + i.gstAmount, 0),
    totalEnrollments: filteredInvoices.reduce((acc, i) => acc + i.enrollmentCount, 0),
  }), [filteredInvoices])

  return (
    <Tooltip.Provider>
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Invoices</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Weekly billing records
          </p>
        </div>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="basic" size="small" onClick={handleExport} className="shrink-0">
              <Button.Icon as={DownloadSimple} />
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
              className="flex flex-col rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 px-4 py-3 min-w-[100px] sm:min-w-0"
            >
              <span className="text-[10px] sm:text-paragraph-xs text-text-soft-400 uppercase tracking-wide">{stat.label}</span>
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
              formatDate={formatDate}
              onView={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        formatCurrency={formatCurrency}
        formatDate={formatDateFull}
        onDownloadPDF={handleDownloadPDF}
        downloadingId={downloadingId}
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
      <div className="hidden sm:flex items-center gap-4 p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group" onClick={onView}>
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

        <Button.Root variant="ghost" size="xsmall" onClick={(e) => { e.stopPropagation() }}>
          <Button.Icon as={DownloadSimple} />
        </Button.Root>
      </div>
    </>
  )
}

// Shared Invoice Content Component
function InvoiceContent({
  invoice,
  formatCurrency,
  formatDate,
  onDownloadPDF,
  isDownloading,
}: {
  invoice: Invoice
  formatCurrency: (n: number) => string
  formatDate: (d: Date | string | undefined) => string
  onDownloadPDF: (invoice: Invoice) => Promise<void>
  isDownloading: boolean
}) {
  return (
    <>
      {/* Invoice Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Tax Invoice Title */}
        <div className="text-center">
          <p className="text-[10px] text-text-soft-400 uppercase tracking-widest mb-0.5">Tax Invoice</p>
          <p className="text-sm font-semibold text-text-strong-950 font-mono">{invoice.invoiceNumber}</p>
        </div>

        {/* From / To Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-[9px] text-text-soft-400 uppercase tracking-wide">From</p>
            <p className="text-xs font-medium text-text-strong-950">Hypedrive Technologies</p>
            <p className="text-[10px] text-text-sub-600">GSTIN: 27AABCH1234A1Z5</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-text-soft-400 uppercase tracking-wide">Bill To</p>
            <p className="text-xs font-medium text-text-strong-950">Nike India Pvt. Ltd.</p>
            <p className="text-[10px] text-text-sub-600">GSTIN: 27AAACN1234A1Z5</p>
          </div>
        </div>

        {/* Dates - 2x2 grid to prevent wrapping */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2.5 px-3 bg-bg-weak-50 rounded-md">
          <div>
            <p className="text-[9px] text-text-soft-400 mb-0.5">Invoice Date</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.createdAt)}</p>
          </div>
          <div>
            <p className="text-[9px] text-text-soft-400 mb-0.5">Due Date</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-text-soft-400 mb-0.5">Billing Period</p>
            <p className="text-[11px] font-medium text-text-strong-950">{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex justify-between text-[9px] text-text-soft-400 uppercase tracking-wide pb-1.5 border-b border-stroke-soft-200">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-xs text-text-strong-950">Campaign Enrollments</p>
              <p className="text-[10px] text-text-sub-600">{invoice.enrollmentCount} enrollments</p>
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
              <span className="text-[10px] text-success-base">• {formatDate(invoice.paidAt)}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="px-4 py-3 bg-bg-weak-50 border-t border-stroke-soft-200">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Button.Root
            variant="basic"
            size="xsmall"
            onClick={() => onDownloadPDF(invoice)}
            disabled={isDownloading}
          >
            <Button.Icon as={isDownloading ? SpinnerGap : DownloadSimple} className={isDownloading ? 'animate-spin' : ''} />
            Download PDF
          </Button.Root>
          <Button.Root variant="basic" size="xsmall" onClick={() => window.print()}>
            <Button.Icon as={Printer} />
            Print
          </Button.Root>
        </div>
        <p className="text-[10px] text-text-sub-600 text-center">Thank you for your business!</p>
        <p className="text-[9px] text-text-soft-400 mt-0.5 text-center">support@hypedrive.io • hypedrive.io</p>
      </div>
    </>
  )
}

// Responsive Invoice Modal - Bottom Sheet on mobile, Modal on desktop
function InvoiceModal({
  invoice,
  onClose,
  formatCurrency,
  formatDate,
  onDownloadPDF,
  downloadingId
}: {
  invoice: Invoice | null
  onClose: () => void
  formatCurrency: (n: number) => string
  formatDate: (d: Date | string | undefined) => string
  onDownloadPDF: (invoice: Invoice, e?: React.MouseEvent) => Promise<void>
  downloadingId: string | null
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
              <Button.Root variant="ghost" size="xsmall">
                <Button.Icon as={X} />
              </Button.Root>
            </BottomSheet.Close>
          </div>
          <InvoiceContent
            invoice={invoice}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onDownloadPDF={onDownloadPDF}
            isDownloading={isDownloading}
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
            <Button.Root variant="ghost" size="xsmall">
              <Button.Icon as={X} />
            </Button.Root>
          </Modal.Close>
        </div>
        <InvoiceContent
          invoice={invoice}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onDownloadPDF={onDownloadPDF}
          isDownloading={isDownloading}
        />
      </Modal.Content>
    </Modal.Root>
  )
}
