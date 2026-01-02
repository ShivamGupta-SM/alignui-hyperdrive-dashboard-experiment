"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"
import { useModalState } from "@/hooks/ui"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Link from "next/link"
import * as Button from "@/components/ui/primitives/button"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as Modal from "@/components/ui/layout/modal"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Breadcrumb from "@/components/ui/navigation/breadcrumb"
import { cn, getAvatarColor, getErrorMessage, formatCurrency, formatDateMedium, getInitial } from "@/lib/utils"
import {
	Check,
	X,
	PencilSimple,
	CalendarBlank,
	Warning,
	ClockCounterClockwise,
	ShieldCheck,
	ListChecks,
	Info,
	Link as LinkIcon,
	Image as ImageIcon,
	CheckCircle,
	VideoCamera,
	Star,
	ShareNetwork,
	ClipboardText,
	CaretRight,
} from "@phosphor-icons/react"
import { ENROLLMENT_STATUS_CONFIG, REJECTION_REASONS, getEnrollmentStatusBadgeStatus } from "@/lib/constants"
import type { Enrollment, EnrollmentStatus } from "@/features/enrollments"
import { updateEnrollmentStatus, enrollmentKeys, requestChanges } from "@/features/enrollments"
import { campaignKeys } from "@/features/campaigns"
import { EnrollmentTimeline } from "@/components/dashboard/enrollment-timeline"
import type { enrollments, organizations, platforms } from "@/brand-client"

// Helper to calculate costs from Encore enrollment
function calculateCosts(enrollment: Enrollment | enrollments.EnrollmentDetail) {
	const billAmount = enrollment.orderValue * (enrollment.lockedBillRate / 100)
	const gstAmount = billAmount * 0.18 // 18% GST
	const platformFee = enrollment.orderValue * (enrollment.lockedPlatformFee / 100)
	const totalCost = billAmount + gstAmount + platformFee
	return { billAmount, gstAmount, platformFee, totalCost }
}

interface EnrollmentDetailClientProps {
	enrollmentId: string
	initialData?:
		| (enrollments.EnrollmentDetail & {
				platforms?: platforms.Platform[]
				campaignDeliverables?: organizations.CampaignDeliverableResponse[]
		  })
		| unknown
}

