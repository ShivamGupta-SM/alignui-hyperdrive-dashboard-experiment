'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Select from '@/components/ui/select'
import * as Input from '@/components/ui/input'
import * as Modal from '@/components/ui/modal'
import * as Pagination from '@/components/ui/pagination'
import * as Table from '@/components/ui/table'
import * as List from '@/components/ui/list'
import { Metric, MetricGroup } from '@/components/ui/metric'
import { Tracker } from '@/components/ui/tracker'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import {
  RiDownloadLine,
  RiPrinterLine,
  RiSearchLine,
  RiEyeLine,
  RiFileList3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
} from '@remixicon/react'
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, PaypalIcon, UnionPayIcon } from '@/components/claude-generated-components/payment-icons'
import { cn } from '@/utils/cn'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { INVOICE_STATUS_CONFIG } from '@/lib/constants'

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-012',
    organizationId: '1',
    periodStart: new Date('2024-12-01'),
    periodEnd: new Date('2024-12-07'),
    dueDate: new Date('2024-12-15'),
    status: 'pending',
    subtotal: 91250,
    gstAmount: 16425,
    totalAmount: 107675,
    enrollmentCount: 45,
    createdAt: new Date('2024-12-08'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-011',
    organizationId: '1',
    periodStart: new Date('2024-11-24'),
    periodEnd: new Date('2024-11-30'),
    dueDate: new Date('2024-12-07'),
    status: 'paid',
    subtotal: 77500,
    gstAmount: 13950,
    totalAmount: 91450,
    enrollmentCount: 38,
    createdAt: new Date('2024-12-01'),
    paidAt: new Date('2024-12-05'),
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-010',
    organizationId: '1',
    periodStart: new Date('2024-11-17'),
    periodEnd: new Date('2024-11-23'),
    dueDate: new Date('2024-11-30'),
    status: 'paid',
    subtotal: 104000,
    gstAmount: 18720,
    totalAmount: 122720,
    enrollmentCount: 52,
    createdAt: new Date('2024-11-24'),
    paidAt: new Date('2024-11-28'),
  },
]

const mockStats = {
  total: 485000,
  totalCount: 12,
  paid: 435000,
  paidCount: 10,
  pending: 50000,
  pendingCount: 2,
  overdue: 0,
  overdueCount: 0,
}

