'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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
  PauseCircle,
  PlayCircle,
  PencilSimple,
  Copy,
  StopCircle,
  DotsThree,
  ShoppingBag,
  Clock,
  Info,
  CalendarBlank,
  DownloadSimple,
  Trash,
  ListChecks,
  Camera,
  Image as ImageIcon,
  Star,
  ShareNetwork,
  VideoCamera,
  ClipboardText,
  CheckCircle,
} from '@phosphor-icons/react/dist/ssr'
import type { Enrollment } from '@/hooks/use-enrollments'
import type { DeliverableType } from '@/lib/types'
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants'
import { useCampaign, usePauseCampaign, useResumeCampaign, useEndCampaign, useCampaignStats, useCampaignPricing, useCampaignPerformance } from '@/hooks/use-campaigns'
import { useCampaignDeliverables } from '@/hooks/use-deliverables'
import type { CampaignWithStats, CampaignStats, CampaignPricing, CampaignStatus } from '@/hooks/use-campaigns'
import type { campaigns } from '@/lib/encore-browser'
import { useEnrollments, useExportEnrollments } from '@/hooks/use-enrollments'
import { toast } from 'sonner'

type TabValue = 'overview' | 'enrollments' | 'statistics' | 'settings'

interface CampaignDetailClientProps {
  campaignId: string
}

