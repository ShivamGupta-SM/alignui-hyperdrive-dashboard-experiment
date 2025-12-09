'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as TabMenu from '@/components/ui/tab-menu-horizontal'
import * as Dropdown from '@/components/ui/dropdown'
import * as ProgressBar from '@/components/ui/progress-bar'
import * as List from '@/components/ui/list'
import { EnrollmentCard } from '@/components/dashboard/enrollment-card'
import { Metric, MetricGroup } from '@/components/ui/metric'
import { Tracker } from '@/components/ui/tracker'
import { BarList } from '@/components/ui/bar-list'
import { AlignLineChart } from '@/components/claude-generated-components/charts'
import { ConfirmationModal } from '@/components/dashboard/modals'
import { useBreadcrumbs } from '@/contexts/breadcrumb-context'
import {
  ArrowLeft,
  ArrowRight,
  PauseCircle,
  PlayCircle,
  PencilSimple,
  Copy,
  StopCircle,
  DotsThree,
  Trash,
  ShoppingBag,
  Clock,
  Info,
  CalendarBlank,
} from '@phosphor-icons/react/dist/ssr'
import type { Campaign, CampaignStatus, Enrollment } from '@/lib/types'
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants'

// Mock data
const mockCampaign: Campaign = {
  id: '1',
  organizationId: '1',
  productId: '1',
  title: 'Nike Summer Sale 2024',
  description: 'Summer collection promotion with amazing cashback offers for shoppers',
  type: 'cashback',
  status: 'active',
  isPublic: true,
  startDate: new Date('2024-12-01'),
  endDate: new Date('2024-12-31'),
  submissionDeadlineDays: 45,
  maxEnrollments: 500,
  currentEnrollments: 234,
  billRate: 18,
  platformFee: 50,
  approvedCount: 198,
  rejectedCount: 24,
  pendingCount: 12,
  totalPayout: 245000,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    campaignId: '1',
    shopperId: '1',
    status: 'awaiting_review',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    orderDate: new Date('2024-12-03'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-19'),
    billAmount: 2340,
    platformFee: 50,
    gstAmount: 421,
    totalCost: 2811,
    shopper: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      previousEnrollments: 5,
      approvalRate: 100,
    },
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '2',
    campaignId: '1',
    shopperId: '2',
    status: 'approved',
    orderId: 'FLK-9876543210',
    orderValue: 8499,
    orderDate: new Date('2024-12-04'),
    platform: 'Flipkart',
    submissionDeadline: new Date('2025-01-20'),
    billAmount: 1530,
    platformFee: 50,
    gstAmount: 275,
    totalCost: 1855,
    shopper: {
      id: '2',
      name: 'Sarah K.',
      email: 'sarah@example.com',
      previousEnrollments: 3,
      approvalRate: 100,
    },
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
]

const mockEnrollmentStats = [
  { name: 'Week 1', enrollments: 45, approved: 38 },
  { name: 'Week 2', enrollments: 62, approved: 52 },
  { name: 'Week 3', enrollments: 78, approved: 68 },
  { name: 'Week 4', enrollments: 49, approved: 40 },
]

