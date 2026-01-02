"use client"

import { memo, useCallback, useState, useTransition, useMemo, Fragment, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm, Controller, useFieldArray, type ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn, performOptimisticDelete, performListItemOptimisticUpdate, formatDateMedium, formatDateWithWeekday, getErrorMessage } from "@/lib/utils"
import { campaignFormSchema, type CampaignFormInput } from "@/lib/utils"
import * as Button from "@/components/ui/primitives/button"
import * as Tooltip from "@/components/ui/layout/tooltip"
import * as Modal from "@/components/ui/layout/modal"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Radio from "@/components/ui/forms/radio"
import * as Popover from "@/components/ui/layout/popover"
import { NumberInput } from "@/components/ui/forms/currency-input"
import { FormField } from "@/components/ui/forms/form-field"
import { Calendar } from "@/components/ui/forms/datepicker"
import { CampaignCard } from "@/components/dashboard/campaign-card"
import { NoCampaignsEmptyState } from "@/components/dashboard/empty-states"
import { Callout } from "@/components/ui/feedback/callout"
import { ConfirmationModal } from "@/components/dashboard"
import {
	Plus,
	Megaphone,
	Play,
	Clock,
	User,
	DownloadSimple,
	MagnifyingGlass,
	X,
	Package,
	CalendarBlank,
	CalendarDots,
	ListChecks,
	CheckCircle,
	Globe,
	Lock,
	Info,
	Trash,
	ArrowRight,
	ArrowLeft,
	Image as ImageIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useCampaignSearchParams, useCurrentOrganization, useDebounceSearch, useModal } from "@/hooks"
import { useStableTime } from "@/hooks/ui/use-mounted"
import { exportCampaigns } from "@/lib/utils/excel"
import { CAMPAIGN_STATUS_TABS, CAMPAIGN_TYPE_OPTIONS, DELIVERABLE_TYPE_OPTIONS, DEFAULT_SUBMISSION_DEADLINE_DAYS } from "@/lib/constants"
import {
	useSearchCampaigns,
	updateCampaignStatus,
	deleteCampaign,
	duplicateCampaign,
	createCampaign,
	campaignKeys,
	type CampaignStatus,
	type CampaignWithStats,
} from "@/features/campaigns"
import type { ProductWithStats } from "@/features/products"

// Wrapper component with memoized handlers for optimal performance
// useCallback ensures stable function references for memo() to work effectively
const CampaignCardWrapper = memo(function CampaignCardWrapper({
	campaign,
	onStatusChange,
	onDelete,
	onDuplicate,
	organizationId,
}: {
	campaign: CampaignWithStats
	onStatusChange: (campaignId: string, status: CampaignStatus) => void
	onDelete: (campaignId: string) => void
	onDuplicate: (campaignId: string) => void
	organizationId: string
}) {
	const router = useRouter()
	const campaignId = campaign.id

	// Memoize handlers to prevent CampaignCard re-renders
	const handleView = useCallback(() => {
		router.push(`/dashboard/${organizationId}/campaigns/${campaignId}`)
	}, [router, organizationId, campaignId])

	const handleEdit = useCallback(() => {
		router.push(`/dashboard/${organizationId}/campaigns/${campaignId}?mode=edit`)
	}, [router, organizationId, campaignId])

	const handlePause = useCallback(() => onStatusChange(campaignId, "paused"), [onStatusChange, campaignId])
	const handleResume = useCallback(() => onStatusChange(campaignId, "active"), [onStatusChange, campaignId])
	const handleEnd = useCallback(() => onStatusChange(campaignId, "ended"), [onStatusChange, campaignId])
	const handleComplete = useCallback(() => onStatusChange(campaignId, "completed"), [onStatusChange, campaignId])
	const handleArchive = useCallback(() => onStatusChange(campaignId, "archived"), [onStatusChange, campaignId])
	const handleCancel = useCallback(() => onStatusChange(campaignId, "cancelled"), [onStatusChange, campaignId])
	const handleSubmitForApproval = useCallback(() => onStatusChange(campaignId, "pending_approval"), [onStatusChange, campaignId])
	const handleDuplicate = useCallback(() => onDuplicate(campaignId), [onDuplicate, campaignId])
	const handleDelete = useCallback(() => onDelete(campaignId), [onDelete, campaignId])

	return (
		<CampaignCard
			campaign={campaign}
			onView={handleView}
			onManage={handleView}
			onPause={handlePause}
			onResume={handleResume}
			onEnd={handleEnd}
			onComplete={handleComplete}
			onArchive={handleArchive}
			onCancel={handleCancel}
			onDuplicate={handleDuplicate}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onSubmitForApproval={handleSubmitForApproval}
		/>
	)
})


/**
 * Props for the CampaignsClient component
 */
export interface CampaignsClientProps {
	/** Initial status filter to apply */
	initialStatus?: CampaignStatus | "all"
	/** Initial campaign data to display */
	initialData?: {
		campaigns: CampaignWithStats[]
		total?: number
		products?: ProductWithStats[]
	}
}

/**
 * CampaignsClient Component
 * 
 * Displays and manages campaigns with filtering, searching, and status management.
 * Supports status filtering, search, export, and campaign actions (create, edit, delete, duplicate).
 * 
 * @param props - Component props
 * @param props.initialStatus - Initial status filter (default: "all")
 * @param props.initialData - Initial campaign data to display
 * @returns Campaigns management interface
 */
