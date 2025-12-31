"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import * as Button from "@/components/ui/primitives/button"
import {
	Plus,
	ArrowRight,
	Clock,
	CheckCircle,
	WarningCircle,
	Building,
} from "@phosphor-icons/react"
import { DISPLAY_LIMITS } from "@/lib/constants"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { toast } from "sonner"
import { OnboardingSetupCard } from "@/components/dashboard/empty-states"
import { CalloutWithActions, Callout } from "@/components/ui/feedback/callout"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/state"
import { useDashboard } from "@/hooks/shared/use-dashboard"
import { getHoursAgo } from "@/lib/utils/date"
import { useHydratedTime, useFormattedDate } from "@/hooks/ui"
import { routes } from "@/lib/routes"
import type { OrganizationListItem } from "@/features/organizations/types"

// Split components for better code splitting
import {
	DashboardSkeleton,
	DashboardMetrics,
	DashboardCampaignsSection,
	DashboardEnrollmentTrend,
	DashboardPriorityQueue,
	DashboardAlertBar,
} from "./components"

interface DashboardClientProps {
	organizationId: string
	/** Organization data fetched server-side - avoids client fetching all orgs */
	initialOrganization?: OrganizationListItem | null
	/** All organizations fetched server-side - for redirect logic */
	initialOrganizations?: OrganizationListItem[]
}