type TabValue = 'overview' | 'enrollments' | 'statistics' | 'settings'

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = React.useState<Campaign>(mockCampaign)
  const [activeTab, setActiveTab] = React.useState<TabValue>('overview')
  const [confirmModal, setConfirmModal] = React.useState<{
    open: boolean
    title: string
    description: string
    variant: 'danger' | 'warning' | 'info'
    action: () => void
  } | null>(null)

  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status]

  // Set breadcrumbs in header
  useBreadcrumbs([
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Campaigns', href: '/dashboard/campaigns' },
    { label: campaign.title },
  ])

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

  const getDaysRemaining = () => {
    const now = new Date()
    const end = new Date(campaign.endDate)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const getProgressPercentage = () => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const getEnrollmentPercentage = () => {
    if (!campaign.maxEnrollments) return 0
    return (campaign.currentEnrollments / campaign.maxEnrollments) * 100
  }

  const handlePause = () => {
    setConfirmModal({
      open: true,
      title: 'Pause Campaign',
      description: 'Are you sure you want to pause this campaign? New enrollments will be temporarily disabled.',
      variant: 'warning',
      action: () => {
        setCampaign((prev) => ({ ...prev, status: 'paused' as CampaignStatus }))
        setConfirmModal(null)
      },
    })
  }

  const handleResume = () => {
    setCampaign((prev) => ({ ...prev, status: 'active' as CampaignStatus }))
  }

  const handleEnd = () => {
    setConfirmModal({
      open: true,
      title: 'End Campaign',
      description: 'Are you sure you want to end this campaign? This action cannot be undone.',
      variant: 'danger',
      action: () => {
        setCampaign((prev) => ({ ...prev, status: 'ended' as CampaignStatus }))
        setConfirmModal(null)
      },
    })
  }

  // Get status badge status
  const getStatusBadgeStatus = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'completed' as const
      case 'draft':
      case 'pending_approval':
      case 'paused':
        return 'pending' as const
      case 'rejected':
      case 'ended':
      case 'cancelled':
      case 'expired':
        return 'failed' as const
      default:
        return 'disabled' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Campaign Header Card */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6">
        {/* Top row: Back + Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
          >
            <ArrowLeft weight="bold" className="size-4" />
            <span className="text-label-sm">Back</span>
          </button>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {campaign.status === 'active' && (
              <Button.Root variant="basic" size="xsmall" onClick={handlePause}>
                <Button.Icon as={PauseCircle} />
                <span className="hidden sm:inline">Pause</span>
              </Button.Root>
            )}
            {campaign.status === 'paused' && (
              <Button.Root variant="primary" size="xsmall" onClick={handleResume}>
                <Button.Icon as={PlayCircle} />
                <span className="hidden sm:inline">Resume</span>
              </Button.Root>
            )}
            {(campaign.status === 'active' || campaign.status === 'paused') && (
              <>
                <Button.Root variant="basic" size="xsmall" asChild>
                  <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                    <Button.Icon as={PencilSimple} />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </Button.Root>
                <Dropdown.Root>
                  <Dropdown.Trigger asChild>
                    <Button.Root variant="basic" size="xsmall">
                      <Button.Icon as={DotsThree} />
                    </Button.Root>
                  </Dropdown.Trigger>
                  <Dropdown.Content align="end">
                    <Dropdown.Item>
                      <Dropdown.ItemIcon as={Copy} />
                      Duplicate
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item onClick={handleEnd} className="text-error-base">
                      <Dropdown.ItemIcon as={StopCircle} />
                      End Campaign
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Root>
              </>
            )}
          </div>
        </div>

        {/* Title + Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">{campaign.title}</h1>
          <StatusBadge.Root status={getStatusBadgeStatus(campaign.status)} variant="light">
            <StatusBadge.Dot />
            {statusConfig.label}
          </StatusBadge.Root>
        </div>
        
        {/* Description */}
        <p className="text-paragraph-sm text-text-sub-600 mb-3 line-clamp-2">
          {campaign.description}
        </p>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
          <span className="flex items-center gap-1.5">
            <ShoppingBag weight="duotone" className="size-4 shrink-0" />
            Nike Air Max 2024
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarBlank weight="duotone" className="size-4 shrink-0" />
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock weight="duotone" className="size-4 shrink-0" />
            {getDaysRemaining()} days left
          </span>
        </div>
      </div>

      {/* Tabs */}
      <TabMenu.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabMenu.List>
          <TabMenu.Trigger value="overview">Overview</TabMenu.Trigger>
          <TabMenu.Trigger value="enrollments">Enrollments</TabMenu.Trigger>
          <TabMenu.Trigger value="statistics">Statistics</TabMenu.Trigger>
          <TabMenu.Trigger value="settings">Settings</TabMenu.Trigger>
        </TabMenu.List>
      </TabMenu.Root>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          campaign={campaign}
          formatCurrency={formatCurrency}
          getDaysRemaining={getDaysRemaining}
          getProgressPercentage={getProgressPercentage}
          getEnrollmentPercentage={getEnrollmentPercentage}
        />
      )}

      {activeTab === 'enrollments' && (
        <EnrollmentsTab
          campaignId={campaign.id}
          enrollments={mockEnrollments}
        />
      )}

      {activeTab === 'statistics' && (
        <StatisticsTab
          campaign={campaign}
          data={mockEnrollmentStats}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab campaign={campaign} />
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          open={confirmModal.open}
          onOpenChange={(open) => !open && setConfirmModal(null)}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmLabel="Confirm"
          onConfirm={confirmModal.action}
        />
      )}
    </div>
  )
}

// Overview Tab Component
interface OverviewTabProps {
  campaign: Campaign
  formatCurrency: (amount: number) => string
  getDaysRemaining: () => number
  getProgressPercentage: () => number
  getEnrollmentPercentage: () => number
}