export function EnrollmentDetailClient({ enrollmentId, initialData }: EnrollmentDetailClientProps) {
	const router = useRouter()
	const { organizationId } = useCurrentOrganization()
	const queryClient = useQueryClient()

	// Modal states - using useModalState hook for consistent pattern
	const [isApproveModalOpen, openApproveModal, closeApproveModal, toggleApproveModal, setIsApproveModalOpen] = useModalState()
	const [isRejectModalOpen, openRejectModal, closeRejectModal, toggleRejectModal, setIsRejectModalOpen] = useModalState()
	const [isChangesModalOpen, openChangesModal, closeChangesModal, toggleChangesModal, setIsChangesModalOpen] = useModalState()
	const [rejectionReason, setRejectionReason] = React.useState("")
	const [changesComment, setChangesComment] = React.useState("")
	const [isProcessing, setIsProcessing] = React.useState(false)

	// Safe type handling - enrollments.EnrollmentDetail is the source of truth
	const isEnrollmentDetail = (data: unknown): data is enrollments.EnrollmentDetail & {
		platforms?: platforms.Platform[]
		campaignDeliverables?: organizations.CampaignDeliverableResponse[]
	} => {
		return !!data && typeof data === "object" && "status" in data && "id" in data
	}

	const enrollmentDetail = isEnrollmentDetail(initialData) ? initialData : undefined
	const enrollment = enrollmentDetail // EnrollmentDetail already has all fields
	const isLoadingEnrollment = !enrollmentDetail

	// Action handlers
	const statusConfig = enrollmentDetail ? ENROLLMENT_STATUS_CONFIG[enrollmentDetail.status as EnrollmentStatus] : null

	const handleApprove = async () => {
		setIsProcessing(true)
		try {
			const campaignId = enrollmentDetail?.campaignId ?? ""
			await updateEnrollmentStatus({ organizationId, campaignId, id: enrollmentId, status: "approved" })
			toast.success("Enrollment approved successfully")
			closeApproveModal()
			// SSOT: Only invalidate affected queries - enrollment list, detail, and specific campaign stats
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists(organizationId) })
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(organizationId, campaignId, enrollmentId) })
			// Only invalidate specific campaign stats, not ALL campaigns list
			if (campaignId) {
				queryClient.invalidateQueries({ queryKey: campaignKeys.stats(organizationId, campaignId) })
			}
			// Give user time to see success message before redirect
			setTimeout(() => {
				router.push(`/dashboard/${organizationId}/enrollments`)
			}, 1500)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to approve enrollment"))
		} finally {
			setIsProcessing(false)
		}
	}

	const handleReject = async () => {
		if (!rejectionReason) return

		setIsProcessing(true)
		try {
			const campaignId = enrollmentDetail?.campaignId ?? ""
			await updateEnrollmentStatus({ organizationId, campaignId, id: enrollmentId, status: "rejected", reason: rejectionReason })
			toast.success("Enrollment rejected")
			closeRejectModal()
			setRejectionReason("")
			// SSOT: Only invalidate affected queries - enrollment list, detail, and specific campaign stats
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists(organizationId) })
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(organizationId, campaignId, enrollmentId) })
			// Only invalidate specific campaign stats, not ALL campaigns list
			if (campaignId) {
				queryClient.invalidateQueries({ queryKey: campaignKeys.stats(organizationId, campaignId) })
			}
			// Give user time to see success message before redirect
			setTimeout(() => {
				router.push(`/dashboard/${organizationId}/enrollments`)
			}, 1500)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to reject enrollment"))
		} finally {
			setIsProcessing(false)
		}
	}

	const handleRequestChanges = async () => {
		if (!changesComment.trim()) return

		setIsProcessing(true)
		try {
			const campaignId = enrollmentDetail?.campaignId ?? ""
			await requestChanges({ organizationId, campaignId, id: enrollmentId, feedback: changesComment.trim() })
			toast.success("Changes requested from shopper")
			closeChangesModal()
			setChangesComment("")
			// SSOT: Only invalidate enrollment queries - no campaign stats change on request changes
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists(organizationId) })
			queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(organizationId, campaignId, enrollmentId) })
			// Give user time to see success message before redirect
			setTimeout(() => {
				router.push(`/dashboard/${organizationId}/enrollments`)
			}, 1500)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to request changes"))
		} finally {
			setIsProcessing(false)
		}
	}

	// Loading state
	if (isLoadingEnrollment) {
		return (
			<div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5 animate-pulse">
					<div className="h-6 bg-bg-soft-200 rounded w-24 mb-4" />
					<div className="flex items-center gap-3">
						<div className="size-12 rounded-full bg-bg-soft-200" />
						<div className="flex-1 space-y-2">
							<div className="h-5 bg-bg-soft-200 rounded w-32" />
							<div className="h-4 bg-bg-soft-200 rounded w-48" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	// No enrollment data
	if (!enrollment || !statusConfig) {
		return (
			<div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
				<Breadcrumb.Root className="mb-4">
					<Breadcrumb.Item asChild>
						<Link href={`/dashboard/${organizationId}`}>Dashboard</Link>
					</Breadcrumb.Item>
					<Breadcrumb.ArrowIcon as={CaretRight} />
					<Breadcrumb.Item asChild>
						<Link href={`/dashboard/${organizationId}/enrollments`}>Enrollments</Link>
					</Breadcrumb.Item>
				</Breadcrumb.Root>
				<div className="rounded-2xl bg-warning-lighter border border-warning-base/20 p-4 sm:p-5 text-center">
					<Warning className="size-8 text-warning-base mx-auto mb-2" />
					<p className="text-label-md text-warning-base mb-1">Enrollment not found</p>
					<p className="text-paragraph-sm text-text-sub-600">
						The requested enrollment could not be found.
					</p>
					<Button.Root variant="neutral" size="small" asChild className="mt-4">
						<Link href={`/dashboard/${organizationId}/enrollments`}>Back to Enrollments</Link>
					</Button.Root>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-0">
			{/* Header Card */}
			<div
				className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5"
			>
				{/* Top row: Breadcrumb + Status */}
				<div className="flex items-center justify-between gap-4 mb-4">
					<Breadcrumb.Root>
						<Breadcrumb.Item asChild>
							<Link href={`/dashboard/${organizationId}`}>Dashboard</Link>
						</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon as={CaretRight} />
						<Breadcrumb.Item asChild>
							<Link href={`/dashboard/${organizationId}/enrollments`}>Enrollments</Link>
						</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon as={CaretRight} />
						<Breadcrumb.Item active>#{enrollment.orderId}</Breadcrumb.Item>
					</Breadcrumb.Root>

					<StatusBadge.Root status={getEnrollmentStatusBadgeStatus(enrollment.status)} variant="light">
						<StatusBadge.Dot />
						{statusConfig.label}
					</StatusBadge.Root>
				</div>

				{/* Enrollment Info */}
				<div className="flex items-center gap-3 sm:gap-4">
					<Avatar.Root size="48" color={getAvatarColor(enrollment.shopperId || "U")}>
						{getInitial(enrollment.shopperId)}
					</Avatar.Root>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-0.5">
							<span className="text-label-md sm:text-title-h5 text-text-strong-950 truncate">
								Shopper #{(enrollment.shopperId || "").slice(0, 8)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 truncate">
								Order #{enrollment.orderId}
							</p>
						</div>
					</div>
					<div className="text-right hidden sm:block">
						<span className="text-title-h5 text-text-strong-950 font-semibold block">
							{formatCurrency(enrollment.orderValue)}
						</span>
						<span className="text-paragraph-xs text-text-sub-600">Order Value</span>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			{(() => {
				const costs = calculateCosts(enrollment)
				return (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<StatCard label="Order Value" value={formatCurrency(enrollment.orderValue)} />
						<StatCard label="Your Cost" value={formatCurrency(costs.totalCost)} highlight />
						<StatCard label="Rebate" value={`${enrollment.lockedRebatePercentage}%`} />
						<StatCard
							label="Rejections"
							value={`${enrollment.rejectionCount}`}
							valueColor={enrollment.rejectionCount > 0 ? "text-amber-600" : "text-green-600"}
						/>
					</div>
				)
			})()}

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Order Details */}
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
					<h2 className="text-label-sm font-semibold text-text-strong-950 mb-3 flex items-center gap-2">
						<CalendarBlank weight="duotone" className="size-4 text-text-soft-400" />
						Order Details
					</h2>
					<div className="space-y-2">
						<DetailRow label="Order ID" value={enrollment.orderId} mono />
						<DetailRow
							label="Purchase Date"
							value={enrollment.purchaseDate ? formatDateMedium(new Date(enrollment.purchaseDate)) : "-"}
						/>
						<DetailRow label="Enrolled" value={formatDateMedium(new Date(enrollment.createdAt))} />
						<DetailRow
							label="Expires"
							value={enrollment.expiresAt ? formatDateMedium(new Date(enrollment.expiresAt)) : "-"}
						/>
						<DetailRow label="Can Resubmit" value={enrollment.canResubmit ? "Yes" : "No"} />
					</div>
				</div>

				{/* Rate Details */}
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
					<h2 className="text-label-sm font-semibold text-text-strong-950 mb-3 flex items-center gap-2">
						<ShieldCheck weight="duotone" className="size-4 text-text-soft-400" />
						Rate Details
					</h2>
					<div className="space-y-2">
						<DetailRow label="Rebate Percentage" value={`${enrollment.lockedRebatePercentage}%`} />
						<DetailRow label="Bill Rate" value={`${enrollment.lockedBillRate}%`} />
						<DetailRow label="Platform Fee" value={`${enrollment.lockedPlatformFee}%`} />
						{enrollment.lockedBonusAmount && (
							<DetailRow
								label="Bonus Amount"
								value={formatCurrency(enrollment.lockedBonusAmount)}
							/>
						)}
						<DetailRow label="Status" value={enrollment.status} />
					</div>
				</div>
			</div>

			{/* Billing Breakdown */}
			{(() => {
				const costs = calculateCosts(enrollment)
				return (
					<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
						<h2 className="text-label-sm font-semibold text-text-strong-950 mb-3">Billing Breakdown</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<DetailRow
									label={`Bill Rate (${enrollment.lockedBillRate}%)`}
									value={formatCurrency(costs.billAmount)}
								/>
								<DetailRow label="GST (18%)" value={formatCurrency(costs.gstAmount)} />
								<DetailRow
									label={`Platform Fee (${enrollment.lockedPlatformFee}%)`}
									value={formatCurrency(costs.platformFee)}
								/>
							</div>
							<div className="rounded-xl bg-primary-lighter ring-1 ring-inset ring-primary-base/20 p-4 flex flex-col items-center justify-center">
								<span className="text-paragraph-sm text-primary-darker mb-1">Total Cost to You</span>
								<span className="text-title-h4 text-primary-base font-bold">
									{formatCurrency(costs.totalCost)}
								</span>
							</div>
						</div>
					</div>
				)
			})()}

			{/* Required Deliverables - Categorized by Platform */}
			{enrollmentDetail?.submissions && enrollmentDetail.submissions.length > 0 && (
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
					<h2 className="text-label-sm font-semibold text-text-strong-950 mb-3 sm:mb-4 flex items-center gap-2">
						<ListChecks weight="duotone" className="size-5 text-primary-base" />
						Required Deliverables
					</h2>
					{(() => {
						const extendedData = enrollmentDetail as enrollments.EnrollmentDetail & {
							platforms?: platforms.Platform[]
							campaignDeliverables?: organizations.CampaignDeliverableResponse[]
						}
						const platformsList = extendedData.platforms || []
						const campaignDeliverables = extendedData.campaignDeliverables || []

						// Create platform map for quick lookup
						const platformMap = new Map(platformsList.map((p: platforms.Platform) => [p.id, p.name]))

						// Create deliverable map to get platformId from campaignDeliverableId
						const deliverablePlatformMap = new Map(
							campaignDeliverables.map((cd: organizations.CampaignDeliverableResponse) => [
								cd.id,
								cd.deliverable?.platformId || "general",
							])
						)

						// Group submissions by platform
						const groupedByPlatform = enrollmentDetail.submissions.reduce(
							(acc: Record<string, typeof enrollmentDetail.submissions>, submission: typeof enrollmentDetail.submissions[0]) => {
								const platformId =
									deliverablePlatformMap.get(submission.campaignDeliverableId) || "general"
								const platformName =
									platformId === "general"
										? "General"
										: (platformMap.get(platformId) as string | undefined) || "Unknown Platform"

								if (!acc[platformName]) {
									acc[platformName] = []
								}
								acc[platformName]!.push(submission)
								return acc
							},
							{} as Record<string, typeof enrollmentDetail.submissions>
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
									const platformSubmissions = groupedByPlatform[platformName]
									return (
										<div key={platformName} className="space-y-3">
											<h4 className="text-label-sm text-text-sub-600 font-medium flex items-center gap-2">
												<span className="size-1.5 rounded-full bg-primary-base" />
												{platformName}
											</h4>
											<div className="space-y-2 pl-4 border-l-2 border-stroke-soft-200">
												{platformSubmissions.map((submission: typeof enrollmentDetail.submissions[0], index: number) => {
													const DeliverableIcon = getDeliverableIcon(submission.deliverableName)
													const isSubmitted = !!submission.submittedAt
													const hasLink = !!submission.proofLink
													const hasScreenshot = !!submission.proofScreenshot

													return (
														<div
															key={submission.id}
															className={cn(
																"flex items-start gap-3 p-3 sm:p-4 rounded-xl border",
																isSubmitted
																	? "bg-success-lighter/30 border-success-base/20"
																	: "bg-bg-weak-50 border-stroke-soft-200"
															)}
														>
															<div
																className={cn(
																	"size-10 sm:size-12 rounded-xl flex items-center justify-center shrink-0",
																	isSubmitted ? "bg-success-lighter" : "bg-primary-alpha-10"
																)}
															>
																<DeliverableIcon
																	weight="duotone"
																	className={cn(
																		"size-5 sm:size-6",
																		isSubmitted ? "text-success-base" : "text-primary-base"
																	)}
																/>
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-label-sm sm:text-label-md text-text-strong-950">
																		{index + 1}. {submission.deliverableName}
																	</span>
																	{submission.isRequired ? (
																		<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-lighter text-error-base text-label-xs font-medium">
																			Required
																		</span>
																	) : (
																		<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-soft-200 text-text-sub-600 text-label-xs font-medium">
																			Optional
																		</span>
																	)}
																	{isSubmitted && (
																		<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-lighter text-success-base text-label-xs font-medium">
																			<Check weight="bold" className="size-3" />
																			Submitted
																		</span>
																	)}
																</div>
																{submission.deliverableDescription && (
																	<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mb-1">
																		{submission.deliverableDescription}
																	</p>
																)}
																{submission.instructions && (
																	<p className="text-paragraph-xs text-text-soft-400 flex items-start gap-1 mb-2">
																		<Info weight="fill" className="size-3.5 shrink-0 mt-0.5" />
																		{submission.instructions}
																	</p>
																)}
																{isSubmitted && (
																	<div className="flex flex-wrap gap-2 mt-2">
																		{hasLink && submission.proofLink && (
																			<a
																				href={submission.proofLink}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-alpha-10 text-primary-base text-paragraph-xs hover:bg-primary-alpha-20 transition-colors"
																			>
																				<LinkIcon weight="duotone" className="size-3.5" />
																				View Link
																			</a>
																		)}
																		{hasScreenshot && submission.proofScreenshot && (
																			<button
																				type="button"
																				onClick={() => {
																					// Open screenshot in modal or new tab
																					window.open(submission.proofScreenshot, "_blank")
																				}}
																				className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-alpha-10 text-primary-base text-paragraph-xs hover:bg-primary-alpha-20 transition-colors"
																			>
																				<ImageIcon weight="duotone" className="size-3.5" />
																				View Screenshot
																			</button>
																		)}
																		{submission.submittedAt && (
																			<span className="text-paragraph-xs text-text-soft-400">
																				Submitted: {formatDateMedium(new Date(submission.submittedAt))}
																			</span>
																		)}
																	</div>
																)}
															</div>
															<div className="shrink-0">
																{isSubmitted ? (
																	<CheckCircle
																		weight="duotone"
																		className="size-5 text-success-base"
																	/>
																) : (
																	<ClockCounterClockwise
																		weight="duotone"
																		className="size-5 text-text-soft-400"
																	/>
																)}
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
					})()}
				</div>
			)}

			{/* Status Timeline - Using EnrollmentTimeline component with history from API */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<EnrollmentTimeline enrollmentId={enrollmentId} history={enrollmentDetail?.history} />
			</div>

			{/* Action Buttons */}
			{enrollment.status === "awaiting_review" && (
				<>
					{/* Desktop: Card with centered buttons */}
					<div className="hidden sm:block rounded-2xl bg-primary-lighter ring-1 ring-inset ring-primary-base/20 p-5">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-label-md text-text-strong-950 mb-1">Ready to Review</h3>
								<p className="text-paragraph-sm text-text-sub-600">
									Approve to pay{" "}
									<strong className="text-primary-base">
										{formatCurrency(calculateCosts(enrollment).totalCost)}
									</strong>{" "}
									to the shopper
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button.Root
									variant="neutral"
									size="small"
									onClick={() => setIsChangesModalOpen(true)}
								>
									<Button.Icon>
										<PencilSimple className="size-5" />
									</Button.Icon>
									Request Changes
								</Button.Root>
								<Button.Root
									variant="error"
									size="small"
									onClick={() => setIsRejectModalOpen(true)}
								>
									<Button.Icon>
										<X className="size-5" />
									</Button.Icon>
									Reject
								</Button.Root>
								<Button.Root variant="primary" onClick={() => setIsApproveModalOpen(true)}>
									<Button.Icon>
										<Check className="size-5" />
									</Button.Icon>
									Approve & Pay
								</Button.Root>
							</div>
						</div>
					</div>

					{/* Mobile: Fixed bottom bar */}
					<div
						className="sm:hidden fixed bottom-0 inset-x-0 p-3 bg-bg-white-0 border-t border-stroke-soft-200 z-20"
						style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
					>
						<div className="flex items-center gap-2">
							<Button.Root
								variant="neutral"
								size="small"
								className="flex-1"
								onClick={() => setIsChangesModalOpen(true)}
							>
								<Button.Icon>
									<PencilSimple className="size-5" />
								</Button.Icon>
								Changes
							</Button.Root>
							<Button.Root
								variant="error"
								size="small"
								className="flex-1"
								onClick={() => setIsRejectModalOpen(true)}
							>
								<Button.Icon>
									<X className="size-5" />
								</Button.Icon>
								Reject
							</Button.Root>
							<Button.Root
								variant="primary"
								className="flex-[1.5]"
								onClick={() => setIsApproveModalOpen(true)}
							>
								<Button.Icon>
									<Check className="size-5" />
								</Button.Icon>
								Approve
							</Button.Root>
						</div>
					</div>

					{/* Bottom padding for fixed buttons on mobile */}
					<div className="h-24 sm:hidden" />
				</>
			)}

			{/* Approve Modal */}
			<Modal.Root open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
				<Modal.Content>
					<Modal.Header>
						<Modal.Title>Approve Enrollment</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{(() => {
							const costs = calculateCosts(enrollment)
							return (
								<div className="text-center mb-4">
									<div className="size-14 rounded-full bg-success-lighter flex items-center justify-center mx-auto mb-3">
										<Check className="size-7 text-success-base" />
									</div>
									<p className="text-paragraph-sm text-text-sub-600 mb-4">
										Approve this enrollment and pay{" "}
										<strong className="text-text-strong-950">
											{formatCurrency(costs.totalCost)}
										</strong>{" "}
										to the shopper?
									</p>
									<div className="text-left rounded-xl bg-bg-weak-50 p-3 space-y-1 text-paragraph-xs">
										<div className="flex justify-between">
											<span className="text-text-sub-600">Bill Amount</span>
											<span className="text-text-strong-950">
												{formatCurrency(costs.billAmount)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-text-sub-600">GST</span>
											<span className="text-text-strong-950">
												{formatCurrency(costs.gstAmount)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-text-sub-600">Platform Fee</span>
											<span className="text-text-strong-950">
												{formatCurrency(costs.platformFee)}
											</span>
										</div>
										<div className="flex justify-between pt-2 border-t border-stroke-soft-200 font-semibold">
											<span className="text-text-strong-950">Total</span>
											<span className="text-primary-base">{formatCurrency(costs.totalCost)}</span>
										</div>
									</div>
								</div>
							)
						})()}
					</Modal.Body>
					<Modal.Footer>
						<Button.Root variant="ghost" onClick={() => setIsApproveModalOpen(false)}>
							Cancel
						</Button.Root>
						<Button.Root variant="primary" onClick={handleApprove} disabled={isProcessing}>
							{isProcessing ? "Processing..." : "Approve & Pay"}
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			{/* Reject Modal */}
			<Modal.Root open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
				<Modal.Content>
					<Modal.Header>
						<Modal.Title>Reject Enrollment</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex items-start gap-2 p-3 rounded-xl bg-warning-lighter mb-4">
							<Warning className="size-4 text-warning-base shrink-0 mt-0.5" />
							<span className="text-paragraph-sm text-warning-dark">
								This action cannot be undone. The shopper will be notified.
							</span>
						</div>
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Reason for rejection
							</label>
							<select
								className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
							>
								<option value="">Select a reason...</option>
								{REJECTION_REASONS.map((reason) => (
									<option key={reason.id} value={reason.id}>
										{reason.label}
									</option>
								))}
							</select>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button.Root variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
							Cancel
						</Button.Root>
						<Button.Root
							variant="error"
							onClick={handleReject}
							disabled={isProcessing || !rejectionReason}
						>
							{isProcessing ? "Rejecting..." : "Confirm Rejection"}
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			{/* Request Changes Modal */}
			<Modal.Root open={isChangesModalOpen} onOpenChange={setIsChangesModalOpen}>
				<Modal.Content>
					<Modal.Header>
						<Modal.Title>Request Changes</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="text-paragraph-sm text-text-sub-600 mb-4">
							Describe what changes the shopper needs to make. They will be notified and can
							resubmit.
						</p>
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Required changes
							</label>
							<Textarea.Root
								placeholder="e.g., Please provide a clearer screenshot showing the order total..."
								value={changesComment}
								onChange={(e) => setChangesComment(e.target.value)}
								rows={4}
							/>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button.Root variant="ghost" onClick={() => setIsChangesModalOpen(false)}>
							Cancel
						</Button.Root>
						<Button.Root
							variant="primary"
							onClick={handleRequestChanges}
							disabled={isProcessing || !changesComment.trim()}
						>
							{isProcessing ? "Sending..." : "Send Request"}
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}

// Stat Card Component
function StatCard({
	label,
	value,
	highlight = false,
	valueColor = "text-text-strong-950",
}: {
	label: string
	value: string
	highlight?: boolean
	valueColor?: string
}) {
	return (
		<div
			className={cn(
				"rounded-xl p-3 text-center border",
				highlight ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
			)}
		>
			<span className={cn("text-xs block mb-0.5", highlight ? "text-blue-600" : "text-gray-500")}>
				{label}
			</span>
			<span
				className={cn(
					"text-base sm:text-lg font-semibold",
					highlight ? "text-blue-600" : valueColor
				)}
			>
				{value}
			</span>
		</div>
	)
}

// Helper function to get deliverable icon based on name/category
function getDeliverableIcon(name: string) {
	const lowerName = name.toLowerCase()
	if (
		lowerName.includes("screenshot") ||
		lowerName.includes("image") ||
		lowerName.includes("photo")
	) {
		return ImageIcon
	}
	if (lowerName.includes("link") || lowerName.includes("url")) {
		return LinkIcon
	}
	if (lowerName.includes("video")) {
		return VideoCamera
	}
	if (lowerName.includes("review") || lowerName.includes("rating") || lowerName.includes("star")) {
		return Star
	}
	if (lowerName.includes("share") || lowerName.includes("social")) {
		return ShareNetwork
	}
	if (lowerName.includes("text") || lowerName.includes("description")) {
		return ClipboardText
	}
	return ListChecks
}

// Helper component for detail rows
function DetailRow({
	label,
	value,
	mono = false,
	valueColor = "text-text-strong-950",
}: {
	label: string
	value: string
	mono?: boolean
	valueColor?: string
}) {
	return (
		<div className="flex items-center justify-between py-1.5">
			<span className="text-paragraph-sm text-text-sub-600">{label}</span>
			<span className={cn("text-paragraph-sm font-medium", valueColor, mono && "font-mono")}>{value}</span>
		</div>
	)
}