export function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {
  const router = useRouter()

  // Fetch campaign data from API (hydrated from SSR)
  const { data: campaign, isLoading, error } = useCampaign(campaignId)
  const { data: enrollmentsData } = useEnrollments({ campaignId, limit: 10 })
  const enrollments = enrollmentsData?.data || []
  const { data: stats } = useCampaignStats(campaignId)
  const { data: pricing } = useCampaignPricing(campaignId)
  const { data: deliverables } = useCampaignDeliverables(campaignId)
  const { data: performanceData } = useCampaignPerformance(campaignId)

  // Campaign action hooks
  const pauseCampaign = usePauseCampaign(campaignId)
  const resumeCampaign = useResumeCampaign(campaignId)
  const endCampaign = useEndCampaign(campaignId)

  const [activeTab, setActiveTab] = React.useState<TabValue>('overview')
  const [confirmModal, setConfirmModal] = React.useState<{
    open: boolean
    title: string
    description: string
    variant: 'danger' | 'warning' | 'info'
    action: () => void
  } | null>(null)

  const statusConfig = campaign ? CAMPAIGN_STATUS_CONFIG[campaign.status] : null

  // Set breadcrumbs in header
  useBreadcrumbs([
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Campaigns', href: '/dashboard/campaigns' },
    { label: campaign?.title || 'Loading...' },
  ])

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysRemaining = () => {
    if (!campaign) return 0
    const now = new Date()
    const end = new Date(campaign.endDate)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const getProgressPercentage = () => {
    if (!campaign) return 0
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const getEnrollmentPercentage = () => {
    if (!campaign || !campaign.maxEnrollments) return 0
    return (campaign.currentEnrollments / campaign.maxEnrollments) * 100
  }

  const handlePause = () => {
    setConfirmModal({
      open: true,
      title: 'Pause Campaign',
      description: 'Are you sure you want to pause this campaign? New enrollments will be temporarily disabled.',
      variant: 'warning',
      action: () => {
        pauseCampaign.mutate(undefined, {
          onSuccess: () => {
            toast.success('Campaign paused successfully')
            setConfirmModal(null)
          },
          onError: () => {
            toast.error('Failed to pause campaign')
          },
        })
      },
    })
  }

  const handleResume = () => {
    resumeCampaign.mutate(undefined, {
      onSuccess: () => {
        toast.success('Campaign resumed successfully')
      },
      onError: () => {
        toast.error('Failed to resume campaign')
      },
    })
  }

  const handleEnd = () => {
    setConfirmModal({
      open: true,
      title: 'End Campaign',
      description: 'Are you sure you want to end this campaign? This action cannot be undone.',
      variant: 'danger',
      action: () => {
        endCampaign.mutate(undefined, {
          onSuccess: () => {
            toast.success('Campaign ended successfully')
            setConfirmModal(null)
          },
          onError: () => {
            toast.error('Failed to end campaign')
          },
        })
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6 animate-pulse">
          <div className="h-8 bg-bg-weak-50 rounded w-1/3 mb-4" />
          <div className="h-4 bg-bg-weak-50 rounded w-2/3" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-error-lighter ring-1 ring-inset ring-error-light p-4 sm:p-6">
          <h2 className="text-label-md text-error-dark mb-2">Campaign not found</h2>
          <p className="text-paragraph-sm text-error-dark/70">The campaign you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Button.Root variant="basic" size="small" className="mt-4" onClick={() => router.push('/dashboard/campaigns')}>
            <ArrowLeft className="size-4" />
            Back to Campaigns
          </Button.Root>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Campaign Header Card */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6">
        {/* Top row: Back + Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
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
            {statusConfig?.label || campaign.status}
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
            {campaign.product?.name || campaign.title}
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
          stats={stats}
          pricing={pricing}
          deliverables={deliverables}
          formatCurrency={formatCurrency}
          getDaysRemaining={getDaysRemaining}
          getProgressPercentage={getProgressPercentage}
          getEnrollmentPercentage={getEnrollmentPercentage}
        />
      )}

      {activeTab === 'enrollments' && (
        <EnrollmentsTab
          campaignId={campaign.id}
          enrollments={enrollments}
        />
      )}

      {activeTab === 'statistics' && (
        <StatisticsTab
          campaign={campaign}
          stats={stats}
          performanceData={performanceData}
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

// Helper to get icon for deliverable type
function getDeliverableIcon(type: DeliverableType) {
  switch (type) {
    case 'order_screenshot':
      return ImageIcon
    case 'delivery_photo':
      return Camera
    case 'product_review':
      return Star
    case 'social_media_post':
      return ShareNetwork
    case 'unboxing_video':
      return VideoCamera
    default:
      return ClipboardText
  }
}

// Overview Tab Component
interface OverviewTabProps {
  campaign: CampaignWithStats
  stats: CampaignStats | undefined
  pricing: CampaignPricing | undefined
  deliverables: campaigns.CampaignDeliverableResponse[] | undefined
  formatCurrency: (amount: number) => string
  getDaysRemaining: () => number
  getProgressPercentage: () => number
  getEnrollmentPercentage: () => number
}

function OverviewTab({
  campaign,
  stats,
  pricing,
  deliverables,
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

  // Enrollment breakdown data for BarList - use stats from CampaignWithStats
  const enrollmentBreakdown = [
    { name: 'Approved', value: campaign.approvedCount, color: 'green' as const },
    { name: 'Pending Review', value: campaign.pendingCount, color: 'orange' as const },
    { name: 'Rejected', value: campaign.rejectedCount, color: 'red' as const },
    { name: 'Withdrawn', value: stats?.withdrawnEnrollments ?? 0, color: 'gray' as const },
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
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Billing & Pricing Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <List.Root variant="divided" size="md">
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>Bill Rate</List.ItemTitle>
                <List.ItemDescription>Percentage of order value</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{pricing?.billRate ?? campaign.billRate ?? 0}%</span>
              </List.ItemAction>
            </List.Item>
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>Platform Fee</List.ItemTitle>
                <List.ItemDescription>Per enrollment</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{formatCurrency(pricing?.platformFee ?? campaign.platformFee ?? 50)}</span>
              </List.ItemAction>
            </List.Item>
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>GST Rate</List.ItemTitle>
                <List.ItemDescription>On bill amount</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{pricing?.gstRate ?? 18}%</span>
              </List.ItemAction>
            </List.Item>
            <List.Item>
              <List.ItemContent>
                <List.ItemTitle>TDS Rate</List.ItemTitle>
                <List.ItemDescription>Tax deducted at source</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAction>
                <span className="text-label-sm sm:text-label-md text-text-strong-950">{pricing?.tdsRate ?? 0}%</span>
              </List.ItemAction>
            </List.Item>
            {pricing?.bonusAmount && pricing.bonusAmount > 0 && (
              <List.Item>
                <List.ItemContent>
                  <List.ItemTitle>Bonus Amount</List.ItemTitle>
                  <List.ItemDescription>Additional shopper incentive</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-label-sm sm:text-label-md text-success-base">{formatCurrency(pricing.bonusAmount)}</span>
                </List.ItemAction>
              </List.Item>
            )}
          </List.Root>

          <div className="rounded-xl bg-bg-weak-50 p-3 sm:p-4">
            <h4 className="text-label-sm text-text-strong-950 mb-2 sm:mb-3">Example Cost (₹10,000 order)</h4>
            <List.Root size="sm">
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Bill ({pricing?.billRate ?? campaign.billRate ?? 0}%)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(10000 * ((pricing?.billRate ?? campaign.billRate ?? 0) / 100))}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>GST ({pricing?.gstRate ?? 18}%)</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(10000 * ((pricing?.billRate ?? campaign.billRate ?? 0) / 100) * ((pricing?.gstRate ?? 18) / 100))}</span>
                </List.ItemAction>
              </List.Item>
              <List.Item>
                <List.ItemContent>
                  <List.ItemDescription>Platform Fee</List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <span className="text-paragraph-sm">{formatCurrency(pricing?.platformFee ?? campaign.platformFee ?? 50)}</span>
                </List.ItemAction>
              </List.Item>
            </List.Root>
            <div className="flex items-center justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-stroke-soft-200">
              <span className="text-label-sm text-text-strong-950">Estimated Cost/Enrollment</span>
              <span className="text-label-md text-primary-base font-semibold">
                {formatCurrency(pricing?.estimatedCostPerEnrollment ?? (
                  10000 * ((campaign.billRate ?? 0) / 100) +
                  10000 * ((campaign.billRate ?? 0) / 100) * 0.18 +
                  (campaign.platformFee ?? 50)
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-information-lighter">
          <Info weight="duotone" className="size-4 text-information-base shrink-0 mt-0.5" />
          <span className="text-paragraph-xs sm:text-paragraph-sm text-information-dark">
            Shopper payouts are determined and managed by Hypedrive platform. Rebate percentage: {pricing?.rebatePercentage ?? 0}%
          </span>
        </div>
      </div>

      {/* Required Deliverables */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4 flex items-center gap-2">
          <ListChecks weight="duotone" className="size-5 text-primary-base" />
          Required Deliverables
        </h3>
        {deliverables && deliverables.length > 0 ? (
          <div className="space-y-3">
            {deliverables.map((campaignDeliverable, index) => {
              const DeliverableIcon = getDeliverableIcon(campaignDeliverable.deliverable?.category as DeliverableType)
              return (
                <div
                  key={campaignDeliverable.id}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200"
                >
                  <div className="size-10 sm:size-12 rounded-xl bg-primary-alpha-10 flex items-center justify-center shrink-0">
                    <DeliverableIcon weight="duotone" className="size-5 sm:size-6 text-primary-base" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-label-sm sm:text-label-md text-text-strong-950">
                        {index + 1}. {campaignDeliverable.deliverable?.name ?? 'Deliverable'}
                      </span>
                      {campaignDeliverable.isRequired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-lighter text-error-base text-[10px] sm:text-xs font-medium">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-soft-200 text-text-sub-600 text-[10px] sm:text-xs font-medium">
                          Optional
                        </span>
                      )}
                    </div>
                    {campaignDeliverable.deliverable?.category && (
                      <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mb-1">
                        {campaignDeliverable.deliverable.category}
                      </p>
                    )}
                    {campaignDeliverable.instructions && (
                      <p className="text-paragraph-xs text-text-soft-400 flex items-start gap-1">
                        <Info weight="fill" className="size-3.5 shrink-0 mt-0.5" />
                        {campaignDeliverable.instructions}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <CheckCircle weight="duotone" className="size-5 text-text-soft-400" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-text-sub-600">
            <ListChecks weight="duotone" className="size-12 mx-auto mb-2 text-gray-300" />
            <p className="text-paragraph-sm">No deliverables configured</p>
            <p className="text-paragraph-xs text-text-soft-400 mt-1">
              Add deliverables to define what shoppers need to submit
            </p>
          </div>
        )}
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
  const exportEnrollments = useExportEnrollments(campaignId)

  const handleExport = () => {
    exportEnrollments.mutate(
      {},
      {
        onSuccess: (response) => {
          toast.success(`Exported ${response.totalCount} enrollments`)
        },
        onError: () => {
          toast.error('Failed to export enrollments')
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label-md text-text-strong-950">
          Campaign Enrollments ({enrollments.length})
        </h3>
        <div className="flex items-center gap-2">
          <Button.Root
            variant="basic"
            size="small"
            onClick={() => handleExport()}
            disabled={exportEnrollments.isPending}
          >
            <Button.Icon as={DownloadSimple} />
            {exportEnrollments.isPending ? 'Exporting...' : 'Export'}
          </Button.Root>
          <Button.Root variant="basic" size="small" asChild>
            <Link href={`/dashboard/enrollments?campaign=${campaignId}`}>
              View All
            </Link>
          </Button.Root>
        </div>
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
  campaign: CampaignWithStats
  stats: CampaignStats | undefined
  performanceData: campaigns.CampaignPerformance[] | undefined
}

function StatisticsTab({ stats, performanceData }: StatisticsTabProps) {
  // Transform performance data for chart (needs 'name' field instead of 'date')
  const chartData = React.useMemo(() => {
    if (!performanceData) return []
    return performanceData.map(item => ({
      name: item.date,
      enrollments: item.enrollments,
      approvals: item.approvals,
    }))
  }, [performanceData])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enrollment Trend */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Enrollment Trend</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[400px] px-4 sm:px-0">
            {chartData.length > 0 ? (
              <AlignLineChart
                data={chartData}
                dataKeys={[
                  { key: 'enrollments', label: 'Total Enrollments', color: 'oklch(0.7 0.15 250)' },
                  { key: 'approvals', label: 'Approved', color: 'oklch(0.7 0.15 145)' },
                ]}
                height={250}
                showLegend
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-text-soft-400 text-paragraph-sm">
                No trend data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics - Using MetricGroup */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Performance Metrics</h3>
        <MetricGroup columns={4} className="grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Total Enrollments"
            value={`${stats?.totalEnrollments ?? 0}`}
            deltaType="unchanged"
            description="all time"
            size="sm"
          />
          <Metric
            label="Approval Rate"
            value={`${stats?.approvalRate ?? 0}%`}
            delta={stats?.approvalRate && stats.approvalRate > 80 ? '+5%' : '-2%'}
            deltaType={stats?.approvalRate && stats.approvalRate > 80 ? 'increase' : 'decrease'}
            description="vs last campaign"
            size="sm"
          />
          <Metric
            label="Avg. Order Value"
            value={`₹${(stats?.averageOrderValue ?? 0).toLocaleString('en-IN')}`}
            deltaType="unchanged"
            description="per enrollment"
            size="sm"
          />
          <Metric
            label="Total Payouts"
            value={`₹${(stats?.totalPayouts ?? 0).toLocaleString('en-IN')}`}
            deltaType="unchanged"
            description="paid out"
            size="sm"
          />
        </MetricGroup>
      </div>
    </div>
  )
}

// Settings Tab Component
interface SettingsTabProps {
  campaign: CampaignWithStats
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
              <List.ItemTitle>Enrollment Expiry</List.ItemTitle>
              <List.ItemDescription className="hidden sm:block">Days after enrollment to submit proof</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <span className="text-label-sm sm:text-label-md text-text-strong-950">
                {campaign.enrollmentExpiryDays} days
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