// URL-based multi-tenancy: organizationId from URL params
// Uses server-fetched org data to avoid client-side fetch of all orgs
export function DashboardClient({
	organizationId,
	initialOrganization,
	initialOrganizations = [],
}: DashboardClientProps) {
	const router = useRouter()
	const currentTime = useHydratedTime()
	const formattedDate = useFormattedDate()
	const [isResubmitting, setIsResubmitting] = useState(false)
	const [isRedirecting, setIsRedirecting] = useState(false)

	// Dismiss onboarding alert state (persisted in localStorage)
	// Using centralized storage key
	const [dismissedOnboardingAlert, setDismissedOnboardingAlert] = useLocalStorage<boolean>(
		STORAGE_KEYS.DASHBOARD_ONBOARDING_ALERT_DISMISSED,
		false
	)

	// Use server-fetched organization data (passed as props) - no client-side fetch needed
	const organizationsList = initialOrganizations
	const organization = initialOrganization as (OrganizationListItem & { gstVerified?: boolean }) | null | undefined
	const hasOrganization = !!organization

	// Simplified redirect logic - no state machine needed
	// Data is server-fetched, so we can determine redirect immediately
	useEffect(() => {
		if (hasOrganization || isRedirecting) return

		setIsRedirecting(true)

		// Find redirect target
		const approvedOrg = organizationsList.find(o => o.approvalStatus === "approved")
		if (approvedOrg) {
			router.replace(`/dashboard/${approvedOrg.id}`)
		} else {
			router.replace(routes.onboarding.root)
		}
	}, [hasOrganization, organizationsList, router, isRedirecting])

	// Fetch dashboard data using organizationId from URL
	const { data, isLoading: isDashboardLoading } = useDashboard({
		organizationId,
		days: 7,
		enabled: hasOrganization,
	})

	// Map pending enrollments with hours ago calculation (only after hydration)
	const pendingEnrollments = data?.pendingEnrollments
	const priorityEnrollments = useMemo(() => {
		if (!pendingEnrollments || !Array.isArray(pendingEnrollments)) return []
		const limit = DISPLAY_LIMITS.PRIORITY_ENROLLMENTS
		return pendingEnrollments.slice(0, limit).map((e) => {
			// Convert null to undefined for type compatibility with PriorityEnrollment
			const campaign = e.campaign ? {
				id: e.campaign.id,
				title: e.campaign.title,
				product: e.campaign.product ? {
					image: e.campaign.product.image ?? undefined,
				} : undefined,
			} : undefined

			return {
				id: e.id,
				orderId: e.orderId,
				orderValue: e.orderValue,
				orderValueDecimal: e.orderValueDecimal,
				createdAt: e.createdAt,
				hoursAgo: currentTime ? getHoursAgo(e.createdAt, currentTime) : 0,
				campaign,
				shopper: e.shopper ? { id: e.shopper.id, name: e.shopper.name } : undefined,
			}
		})
	}, [pendingEnrollments, currentTime])

	// Memoized event handlers - MUST be defined before early returns
	const handleDismissAlert = useCallback(() => {
		setDismissedOnboardingAlert(true)
	}, [setDismissedOnboardingAlert])

	const handleStartOnboarding = useCallback(() => {
		router.push(routes.onboarding.root)
	}, [router])

	// Show skeleton while redirecting or loading dashboard data
	const shouldShowSkeleton =
		isRedirecting ||                          // Actively redirecting
		(hasOrganization && isDashboardLoading)   // Org found, loading dashboard data

	if (shouldShowSkeleton) {
		return <DashboardSkeleton />
	}

	// Show onboarding alert if no organization
	const showOnboardingAlert = !hasOrganization && !dismissedOnboardingAlert

	// If no organization, show onboarding alert/empty state (don't wait for data)
	if (!hasOrganization) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* ONBOARDING ALERT */}
				{showOnboardingAlert && (
					<CalloutWithActions
						variant="warning"
						title="Complete Your Organization Setup"
						dismissible
						onDismiss={handleDismissAlert}
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
									onClick={handleDismissAlert}
								>
									Maybe Later
								</Button.Root>
							</>
						}
					>
						To access all dashboard features, create campaigns, and manage enrollments, you need to complete your organization setup. This will only take a few minutes.
					</CalloutWithActions>
				)}

				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 min-h-5">
							{formattedDate || <span className="invisible">Loading...</span>}
						</p>
					</div>
				</div>

				{/* EMPTY STATE */}
				{dismissedOnboardingAlert && (
					<OnboardingSetupCard
						variant="primary"
						onAction={handleStartOnboarding}
					/>
				)}
			</div>
		)
	}

	// If has organization but no data yet, show skeleton
	if (!data || !data.stats || !data.enrollmentDistribution) {
		return <DashboardSkeleton />
	}

	// At this point, data is guaranteed to be non-null
	const safeData = data

	// Transform API data to UI format - STRICT (no fallbacks, will fail if data is wrong)
	const wallet = {
		available: safeData.stats.walletBalance ?? 0,
		held: safeData.stats.heldAmount ?? 0,
		avgDailySpend: safeData.stats.avgDailySpend ?? 0,
		lowBalanceThreshold: safeData.stats.lowBalanceThreshold ?? 0,
	}

	const metrics = {
		activeCampaigns: safeData.stats.activeCampaigns ?? 0,
		pausedCampaigns: safeData.stats.pausedCampaigns ?? 0,
		endingSoon: safeData.stats.endingSoon ?? 0,
		pendingTotal: safeData.stats.pendingEnrollments ?? 0,
		pendingOverdue: safeData.stats.overdueEnrollments ?? 0,
		pendingHigh: safeData.stats.highValuePending ?? 0,
		totalEnrollments: safeData.enrollmentDistribution.total ?? 0,
		approvedCount: safeData.enrollmentDistribution.approved ?? 0,
		rejectedCount: safeData.enrollmentDistribution.rejected ?? 0,
		pendingCount: safeData.enrollmentDistribution.pending ?? 0,
		enrollmentsTrend: safeData.stats.enrollmentTrend ?? 0,
		approvalRateTrend: safeData.stats.approvalRateTrend ?? 0,
	}

	const enrollmentChartData = (safeData.enrollmentChart && Array.isArray(safeData.enrollmentChart))
		? safeData.enrollmentChart.map((d) => ({ value: d.enrollments ?? 0 }))
		: []

	// Map top campaigns - use product image from API (memoized)
	const topCampaigns = useMemo(() => {
		return (safeData.topCampaigns && Array.isArray(safeData.topCampaigns))
			? safeData.topCampaigns.slice(0, DISPLAY_LIMITS.TOP_CAMPAIGNS).map((c) => ({
				id: c.id,
				name: c.name,
				enrollments: c.enrollments,
				approvalRate: c.approvalRate,
				status: c.status,
				daysLeft: c.daysLeft,
				image: c.productImage ?? undefined,
			}))
			: []
	}, [safeData.topCampaigns])

	// Memoize calculations
	const approvalRate = useMemo(
		() => (metrics.totalEnrollments > 0
			? Math.round((metrics.approvedCount / metrics.totalEnrollments) * 100)
			: 0),
		[metrics.totalEnrollments, metrics.approvedCount]
	)
	const runwayDays = useMemo(
		() => (wallet.avgDailySpend > 0 ? Math.floor(wallet.available / wallet.avgDailySpend) : 0),
		[wallet.avgDailySpend, wallet.available]
	)
	const isLowBalance = useMemo(
		() => wallet.available < wallet.lowBalanceThreshold,
		[wallet.available, wallet.lowBalanceThreshold]
	)
	const hasOverdue = useMemo(
		() => metrics.pendingOverdue > 0,
		[metrics.pendingOverdue]
	)

	const trackerData = useMemo(
		() => [
			{ status: "success" as const, count: metrics.approvedCount },
			{ status: "warning" as const, count: metrics.pendingCount },
			{ status: "error" as const, count: metrics.rejectedCount },
		],
		[metrics.approvedCount, metrics.pendingCount, metrics.rejectedCount]
	)

	// If no organization, show minimal dashboard with alert
	if (!hasOrganization) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 min-h-5">
							{formattedDate || <span className="invisible">Loading...</span>}
						</p>
					</div>
				</div>

				{/* EMPTY STATE - No organization */}
				<OnboardingSetupCard
					variant="warning"
					onAction={handleStartOnboarding}
				/>
			</div>
		)
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* ONBOARDING ALERT - Show if no organization */}
			{showOnboardingAlert && (
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 sm:p-8">
					<div className="flex items-start gap-4">
						<div className="flex shrink-0">
							<div className="flex size-12 items-center justify-center rounded-xl bg-primary-base">
								<Building weight="duotone" className="size-6 text-white" />
							</div>
						</div>

						<div className="flex-1 space-y-3">
							<div>
								<h3 className="text-title-h6 font-semibold text-text-strong-950">
									Complete Your Organization Setup
								</h3>
								<p className="mt-2 text-paragraph-sm text-text-sub-600">
									To access all dashboard features, create campaigns, and manage enrollments, you need to complete your organization setup. This will only take a few minutes.
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-3">
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
									onClick={handleDismissAlert}
								>
									Maybe Later
								</Button.Root>
							</div>
						</div>

						<button
							type="button"
							onClick={handleDismissAlert}
							className="shrink-0 rounded-lg p-1.5 text-text-sub-500 transition-colors hover:bg-bg-soft-200 hover:text-text-strong-950"
							aria-label="Dismiss"
						>
							<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			)}

			{/* HEADER */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<div className="min-w-0">
					<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
					<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 min-h-5">
						{formattedDate || <span className="invisible">Loading...</span>}
					</p>
				</div>
				{hasOrganization && (
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<div>
									<Button.Root 
										variant="primary" 
										size="small" 
										asChild 
										className="shrink-0"
										disabled={organization?.approvalStatus !== "approved"}
									>
										<Link href={`/dashboard/${organizationId}/campaigns/create`}>
											<Button.Icon><Plus className="size-5" /></Button.Icon>
											<span className="hidden sm:inline">New Campaign</span>
										</Link>
									</Button.Root>
								</div>
							</Tooltip.Trigger>
							{organization?.approvalStatus !== "approved" && (
								<Tooltip.Content>
									{organization?.approvalStatus === "draft" 
										? "Complete onboarding and wait for admin approval"
										: organization?.approvalStatus === "pending"
										? "Your application is under review"
										: "Organization approval required"}
								</Tooltip.Content>
							)}
						</Tooltip.Root>
					</Tooltip.Provider>
				)}
			</div>

			{/* APPROVAL STATUS BANNER */}
			{hasOrganization && organization && organization.approvalStatus && organization.approvalStatus !== "approved" && (
				<>
					{organization.approvalStatus === "draft" && (
						<CalloutWithActions
							variant="warning"
							size="md"
							title="Complete Your Organization Setup"
							dismissible
							actions={
								<Button.Root
									variant="primary"
									size="small"
									onClick={() => router.push(routes.onboarding.root)}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									Continue Setup
								</Button.Root>
							}
						>
							<div className="space-y-2">
								<p>Finish your organization profile to start creating campaigns. Complete GST verification and submit for approval.</p>
								{!organization.gstVerified && (
									<div className="flex items-center gap-2 text-paragraph-xs text-warning-base">
										<WarningCircle className="size-4" />
										<span>GST verification is required before submitting for approval</span>
									</div>
								)}
							</div>
						</CalloutWithActions>
					)}
					{organization.approvalStatus === "pending" && (
						<Callout
							variant="info"
							size="md"
							title="Application Under Review"
						>
							<div className="space-y-2">
								<p>
									Your organization application is being reviewed. 
									You'll be notified via email once approved.
								</p>
								<div className="flex items-center gap-2 text-paragraph-xs">
									<Clock className="size-4" />
									<span>Typically takes 1-2 business days</span>
								</div>
								{organization.gstVerified && (
									<div className="flex items-center gap-2 text-paragraph-xs text-success-base">
										<CheckCircle className="size-4" />
										<span>GST verification completed</span>
									</div>
								)}
							</div>
						</Callout>
					)}
					{organization.approvalStatus === "rejected" && (
						<CalloutWithActions
							variant="error"
							size="md"
							title="Application Rejected"
							actions={
								<Button.Root
									variant="primary"
									size="small"
									disabled={isResubmitting}
									onClick={async () => {
										if (!organization?.id) return

										setIsResubmitting(true)
										try {
											const { resubmitOrganizationForApproval } = await import("@/app/actions")
											const result = await resubmitOrganizationForApproval({ organizationId: organization.id })

											if (result?.data?.success) {
												// Redirect to onboarding to edit and resubmit
												router.push(routes.onboarding.root)
											} else {
												// Show error to user - they can still navigate manually
												const errorMsg = result?.serverError || "Failed to resubmit. Please try again."
												toast.error(errorMsg)
												router.push(routes.onboarding.root)
											}
										} catch {
											// Show error to user - they can still navigate manually
											toast.error("Something went wrong. Please try again.")
											router.push(routes.onboarding.root)
										} finally {
											setIsResubmitting(false)
										}
									}}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									{isResubmitting ? "Processing..." : "Edit & Resubmit"}
								</Button.Root>
							}
						>
							Your organization application was rejected. Please review the feedback and resubmit.
						</CalloutWithActions>
					)}
				</>
			)}

			{/* ALERT BAR - Only show if has organization and data */}
			{hasOrganization && safeData && (
				<DashboardAlertBar
					organizationId={organizationId}
					hasOverdue={hasOverdue}
					isLowBalance={isLowBalance}
					pendingOverdue={metrics.pendingOverdue}
					runwayDays={runwayDays}
				/>
			)}

			{/* METRICS */}
			<DashboardMetrics
				organizationId={organizationId}
				wallet={{ available: wallet.available, lowBalanceThreshold: wallet.lowBalanceThreshold }}
				metrics={{ pendingTotal: metrics.pendingTotal, pendingOverdue: metrics.pendingOverdue }}
				approvalRate={approvalRate}
			/>

			{/* MAIN GRID */}
			<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
				{/* CAMPAIGNS */}
				<DashboardCampaignsSection
					organizationId={organizationId}
					campaigns={topCampaigns}
					metrics={{
						activeCampaigns: metrics.activeCampaigns,
						endingSoon: metrics.endingSoon,
						pausedCampaigns: metrics.pausedCampaigns,
					}}
				/>

				{/* ENROLLMENT TREND */}
				<DashboardEnrollmentTrend
					metrics={{
						totalEnrollments: metrics.totalEnrollments,
						approvedCount: metrics.approvedCount,
						rejectedCount: metrics.rejectedCount,
						pendingCount: metrics.pendingCount,
					}}
					enrollmentChartData={enrollmentChartData}
					trackerData={trackerData}
				/>
			</div>

			{/* PRIORITY QUEUE - Only show if has organization and data */}
			{hasOrganization && safeData && (
				<DashboardPriorityQueue
					organizationId={organizationId}
					priorityEnrollments={priorityEnrollments}
					pendingTotal={metrics.pendingTotal}
					hasOverdue={hasOverdue}
				/>
			)}

			{/* EMPTY STATE - Show if no organization and alert dismissed */}
			{!hasOrganization && dismissedOnboardingAlert && (
				<OnboardingSetupCard
					variant="warning-minimal"
					onAction={handleStartOnboarding}
				/>
			)}
		</div>
	)
}