function OverviewTab({
  campaign,
  formatCurrency,
  getDaysRemaining,
  getProgressPercentage,
  getEnrollmentPercentage,
}: OverviewTabProps) {
  const approvalRate = campaign.currentEnrollments > 0
    ? Math.round((campaign.approvedCount / campaign.currentEnrollments) * 100)
    : 0

  // Generate tracker data for enrollment status distribution
  const trackerData = React.useMemo(() => {
    const total = campaign.currentEnrollments
    if (total === 0) return []

    const approved = Math.round((campaign.approvedCount / total) * 20)
    const rejected = Math.round((campaign.rejectedCount / total) * 20)
    const pending = Math.round((campaign.pendingCount / total) * 20)
    const other = 20 - approved - rejected - pending

    return [
      ...Array(approved).fill({ status: 'success' as const, tooltip: 'Approved' }),
      ...Array(pending).fill({ status: 'warning' as const, tooltip: 'Pending' }),
      ...Array(rejected).fill({ status: 'error' as const, tooltip: 'Rejected' }),
      ...Array(Math.max(0, other)).fill({ status: 'neutral' as const, tooltip: 'Other' }),
    ]
  }, [campaign])

  // Enrollment breakdown data for BarList
  const enrollmentBreakdown = [
    { name: 'Approved', value: campaign.approvedCount, color: 'green' as const },
    { name: 'Pending Review', value: campaign.pendingCount, color: 'orange' as const },
    { name: 'Rejected', value: campaign.rejectedCount, color: 'red' as const },
    { name: 'Awaiting Submission', value: 12, color: 'blue' as const },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics - Using MetricGroup */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-sm text-text-sub-600 mb-3 sm:mb-4">Key Metrics</h3>
        <MetricGroup columns={4} className="grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Total Enrollments"
            value={campaign.currentEnrollments}
            description={`of ${campaign.maxEnrollments || '∞'} max`}
            size="sm"
          />
          <Metric
            label="Approval Rate"
            value={`${approvalRate}%`}
            delta={approvalRate > 80 ? '+5%' : '-2%'}
            deltaType={approvalRate > 80 ? 'increase' : 'decrease'}
            description="vs last campaign"
            size="sm"
          />
          <Metric
            label="Total Payout"
            value={formatCurrency(campaign.totalPayout)}
            description="to date"
            size="sm"
          />
          <Metric
            label="Avg. Cost"
            value={formatCurrency(campaign.currentEnrollments > 0 ? Math.round(campaign.totalPayout / campaign.currentEnrollments) : 0)}
            description="per enrollment"
            size="sm"
          />
        </MetricGroup>
      </div>

      {/* Progress & Distribution */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Campaign Progress */}
        <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
          <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Campaign Progress</h3>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-xs sm:text-label-sm text-text-sub-600">Time Progress</span>
                <span className="text-label-xs sm:text-label-sm text-text-strong-950">{getDaysRemaining()} days left</span>
              </div>
              <ProgressBar.Root value={getProgressPercentage()} />
              <p className="text-paragraph-xs text-text-soft-400 mt-1">
                {Math.round(getProgressPercentage())}% of campaign duration elapsed
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-xs sm:text-label-sm text-text-sub-600">Enrollment Capacity</span>
                <span className="text-label-xs sm:text-label-sm text-text-strong-950">
                  {campaign.currentEnrollments} / {campaign.maxEnrollments || '∞'}
                </span>
              </div>
              <ProgressBar.Root value={getEnrollmentPercentage()} color="blue" />
              <p className="text-paragraph-xs text-text-soft-400 mt-1">
                {Math.round(getEnrollmentPercentage())}% capacity used
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Distribution - Using Tracker & BarList */}
        <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
          <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Enrollment Distribution</h3>
          
          {/* Tracker visualization */}
          <div className="mb-4">
            <Tracker data={trackerData} size="lg" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-paragraph-xs text-text-sub-600">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-success-base" /> Approved
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-warning-base" /> Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-error-base" /> Rejected
              </span>
            </div>
          </div>

          {/* BarList breakdown */}
          <BarList
            data={enrollmentBreakdown}
            valueFormatter={(v) => `${v}`}
            size="sm"
          />
        </div>
      </div>

      {/* Billing Details - Using List */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Billing Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <List.Root variant="divided" size="md">
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>Bill Rate</List.ItemTitle>
                <List.ItemDescription>Percentage of order value</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{campaign.billRate ?? 0}%</span>
              </List.ItemAction>
            </List.Item>
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>Platform Fee</List.ItemTitle>
                <List.ItemDescription>Per enrollment</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{formatCurrency(campaign.platformFee ?? 50)}</span>
              </List.ItemAction>
            </List.Item>
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>GST</List.ItemTitle>
                <List.ItemDescription>On bill amount</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">18%</span>
              </List.ItemAction>
            </List.Item>
          </List.Root>

          <div className="rounded-xl bg-bg-weak-50 p-3 sm:p-4">
            <h4 className="text-label-sm text-text-strong-950 mb-2 sm:mb-3">Example Cost (₹10,000 order)</h4>
            <List.Root size="sm">
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Bill ({campaign.billRate ?? 0}%)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(10000 * ((campaign.billRate ?? 0) / 100))}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>GST (18%)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(10000 * ((campaign.billRate ?? 0) / 100) * 0.18)}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Platform Fee</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(campaign.platformFee ?? 50)}</span>
                </List.ItemAction>
              </List.Item>
            </List.Root>
            <div className="flex items-center justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-stroke-soft-200">
              <span className="text-label-sm text-text-strong-950">Total Cost</span>
              <span className="text-label-md text-primary-base font-semibold">
                {formatCurrency(
                  10000 * ((campaign.billRate ?? 0) / 100) +
                  10000 * ((campaign.billRate ?? 0) / 100) * 0.18 +
                  (campaign.platformFee ?? 50)
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-information-lighter">
          <Info weight="duotone" className="size-4 text-information-base shrink-0 mt-0.5" />
          <span className="text-paragraph-xs sm:text-paragraph-sm text-information-dark">
            Shopper payouts are determined and managed by Hypedrive platform.
          </span>
        </div>
      </div>
    </div>
  )
}

