"use client"

import { memo, useState, useEffect, useCallback, useMemo, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as Button from "@/components/ui/primitives/button"
import * as Badge from "@/components/ui/data-display/badge"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { Tracker } from "@/components/ui/data-display/tracker"
import { getAvatarColor } from "@/utils/avatar-color"
import { THRESHOLDS } from "@/lib/types/constants"
import {
	MagnifyingGlass,
	Check,
	X,
	DownloadSimple,
	ListChecks,
	SquaresFour,
	ArrowRight,
	Warning,
	CaretUp,
	CaretDown,
	ArrowsDownUp,
	CaretLeft,
	CaretRight,
} from "@phosphor-icons/react"
import { cn } from "@/utils/cn"
import { formatCurrency, formatDateMedium } from "@/lib/utils/format"
import { useEnrollmentSearchParams } from "@/hooks"
import { type Enrollment, type EnrollmentStatus } from "@/features/enrollments"
import { useDebounceValue, useLocalStorage } from "usehooks-ts"
import { exportEnrollments } from "@/lib/utils/excel"
import { bulkUpdateEnrollments } from "@/features/enrollments"
import { useOrganizationContext } from "@/contexts/organization-context"
import type { enrollments } from "@/lib/api/encore-client"
import { CalloutWithActions } from "@/components/ui/feedback/callout"
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
import * as Table from "@/components/ui/data-display/table"
import * as Select from "@/components/ui/forms/select"
import type { campaigns } from "@/lib/api/encore-client"

// Helper functions - use stable date reference to avoid re-renders
const getTimeAgo = (date: Date | string, referenceTime: number): string => {
	const diffMs = referenceTime - new Date(date).getTime()
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	if (diffHours < 1) return "Just now"
	if (diffHours < 24) return `${diffHours}h ago`
	const diffDays = Math.floor(diffHours / 24)
	if (diffDays === 1) return "1 day ago"
	return `${diffDays} days ago`
}

const isOverdue = (date: Date | string, referenceTime: number): boolean => {
	const diffMs = referenceTime - new Date(date).getTime()
	return diffMs > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS * 60 * 60 * 1000
}

const statusTabs = [
	{ value: "all", label: "All" },
	{ value: "awaiting_review", label: "Pending" },
	{ value: "changes_requested", label: "Changes" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
]

const getStatusBadgeStatus = (status: EnrollmentStatus) => {
	switch (status) {
		case "approved":
			return "completed" as const
		case "awaiting_review":
		case "awaiting_submission":
		case "changes_requested":
			return "pending" as const
		case "permanently_rejected":
		case "withdrawn":
		case "expired":
			return "failed" as const
		default:
			return "disabled" as const
	}
}

const getStatusLabel = (status: EnrollmentStatus) => {
	switch (status) {
		case "awaiting_review":
			return "Pending"
		case "awaiting_submission":
			return "Awaiting"
		case "changes_requested":
			return "Changes"
		case "approved":
			return "Approved"
		case "permanently_rejected":
			return "Rejected"
		case "withdrawn":
			return "Withdrawn"
		case "expired":
			return "Expired"
		default:
			return status
	}
}

/**
 * Props for the EnrollmentsClient component
 */
export interface EnrollmentsClientProps {
	/** Initial status filter to apply */
	initialStatus?: string
	/** Initial campaign filter to apply */
	initialCampaign?: string
	/** Initial enrollment data to display */
	initialData?: {
		enrollments: Enrollment[]
		data?: Enrollment[]
		total?: number
		stats?: {
			total: number
			pending: number
			overdue: number
			approved: number
			rejected: number
			totalValue: number
		}
	}
	/** Available campaigns for filtering */
	campaigns?: campaigns.CampaignWithStats[]
}

/**
 * EnrollmentsClient Component
 * 
 * Displays and manages enrollments with filtering, searching, and bulk actions.
 * Supports status filtering, campaign filtering, search, export, and bulk approval/rejection.
 * 
 * @param props - Component props
 * @param props.initialStatus - Initial status filter (default: "all")
 * @param props.initialCampaign - Initial campaign filter (default: "")
 * @param props.initialData - Initial enrollment data to display
 * @param props.campaigns - Available campaigns for filtering
 * @returns Enrollments management interface
 */
export function EnrollmentsClient({
	initialStatus = "all",
	initialCampaign = "",
	initialData,
	campaigns = [],
}: EnrollmentsClientProps) {
	const router = useRouter()
	
	// Industry Standard: Always use context, never props
	const { hasOrganization, isLoading: isOrgLoading } = useOrganizationContext()
	
	// Stable reference time to avoid re-renders from Date.now()
	const referenceTime = useMemo(() => Date.now(), [])
	
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [viewMode, setViewMode] = useState<"list" | "compact">("list")
	const [isBulkLoading, setIsBulkLoading] = useState(false)

	// Dismiss onboarding alert state (persisted in localStorage)
	const [dismissedOnboardingAlert, setDismissedOnboardingAlert] = useLocalStorage<boolean>(
		"enrollments-onboarding-alert-dismissed",
		false
	)

	// nuqs: URL state management for filters
	const [searchParams, setSearchParams] = useEnrollmentSearchParams()
	const statusFilter = searchParams.status || initialStatus
	const campaignFilter = searchParams.campaign || initialCampaign
	const [search, setSearch] = useState(searchParams.search)

	// Industry Standard: Check loading state first
	if (isOrgLoading) {
		return (
			<div className="space-y-5 sm:space-y-6">
				<div className="animate-pulse">
					<div className="h-8 w-48 bg-bg-soft-200 rounded mb-4" />
					<div className="h-40 bg-bg-soft-200 rounded-xl" />
				</div>
			</div>
		)
	}

	// Show onboarding alert if no organization
	const showOnboardingAlert = !hasOrganization && !dismissedOnboardingAlert

	// Memoized handlers for onboarding alert
	const handleDismissOnboardingAlert = useCallback(() => {
		setDismissedOnboardingAlert(true)
	}, [setDismissedOnboardingAlert])

	const handleStartOnboarding = useCallback(() => {
		router.push("/onboarding")
	}, [router])

	// If no organization, show alert
	if (!hasOrganization) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* ONBOARDING ALERT */}
				{showOnboardingAlert && (
					<CalloutWithActions
						variant="warning"
						title="Complete Your Organization Setup"
						dismissible
						onDismiss={handleDismissOnboardingAlert}
						actions={
							<>
								<Button.Root
									variant="primary"
									size="small"
									onClick={handleStartOnboarding}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									Start Onboarding
								</Button.Root>
								<Button.Root
									variant="ghost"
									size="small"
									onClick={handleDismissOnboardingAlert}
								>
									Maybe Later
								</Button.Root>
							</>
						}
					>
						To view and manage enrollments, you need to complete your organization setup. This will only take a few minutes.
					</CalloutWithActions>
				)}

				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Enrollments</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage enrollment submissions
						</p>
					</div>
				</div>

				{/* EMPTY STATE */}
				{dismissedOnboardingAlert && (
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-8 sm:p-12 text-center">
						<div className="max-w-md mx-auto space-y-4">
							<div className="flex justify-center">
								<div className="flex size-16 items-center justify-center rounded-full bg-warning-lighter">
									<Warning weight="duotone" className="size-8 text-warning-base" />
								</div>
							</div>
							<div>
								<h3 className="text-title-h6 text-text-strong-950">Organization Setup Required</h3>
								<p className="text-paragraph-sm text-text-sub-600 mt-2">
									Complete your organization setup to view and manage enrollments.
								</p>
							</div>
							<Button.Root variant="primary" size="medium" onClick={handleStartOnboarding}>
								<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
								Start Onboarding
							</Button.Root>
						</div>
					</div>
				)}
			</div>
		)
	}

	// React Query hook removed - using server data via initialData
	// const { data } = useEnrollmentsData(statusFilter)

	// Use server data directly - type-safe with Encore types
	const enrollmentsList: enrollments.EnrollmentWithRelations[] =
		initialData?.enrollments ?? initialData?.data ?? []
	const allEnrollments = enrollmentsList
	const stats = initialData?.stats ?? {
		total: enrollmentsList.length,
		pending: 0,
		overdue: 0,
		approved: 0,
		rejected: 0,
		totalValue: 0,
	}

	// usehooks-ts: Debounce search input to avoid excessive URL updates
	const [debouncedSearch] = useDebounceValue(search, 300)

	// Sync debounced search to URL
	useEffect(() => {
		if (debouncedSearch !== searchParams.search) {
			setSearchParams({ search: debouncedSearch, page: 1 })
		}
	}, [debouncedSearch, searchParams.search, setSearchParams])

	// Memoized handlers for search and view mode
	const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value)
	}, [])

	const handleSetViewModeList = useCallback(() => {
		setViewMode("list")
	}, [])

	const handleSetViewModeCompact = useCallback(() => {
		setViewMode("compact")
	}, [])

	// Excel export handler
	const handleExport = useCallback(() => {
		try {
			exportEnrollments(allEnrollments)
			toast.success("Enrollments exported to Excel")
		} catch {
			toast.error("Failed to export enrollments")
		}
	}, [allEnrollments])

	// Bulk action handlers
	const handleBulkApprove = useCallback(async () => {
		if (selectedIds.length === 0) return
		setIsBulkLoading(true)
		try {
			const result = await bulkUpdateEnrollments(selectedIds, "approved")
			if (result.success) {
				toast.success(
					`${result.data.updatedCount} enrollment${result.data.updatedCount !== 1 ? "s" : ""} approved`
				)
				setSelectedIds([])
				router.refresh()
			} else {
				toast.error(result.error instanceof Error ? result.error.message : "Failed to approve enrollments")
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
		} finally {
			setIsBulkLoading(false)
		}
	}, [selectedIds, router])

	const handleBulkReject = useCallback(async () => {
		if (selectedIds.length === 0) return
		setIsBulkLoading(true)
		try {
			const result = await bulkUpdateEnrollments(selectedIds, "rejected")
			if (result.success) {
				toast.success(
					`${result.data.updatedCount} enrollment${result.data.updatedCount !== 1 ? "s" : ""} rejected`
				)
				setSelectedIds([])
				router.refresh()
			} else {
				toast.error(result.error instanceof Error ? result.error.message : "Failed to reject enrollments")
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
		} finally {
			setIsBulkLoading(false)
		}
	}, [selectedIds, router])

	// Filter enrollments by status
	const statusFilteredEnrollments = useMemo(() => {
		if (statusFilter === "all") return allEnrollments
		return allEnrollments.filter((e) => e.status === statusFilter)
	}, [allEnrollments, statusFilter])

	// Filter by campaign
	const campaignFilteredEnrollments = useMemo(() => {
		if (!campaignFilter || campaignFilter === "") return statusFilteredEnrollments
		return statusFilteredEnrollments.filter((e) => e.campaignId === campaignFilter)
	}, [statusFilteredEnrollments, campaignFilter])

	// Filter by search
	const filteredEnrollments = useMemo(() => {
		if (!search) return campaignFilteredEnrollments

		const searchLower = (search || "").toLowerCase()
		return campaignFilteredEnrollments.filter(
			(e) =>
				(e.shopperId || "").toLowerCase().includes(searchLower) ||
				(e.orderId || "").toLowerCase().includes(searchLower)
		)
	}, [campaignFilteredEnrollments, search])

	// Tracker data
	const trackerData = useMemo(() => {
		return allEnrollments.map((e: enrollments.EnrollmentWithRelations) => {
			switch (e.status) {
				case "approved":
					return { status: "success" as const, tooltip: e.orderId || e.shopperId }
				case "awaiting_review":
				case "awaiting_submission":
				case "changes_requested":
					return { status: "warning" as const, tooltip: e.orderId || e.shopperId }
				case "permanently_rejected":
				case "withdrawn":
				case "expired":
					return { status: "error" as const, tooltip: e.orderId || e.shopperId }
				default:
					return { status: "neutral" as const, tooltip: e.orderId || e.shopperId }
			}
		})
	}, [allEnrollments])

	// nuqs: Update URL when tab changes
	const handleTabChange = useCallback((value: string) => {
		setSearchParams({ status: value as typeof statusFilter, page: 1 })
	}, [setSearchParams, statusFilter])

	// Handle campaign filter change
	const handleCampaignChange = useCallback((value: string) => {
		setSearchParams({ campaign: value || "", page: 1 })
	}, [setSearchParams])

	const getStatusCount = (status: string) => {
		if (status === "all") return allEnrollments.length
		return allEnrollments.filter((e) => e.status === status).length
	}

	// Use centralized formatting functions from lib/format.ts directly
	const formatDate = (date: Date | string): string => formatDateMedium(date)

	// Table columns definition
	const columns: ColumnDef<enrollments.EnrollmentWithRelations>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => {
					const selectableCount = filteredEnrollments.filter(
						(e) => e.status === "awaiting_review"
					).length
					const selectedCount = selectedIds.length
					return (
						<Checkbox.Root
							checked={selectableCount > 0 && selectedCount === selectableCount}
							onCheckedChange={(checked) => {
								if (checked) {
									const selectableIds = filteredEnrollments
										.filter((e) => e.status === "awaiting_review")
										.map((e) => e.id)
									setSelectedIds(selectableIds)
								} else {
									setSelectedIds([])
								}
							}}
							aria-label="Select all"
						/>
					)
				},
				cell: ({ row }) => {
					const canSelect = row.original.status === "awaiting_review"
					return (
						<Checkbox.Root
							checked={selectedIds.includes(row.original.id)}
							onCheckedChange={(checked) => {
								if (checked) {
									setSelectedIds([...selectedIds, row.original.id])
								} else {
									setSelectedIds(selectedIds.filter((id) => id !== row.original.id))
								}
							}}
							disabled={!canSelect}
							aria-label="Select row"
						/>
					)
				},
				enableSorting: false,
				enableHiding: false,
				size: 50,
			},
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
					const displayName = enrollment.orderId || enrollment.shopperId.slice(0, 8)
					return (
						<div className="flex items-center gap-3">
							<Avatar.Root size="32" color={getAvatarColor(displayName)}>
								{displayName.charAt(0).toUpperCase()}
							</Avatar.Root>
							<div>
								<div className="text-label-sm text-text-strong-950 font-medium">
									{enrollment.orderId || `#${enrollment.shopperId.slice(0, 8)}`}
								</div>
								<div className="text-paragraph-xs text-text-sub-600">
									{enrollment.shopperId.slice(0, 8)}...
								</div>
							</div>
						</div>
					)
				},
				size: 200,
			},
			{
				accessorKey: "campaignId",
				header: "Campaign",
				cell: ({ row }) => {
					const campaignId = row.original.campaignId
					return (
						<div className="text-paragraph-sm text-text-strong-950">
							{campaignId.slice(0, 12)}...
						</div>
					)
				},
				size: 150,
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
						enrollment.status === "awaiting_review" && isOverdue(enrollment.createdAt, referenceTime)
					return (
						<div className="flex items-center gap-2">
							<StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
								{getStatusLabel(enrollment.status)}
							</StatusBadge.Root>
							{enrollmentOverdue && (
								<Badge.Root color="red" variant="light" size="small">
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
								{formatDate(row.original.createdAt)}
							</div>
							<div className="text-paragraph-xs text-text-sub-600">
								{getTimeAgo(row.original.createdAt, referenceTime)}
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
							onClick={() => router.push(`/dashboard/enrollments/${row.original.id}`)}
						>
							View
							<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
						</Button.Root>
					)
				},
				enableSorting: false,
				size: 100,
			},
		],
		[selectedIds, filteredEnrollments, router, formatCurrency, formatDate, getTimeAgo, referenceTime]
	)

	// Table state
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

	// Initialize table
	const table = useReactTable({
		data: filteredEnrollments,
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
		<Tooltip.Provider>
			<div className="space-y-5 sm:space-y-6">
				{/* Overdue Alert */}
				{stats.overdue > 0 && (
					<div className="flex items-center gap-3 rounded-xl bg-linear-to-r from-error-lighter to-error-lighter/50 p-3 ring-1 ring-inset ring-error-base/20">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-error-base text-white">
							<Warning weight="fill" className="size-4" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-label-sm text-error-base font-medium">
								{stats.overdue} enrollment{stats.overdue > 1 ? "s" : ""} overdue
							</p>
							<p className="text-paragraph-xs text-text-sub-600 hidden sm:block">
								Reviews pending for more than 48 hours
							</p>
						</div>
						<Button.Root
							variant="error"
							size="xsmall"
							onClick={() => handleTabChange("awaiting_review")}
							className="shrink-0"
						>
							Review Now
						</Button.Root>
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Enrollments</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Review and manage campaign enrollments
						</p>
					</div>
					<Tooltip.Root>
						<Tooltip.Trigger asChild>
							<Button.Root
								variant="neutral"
								size="small"
								onClick={handleExport}
								className="shrink-0"
							>
								<Button.Icon><DownloadSimple className="size-5" /></Button.Icon>
								<span className="hidden sm:inline">Export</span>
							</Button.Root>
						</Tooltip.Trigger>
						<Tooltip.Content>Export enrollments to Excel</Tooltip.Content>
					</Tooltip.Root>
				</div>

				{/* Stats + Tracker */}
				<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 sm:p-4 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-paragraph-xs text-text-sub-600">
						<span className="flex items-center gap-1">
							<span className="size-2 rounded-full bg-success-base" /> Approved
						</span>
						<span className="flex items-center gap-1">
							<span className="size-2 rounded-full bg-warning-base" /> Pending / Changes
						</span>
						<span className="flex items-center gap-1">
							<span className="size-2 rounded-full bg-error-base" /> Rejected
						</span>
					</div>
					<Tracker data={trackerData} size="lg" className="mb-4" />
					<div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-5 pt-3 sm:pt-4 border-t border-stroke-soft-200">
						<div>
							<span className="text-paragraph-xs text-text-soft-400 block">Total</span>
							<span className="text-label-lg text-text-strong-950 font-semibold">
								{stats.total}
							</span>
						</div>
						<div>
							<span className="text-paragraph-xs text-text-soft-400 block">Pending</span>
							<span className="text-label-lg text-warning-base font-semibold">{stats.pending}</span>
						</div>
						<div>
							<span className="text-paragraph-xs text-text-soft-400 block">Overdue</span>
							<span
								className={cn(
									"text-label-lg font-semibold",
									stats.overdue > 0 ? "text-error-base" : "text-text-soft-400"
								)}
							>
								{stats.overdue}
							</span>
						</div>
						<div>
							<span className="text-paragraph-xs text-text-soft-400 block">Approved</span>
							<span className="text-label-lg text-success-base font-semibold">
								{stats.approved}
							</span>
						</div>
						<div className="col-span-2 sm:col-span-1">
							<span className="text-paragraph-xs text-text-soft-400 block">Total Value</span>
							<span className="text-label-lg text-text-strong-950 font-semibold">
								{formatCurrency(stats.totalValue)}
							</span>
						</div>
					</div>
				</div>

				{/* Filters Row */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Status Tabs */}
					<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
						<div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-1">
							{statusTabs.map((tab) => {
								const count = getStatusCount(tab.value)
								const isActive = statusFilter === tab.value
								return (
									<button
										type="button"
										key={tab.value}
										onClick={() => handleTabChange(tab.value)}
										className={cn(
											"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-xs sm:text-label-sm font-medium transition-all duration-200 whitespace-nowrap",
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

					{/* Campaign Filter + Search + View Toggle */}
					<div className="flex items-center gap-2">
						{/* Campaign Filter */}
						<Select.Root value={campaignFilter || ""} onValueChange={handleCampaignChange}>
							<Select.Trigger className="w-[180px] sm:w-[200px]">
								<Select.Value placeholder="All Campaigns" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">All Campaigns</Select.Item>
								{campaigns.map((campaign) => (
									<Select.Item key={campaign.id} value={campaign.id}>
										{campaign.title}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>

						<div className="relative flex-1 sm:flex-none">
							<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" />
							<input
								type="text"
								placeholder="Search..."
								value={search}
								onChange={handleSearchChange}
								className="w-full sm:w-40 pl-9 pr-3 py-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base"
							/>
						</div>
						<div className="flex items-center gap-1 p-1 rounded-lg bg-bg-weak-50">
							<button
								type="button"
								onClick={handleSetViewModeList}
								className={cn(
									"p-1.5 rounded transition-all duration-200",
									viewMode === "list"
										? "bg-bg-white-0 shadow-sm"
										: "hover:bg-bg-soft-200 active:scale-95"
								)}
							>
								<ListChecks className="size-4 text-text-sub-600" />
							</button>
							<button
								type="button"
								onClick={handleSetViewModeCompact}
								className={cn(
									"p-1.5 rounded transition-all duration-200",
									viewMode === "compact"
										? "bg-bg-white-0 shadow-sm"
										: "hover:bg-bg-soft-200 active:scale-95"
								)}
							>
								<SquaresFour className="size-4 text-text-sub-600" />
							</button>
						</div>
					</div>
				</div>

				{/* Bulk Actions */}
				{selectedIds.length > 0 && (
					<div className="flex items-center gap-3 p-3 rounded-xl bg-primary-lighter">
						<span className="text-label-sm text-primary-base">{selectedIds.length} selected</span>
						<div className="flex items-center gap-2 ml-auto">
							<Button.Root
								variant="primary"
								size="xsmall"
								onClick={handleBulkApprove}
								disabled={isBulkLoading}
							>
								<Button.Icon><Check className="size-5" /></Button.Icon>
								{isBulkLoading ? "Processing..." : "Approve All"}
							</Button.Root>
							<Button.Root
								variant="error"
								size="xsmall"
								onClick={handleBulkReject}
								disabled={isBulkLoading}
							>
								<Button.Icon><X className="size-5" /></Button.Icon>
								Reject All
							</Button.Root>
						</div>
					</div>
				)}

				{/* Enrollments Table */}
				{viewMode === "list" ? (
					<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
						<div className="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									{table.getHeaderGroups().map((headerGroup) => (
										<Table.Row key={headerGroup.id} className="hover:bg-transparent">
											{headerGroup.headers.map((header) => (
												<Table.Head
													key={header.id}
													className={cn(
												header.getSize() !== 150 && "w-[var(--column-width)]",
														header.id === "select" && "w-12 px-4",
														header.id === "actions" && "w-24",
														"first:pl-6 last:pr-6"
											)}
											style={
												header.getSize() !== 150
													? ({ "--column-width": `${header.getSize()}px` } as React.CSSProperties)
													: undefined
											}
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
												data-state={selectedIds.includes(row.original.id) && "selected"}
												className={cn(
													"cursor-pointer transition-colors group",
													selectedIds.includes(row.original.id) && "bg-primary-lighter/30",
													row.original.status === "awaiting_review" &&
														isOverdue(row.original.createdAt, referenceTime) &&
														"bg-error-lighter/20",
													"hover:bg-bg-weak-50"
												)}
												onClick={() => router.push(`/dashboard/enrollments/${row.original.id}`)}
											>
												{row.getVisibleCells().map((cell) => (
													<Table.Cell
														key={cell.id}
														className={cn(
															"first:pl-6 last:pr-6",
															cell.column.id === "select" && "w-12"
														)}
														onClick={(e) => {
															// Prevent navigation when clicking checkbox or action button
															if (cell.column.id === "select" || cell.column.id === "actions") {
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
											icon={<Check className="size-8 text-text-soft-400" />}
											title="No enrollments found"
											description="No enrollments match your current filters."
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
									of{" "}
									<span className="font-medium text-text-strong-950">
										{filteredEnrollments.length}
									</span>{" "}
									enrollments
								</div>
								<div className="flex items-center gap-2">
									<Button.Root
										variant="ghost"
										size="xsmall"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
									>
										<Button.Icon><CaretLeft className="size-5" /></Button.Icon>
										Previous
									</Button.Root>
									<div className="text-paragraph-sm text-text-sub-600 px-3">
										Page{" "}
										<span className="font-medium text-text-strong-950">
											{table.getState().pagination.pageIndex + 1}
										</span>{" "}
										of{" "}
										<span className="font-medium text-text-strong-950">{table.getPageCount()}</span>
									</div>
									<Button.Root
										variant="ghost"
										size="xsmall"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
									>
										Next
										<Button.Icon><CaretRight className="size-5" /></Button.Icon>
									</Button.Root>
								</div>
							</div>
						)}
					</div>
				) : (
					<>
						{filteredEnrollments.length === 0 ? (
							<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-12 text-center">
								<div className="max-w-md mx-auto space-y-4">
									<div className="flex justify-center">
										<div className="flex size-16 items-center justify-center rounded-full bg-bg-soft-200">
											<Check weight="duotone" className="size-8 text-text-soft-400" />
										</div>
									</div>
									<div>
										<h3 className="text-title-h6 text-text-strong-950">No enrollments found</h3>
										<p className="text-paragraph-sm text-text-sub-600 mt-2">
											{search || campaignFilter || statusFilter !== "all"
												? "No enrollments match your current filters. Try adjusting your search or filters."
												: "Enrollments will appear here once shoppers start submitting."}
										</p>
									</div>
									{(search || campaignFilter || statusFilter !== "all") && (
										<Button.Root
											variant="neutral"
											size="medium"
											onClick={() => {
												setSearch("")
												handleCampaignChange("")
												handleTabChange("all")
											}}
										>
											Clear Filters
										</Button.Root>
									)}
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{filteredEnrollments.map((enrollment) => (
									<EnrollmentCardItem
										key={enrollment.id}
										enrollment={enrollment}
										formatCurrency={formatCurrency}
										onClick={() => router.push(`/dashboard/enrollments/${enrollment.id}`)}
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</Tooltip.Provider>
	)
}

// List view item
interface EnrollmentListItemProps {
	enrollment: Enrollment
	formatCurrency: (amount: number) => string
	selected: boolean
	onSelect: (checked: boolean) => void
	onClick: () => void
	referenceTime: number
}

const EnrollmentListItem = memo(function EnrollmentListItem({
	enrollment,
	formatCurrency,
	selected,
	onSelect,
	onClick,
	referenceTime,
}: EnrollmentListItemProps) {
	const canSelect = enrollment.status === "awaiting_review"
	const enrollmentOverdue =
		enrollment.status === "awaiting_review" && isOverdue(enrollment.createdAt, referenceTime)
	// Display ID or orderId as the primary identifier
	const displayName = enrollment.orderId || enrollment.shopperId.slice(0, 8)

	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-xl bg-bg-white-0 ring-1 ring-inset p-3 sm:p-4 transition-colors group",
				selected
					? "ring-primary-base bg-primary-lighter"
					: enrollmentOverdue
						? "ring-error-base/50 bg-error-lighter/30"
						: "ring-stroke-soft-200 hover:ring-stroke-sub-300"
			)}
		>
			{/* Checkbox */}
			<div className="w-5 shrink-0 flex items-center justify-center">
				{canSelect ? (
					<Checkbox.Root checked={selected} onCheckedChange={onSelect} />
				) : (
					<span className="size-2 rounded-full bg-transparent" />
				)}
			</div>

			{/* Clickable area */}
			<button
				type="button"
				onClick={onClick}
				className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 text-left"
			>
				{/* Avatar */}
				<div className="relative shrink-0">
					<Avatar.Root size="40" color={getAvatarColor(displayName)}>
						{displayName.charAt(0).toUpperCase()}
					</Avatar.Root>
				</div>

				{/* Main content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5 flex-wrap">
						<span className="text-label-sm text-text-strong-950 truncate">{displayName}</span>
						<StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
							{getStatusLabel(enrollment.status)}
						</StatusBadge.Root>
						{enrollmentOverdue && (
							<Badge.Root color="red" variant="light" size="small">
								<Badge.Icon as={Warning} weight="duotone" />
								Overdue
							</Badge.Root>
						)}
					</div>
					<div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600">
						<span className="truncate">Campaign: {enrollment.campaignId.slice(0, 8)}...</span>
						<span className="text-text-soft-400">•</span>
						<span className="text-text-soft-400">{getTimeAgo(enrollment.createdAt, referenceTime)}</span>
					</div>
				</div>

				{/* Value + Arrow */}
				<div className="flex items-center gap-2 sm:gap-4 shrink-0">
					<div className="text-right">
						<span className="text-label-sm sm:text-label-md text-text-strong-950 font-semibold block">
							{formatCurrency(enrollment.orderValue)}
						</span>
						<span className="text-paragraph-xs text-text-sub-600 hidden sm:block">
							{enrollment.orderId.slice(0, 12)}...
						</span>
					</div>
					<ArrowRight className="size-4 text-text-soft-400 group-hover:text-text-sub-600 transition-colors" />
				</div>
			</button>
		</div>
	)
})

// Card view item
interface EnrollmentCardItemProps {
	enrollment: Enrollment
	formatCurrency: (amount: number) => string
	onClick: () => void
}

const EnrollmentCardItem = memo(function EnrollmentCardItem({ enrollment, formatCurrency, onClick }: EnrollmentCardItemProps) {
	const displayName = enrollment.orderId || enrollment.shopperId.slice(0, 8)

	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full text-left rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 hover:bg-bg-weak-50 hover:ring-stroke-sub-300 transition-all duration-200 hover:shadow-sm"
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-3">
					<Avatar.Root size="40" color={getAvatarColor(displayName)} className="shrink-0">
						{displayName.charAt(0).toUpperCase()}
					</Avatar.Root>
					<div>
						<span className="text-label-sm text-text-strong-950 block truncate">{displayName}</span>
						<span className="text-paragraph-xs text-text-sub-600">
							Campaign: {enrollment.campaignId.slice(0, 8)}...
						</span>
					</div>
				</div>
				<StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
					{getStatusLabel(enrollment.status)}
				</StatusBadge.Root>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="rounded-lg bg-bg-weak-50 p-2">
					<span className="text-paragraph-xs text-text-soft-400 block">Order Value</span>
					<span className="text-label-sm text-text-strong-950 font-semibold">
						{formatCurrency(enrollment.orderValue)}
					</span>
				</div>
				<div className="rounded-lg bg-bg-weak-50 p-2">
					<span className="text-paragraph-xs text-text-soft-400 block">Order ID</span>
					<span className="text-label-sm text-text-strong-950">
						{enrollment.orderId.slice(0, 12)}...
					</span>
				</div>
			</div>
		</button>
	)
})