export function CampaignsClient({
	initialStatus = "all",
	initialData,
}: CampaignsClientProps) {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
	const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useModal()
	const [isCreateModalOpen, openCreateModal, closeCreateModal] = useModal()

	// SSOT: Use centralized organization hook instead of duplicating logic
	const { organization, organizationId, isApproved } = useCurrentOrganization()

	// Get products from initial data for create campaign modal
	const products = initialData?.products ?? []

	// SSOT: Use centralized debounce search hook
	const { query: searchQuery, debouncedQuery, setQuery: setSearchQuery, isSearchActive } = useDebounceSearch()

	// nuqs: URL state management for filters
	const [searchParams, setSearchParams] = useCampaignSearchParams()
	const statusFilter = searchParams.status || initialStatus

	// Use initialData which is passed from server component - type-safe
	const campaignsData: CampaignWithStats[] = initialData?.campaigns ?? []

	// Search hook - only active when there's a search query
	const { data: searchResults, isLoading: isSearching, isError: isSearchError } = useSearchCampaigns(organizationId, {
		q: debouncedQuery,
		status: statusFilter !== "all" ? (statusFilter as CampaignStatus) : undefined,
	})

	// Use server data first, fallback to search results when search is active
	const campaigns: CampaignWithStats[] = isSearchActive
		? (searchResults?.data ?? []) as CampaignWithStats[]
		: campaignsData

	// Stable reference time to avoid re-renders
	const referenceTime = useStableTime()

	// Calculate stats from campaigns - memoized for performance
	// Use current time as fallback before hydration (won't cause mismatch since it's in useMemo)
	const now = referenceTime ?? Date.now()
	const stats = useMemo(() => ({
		total: campaigns.length,
		active: campaigns.filter((c) => c.status === "active").length,
		endingSoon: campaigns.filter((c) => {
			if (c.status !== "active" || !c.endDate) return false
			const daysUntilEnd = Math.ceil(
				(new Date(c.endDate).getTime() - now) / (1000 * 60 * 60 * 24)
			)
			return daysUntilEnd <= 7 && daysUntilEnd > 0
		}).length,
		draft: campaigns.filter((c) => c.status === "draft").length,
		pending: campaigns.filter((c) => c.status === "pending_approval").length,
		completed: campaigns.filter((c) => c.status === "completed").length,
		totalEnrollments: campaigns.reduce((sum, c) => sum + (c.currentEnrollments || 0), 0),
		totalPayout: campaigns.reduce((sum, c) => sum + (c.totalPayout || 0), 0),
	}), [campaigns, now])

	const handleStatusChange = useCallback((campaignId: string, status: CampaignStatus) => {
		// Map CampaignStatus to action type
		let action: "submit" | "activate" | "cancel" | "end" | "complete" | "archive" | "unarchive"
		if (status === "pending_approval") action = "submit"
		else if (status === "active") action = "activate"
		else if (status === "cancelled") action = "cancel"
		else if (status === "ended") action = "end"
		else if (status === "completed") action = "complete"
		else if (status === "archived") action = "archive"
		else {
			toast.error("Invalid status transition")
			return
		}

		// Use optimistic update for instant UI feedback
		startTransition(async () => {
			await performListItemOptimisticUpdate<CampaignWithStats, unknown>({
				queryClient,
				queryKey: campaignKeys.list(organizationId, { status: statusFilter !== "all" ? statusFilter : undefined }),
				itemId: campaignId,
				updateFn: (campaign) => ({ ...campaign, status }),
				serverFn: () => updateCampaignStatus({ organizationId, id: campaignId, action }),
				invalidateKeys: [
					campaignKeys.lists(organizationId),
					campaignKeys.detail(organizationId, campaignId),
				],
				successMessage: `Campaign ${action === "submit" ? "submitted for approval" : `${action}d`} successfully`,
				errorMessage: `Failed to ${action} campaign`,
			})
		})
	}, [queryClient, organizationId, statusFilter])

	const handleDelete = useCallback((campaignId: string) => {
		setDeletingCampaignId(campaignId)
		openDeleteModal()
	}, [])

	const confirmDeleteCampaign = useCallback(async () => {
		if (!deletingCampaignId) return

		// ✅ FIX: Capture ID before resetting state to avoid race condition
		const idToDelete = deletingCampaignId

		// ✅ FIX: Reset state BEFORE closing modal to prevent stale data flash
		setDeletingCampaignId(null)
		closeDeleteModal()

		// Use optimistic delete for instant UI feedback
		startTransition(async () => {
			await performOptimisticDelete<CampaignWithStats, unknown>({
				queryClient,
				queryKey: campaignKeys.list(organizationId, { status: statusFilter !== "all" ? statusFilter : undefined }),
				itemId: idToDelete,
				serverFn: () => deleteCampaign({ organizationId, id: idToDelete }),
				invalidateKeys: [
					campaignKeys.lists(organizationId),
				],
				successMessage: "Campaign deleted successfully",
				errorMessage: "Failed to delete campaign",
			})
		})
	}, [deletingCampaignId, queryClient, organizationId, statusFilter])

	const handleDuplicate = useCallback((campaignId: string) => {
		startTransition(async () => {
			try {
				const result = await duplicateCampaign({ id: campaignId, organizationId })
				// Invalidate campaigns queries to show new campaign
				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				toast.success("Campaign duplicated successfully")
				if (result?.data?.id) {
					router.push(`/dashboard/${organizationId}/campaigns/${result.data.id}`)
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Failed to duplicate campaign")
			}
		})
	}, [queryClient, router, organizationId])

	const getStatusCount = (status: string) => {
		if (status === "all") return stats.total
		if (status === "draft") return stats.draft
		if (status === "pending_approval") return stats.pending
		if (status === "active") return stats.active
		if (status === "completed") return stats.completed
		return 0
	}

	// nuqs: Update URL when tab changes
	const handleTabChange = useCallback((value: string) => {
		setSearchParams({ status: value as typeof statusFilter, page: 1 })
	}, [setSearchParams])

	// Excel export handler
	const handleExport = useCallback(() => {
		try {
			exportCampaigns(campaigns as CampaignWithStats[])
			toast.success("Campaigns exported to Excel")
		} catch {
			toast.error("Failed to export campaigns")
		}
	}, [campaigns])

	return (
		<Tooltip.Provider>
			<div className="space-y-5 sm:space-y-6">
				{/* Page Header */}
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Campaigns</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage your influencer marketing campaigns
						</p>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<Button.Root variant="neutral" size="small" onClick={handleExport} aria-label="Export campaigns to Excel">
									<Button.Icon>
										<DownloadSimple className="size-5" />
									</Button.Icon>
									<span className="hidden sm:inline">Export</span>
								</Button.Root>
							</Tooltip.Trigger>
							<Tooltip.Content>Export campaigns to Excel</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<div>
									<Button.Root
										variant="primary"
										size="small"
										disabled={!isApproved}
										onClick={openCreateModal}
									>
										<Button.Icon>
											<Plus className="size-5" />
										</Button.Icon>
										<span className="hidden sm:inline">Create Campaign</span>
										<span className="sm:hidden">Create</span>
									</Button.Root>
								</div>
							</Tooltip.Trigger>
							{!isApproved && (
								<Tooltip.Content>
									{organization?.approvalStatus === "draft"
										? "Complete onboarding and wait for admin approval"
										: organization?.approvalStatus === "pending"
										? "Your application is under review"
										: "Organization approval required"}
								</Tooltip.Content>
							)}
						</Tooltip.Root>
					</div>
				</div>

				{/* Stats Overview - 2x2 grid on mobile, 4 cols on larger */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{[
						{ label: "Total Campaigns", value: stats.total, icon: Megaphone, color: "default" as const },
						{ label: "Active", value: stats.active, icon: Play, color: "success" as const },
						{ label: "Ending Soon", value: stats.endingSoon, icon: Clock, color: stats.endingSoon > 0 ? "warning" as const : "default" as const },
						{ label: "Enrollments", value: stats.totalEnrollments.toLocaleString(), icon: User, color: "info" as const },
					].map((stat) => (
						<div
							key={stat.label}
							className={cn(
								"flex items-center gap-3 rounded-xl ring-1 ring-inset p-3 sm:p-4",
								stat.color === "warning" && stats.endingSoon > 0
									? "bg-warning-lighter/50 ring-warning-base/20"
									: "bg-bg-white-0 ring-stroke-soft-200"
							)}
						>
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-lg shrink-0",
									stat.color === "success" && "bg-success-lighter text-success-base",
									stat.color === "warning" && stats.endingSoon > 0 && "bg-warning-base text-white",
									stat.color === "warning" && stats.endingSoon === 0 && "bg-bg-weak-50 text-text-sub-600",
									stat.color === "info" && "bg-information-lighter text-information-base",
									stat.color === "default" && "bg-bg-weak-50 text-text-sub-600"
								)}
							>
								<stat.icon weight={stat.color === "default" ? "duotone" : "fill"} className="size-5" />
							</div>
							<div>
								<div
									className={cn(
										"text-title-h6 sm:text-title-h5 font-semibold",
										stat.color === "success" && "text-success-base",
										stat.color === "warning" && stats.endingSoon > 0 && "text-warning-base",
										stat.color === "warning" && stats.endingSoon === 0 && "text-text-soft-400",
										(stat.color === "info" || stat.color === "default") && "text-text-strong-950"
									)}
								>
									{stat.value}
								</div>
								<div className="text-label-xs text-text-soft-400">
									{stat.label}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Search and Status Filter - Clean card container */}
				<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
						{/* Left: Search Input */}
						<div className="relative flex-1 lg:max-w-sm">
							<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" aria-hidden="true" />
							<input
								type="search"
								placeholder="Search campaigns..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full h-9 pl-9 pr-8 rounded-lg bg-bg-weak-50 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 ring-1 ring-inset ring-stroke-soft-200 focus:outline-none focus:ring-2 focus:ring-primary-base focus:bg-bg-white-0 transition-all"
								aria-label="Search campaigns"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-weak-50 text-text-soft-400 hover:text-text-sub-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
									aria-label="Clear search"
								>
									<X className="size-3.5" aria-hidden="true" />
								</button>
							)}
							{isSearching && (
								<div className="absolute right-8 top-1/2 -translate-y-1/2">
									<div className="size-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
								</div>
							)}
						</div>

						{/* Right: Status Filter - Horizontal scrolling on mobile */}
						<div className="overflow-x-auto -mx-3 px-3 lg:mx-0 lg:px-0 lg:overflow-visible scrollbar-hide">
							<div className="flex gap-1.5 min-w-max lg:min-w-0 lg:flex-wrap">
								{CAMPAIGN_STATUS_TABS.map((tab) => {
									const count = getStatusCount(tab.value)
									const isActive = statusFilter === tab.value
									return (
										<button
											type="button"
											key={tab.value}
											onClick={() => handleTabChange(tab.value)}
											className={cn(
												"inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-label-xs font-medium transition-all duration-200 whitespace-nowrap",
												isActive
													? "bg-primary-base text-white shadow-sm"
													: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 active:scale-95"
											)}
										>
											{tab.label}
											<span
												className={cn(
													"inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold",
													isActive ? "bg-white/20 text-white" : "bg-bg-soft-200 text-text-soft-400"
												)}
											>
												{count}
											</span>
										</button>
									)
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Search Error */}
				{isSearchError && isSearchActive && (
					<Callout variant="error" size="sm" dismissible>
						<strong>Search failed.</strong> Unable to search campaigns. Please try again.
					</Callout>
				)}

				{/* Campaign Tips */}
				{campaigns.length > 0 && statusFilter === "all" && !isSearchError && (
					<div className="hidden sm:block">
						<Callout variant="tip" size="sm" dismissible>
							<strong>Tip:</strong> Set clear campaign goals and deadlines to maximize enrollment
							quality.
						</Callout>
					</div>
				)}

				{/* Campaigns Grid - Wrapped in card container */}
				<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
					{/* Header with count */}
					<div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stroke-soft-200">
						<span className="text-label-sm text-text-sub-600">
							{campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"}
							{statusFilter !== "all" && ` (${CAMPAIGN_STATUS_TABS.find((t) => t.value === statusFilter)?.label})`}
						</span>
					</div>

					{/* Content */}
					{campaigns.length === 0 ? (
						<div className="p-8 sm:p-12">
							{statusFilter === "all" ? (
								<NoCampaignsEmptyState organizationId={organizationId} />
							) : (
								<div className="text-center">
									<Megaphone weight="duotone" className="size-12 mx-auto mb-4 text-text-soft-400" />
									<h3 className="text-label-lg text-text-strong-950 mb-2">
										No {CAMPAIGN_STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()} campaigns
									</h3>
									<p className="text-paragraph-sm text-text-sub-600 mb-6">
										Try selecting a different status filter or create a new campaign.
									</p>
									<Button.Root variant="neutral" size="small" onClick={() => handleTabChange("all")}>
										View All Campaigns
									</Button.Root>
								</div>
							)}
						</div>
					) : (
						<div className="p-3 sm:p-4">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
								{campaigns.map((campaign: CampaignWithStats) => (
									<CampaignCardWrapper
										key={campaign.id}
										campaign={campaign}
										onStatusChange={handleStatusChange}
										onDelete={handleDelete}
										onDuplicate={handleDuplicate}
										organizationId={organizationId}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={isDeleteModalOpen}
				onOpenChange={(open) => !open && closeDeleteModal()}
				variant="danger"
				title="Delete Campaign"
				description="Are you sure you want to delete this campaign? This action cannot be undone. All associated enrollments will be affected."
				confirmLabel="Delete Campaign"
				cancelLabel="Cancel"
				onConfirm={confirmDeleteCampaign}
				isLoading={isPending}
			/>

			{/* Create Campaign Modal */}
			<CampaignModal
				open={isCreateModalOpen}
				onOpenChange={(open) => !open && closeCreateModal()}
				products={products}
				organizationId={organizationId}
			/>
		</Tooltip.Provider>
	)
}

// ============================================
// Campaign Modal Component - Multi-step wizard
// ============================================

const MODAL_STEPS = [
	{ label: "Basic Info", value: 1, icon: Package },
	{ label: "Schedule", value: 2, icon: CalendarDots },
	{ label: "Deliverables", value: 3, icon: ListChecks },
	{ label: "Review", value: 4, icon: CheckCircle },
]

interface CampaignModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	products: ProductWithStats[]
	organizationId: string
}

function CampaignModal({ open, onOpenChange, products, organizationId }: CampaignModalProps) {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [currentStep, setCurrentStep] = useState(1)

	// Date picker states
	const [startDateOpen, , , , setStartDateOpen] = useModal(false)
	const [endDateOpen, , , , setEndDateOpen] = useModal(false)

	// RHF form setup
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		trigger,
		watch,
		setValue,
		getValues,
		reset,
	} = useForm<CampaignFormInput>({
		resolver: zodResolver(campaignFormSchema),
		mode: "onChange",
		defaultValues: {
			type: "cashback",
			isPublic: true,
			submissionDeadlineDays: DEFAULT_SUBMISSION_DEADLINE_DAYS,
			deliverables: [
				{
					id: crypto.randomUUID(),
					type: "order_screenshot",
					title: "Order Screenshot",
					isRequired: true,
					instructions: "",
				},
			],
			terms: [],
		},
	})

	const {
		fields: deliverableFields,
		append: appendDeliverable,
		remove: removeDeliverable,
	} = useFieldArray({
		control,
		name: "deliverables",
	})

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			reset()
			setCurrentStep(1)
		}
	}, [open, reset])

	const handleNext = async () => {
		let isValid = false
		switch (currentStep) {
			case 1:
				isValid = await trigger(["productId", "title", "type"])
				break
			case 2:
				isValid = await trigger(["startDate", "endDate", "maxEnrollments", "submissionDeadlineDays"])
				break
			case 3:
				isValid = await trigger("deliverables")
				break
			case 4:
				isValid = true
				break
		}

		if (isValid && currentStep < 4) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSaveDraft = async () => {
		const data = getValues()
		startTransition(async () => {
			try {
				const campaignData = {
					organizationId,
					title: data.title || "",
					description: data.description || "",
					productId: data.productId || "",
					campaignType: data.type || "cashback",
					isPublic: data.isPublic ?? true,
					maxEnrollments: data.maxEnrollments || 0,
					startDate: data.startDate?.toISOString() || "",
					endDate: data.endDate?.toISOString() || "",
				}

				await createCampaign(campaignData)
				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				toast.success("Campaign saved as draft")
				onOpenChange(false)
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to save campaign"))
			}
		})
	}

	const onSubmit = async (data: CampaignFormInput) => {
		startTransition(async () => {
			try {
				const campaignData = {
					organizationId,
					title: data.title,
					description: data.description || "",
					productId: data.productId,
					campaignType: data.type,
					isPublic: data.isPublic,
					maxEnrollments: data.maxEnrollments,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
				}

				const result = await createCampaign(campaignData)
				const campaignId = result?.data?.id

				if (!campaignId) {
					throw new Error("Failed to create campaign")
				}

				// Submit for approval
				await updateCampaignStatus({ organizationId, id: campaignId, action: "submit" })

				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				toast.success("Campaign submitted for approval")
				onOpenChange(false)
				router.push(`/dashboard/${organizationId}/campaigns/${campaignId}`)
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to create campaign"))
			}
		})
	}

	// Watch form values
	const productId = watch("productId")
	const type = watch("type")
	const isPublic = watch("isPublic")
	const startDate = watch("startDate")
	const endDate = watch("endDate")
	const formData = watch()

	// Get selected product for review
	const selectedProduct = products.find((p) => p.id === productId)

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="sm:max-w-4xl max-h-[90vh] flex flex-col">
				<Modal.Header>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary-alpha-10">
							<Megaphone weight="duotone" className="size-5 text-primary-base" />
						</div>
						<div>
							<Modal.Title>Create Campaign</Modal.Title>
							<p className="text-paragraph-xs text-text-sub-600 mt-0.5">
								Step {currentStep} of 4 - {MODAL_STEPS[currentStep - 1].label}
							</p>
						</div>
					</div>
				</Modal.Header>

				<Modal.Body className="flex-1 overflow-y-auto p-0">
					{/* Progress Steps */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200 bg-bg-weak-50/50">
						{MODAL_STEPS.map((step, index) => {
							const Icon = step.icon
							const isCompleted = currentStep > step.value
							const isActive = currentStep === step.value

							return (
								<Fragment key={step.value}>
									<button
										type="button"
										onClick={() => isCompleted && setCurrentStep(step.value)}
										disabled={!isCompleted}
										className={cn(
											"flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
											isActive && "bg-primary-base/10",
											isCompleted && "cursor-pointer hover:bg-bg-weak-50",
											!isActive && !isCompleted && "opacity-50"
										)}
									>
										<div
											className={cn(
												"flex size-7 items-center justify-center rounded-md transition-colors",
												isCompleted && "bg-success-base text-white",
												isActive && "bg-primary-base text-white",
												!isActive && !isCompleted && "bg-bg-soft-200 text-text-soft-400"
											)}
										>
											{isCompleted ? (
												<CheckCircle weight="fill" className="size-4" />
											) : (
												<Icon weight={isActive ? "fill" : "regular"} className="size-4" />
											)}
										</div>
										<span
											className={cn(
												"text-label-xs hidden sm:inline",
												isActive ? "text-primary-base font-medium" : isCompleted ? "text-text-strong-950" : "text-text-soft-400"
											)}
										>
											{step.label}
										</span>
									</button>

									{index < MODAL_STEPS.length - 1 && (
										<div
											className={cn(
												"flex-1 h-0.5 mx-1 rounded-full transition-colors",
												currentStep > step.value ? "bg-success-base" : "bg-stroke-soft-200"
											)}
										/>
									)}
								</Fragment>
							)
						})}
					</div>

					{/* Form Content */}
					<form id="campaign-modal-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
						{/* Step 1: Basic Info */}
						{currentStep === 1 && (
							<div className="space-y-6">
								<div>
									<h3 className="text-label-lg text-text-strong-950 mb-1">Basic Information</h3>
									<p className="text-paragraph-sm text-text-sub-600">Set up the foundation of your campaign</p>
								</div>

								{/* Product Selection with Images */}
								<FormField label="Select Product" required error={errors.productId?.message}>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
										{products.length === 0 ? (
											<div className="col-span-full text-center py-8">
												<Package weight="duotone" className="size-12 mx-auto mb-4 text-text-soft-400" />
												<h3 className="text-label-md text-text-strong-950 mb-2">No products found</h3>
												<p className="text-paragraph-sm text-text-sub-600 mb-4">Add a product to create a campaign</p>
												<Button.Root variant="primary" size="small" asChild>
													<Link href={`/dashboard/${organizationId}/products`}>
														<Button.Icon><Plus className="size-5" /></Button.Icon>
														Add Product
													</Link>
												</Button.Root>
											</div>
										) : (
											products.map((product) => {
												const productImage = product.productImages?.[0]?.imageUrl
												return (
													<button
														key={product.id}
														type="button"
														onClick={() => setValue("productId", product.id, { shouldValidate: true })}
														className={cn(
															"flex items-center gap-3 p-3 rounded-xl text-left transition-all",
															"ring-1 ring-inset",
															productId === product.id
																? "ring-primary-base bg-primary-base/5 shadow-sm"
																: "ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-stroke-sub-300"
														)}
													>
														{/* Product Image */}
														<div className="size-12 rounded-lg bg-bg-weak-50 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-inset ring-stroke-soft-200">
															{productImage ? (
																<Image
																	src={productImage}
																	alt={product.name}
																	width={48}
																	height={48}
																	className="size-full object-contain p-1"
																/>
															) : (
																<ImageIcon weight="duotone" className="size-6 text-text-soft-400" />
															)}
														</div>
														<div className="min-w-0 flex-1">
															<div className="text-label-sm text-text-strong-950 truncate">{product.name}</div>
															<div className="text-paragraph-xs text-text-soft-400">{product.sku}</div>
														</div>
														{productId === product.id && (
															<CheckCircle weight="fill" className="size-5 text-primary-base shrink-0" />
														)}
													</button>
												)
											})
										)}
									</div>
								</FormField>

								{/* Campaign Title */}
								<FormField label="Campaign Title" required error={errors.title?.message}>
									<Input.Root>
										<Input.Wrapper>
											<Input.El {...register("title")} placeholder="e.g., Summer Sale 2024" />
										</Input.Wrapper>
									</Input.Root>
								</FormField>

								{/* Description */}
								<FormField label="Description" error={errors.description?.message}>
									<Textarea.Root
										{...register("description")}
										placeholder="Describe your campaign goals..."
										rows={3}
									/>
								</FormField>

								{/* Campaign Type */}
								<FormField label="Campaign Type" required error={errors.type?.message}>
									<Controller
										name="type"
										control={control}
										render={({ field }: { field: ControllerRenderProps<CampaignFormInput, "type"> }) => (
											<Radio.Group value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
												{CAMPAIGN_TYPE_OPTIONS.map((option) => (
													<div
														key={option.value}
														className={cn(
															"flex flex-col p-3 rounded-xl cursor-pointer transition-all ring-1 ring-inset",
															type === option.value
																? "ring-primary-base bg-primary-base/5"
																: "ring-stroke-soft-200 hover:bg-bg-weak-50"
														)}
														onClick={() => field.onChange(option.value)}
														onKeyDown={(e) => e.key === "Enter" && field.onChange(option.value)}
														role="button"
														tabIndex={0}
													>
														<div className="flex items-center gap-2">
															<Radio.Item value={option.value} />
															<span className="text-label-sm text-text-strong-950">{option.label}</span>
														</div>
														<span className="text-paragraph-xs text-text-soft-400 pl-6 mt-1">{option.description}</span>
													</div>
												))}
											</Radio.Group>
										)}
									/>
								</FormField>

								{/* Visibility */}
								<div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
									<Controller
										name="isPublic"
										control={control}
										render={({ field }: { field: ControllerRenderProps<CampaignFormInput, "isPublic"> }) => (
											<label className="flex items-start gap-3 cursor-pointer">
												<Checkbox.Root
													checked={field.value}
													onCheckedChange={(checked) => field.onChange(checked === true)}
													className="mt-0.5"
												/>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														{isPublic ? (
															<Globe weight="duotone" className="size-4 text-success-base" />
														) : (
															<Lock weight="duotone" className="size-4 text-text-soft-400" />
														)}
														<span className="text-label-sm text-text-strong-950">
															{isPublic ? "Public Campaign" : "Private Campaign"}
														</span>
													</div>
													<span className="text-paragraph-xs text-text-soft-400 block mt-0.5">
														{isPublic ? "Visible to all shoppers" : "Only accessible via direct link"}
													</span>
												</div>
											</label>
										)}
									/>
								</div>
							</div>
						)}

						{/* Step 2: Schedule */}
						{currentStep === 2 && (
							<div className="space-y-6">
								<div>
									<h3 className="text-label-lg text-text-strong-950 mb-1">Schedule & Limits</h3>
									<p className="text-paragraph-sm text-text-sub-600">Define when your campaign runs</p>
								</div>

								{/* Campaign Period */}
								<div className="space-y-3">
									<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
										<CalendarDots weight="duotone" className="size-4 text-primary-base" />
										Campaign Period
										<span className="text-error-base">*</span>
									</label>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Popover.Root open={startDateOpen} onOpenChange={setStartDateOpen}>
											<div className="space-y-1.5">
												<span className="text-label-xs text-text-sub-600">Start Date</span>
												<Popover.Trigger asChild>
													<button
														type="button"
														className="flex items-center gap-2 w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50 transition-all"
													>
														<CalendarBlank weight="duotone" className="size-5 text-text-soft-400 shrink-0" />
														<span className={cn("flex-1 text-paragraph-sm", startDate ? "text-text-strong-950" : "text-text-soft-400")}>
															{startDate ? formatDateWithWeekday(startDate) : "Select date"}
														</span>
													</button>
												</Popover.Trigger>
											</div>
											<Popover.Content>
												<Calendar
													mode="single"
													selected={startDate}
													onSelect={(date: Date | undefined) => {
														if (date) {
															setValue("startDate", date, { shouldValidate: true })
															setStartDateOpen(false)
														}
													}}
													disabled={(date: Date) => {
														const today = new Date()
														today.setHours(0, 0, 0, 0)
														return date < today
													}}
												/>
											</Popover.Content>
										</Popover.Root>

										<Popover.Root open={endDateOpen} onOpenChange={setEndDateOpen}>
											<div className="space-y-1.5">
												<span className="text-label-xs text-text-sub-600">End Date</span>
												<Popover.Trigger asChild>
													<button
														type="button"
														className="flex items-center gap-2 w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50 transition-all"
													>
														<CalendarBlank weight="duotone" className="size-5 text-text-soft-400 shrink-0" />
														<span className={cn("flex-1 text-paragraph-sm", endDate ? "text-text-strong-950" : "text-text-soft-400")}>
															{endDate ? formatDateWithWeekday(endDate) : "Select date"}
														</span>
													</button>
												</Popover.Trigger>
											</div>
											<Popover.Content>
												<Calendar
													mode="single"
													selected={endDate}
													onSelect={(date: Date | undefined) => {
														if (date) {
															setValue("endDate", date, { shouldValidate: true })
															setEndDateOpen(false)
														}
													}}
													disabled={(date: Date) => {
														const today = new Date()
														today.setHours(0, 0, 0, 0)
														return startDate ? date < startDate : date < today
													}}
												/>
											</Popover.Content>
										</Popover.Root>
									</div>
									{(errors.startDate || errors.endDate) && (
										<p className="text-paragraph-xs text-error-base">
											{errors.startDate?.message || errors.endDate?.message}
										</p>
									)}
								</div>

								{/* Capacity Settings */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<FormField label="Maximum Enrollments" required error={errors.maxEnrollments?.message}>
										<NumberInput {...register("maxEnrollments", { valueAsNumber: true })} placeholder="500" size="medium" />
										<p className="text-paragraph-xs text-text-soft-400 mt-1.5">Maximum shoppers who can enroll</p>
									</FormField>

									<FormField label="Submission Deadline" error={errors.submissionDeadlineDays?.message}>
										<NumberInput
											{...register("submissionDeadlineDays", { valueAsNumber: true })}
											placeholder="45"
											suffix="days"
											size="medium"
										/>
										<p className="text-paragraph-xs text-text-soft-400 mt-1.5">Days to submit proofs after enrolling</p>
									</FormField>
								</div>

								{/* Info Callout */}
								<div className="flex items-start gap-3 rounded-xl bg-information-lighter/50 p-4 ring-1 ring-inset ring-information-base/20">
									<Info weight="fill" className="size-5 text-information-base shrink-0 mt-0.5" />
									<div className="text-paragraph-sm text-text-sub-600">
										<strong className="text-information-base">Tip:</strong> 45 days is recommended for product delivery and content creation.
									</div>
								</div>
							</div>
						)}

						{/* Step 3: Deliverables */}
						{currentStep === 3 && (
							<div className="space-y-6">
								<div>
									<h3 className="text-label-lg text-text-strong-950 mb-1">Campaign Deliverables</h3>
									<p className="text-paragraph-sm text-text-sub-600">Define what participants need to submit</p>
								</div>

								{/* Info Banner */}
								<div className="flex items-start gap-3 rounded-xl bg-success-lighter/50 p-4 ring-1 ring-inset ring-success-base/20">
									<CheckCircle weight="fill" className="size-5 text-success-base shrink-0 mt-0.5" />
									<div className="text-paragraph-sm text-text-sub-600">
										<strong className="text-success-base">Order screenshot</strong> is automatically required for OCR verification.
									</div>
								</div>

								{/* Deliverables List */}
								<div className="space-y-3">
									{deliverableFields.map((field, index) => (
										<div
											key={field.id}
											className={cn(
												"rounded-xl ring-1 ring-inset p-4",
												index === 0 ? "ring-primary-base/30 bg-primary-base/5" : "ring-stroke-soft-200"
											)}
										>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"flex size-6 items-center justify-center rounded-md text-label-xs font-semibold",
															index === 0 ? "bg-primary-base text-white" : "bg-bg-weak-50 text-text-sub-600"
														)}
													>
														{index + 1}
													</div>
													<span className="text-label-sm text-text-strong-950">
														{DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === watch(`deliverables.${index}.type`))?.label || "Deliverable"}
													</span>
													{index === 0 && <span className="text-paragraph-xs text-primary-base">(Required)</span>}
												</div>

												<div className="flex items-center gap-2">
													{index > 0 && (
														<>
															<Controller
																name={`deliverables.${index}.isRequired`}
																control={control}
																render={({ field: checkField }: { field: ControllerRenderProps<CampaignFormInput, `deliverables.${number}.isRequired`> }) => (
																	<label className="flex items-center gap-1.5 cursor-pointer">
																		<Checkbox.Root
																			checked={checkField.value}
																			onCheckedChange={(checked) => checkField.onChange(checked === true)}
																		/>
																		<span className="text-label-xs text-text-sub-600">Required</span>
																	</label>
																)}
															/>
															<Button.Root
																type="button"
																variant="ghost"
																size="xsmall"
																onClick={() => removeDeliverable(index)}
																className="text-error-base hover:bg-error-lighter"
															>
																<Button.Icon><Trash className="size-4" /></Button.Icon>
															</Button.Root>
														</>
													)}
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
												<FormField label="Type" required error={errors.deliverables?.[index]?.type?.message}>
													<Controller
														name={`deliverables.${index}.type`}
														control={control}
														render={({ field: typeField }: { field: ControllerRenderProps<CampaignFormInput, `deliverables.${number}.type`> }) => (
															<Select.Root value={typeField.value} onValueChange={typeField.onChange} disabled={index === 0}>
																<Select.Trigger>
																	<Select.Value />
																</Select.Trigger>
																<Select.Content>
																	{DELIVERABLE_TYPE_OPTIONS.map((option) => (
																		<Select.Item key={option.value} value={option.value}>
																			{option.label}
																		</Select.Item>
																	))}
																</Select.Content>
															</Select.Root>
														)}
													/>
												</FormField>
												<FormField label="Instructions" error={errors.deliverables?.[index]?.instructions?.message}>
													<Input.Root>
														<Input.Wrapper>
															<Input.El {...register(`deliverables.${index}.instructions`)} placeholder="e.g., Min 50 words" />
														</Input.Wrapper>
													</Input.Root>
												</FormField>
											</div>
										</div>
									))}
								</div>

								<Button.Root
									type="button"
									variant="neutral"
									size="small"
									onClick={() =>
										appendDeliverable({
											id: crypto.randomUUID(),
											type: "delivery_photo",
											title: "",
											isRequired: false,
											instructions: "",
										})
									}
								>
									<Button.Icon><Plus className="size-5" /></Button.Icon>
									Add Deliverable
								</Button.Root>
							</div>
						)}

						{/* Step 4: Review */}
						{currentStep === 4 && (
							<div className="space-y-6">
								<div>
									<h3 className="text-label-lg text-text-strong-950 mb-1">Review & Submit</h3>
									<p className="text-paragraph-sm text-text-sub-600">Verify all details before submitting</p>
								</div>

								{/* Review Sections */}
								<div className="space-y-4">
									{/* Basic Info */}
									<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
										<div className="flex items-center justify-between px-4 py-2.5 bg-bg-weak-50 border-b border-stroke-soft-200">
											<h4 className="text-label-sm text-text-strong-950">Basic Information</h4>
											<Button.Root variant="ghost" size="xsmall" onClick={() => setCurrentStep(1)}>
												Edit
											</Button.Root>
										</div>
										<div className="p-4 space-y-2 text-paragraph-sm">
											<div className="flex justify-between">
												<span className="text-text-sub-600">Product</span>
												<span className="text-text-strong-950">{selectedProduct?.name || "Not selected"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-text-sub-600">Title</span>
												<span className="text-text-strong-950">{formData.title || "Not set"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-text-sub-600">Type</span>
												<span className="text-text-strong-950">
													{CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === formData.type)?.label}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-text-sub-600">Visibility</span>
												<span className="text-text-strong-950">{formData.isPublic ? "Public" : "Private"}</span>
											</div>
										</div>
									</div>

									{/* Schedule */}
									<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
										<div className="flex items-center justify-between px-4 py-2.5 bg-bg-weak-50 border-b border-stroke-soft-200">
											<h4 className="text-label-sm text-text-strong-950">Schedule & Limits</h4>
											<Button.Root variant="ghost" size="xsmall" onClick={() => setCurrentStep(2)}>
												Edit
											</Button.Root>
										</div>
										<div className="p-4 space-y-2 text-paragraph-sm">
											<div className="flex justify-between">
												<span className="text-text-sub-600">Period</span>
												<span className="text-text-strong-950">
													{formData.startDate ? formatDateMedium(formData.startDate) : "Not set"} -{" "}
													{formData.endDate ? formatDateMedium(formData.endDate) : "Not set"}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-text-sub-600">Max Enrollments</span>
												<span className="text-text-strong-950">{formData.maxEnrollments?.toLocaleString() || "Not set"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-text-sub-600">Submission Deadline</span>
												<span className="text-text-strong-950">{formData.submissionDeadlineDays} days</span>
											</div>
										</div>
									</div>

									{/* Deliverables */}
									<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
										<div className="flex items-center justify-between px-4 py-2.5 bg-bg-weak-50 border-b border-stroke-soft-200">
											<h4 className="text-label-sm text-text-strong-950">Deliverables</h4>
											<Button.Root variant="ghost" size="xsmall" onClick={() => setCurrentStep(3)}>
												Edit
											</Button.Root>
										</div>
										<div className="p-4 space-y-2 text-paragraph-sm">
											{formData.deliverables?.map((d, i) => (
												<div key={i} className="flex justify-between">
													<span className="text-text-sub-600">
														{DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === d.type)?.label || d.type}
													</span>
													<span className="text-text-strong-950">{d.isRequired ? "Required" : "Optional"}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						)}
					</form>
				</Modal.Body>

				<Modal.Footer className="border-t border-stroke-soft-200">
					<div className="flex items-center justify-between w-full">
						<div>
							{currentStep > 1 && (
								<Button.Root type="button" variant="ghost" onClick={handleBack} disabled={isPending}>
									<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
									Back
								</Button.Root>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button.Root type="button" variant="neutral" onClick={handleSaveDraft} disabled={isPending}>
								Save Draft
							</Button.Root>
							{currentStep < 4 ? (
								<Button.Root type="button" variant="primary" onClick={handleNext} disabled={isPending}>
									Continue
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
								</Button.Root>
							) : (
								<Button.Root type="submit" form="campaign-modal-form" variant="primary" disabled={isPending}>
									{isPending ? "Submitting..." : "Submit for Approval"}
								</Button.Root>
							)}
						</div>
					</div>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
