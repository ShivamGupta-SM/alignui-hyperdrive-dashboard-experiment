"use client"

import { memo, useCallback, useState, useEffect, useTransition, useMemo } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { cn } from "@/utils/cn"
import * as Button from "@/components/ui/primitives/button"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { CampaignCard } from "@/components/dashboard/campaign-card"
import { NoCampaignsEmptyState } from "@/components/dashboard/empty-states"
import { Callout, CalloutWithActions } from "@/components/ui/feedback/callout"
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
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useCampaignSearchParams } from "@/hooks"
import { exportCampaigns } from "@/lib/utils/excel"
import { getErrorMessage } from "@/lib/utils/format"
import { useOrganizations } from "@/features/organizations"
import {
	useSearchCampaigns,
	updateCampaignStatus,
	deleteCampaign,
	duplicateCampaign,
	campaignKeys,
	type CampaignStatus,
	type CampaignWithStats,
} from "@/features/campaigns"

// Memoized wrapper component to prevent unnecessary re-renders
const CampaignCardWrapper = memo(function CampaignCardWrapper({
	campaign,
	onStatusChange,
	onDelete,
	onDuplicate,
	router,
	organizationId,
}: {
	campaign: CampaignWithStats
	onStatusChange: (campaignId: string, status: CampaignStatus) => void
	onDelete: (campaignId: string) => void
	onDuplicate: (campaignId: string) => void
	router: ReturnType<typeof useRouter>
	organizationId: string
}) {
	const handleView = useCallback(() => {
		router.push(`/dashboard/${organizationId}/campaigns/${campaign.id}`)
	}, [campaign.id, router, organizationId])

	const handleManage = useCallback(() => {
		router.push(`/dashboard/${organizationId}/campaigns/${campaign.id}`)
	}, [campaign.id, router, organizationId])
	
	const handlePause = useCallback(() => {
		onStatusChange(campaign.id, "paused")
	}, [campaign.id, onStatusChange])
	
	const handleResume = useCallback(() => {
		onStatusChange(campaign.id, "active")
	}, [campaign.id, onStatusChange])
	
	const handleEnd = useCallback(() => {
		onStatusChange(campaign.id, "ended")
	}, [campaign.id, onStatusChange])
	
	const handleComplete = useCallback(() => {
		onStatusChange(campaign.id, "completed")
	}, [campaign.id, onStatusChange])
	
	const handleArchive = useCallback(() => {
		onStatusChange(campaign.id, "archived")
	}, [campaign.id, onStatusChange])
	
	const handleCancel = useCallback(() => {
		onStatusChange(campaign.id, "cancelled")
	}, [campaign.id, onStatusChange])
	
	const handleDuplicate = useCallback(() => {
		onDuplicate(campaign.id)
	}, [campaign.id, onDuplicate])
	
	const handleEdit = useCallback(() => {
		router.push(`/dashboard/${organizationId}/campaigns/${campaign.id}/edit`)
	}, [campaign.id, router, organizationId])
	
	const handleDelete = useCallback(() => {
		onDelete(campaign.id)
	}, [campaign.id, onDelete])
	
	const handleSubmitForApproval = useCallback(() => {
		onStatusChange(campaign.id, "pending_approval")
	}, [campaign.id, onStatusChange])

	return (
		<CampaignCard
			campaign={campaign}
			onView={handleView}
			onManage={handleManage}
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

const statusTabs = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "pending_approval", label: "Pending" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
]

/**
 * Props for the CampaignsClient component
 */
export interface CampaignsClientProps {
	/** Initial status filter to apply */
	initialStatus?: string
	/** Initial campaign data to display */
	initialData?: {
		campaigns?: CampaignWithStats[]
		data?: CampaignWithStats[]
		total?: number
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
	const params = useParams<{ organizationId: string }>()
	const organizationId = params.organizationId
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [searchQuery, setSearchQuery] = useState("")
	const [debouncedQuery, setDebouncedQuery] = useState("")
	const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	// URL-based multi-tenancy: get organization from list using URL param
	const { data: orgsData } = useOrganizations()
	const organization = orgsData?.organizations?.find(org => org.id === organizationId) || null
	const isApproved = organization?.approvalStatus === "approved"

	// nuqs: URL state management for filters
	const [searchParams, setSearchParams] = useCampaignSearchParams()
	const statusFilter = searchParams.status || initialStatus

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery)
		}, 300)
		return () => clearTimeout(timer)
	}, [searchQuery])

	// Use initialData which is passed from server component - type-safe
	const campaignsData: CampaignWithStats[] = (initialData?.campaigns ?? initialData?.data ?? []) as CampaignWithStats[]

	// Search hook - only active when there's a search query
	const { data: searchResults, isLoading: isSearching } = useSearchCampaigns(organizationId, {
		q: debouncedQuery,
		status: statusFilter !== "all" ? (statusFilter as CampaignStatus) : undefined,
	})

	// Use server data first, fallback to search results
	const isSearchActive = debouncedQuery.length >= 2
	const campaigns: CampaignWithStats[] = isSearchActive
		? (searchResults?.data ?? []) as CampaignWithStats[]
		: campaignsData

	// Stable reference time to avoid re-renders
	const referenceTime = useMemo(() => Date.now(), [])

	// Calculate stats from campaigns
	const stats = {
		total: campaigns.length,
		active: campaigns.filter((c) => c.status === "active").length,
		endingSoon: campaigns.filter((c) => {
			if (c.status !== "active" || !c.endDate) return false
			const daysUntilEnd = Math.ceil(
				(new Date(c.endDate).getTime() - referenceTime) / (1000 * 60 * 60 * 24)
			)
			return daysUntilEnd <= 7 && daysUntilEnd > 0
		}).length,
		draft: campaigns.filter((c) => c.status === "draft").length,
		pending: campaigns.filter((c) => c.status === "pending_approval").length,
		completed: campaigns.filter((c) => c.status === "completed").length,
		totalEnrollments: campaigns.reduce((sum, c) => sum + (c.currentEnrollments || 0), 0),
		totalPayout: campaigns.reduce((sum, c) => sum + (c.totalPayout || 0), 0),
	}

	const handleStatusChange = useCallback((campaignId: string, status: CampaignStatus) => {
		startTransition(async () => {
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

			await updateCampaignStatus({ id: campaignId, action })
			// Invalidate campaigns queries to refetch updated data
			queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
			queryClient.invalidateQueries({ queryKey: campaignKeys.detail(organizationId, campaignId) })
			router.refresh()
		})
	}, [queryClient, router, organizationId])

	const handleDelete = useCallback((campaignId: string) => {
		setDeletingCampaignId(campaignId)
		setIsDeleteModalOpen(true)
	}, [])

	const confirmDeleteCampaign = useCallback(async () => {
		if (!deletingCampaignId) return

		startTransition(async () => {
			try {
				await deleteCampaign({ id: deletingCampaignId })
				toast.success("Campaign deleted successfully")
				setIsDeleteModalOpen(false)
				// Invalidate campaigns queries to refetch updated list
				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				queryClient.invalidateQueries({ queryKey: campaignKeys.detail(organizationId, deletingCampaignId) })
				router.refresh()
			} catch (error) {
				toast.error(getErrorMessage(error, "An error occurred while deleting campaign"))
			} finally {
				setDeletingCampaignId(null)
			}
		})
	}, [deletingCampaignId, queryClient, router, organizationId])

		const handleDuplicate = useCallback((campaignId: string) => {
		startTransition(async () => {
			try {
				const result = await duplicateCampaign({ id: campaignId, organizationId })
				// Invalidate campaigns queries to show new campaign
				queryClient.invalidateQueries({ queryKey: campaignKeys.lists(organizationId) })
				if (result?.data?.id) {
					router.push(`/dashboard/${organizationId}/campaigns/${result.data.id}`)
				}
				router.refresh()
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to duplicate campaign"))
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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
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
										onClick={() => router.push(`/dashboard/${organizationId}/campaigns/create`)}
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

				{/* Stats Overview */}
				<div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
					<div className="flex items-center gap-2.5 rounded-xl bg-bg-white-0 p-2.5 sm:p-3 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 transition-colors shrink-0">
							<Megaphone weight="duotone" className="size-3.5 sm:size-4" />
						</div>
						<div className="min-w-0">
							<span className="block text-paragraph-xs text-text-soft-400 truncate">Total</span>
							<span className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">
								{stats.total}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl bg-bg-white-0 p-2.5 sm:p-3 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-success-lighter text-success-base transition-colors shrink-0">
							<Play weight="fill" className="size-3.5 sm:size-4" />
						</div>
						<div className="min-w-0">
							<span className="block text-paragraph-xs text-text-soft-400 truncate">Active</span>
							<span className="text-label-md sm:text-label-lg text-success-base font-semibold">
								{stats.active}
							</span>
						</div>
					</div>
					<div
						className={cn(
							"flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 ring-1 ring-inset transition-all duration-200 hover:shadow-sm",
							stats.endingSoon > 0
								? "bg-warning-lighter/50 ring-warning-base/20 hover:ring-warning-base/40"
								: "bg-bg-white-0 ring-stroke-soft-200 hover:ring-stroke-sub-300"
						)}
					>
						<div
							className={cn(
								"flex size-8 sm:size-9 items-center justify-center rounded-lg shrink-0",
								stats.endingSoon > 0
									? "bg-warning-base text-white"
									: "bg-bg-weak-50 text-text-sub-600"
							)}
						>
							<Clock weight="fill" className="size-3.5 sm:size-4" />
						</div>
						<div className="min-w-0">
							<span className="block text-paragraph-xs text-text-soft-400 truncate">Ending Soon</span>
							<span
								className={cn(
									"text-label-md sm:text-label-lg font-semibold",
									stats.endingSoon > 0 ? "text-warning-base" : "text-text-soft-400"
								)}
							>
								{stats.endingSoon}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl bg-bg-white-0 p-2.5 sm:p-3 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-information-lighter text-information-base transition-colors shrink-0">
							<User weight="fill" className="size-3.5 sm:size-4" />
						</div>
						<div className="min-w-0">
							<span className="block text-paragraph-xs text-text-soft-400 truncate">Enrollments</span>
							<span className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">
								{stats.totalEnrollments.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Search and Status Filter */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Search Input */}
					<div className="relative w-full sm:w-72">
						<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" />
						<input
							type="text"
							placeholder="Search campaigns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-9 pl-9 pr-8 rounded-lg bg-bg-white-0 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 ring-1 ring-inset ring-stroke-soft-200 focus:outline-none focus:ring-2 focus:ring-primary-base transition-shadow"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-weak-50 text-text-soft-400 hover:text-text-sub-600 transition-colors"
							>
								<X className="size-3.5" />
							</button>
						)}
						{isSearching && (
							<div className="absolute right-8 top-1/2 -translate-y-1/2">
								<div className="size-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
							</div>
						)}
					</div>

					{/* Status Filter */}
					<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
						<div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
							{statusTabs.map((tab) => {
								const count = getStatusCount(tab.value)
								const isActive = statusFilter === tab.value
								return (
									<button
										type="button"
										key={tab.value}
										onClick={() => handleTabChange(tab.value)}
										className={cn(
											"inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-label-xs sm:text-label-sm font-medium transition-all duration-200 whitespace-nowrap",
											isActive
												? "bg-primary-base text-white shadow-sm"
												: "bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 active:scale-95"
										)}
									>
										{tab.label}
										<span
											className={cn(
												"inline-flex items-center justify-center size-4 sm:size-5 rounded-full text-[10px] sm:text-label-xs font-medium",
												isActive ? "bg-white/20 text-white" : "bg-bg-soft-200 text-text-sub-600"
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

				{/* Campaign Tips */}
				{campaigns.length > 0 && statusFilter === "all" && (
					<div className="hidden sm:block">
						<Callout variant="tip" size="sm" dismissible>
							<strong>Tip:</strong> Set clear campaign goals and deadlines to maximize enrollment
							quality.
						</Callout>
					</div>
				)}

				{/* Campaigns Grid */}
				{campaigns.length === 0 ? (
					statusFilter === "all" ? (
						<NoCampaignsEmptyState organizationId={organizationId} />
					) : (
						<div className="p-8 sm:p-12">
							<div className="text-center">
								<Megaphone weight="duotone" className="size-12 mx-auto mb-4 text-text-soft-400" />
								<h3 className="text-label-lg text-text-strong-950 mb-2">
									No campaigns with "{statusTabs.find((t) => t.value === statusFilter)?.label}"
									status
								</h3>
								<p className="text-paragraph-sm text-text-sub-600 mb-6">
									Try selecting a different status filter or create a new campaign.
								</p>
								<Button.Root variant="primary" asChild>
									<Link href={`/dashboard/${organizationId}/campaigns/create`}>
										<Button.Icon>
											<Plus className="size-5" />
										</Button.Icon>
										Create Campaign
									</Link>
								</Button.Root>
							</div>
						</div>
					)
				) : (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 items-stretch">
						{campaigns.map((campaign: CampaignWithStats) => (
							<CampaignCardWrapper
								key={campaign.id}
								campaign={campaign}
								onStatusChange={handleStatusChange}
								onDelete={handleDelete}
								onDuplicate={handleDuplicate}
								router={router}
								organizationId={organizationId}
							/>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				variant="danger"
				title="Delete Campaign"
				description="Are you sure you want to delete this campaign? This action cannot be undone. All associated enrollments will be affected."
				confirmLabel="Delete Campaign"
				cancelLabel="Cancel"
				onConfirm={confirmDeleteCampaign}
				isLoading={isPending}
			/>
		</Tooltip.Provider>
	)
}
