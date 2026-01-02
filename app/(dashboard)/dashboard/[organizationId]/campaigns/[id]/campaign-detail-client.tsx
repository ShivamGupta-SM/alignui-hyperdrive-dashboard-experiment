"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import * as Button from "@/components/ui/primitives/button"
import * as Breadcrumb from "@/components/ui/navigation/breadcrumb"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as TabMenu from "@/components/ui/navigation/tab-menu-horizontal"
import * as Dropdown from "@/components/ui/layout/dropdown"
import * as ProgressBar from "@/components/ui/primitives/progress-bar"
import * as List from "@/components/ui/data-display/list"
import { Metric, MetricGroup } from "@/components/ui/data-display/metric"
import { Tracker } from "@/components/ui/data-display/tracker"
import { BarList } from "@/components/ui/data-display/bar-list"
import { AlignLineChart } from "@/components/ui/data-display/charts"
import { ConfirmationModal } from "@/components/dashboard/modals"
import * as Table from "@/components/ui/data-display/table"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as Badge from "@/components/ui/data-display/badge"
import { cn, getAvatarColor, getErrorMessage, formatCurrency, formatDateMedium, getTimeAgo, isOverdue, getInitial } from "@/lib/utils"
import { useStableTime } from "@/hooks/ui/use-mounted"
import {
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
	ArrowRight,
	CaretUp,
	CaretDown,
	ArrowsDownUp,
	CaretLeft,
	CaretRight,
	Warning,
	Plus,
} from "@phosphor-icons/react"
import type { Enrollment, EnrollmentStatus } from "@/features/enrollments"
import { CAMPAIGN_STATUS_CONFIG, getCampaignStatusBadgeStatus, getEnrollmentStatusBadgeStatus, getEnrollmentStatusLabel } from "@/lib/constants"
import { THRESHOLDS } from "@/lib/types/constants"
import {
	updateCampaignStatus,
	duplicateCampaign,
	exportCampaignEnrollments,
	campaignKeys,
	type CampaignWithStats,
	type CampaignStats,
	type CampaignPricing,
	type CampaignStatus,
} from "@/features/campaigns"
import type { platforms, organizations } from "@/brand-client"
import { toast } from "sonner"
import {
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { SettingsTab } from "./settings-tab"
import { DeliverablesTab } from "./deliverables-tab"
import { InlineBackButton } from "@/components/ui/navigation/back-button"

type TabValue = "overview" | "enrollments" | "deliverables" | "statistics" | "settings"

interface CampaignDetailClientProps {
	campaignId: string
	initialData?: organizations.CampaignWithStats & {
		stats?: organizations.CampaignStats
		pricing?: organizations.CampaignPricing
		deliverables?: organizations.CampaignDeliverableResponse[]
		performance?: organizations.CampaignPerformance[]
		enrollments?: organizations.EnrollmentWithRelations[]
		platforms?: platforms.Platform[]
	}
}

export function CampaignDetailClient({ campaignId, initialData }: CampaignDetailClientProps) {
	const router = useRouter()
	const { organizationId } = useCurrentOrganization()
	const queryClient = useQueryClient()
	// Data from RSC - use optional chaining with defaults for safety
	// Convert null to undefined for type safety (API may return null for missing data)
	const campaign = initialData
	const stats = initialData?.stats ?? undefined
	const pricing = initialData?.pricing ?? undefined
	const deliverables = initialData?.deliverables ?? []
	const performanceData = initialData?.performance ?? []

	// Enrollments and platforms from initialData
	const campaignEnrollments = initialData?.enrollments ?? []
	const platforms = initialData?.platforms ?? []

	const [activeTab, setActiveTab] = React.useState<TabValue>("overview")
	const [confirmModal, setConfirmModal] = React.useState<{
		open: boolean
		title: string
		description: string
		variant: "danger" | "warning" | "info"
		action: () => void
	} | null>(null)

	const [isPending, startTransition] = React.useTransition()

	// Hydration-safe reference time - prevents server/client mismatch
	const referenceTime = useStableTime()

	const statusConfig = campaign ? CAMPAIGN_STATUS_CONFIG[campaign.status] : null

	const getDaysRemaining = () => {
		if (!campaign || !referenceTime) return 0
		const end = new Date(campaign.endDate)
		const diff = Math.ceil((end.getTime() - referenceTime) / (1000 * 60 * 60 * 24))
		return Math.max(0, diff)
	}

	const getProgressPercentage = () => {
		if (!campaign || !referenceTime) return 0
		const start = new Date(campaign.startDate)
		const end = new Date(campaign.endDate)
		const total = end.getTime() - start.getTime()
		const elapsed = referenceTime - start.getTime()
		return Math.min(100, Math.max(0, (elapsed / total) * 100))
	}

	const getEnrollmentPercentage = () => {
		if (!campaign || !campaign.maxEnrollments) return 0
		return (campaign.currentEnrollments / campaign.maxEnrollments) * 100
	}

	const handlePause = () => {
		setConfirmModal({
			open: true,
			title: "Pause Campaign",
			description:
				"Are you sure you want to pause this campaign? New enrollments will be temporarily disabled.",
			variant: "warning",
			action: () => {
				startTransition(async () => {
					try {
						await updateCampaignStatus({ organizationId, id: campaignId, action: "pause", reason: "Paused by user" })
						toast.success("Campaign paused successfully")
						setConfirmModal(null)
						// Invalidate campaigns queries to refetch updated status
						queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
						queryClient.invalidateQueries({ queryKey: campaignKeys.detail(organizationId, campaignId) })
					} catch (error) {
						toast.error(getErrorMessage(error, "Failed to pause campaign"))
					}
				})
			},
		})
	}

	const handleResume = () => {
		startTransition(async () => {
			try {
				await updateCampaignStatus({ organizationId, id: campaignId, action: "resume" })
				toast.success("Campaign resumed successfully")
				// Invalidate campaigns queries to refetch updated status
				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				queryClient.invalidateQueries({ queryKey: campaignKeys.detail(organizationId, campaignId) })
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to resume campaign"))
			}
		})
	}

	const handleEnd = () => {
		setConfirmModal({
			open: true,
			title: "End Campaign",
			description: "Are you sure you want to end this campaign? This action cannot be undone.",
			variant: "danger",
			action: () => {
				startTransition(async () => {
					try {
						await updateCampaignStatus({ organizationId, id: campaignId, action: "end" })
						toast.success("Campaign ended successfully")
						setConfirmModal(null)
						// Invalidate campaigns queries to refetch updated status
						queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
						queryClient.invalidateQueries({ queryKey: campaignKeys.detail(organizationId, campaignId) })
					} catch (error) {
						toast.error(getErrorMessage(error, "Failed to end campaign"))
					}
				})
			},
		})
	}

	const handleDuplicate = () => {
		startTransition(async () => {
			try {
				const result = await duplicateCampaign({ id: campaignId, organizationId })
				if (result?.data?.id) {
					toast.success("Campaign duplicated successfully")
					// Invalidate campaigns list to show the new campaign
					queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
					// Navigate to the new campaign
					router.push(`/dashboard/${organizationId}/campaigns/${result.data.id}`)
				} else {
					toast.error("Failed to duplicate campaign")
				}
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to duplicate campaign"))
			}
		})
	}

	if (!campaign) {
		return (
			<div className="space-y-6">
				<div className="rounded-2xl bg-error-lighter ring-1 ring-inset ring-error-light p-4 sm:p-6">
					<h2 className="text-label-md text-error-dark mb-2">Campaign not found</h2>
					<p className="text-paragraph-sm text-error-dark/70">
						The campaign you&apos;re looking for doesn&apos;t exist or has been deleted.
					</p>
					<InlineBackButton
						label="Back to Campaigns"
						href={`/dashboard/${organizationId}/campaigns`}
						className="mt-4"
					/>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Campaign Header Card */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6">
				{/* Top row: Breadcrumb + Actions */}
				<div className="flex items-center justify-between gap-4 mb-4">
					<Breadcrumb.Root>
						<Breadcrumb.Item asChild>
							<Link href={`/dashboard/${organizationId}`}>Dashboard</Link>
						</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon as={CaretRight} />
						<Breadcrumb.Item asChild>
							<Link href={`/dashboard/${organizationId}/campaigns`}>Campaigns</Link>
						</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon as={CaretRight} />
						<Breadcrumb.Item active>{campaign.title}</Breadcrumb.Item>
					</Breadcrumb.Root>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{campaign.status === "active" && (
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={handlePause}
								disabled={isPending}
							>
								<Button.Icon>
									<PauseCircle className="size-5" />
								</Button.Icon>
								<span className="hidden sm:inline">Pause</span>
							</Button.Root>
						)}
						{campaign.status === "paused" && (
							<Button.Root
								variant="primary"
								size="xsmall"
								onClick={handleResume}
								disabled={isPending}
							>
								<Button.Icon>
									<PlayCircle className="size-5" />
								</Button.Icon>
								<span className="hidden sm:inline">Resume</span>
							</Button.Root>
						)}
						{(campaign.status === "active" || campaign.status === "paused") && (
							<>
								<Button.Root variant="neutral" size="xsmall" asChild>
									<Link href={`/dashboard/${organizationId}/campaigns/${campaign.id}?mode=edit`}>
										<Button.Icon>
											<PencilSimple className="size-5" />
										</Button.Icon>
										<span className="hidden sm:inline">Edit</span>
									</Link>
								</Button.Root>
								<Dropdown.Root>
									<Dropdown.Trigger asChild>
										<Button.Root variant="ghost" size="xsmall" aria-label="More actions">
											<Button.Icon>
												<DotsThree className="size-5" />
											</Button.Icon>
										</Button.Root>
									</Dropdown.Trigger>
									<Dropdown.Content align="end">
										<Dropdown.Item onClick={handleDuplicate} disabled={isPending}>
											<Dropdown.ItemIcon as={Copy} />
											{isPending ? "Duplicating..." : "Duplicate"}
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
					<StatusBadge.Root status={getCampaignStatusBadgeStatus(campaign.status)} variant="light">
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
						{formatDateMedium(campaign.startDate)} - {formatDateMedium(campaign.endDate)}
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
					<TabMenu.Trigger value="deliverables">Deliverables</TabMenu.Trigger>
					<TabMenu.Trigger value="statistics">Statistics</TabMenu.Trigger>
					<TabMenu.Trigger value="settings">Settings</TabMenu.Trigger>
				</TabMenu.List>
			</TabMenu.Root>

			{/* Tab Content */}
			{activeTab === "overview" && (
				<OverviewTab
					campaign={campaign}
					stats={stats}
					pricing={pricing}
					deliverables={deliverables}
					platforms={platforms}
					getDaysRemaining={getDaysRemaining}
					getProgressPercentage={getProgressPercentage}
					getEnrollmentPercentage={getEnrollmentPercentage}
				/>
			)}

			{activeTab === "enrollments" && (
				<EnrollmentsTab campaignId={campaign.id} enrollments={campaignEnrollments} organizationId={organizationId} />
			)}

			{activeTab === "deliverables" && (
				<DeliverablesTab
					organizationId={organizationId}
					campaignId={campaign.id}
					deliverables={deliverables}
					platforms={platforms}
					canEdit={campaign.status === "draft" || campaign.status === "active" || campaign.status === "paused"}
				/>
			)}

			{activeTab === "statistics" && (
				<StatisticsTab campaign={campaign} stats={stats} performanceData={performanceData} />
			)}

			{activeTab === "settings" && <SettingsTab campaign={campaign} />}

			{/* Confirmation Modal */}
			{confirmModal && (
				<ConfirmationModal
					open={confirmModal.open}
					onOpenChange={(open: boolean) => !open && setConfirmModal(null)}
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
function getDeliverableIcon(type: string) {
	switch (type) {
		case "order_screenshot":
			return ImageIcon
		case "delivery_photo":
			return Camera
		case "product_review":
			return Star
		case "social_media_post":
			return ShareNetwork
		case "unboxing_video":
			return VideoCamera
		default:
			return ClipboardText
	}
}

// Overview Tab Component
interface OverviewTabProps {
	campaign: CampaignWithStats
	stats: CampaignStats | null | undefined
	pricing: CampaignPricing | undefined
	deliverables: organizations.CampaignDeliverableResponse[] | undefined
	platforms: platforms.Platform[]
	getDaysRemaining: () => number
	getProgressPercentage: () => number
	getEnrollmentPercentage: () => number
}

function OverviewTab({
	campaign,
	stats,
	pricing,
	deliverables,
	platforms,
	getDaysRemaining,
	getProgressPercentage,
	getEnrollmentPercentage,
}: OverviewTabProps) {
	const approvalRate =
		campaign.currentEnrollments > 0
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
			...Array(approved).fill({ status: "success" as const, tooltip: "Approved" }),
			...Array(pending).fill({ status: "warning" as const, tooltip: "Pending" }),
			...Array(rejected).fill({ status: "error" as const, tooltip: "Rejected" }),
			...Array(Math.max(0, other)).fill({ status: "neutral" as const, tooltip: "Other" }),
		]
	}, [campaign])

	// Enrollment breakdown data for BarList - use stats from CampaignWithStats
	const enrollmentBreakdown = [
		{ name: "Approved", value: campaign.approvedCount, color: "green" as const },
		{ name: "Pending Review", value: campaign.pendingCount, color: "orange" as const },
		{ name: "Rejected", value: campaign.rejectedCount, color: "red" as const },
		{ name: "Withdrawn", value: stats?.withdrawnEnrollments ?? 0, color: "gray" as const },
	]

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* Key Metrics - Using MetricGroup */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<h3 className="text-label-sm text-text-sub-600 mb-3 sm:mb-4">Key Metrics</h3>
				<MetricGroup columns={4} className="grid-cols-2 lg:grid-cols-4">
					<Metric
						label="Total Enrollments"
						value={campaign.currentEnrollments}
						description={`of ${campaign.maxEnrollments || "∞"} max`}
						size="sm"
					/>
					<Metric
						label="Approval Rate"
						value={`${approvalRate}%`}
						delta={approvalRate > 80 ? "+5%" : "-2%"}
						deltaType={approvalRate > 80 ? "increase" : "decrease"}
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
						value={formatCurrency(
							campaign.currentEnrollments > 0
								? Math.round(campaign.totalPayout / campaign.currentEnrollments)
								: 0
						)}
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
					<div className="space-y-5 sm:space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-label-xs sm:text-label-sm text-text-sub-600">
									Time Progress
								</span>
								<span className="text-label-xs sm:text-label-sm text-text-strong-950">
									{getDaysRemaining()} days left
								</span>
							</div>
							<ProgressBar.Root value={getProgressPercentage()} />
							<p className="text-paragraph-xs text-text-soft-400 mt-1">
								{Math.round(getProgressPercentage())}% of campaign duration elapsed
							</p>
						</div>
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-label-xs sm:text-label-sm text-text-sub-600">
									Enrollment Capacity
								</span>
								<span className="text-label-xs sm:text-label-sm text-text-strong-950">
									{campaign.currentEnrollments} / {campaign.maxEnrollments || "∞"}
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
					<h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">
						Enrollment Distribution
					</h3>

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
					<BarList data={enrollmentBreakdown} valueFormatter={(v) => `${v}`} size="sm" />
				</div>
			</div>

			{/* Billing Details - Using List */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">
					Billing & Pricing Details
				</h3>
				<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
					<List.Root variant="divided" size="md">
						<List.Item>
							<List.ItemContent>
								<List.ItemTitle>Bill Rate</List.ItemTitle>
								<List.ItemDescription>Percentage of order value</List.ItemDescription>
							</List.ItemContent>
							<List.ItemAction>
								<span className="text-label-sm sm:text-label-md text-text-strong-950">
									{pricing?.billRate ?? campaign.billRate ?? 0}%
								</span>
							</List.ItemAction>
						</List.Item>
						<List.Item>
							<List.ItemContent>
								<List.ItemTitle>Platform Fee</List.ItemTitle>
								<List.ItemDescription>Per enrollment</List.ItemDescription>
							</List.ItemContent>
							<List.ItemAction>
								<span className="text-label-sm sm:text-label-md text-text-strong-950">
									{formatCurrency(pricing?.platformFee ?? campaign.platformFee ?? 0)}
								</span>
							</List.ItemAction>
						</List.Item>
						<List.Item>
							<List.ItemContent>
								<List.ItemTitle>GST Rate</List.ItemTitle>
								<List.ItemDescription>On bill amount</List.ItemDescription>
							</List.ItemContent>
							<List.ItemAction>
								<span className="text-label-sm sm:text-label-md text-text-strong-950">
									{pricing?.gstRate ?? 0}%
								</span>
							</List.ItemAction>
						</List.Item>
						<List.Item>
							<List.ItemContent>
								<List.ItemTitle>TDS Rate</List.ItemTitle>
								<List.ItemDescription>Tax deducted at source</List.ItemDescription>
							</List.ItemContent>
							<List.ItemAction>
								<span className="text-label-sm sm:text-label-md text-text-strong-950">
									{pricing?.tdsRate ?? 0}%
								</span>
							</List.ItemAction>
						</List.Item>
						{pricing?.bonusAmount !== undefined && pricing.bonusAmount > 0 && (
							<List.Item>
								<List.ItemContent>
									<List.ItemTitle>Bonus Amount</List.ItemTitle>
									<List.ItemDescription>Additional shopper incentive</List.ItemDescription>
								</List.ItemContent>
								<List.ItemAction>
									<span className="text-label-sm sm:text-label-md text-success-base">
										{formatCurrency(pricing.bonusAmount)}
									</span>
								</List.ItemAction>
							</List.Item>
						)}
					</List.Root>

					<div className="rounded-xl bg-bg-weak-50 p-3 sm:p-4">
						<h4 className="text-label-sm text-text-strong-950 mb-2 sm:mb-3">
							Example Cost (₹10,000 order)
						</h4>
						<List.Root size="sm">
							<List.Item>
								<List.ItemContent>
									<List.ItemDescription>
										Bill ({pricing?.billRate ?? campaign.billRate ?? 0}%)
									</List.ItemDescription>
								</List.ItemContent>
								<List.ItemAction>
									<span className="text-paragraph-sm">
										{formatCurrency(10000 * ((pricing?.billRate ?? campaign.billRate ?? 0) / 100))}
									</span>
								</List.ItemAction>
							</List.Item>
							<List.Item>
								<List.ItemContent>
									<List.ItemDescription>GST ({pricing?.gstRate ?? 18}%)</List.ItemDescription>
								</List.ItemContent>
								<List.ItemAction>
									<span className="text-paragraph-sm">
										{formatCurrency(
											10000 *
												((pricing?.billRate ?? campaign.billRate ?? 0) / 100) *
												((pricing?.gstRate ?? 18) / 100)
										)}
									</span>
								</List.ItemAction>
							</List.Item>
							<List.Item>
								<List.ItemContent>
									<List.ItemDescription>Platform Fee</List.ItemDescription>
								</List.ItemContent>
								<List.ItemAction>
									<span className="text-paragraph-sm">
										{formatCurrency(pricing?.platformFee ?? campaign.platformFee ?? 50)}
									</span>
								</List.ItemAction>
							</List.Item>
						</List.Root>
						<div className="flex items-center justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-stroke-soft-200">
							<span className="text-label-sm text-text-strong-950">Estimated Cost/Enrollment</span>
							<span className="text-label-md text-primary-base font-semibold">
								{formatCurrency(
									pricing?.estimatedCostPerEnrollment ??
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
						Shopper payouts are determined and managed by Hypedrive platform. Rebate percentage:{" "}
						{pricing?.rebatePercentage ?? 0}%
					</span>
				</div>
			</div>

			{/* Required Deliverables - Grouped by Platform */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4 flex items-center gap-2">
					<ListChecks weight="duotone" className="size-5 text-primary-base" />
					Required Deliverables
				</h3>
				{deliverables && deliverables.length > 0 ? (
					(() => {
						// Create platform map for quick lookup
						const platformMap = new Map(platforms.map((p) => [p.id, p.name]))

						// Group deliverables by platform
						const groupedByPlatform = deliverables.reduce(
							(acc, deliverable) => {
								const platformId = deliverable.deliverable?.platformId || "general"
								const platformName =
									platformId === "general"
										? "General"
										: platformMap.get(platformId) || "Unknown Platform"

								if (!acc[platformName]) {
									acc[platformName] = []
								}
								acc[platformName].push(deliverable)
								return acc
							},
							{} as Record<string, typeof deliverables>
						)

						// Sort platforms: General last, others alphabetically
						const sortedPlatforms = Object.keys(groupedByPlatform).sort((a, b) => {
							if (a === "General") return 1
							if (b === "General") return -1
							return a.localeCompare(b)
						})

						return (
							<div className="space-y-4">
								{sortedPlatforms.map((platformName) => {
									const platformDeliverables = groupedByPlatform[platformName]
									return (
										<div key={platformName} className="space-y-3">
											<h4 className="text-label-sm text-text-sub-600 font-medium flex items-center gap-2">
												<span className="size-1.5 rounded-full bg-primary-base" />
												{platformName}
											</h4>
											<div className="space-y-2 pl-4 border-l-2 border-stroke-soft-200">
												{platformDeliverables.map((campaignDeliverable: organizations.CampaignDeliverableResponse, index: number) => {
													const DeliverableIcon = getDeliverableIcon(
														campaignDeliverable.deliverable?.category as string
													)
													return (
														<div
															key={campaignDeliverable.id}
															className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200"
														>
															<div className="size-10 sm:size-12 rounded-xl bg-primary-alpha-10 flex items-center justify-center shrink-0">
																<DeliverableIcon
																	weight="duotone"
																	className="size-5 sm:size-6 text-primary-base"
																/>
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-label-sm sm:text-label-md text-text-strong-950">
																		{index + 1}.{" "}
																		{campaignDeliverable.deliverable?.name ?? "Deliverable"}
																	</span>
																	{campaignDeliverable.isRequired ? (
																		<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-lighter text-error-base text-label-xs font-medium">
																			Required
																		</span>
																	) : (
																		<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-soft-200 text-text-sub-600 text-label-xs font-medium">
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
																<CheckCircle
																	weight="duotone"
																	className="size-5 text-text-soft-400"
																/>
															</div>
														</div>
													)
												})}
											</div>
										</div>
									)
								})}
							</div>
						)
					})()
				) : (
					<div className="text-center py-8 text-text-sub-600">
						<ListChecks weight="duotone" className="size-12 mx-auto mb-2 text-text-soft-400" />
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
	enrollments: organizations.EnrollmentWithRelations[]
	organizationId: string
}

// Helper functions imported from @/lib/utils/date

function EnrollmentsTab({ campaignId, enrollments, organizationId }: EnrollmentsTabProps) {
	const router = useRouter()
	const [isPending, startTransition] = React.useTransition()
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

	const handleExport = () => {
		startTransition(async () => {
			try {
				const result = await exportCampaignEnrollments({ organizationId, campaignId })
				// Server action returns {data: ExportResponse} where ExportResponse.data is EnrollmentExportRow[]
				if (!result?.data?.data) {
					throw new Error("No export data received")
				}
				const { exportToCSV } = await import("@/lib/utils/excel")
				const exportData = result.data.data as unknown as Record<string, unknown>[]
				exportToCSV(
					exportData,
					`campaign-${campaignId}-enrollments-${new Date().toISOString().split("T")[0]}`,
					[
						{ key: "enrollmentId", header: "Enrollment ID" },
						{ key: "orderId", header: "Order ID" },
						{ key: "orderValue", header: "Order Value (₹)" },
						{ key: "purchaseDate", header: "Purchase Date" },
						{ key: "shopperName", header: "Shopper Name" },
						{ key: "shopperEmail", header: "Shopper Email" },
						{ key: "status", header: "Status" },
						{ key: "rebatePercentage", header: "Rebate %" },
						{ key: "bonusAmount", header: "Bonus Amount (₹)" },
						{ key: "shopperPayout", header: "Shopper Payout (₹)" },
						{ key: "submittedAt", header: "Submitted At" },
						{ key: "approvedAt", header: "Approved At" },
						{ key: "createdAt", header: "Created At" },
					]
				)
				toast.success("Enrollments exported to CSV")
			} catch (error) {
				toast.error(getErrorMessage(error, "An error occurred while exporting"))
			}
		})
	}

	// Table columns definition (same as enrollments page)
	const columns: ColumnDef<organizations.EnrollmentWithRelations>[] = React.useMemo(
		() => [
			{
				accessorKey: "orderId",
				header: ({ column }) => {
					return (
						<button
							type="button"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="flex items-center gap-1.5 hover:text-text-strong-950 transition-colors"
						>
							Order ID
							{column.getIsSorted() === "asc" ? (
								<CaretUp className="size-3.5" />
							) : column.getIsSorted() === "desc" ? (
								<CaretDown className="size-3.5" />
							) : (
								<ArrowsDownUp className="size-3.5 text-text-soft-400" />
							)}
						</button>
					)
				},
				cell: ({ row }) => {
					const enrollment = row.original
					const shopperId = enrollment.shopperId || ""
					const displayName = enrollment.orderId || shopperId.slice(0, 8)
					return (
						<div className="flex items-center gap-3">
							<Avatar.Root size="32" color={getAvatarColor(displayName)}>
								{getInitial(displayName)}
							</Avatar.Root>
							<div>
								<div className="text-label-sm text-text-strong-950 font-medium">
									{enrollment.orderId || `#${shopperId.slice(0, 8)}`}
								</div>
								<div className="text-paragraph-xs text-text-sub-600">
									{shopperId.slice(0, 8)}...
								</div>
							</div>
						</div>
					)
				},
				size: 200,
			},
			{
				accessorKey: "status",
				header: ({ column }) => {
					return (
						<button
							type="button"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="flex items-center gap-1.5 hover:text-text-strong-950 transition-colors"
						>
							Status
							{column.getIsSorted() === "asc" ? (
								<CaretUp className="size-3.5" />
							) : column.getIsSorted() === "desc" ? (
								<CaretDown className="size-3.5" />
							) : (
								<ArrowsDownUp className="size-3.5 text-text-soft-400" />
							)}
						</button>
					)
				},
				cell: ({ row }) => {
					const enrollment = row.original
					const enrollmentOverdue =
						enrollment.status === "awaiting_review" && isOverdue(enrollment.createdAt)
					return (
						<div className="flex items-center gap-2">
							<StatusBadge.Root
								status={getEnrollmentStatusBadgeStatus(enrollment.status)}
								variant="light"
							>
								{getEnrollmentStatusLabel(enrollment.status)}
							</StatusBadge.Root>
							{enrollmentOverdue && (
								<Badge.Root color="red" variant="lighter" size="small">
									<Badge.Icon as={Warning} weight="duotone" />
									Overdue
								</Badge.Root>
							)}
						</div>
					)
				},
				size: 150,
			},
			{
				accessorKey: "orderValue",
				header: ({ column }) => {
					return (
						<button
							type="button"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="flex items-center gap-1.5 hover:text-text-strong-950 transition-colors"
						>
							Order Value
							{column.getIsSorted() === "asc" ? (
								<CaretUp className="size-3.5" />
							) : column.getIsSorted() === "desc" ? (
								<CaretDown className="size-3.5" />
							) : (
								<ArrowsDownUp className="size-3.5 text-text-soft-400" />
							)}
						</button>
					)
				},
				cell: ({ row }) => {
					return (
						<div className="text-label-sm text-text-strong-950 font-semibold">
							{formatCurrency(row.original.orderValue)}
						</div>
					)
				},
				size: 120,
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => {
					return (
						<button
							type="button"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="flex items-center gap-1.5 hover:text-text-strong-950 transition-colors"
						>
							Date
							{column.getIsSorted() === "asc" ? (
								<CaretUp className="size-3.5" />
							) : column.getIsSorted() === "desc" ? (
								<CaretDown className="size-3.5" />
							) : (
								<ArrowsDownUp className="size-3.5 text-text-soft-400" />
							)}
						</button>
					)
				},
				cell: ({ row }) => {
					return (
						<div>
							<div className="text-paragraph-sm text-text-strong-950">
								{formatDateMedium(row.original.createdAt)}
							</div>
							<div className="text-paragraph-xs text-text-sub-600">
								{getTimeAgo(row.original.createdAt)}
							</div>
						</div>
					)
				},
				size: 140,
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					return (
						<Button.Root
							variant="ghost"
							size="xsmall"
							onClick={(e) => {
								e.stopPropagation()
								router.push(`/dashboard/${organizationId}/enrollments/${row.original.id}`)
							}}
						>
							View
							<Button.Icon>
								<ArrowRight className="size-5" />
							</Button.Icon>
						</Button.Root>
					)
				},
				enableSorting: false,
				size: 100,
			},
		],
		[router, organizationId]
	)

	// Initialize table
	const table = useReactTable({
		data: enrollments,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	})

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-label-md text-text-strong-950">
					Campaign Enrollments ({enrollments.length})
				</h3>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						size="small"
						onClick={() => handleExport()}
						disabled={isPending}
					>
						<Button.Icon>
							<DownloadSimple className="size-5" />
						</Button.Icon>
						{isPending ? "Exporting..." : "Export"}
					</Button.Root>
					<Button.Root variant="neutral" size="small" asChild>
						<Link href={`/dashboard/${organizationId}/enrollments?campaign=${campaignId}`}>View All</Link>
					</Button.Root>
				</div>
			</div>

			{/* TanStack Table */}
			<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
				<div className="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							{table.getHeaderGroups().map((headerGroup) => (
								<Table.Row key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header) => (
										<Table.Head
											key={header.id}
											style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
											className={cn(header.id === "actions" && "w-24", "first:pl-6 last:pr-6")}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</Table.Head>
									))}
								</Table.Row>
							))}
						</Table.Header>
						<Table.Body>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<Table.Row
										key={row.id}
										className={cn(
											"cursor-pointer transition-colors group",
											row.original.status === "awaiting_review" &&
												isOverdue(row.original.createdAt) &&
												"bg-error-lighter/20",
											"hover:bg-bg-weak-50"
										)}
										onClick={() => router.push(`/dashboard/${organizationId}/enrollments/${row.original.id}`)}
									>
										{row.getVisibleCells().map((cell) => (
											<Table.Cell
												key={cell.id}
												className={cn("first:pl-6 last:pr-6")}
												onClick={(e) => {
													// Prevent navigation when clicking action button
													if (cell.column.id === "actions") {
														e.stopPropagation()
													}
												}}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Table.Cell>
										))}
									</Table.Row>
								))
							) : (
								<Table.Empty
									colSpan={columns.length}
									icon={<CheckCircle className="size-8 text-text-soft-400" />}
									title="No enrollments found"
									description="This campaign has no enrollments yet."
								/>
							)}
						</Table.Body>
					</Table.Root>
				</div>

				{/* Pagination */}
				{table.getPageCount() > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-t border-stroke-soft-200 bg-bg-weak-50">
						<div className="text-paragraph-sm text-text-sub-600">
							Showing{" "}
							<span className="font-medium text-text-strong-950">
								{table.getRowModel().rows.length}
							</span>{" "}
							of <span className="font-medium text-text-strong-950">{enrollments.length}</span>{" "}
							enrollments
						</div>
						<div className="flex items-center gap-2">
							<Button.Root
								variant="ghost"
								size="xsmall"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<Button.Icon>
									<CaretLeft className="size-5" />
								</Button.Icon>
								Previous
							</Button.Root>
							<div className="text-paragraph-sm text-text-sub-600 px-3">
								Page{" "}
								<span className="font-medium text-text-strong-950">
									{table.getState().pagination.pageIndex + 1}
								</span>{" "}
								of <span className="font-medium text-text-strong-950">{table.getPageCount()}</span>
							</div>
							<Button.Root
								variant="ghost"
								size="xsmall"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								Next
								<Button.Icon>
									<CaretRight className="size-5" />
								</Button.Icon>
							</Button.Root>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

// Statistics Tab Component
interface StatisticsTabProps {
	campaign: CampaignWithStats
	stats: CampaignStats | null | undefined
	performanceData: organizations.CampaignPerformance[] | undefined
}

function StatisticsTab({ stats, performanceData }: StatisticsTabProps) {
	// Transform performance data for chart
	const chartData = React.useMemo(() => {
		if (!performanceData) return []
		return performanceData.map((item) => ({
			name: item.date,
			enrollments: item.enrollments,
			approvals: item.approvals,
		}))
	}, [performanceData])

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* Enrollment Trend */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<h3 className="text-label-md text-text-strong-950 mb-3 sm:mb-4">Enrollment Trend</h3>
				<div className="overflow-x-auto -mx-4 sm:mx-0">
					<div className="min-w-[400px] px-4 sm:px-0">
						{chartData.length > 0 ? (
							<AlignLineChart
								data={chartData}
								dataKeys={[
									{ key: "enrollments", label: "Enrollments", color: "blue" },
									{ key: "approvals", label: "Approvals", color: "green" },
								]}
								xAxisKey="name"
								height={288}
								className="h-72"
							/>
						) : (
							<div className="h-72 flex items-center justify-center text-text-soft-400">
								No performance data available
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

// DeliverablesTab is now imported from ./deliverables-tab.tsx