// Enrollments Tab Component
interface EnrollmentsTabProps {
  campaignId: string
  enrollments: Enrollment[]
}

function EnrollmentsTab({ campaignId, enrollments }: EnrollmentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label-md text-text-strong-950">
          Campaign Enrollments ({enrollments.length})
        </h3>
        <Button.Root variant="basic" size="small" asChild>
          <Link href={`/dashboard/enrollments?campaign=${campaignId}`}>
            View All
          </Link>
        </Button.Root>
      </div>
      <div className="space-y-3">
        {enrollments.map((enrollment) => (
          <EnrollmentCard
            key={enrollment.id}
            enrollment={enrollment}
            onReview={() => {}}
            onView={() => {}}
          />
        ))}
      </div>
    </div>
  )
}

// Statistics Tab Component
interface StatisticsTabProps {
  campaign: Campaign
  data: { name: string; enrollments: number; approved: number }[]
}

function StatisticsTab({ campaign, data }: StatisticsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enrollment Trend */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Enrollment Trend</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[400px] px-4 sm:px-0">
            <AlignLineChart
              data={data}
              dataKeys={[
                { key: 'enrollments', label: 'Total Enrollments', color: 'oklch(0.7 0.15 250)' },
                { key: 'approved', label: 'Approved', color: 'oklch(0.7 0.15 145)' },
              ]}
              height={250}
              showLegend
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics - Using MetricGroup */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Performance Metrics</h3>
        <MetricGroup columns={4} className="grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Avg. Review Time"
            value="2.5 hours"
            delta="-30min"
            deltaType="increase"
            description="vs last week"
            size="sm"
          />
          <Metric
            label="Approval Rate"
            value="85%"
            delta="+5%"
            deltaType="increase"
            description="vs last campaign"
            size="sm"
          />
          <Metric
            label="Rejection Rate"
            value="10%"
            delta="-2%"
            deltaType="increase"
            description="improving"
            size="sm"
          />
          <Metric
            label="Withdrawal Rate"
            value="5%"
            deltaType="unchanged"
            description="stable"
            size="sm"
          />
        </MetricGroup>
      </div>
    </div>
  )
}

// Settings Tab Component
interface SettingsTabProps {
  campaign: Campaign
}

function SettingsTab({ campaign }: SettingsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Campaign Settings</h3>
        <List.Root variant="divided" size="md">
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Public Campaign</List.ItemTitle>
              <List.ItemDescription className="hidden sm:block">Allow shoppers to discover and enroll in this campaign</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <StatusBadge.Root status={campaign.isPublic ? 'completed' : 'disabled'} variant="light">
                <StatusBadge.Dot />
                {campaign.isPublic ? 'Enabled' : 'Disabled'}
              </StatusBadge.Root>
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Max Enrollments</List.ItemTitle>
              <List.ItemDescription className="hidden sm:block">Maximum number of enrollments allowed</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <span className="text-label-sm sm:text-label-md text-text-strong-950">
                {campaign.maxEnrollments || 'Unlimited'}
              </span>
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Submission Deadline</List.ItemTitle>
              <List.ItemDescription className="hidden sm:block">Days after enrollment to submit proof</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <span className="text-label-sm sm:text-label-md text-text-strong-950">
                {campaign.submissionDeadlineDays} days
              </span>
            </List.ItemAction>
          </List.Item>
        </List.Root>
      </div>

      <div className="rounded-2xl bg-error-lighter ring-1 ring-inset ring-error-light p-4 sm:p-5">
        <h3 className="text-label-md text-error-dark mb-3 sm:mb-4">Danger Zone</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-label-sm text-error-base">Delete Campaign</div>
            <div className="text-paragraph-xs text-error-dark/70">
              Permanently delete this campaign and all its data
            </div>
          </div>
          <Button.Root variant="error" size="small" className="w-full sm:w-auto">
            <Button.Icon as={Trash} />
            Delete
          </Button.Root>
        </div>
      </div>
    </div>
  )
}