// Map invoice status to StatusBadge status
const getStatusBadgeStatus = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return 'completed' as const
    case 'pending':
      return 'pending' as const
    case 'overdue':
      return 'failed' as const
    default:
      return 'disabled' as const
  }
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [search, setSearch] = React.useState('')
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredInvoices = React.useMemo(() => {
    let result = mockInvoices

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [statusFilter, search])

  // Tracker data for invoice status distribution
  const trackerData = React.useMemo(() => {
    return mockInvoices.map(i => {
      switch (i.status) {
        case 'paid':
          return { status: 'success' as const, tooltip: i.invoiceNumber }
        case 'pending':
          return { status: 'warning' as const, tooltip: i.invoiceNumber }
        case 'overdue':
          return { status: 'error' as const, tooltip: i.invoiceNumber }
        default:
          return { status: 'neutral' as const, tooltip: i.invoiceNumber }
      }
    })
  }, [])

  const outstandingAmount = mockStats.pending + mockStats.overdue
  const outstandingCount = mockStats.pendingCount + mockStats.overdueCount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">Invoices</h1>
          <p className="text-paragraph-sm text-text-sub-600 mt-1">
            View and manage your invoices
          </p>
        </div>
        <Button.Root variant="basic">
          <Button.Icon as={RiDownloadLine} />
          Export All
        </Button.Root>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-20 bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
          <Metric
            label="Total Invoices"
            value={formatCurrency(mockStats.total)}
            description={`${mockStats.totalCount} invoices`}
            size="lg"
          />
        </div>
        <div className="rounded-20 bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
          <Metric
            label="Paid"
            value={formatCurrency(mockStats.paid)}
            description={`${mockStats.paidCount} invoices`}
            size="lg"
            className="[&>div>span:last-child]:text-success-base"
          />
        </div>
        <div className="rounded-20 bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
          <Metric
            label="Pending"
            value={formatCurrency(mockStats.pending)}
            description={`${mockStats.pendingCount} invoices`}
            size="lg"
            className="[&>div>span:last-child]:text-warning-base"
          />
        </div>
        <div className="rounded-20 bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
          <Metric
            label="Overdue"
            value={formatCurrency(mockStats.overdue)}
            description={`${mockStats.overdueCount} invoices`}
            size="lg"
            className={mockStats.overdueCount > 0 ? '[&>div>span:last-child]:text-error-base' : ''}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger className="w-40">
              <Select.Value placeholder="Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="paid">Paid</Select.Item>
              <Select.Item value="overdue">Overdue</Select.Item>
            </Select.Content>
          </Select.Root>

          <div className="flex-1 max-w-xs">
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.El
                  placeholder="Search invoice #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button.Root variant="ghost" size="small">
            This Month
          </Button.Root>
          <Button.Root variant="ghost" size="small">
            Last 30 Days
          </Button.Root>
          <Button.Root variant="basic" size="small" onClick={() => {}}>
            Custom Range
          </Button.Root>
        </div>
      </div>

      {/* Invoices Table - Using DataTable */}
      {filteredInvoices.length === 0 ? (
        <EmptyState.Root size="large">
          <EmptyState.Header>
            <EmptyState.Icon color="gray">
              <RiFileList3Line className="size-full" />
            </EmptyState.Icon>
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>No invoices yet</EmptyState.Title>
            <EmptyState.Description>
              Invoices are generated weekly based on approved enrollments. Once campaigns have approved enrollments, invoices will appear here automatically.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Invoice #</Table.Head>
                <Table.Head>Period</Table.Head>
                <Table.Head>Enrollments</Table.Head>
                <Table.Head>Amount</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredInvoices.map((invoice) => {
                const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
                return (
                  <Table.Row key={invoice.id}>
                    <Table.Cell>
                      <span className="text-label-sm text-text-strong-950 font-mono">
                        {invoice.invoiceNumber}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-text-sub-600">
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </Table.Cell>
                    <Table.Cell className="font-medium">
                      {invoice.enrollmentCount}
                    </Table.Cell>
                    <Table.Cell className="font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge.Root status={getStatusBadgeStatus(invoice.status)} variant="light">
                        <StatusBadge.Dot />
                        {statusConfig.label}
                      </StatusBadge.Root>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button.Root
                          variant="ghost"
                          size="xsmall"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Button.Icon as={RiEyeLine} />
                        </Button.Root>
                        <Button.Root variant="ghost" size="xsmall">
                          <Button.Icon as={RiDownloadLine} />
                        </Button.Root>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-paragraph-sm text-text-sub-600">
            Showing 1-{filteredInvoices.length} of {filteredInvoices.length}
          </span>
          <Pagination.Root>
            <Pagination.NavButton disabled>
              <RiArrowLeftSLine className="size-5" />
            </Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.NavButton disabled>
              <RiArrowRightSLine className="size-5" />
            </Pagination.NavButton>
          </Pagination.Root>
        </div>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  )
}

// Invoice Detail Modal - Using List component
function InvoiceDetailModal({
  invoice,
  onClose,
}: {
  invoice: Invoice | null
  onClose: () => void
}) {
  if (!invoice) return null

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]

  return (
    <Modal.Root open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content variant="large">
        <Modal.Header>
          <Modal.Title>Invoice: {invoice.invoiceNumber}</Modal.Title>
          <div className="flex items-center gap-2">
            <Button.Root variant="basic" size="small">
              <Button.Icon as={RiDownloadLine} />
              Download PDF
            </Button.Root>
            <Button.Root variant="ghost" size="small">
              <Button.Icon as={RiPrinterLine} />
              Print
            </Button.Root>
          </div>
        </Modal.Header>
        <Modal.Body>
          {/* From / To */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-10 bg-bg-weak-50 p-4">
              <h4 className="text-label-xs text-text-sub-600 mb-2">FROM</h4>
              <div className="text-label-sm text-text-strong-950">Hypedrive Technologies</div>
              <div className="text-paragraph-xs text-text-sub-600">GST: 27AABCH1234A1Z5</div>
            </div>
            <div className="rounded-10 bg-bg-weak-50 p-4">
              <h4 className="text-label-xs text-text-sub-600 mb-2">TO</h4>
              <div className="text-label-sm text-text-strong-950">Nike India Pvt. Ltd.</div>
              <div className="text-paragraph-xs text-text-sub-600">GST: 27AAACN1234A1Z5</div>
            </div>
          </div>

          {/* Invoice Details - Using List */}
          <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4 mb-6">
            <h4 className="text-label-sm text-text-strong-950 mb-3">Invoice Details</h4>
            <List.Root variant="divided" size="sm">
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Number</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{invoice.invoiceNumber}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Date</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{formatDate(invoice.createdAt)}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Period</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">
                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Due</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{formatDate(invoice.dueDate)}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Status</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <StatusBadge.Root status={getStatusBadgeStatus(invoice.status)} variant="light">
                    <StatusBadge.Dot />
                    {statusConfig.label}
                  </StatusBadge.Root>
                </List.ItemAction>
              </List.Item>
            </List.Root>
          </div>

          {/* Summary - Using List */}
          <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4 mb-6">
            <h4 className="text-label-sm text-text-strong-950 mb-3">Summary</h4>
            <List.Root size="sm">
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Subtotal ({invoice.enrollmentCount} enrollments)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{formatCurrency(invoice.subtotal)}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>GST (18%)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{formatCurrency(invoice.gstAmount)}</span>
                </List.ItemAction>
              </List.Item>
            </List.Root>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-stroke-soft-200">
              <span className="text-label-sm text-text-strong-950">Total</span>
              <span className="text-label-md text-primary-base font-semibold">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-10 bg-bg-weak-50 p-4">
            <h4 className="text-label-sm text-text-strong-950 mb-2">Payment Status</h4>
            <List.Root size="sm">
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Method</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">Wallet Deduction</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Status</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm text-text-strong-950">{statusConfig.label}</span>
                </List.ItemAction>
              </List.Item>
            </List.Root>
            {invoice.status === 'pending' && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-10 bg-warning-lighter">
                <RiInformationLine className="size-4 text-warning-base shrink-0" />
                <span className="text-paragraph-sm text-warning-dark">
                  Amount will be deducted from wallet on due date
                </span>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={onClose}>
            Close
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
