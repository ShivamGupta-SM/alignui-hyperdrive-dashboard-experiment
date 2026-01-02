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
} from "@phosphor-icons/react"
import { DISPLAY_LIMITS } from "@/lib/constants"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { toast } from "sonner"
import { OnboardingSetupCard, OnboardingRequiredAlert } from "@/components/dashboard/empty-states"
import { CalloutWithActions, Callout } from "@/components/ui/feedback/callout"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/state"
import { useDashboard } from "@/hooks/shared/use-dashboard"
import { getHoursAgo } from "@/lib/utils"
import { useStableTime, useFormattedDate } from "@/hooks/ui"
import { routes } from "@/lib/routes"
import type { OrganizationListItem } from "@/features/organizations/types"
import type { DashboardData } from "@/hooks/shared/use-dashboard"

// Split components for better code splitting
import {
	DashboardSkeleton,
	DashboardMetrics,
	DashboardCampaignsSection,
	DashboardEnrollmentTrend,
	DashboardPriorityQueue,
	DashboardAlertBar,
} from "./_components"

interface DashboardClientProps {
	organizationId: string
	/** Organization data fetched server-side - avoids client fetching all orgs */
	initialOrganization?: OrganizationListItem | null
	/** All organizations fetched server-side - for redirect logic */
	initialOrganizations?: OrganizationListItem[]
	/** Dashboard data fetched server-side - prevents loading flash */
	initialDashboardData?: DashboardData | null
}

// URL-based multi-tenancy: organizationId from URL params
// Uses server-fetched org data to avoid client-side fetch of all orgs
export function DashboardClient({
	organizationId,
	initialOrganization,
	initialOrganizations = [],
	initialDashboardData,
}: DashboardClientProps) {
	const router = useRouter()
	// useStableTime: stable reference time (set once on mount) - doesn't cause re-renders
	// Better for "hours ago" calculations that don't need real-time updates
	const currentTime = useStableTime()
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
	// gstVerified is now part of OrganizationListItem type - no unsafe assertion needed
	const organization = initialOrganization
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
		// Note: isRedirecting is intentionally excluded - it's set inside the effect
		// and including it would cause unnecessary re-runs
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasOrganization, organizationsList, router])

	// Fetch dashboard data using organizationId from URL
	// Uses SSR initialData to prevent loading flash (blank → spinner → content)
	const { data, isLoading: isDashboardLoading } = useDashboard({
		organizationId,
		days: 7,
		enabled: hasOrganization,
		initialData: initialDashboardData,
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

	// ALL useMemo hooks MUST be called before any early returns (Rules of Hooks)
	// Map top campaigns - use product image from API
	const topCampaigns = useMemo(() => {
		if (!data?.topCampaigns || !Array.isArray(data.topCampaigns)) return []
		return data.topCampaigns.slice(0, DISPLAY_LIMITS.TOP_CAMPAIGNS).map((c) => ({
			id: c.id,
			name: c.name,
			enrollments: c.enrollments,
			approvalRate: c.approvalRate,
			status: c.status,
			daysLeft: c.daysLeft,
			image: c.productImage ?? undefined,
		}))
	}, [data?.topCampaigns])

	// Derived metrics - calculate from data if available
	const metrics = useMemo(() => {
		if (!data?.stats || !data?.enrollmentDistribution) {
			return {
				activeCampaigns: 0,
				pausedCampaigns: 0,
				endingSoon: 0,
				pendingTotal: 0,
				pendingOverdue: 0,
				pendingHigh: 0,
				totalEnrollments: 0,
				approvedCount: 0,
				rejectedCount: 0,
				pendingCount: 0,
				enrollmentsTrend: 0,
				approvalRateTrend: 0,
			}
		}
		return {
			activeCampaigns: data.stats.activeCampaigns ?? 0,
			pausedCampaigns: data.stats.pausedCampaigns ?? 0,
			endingSoon: data.stats.endingSoon ?? 0,
			pendingTotal: data.stats.pendingEnrollments ?? 0,
			pendingOverdue: data.stats.overdueEnrollments ?? 0,
			pendingHigh: data.stats.highValuePending ?? 0,
			totalEnrollments: data.enrollmentDistribution.total ?? 0,
			approvedCount: data.enrollmentDistribution.approved ?? 0,
			rejectedCount: data.enrollmentDistribution.rejected ?? 0,
			pendingCount: data.enrollmentDistribution.pending ?? 0,
			enrollmentsTrend: data.stats.enrollmentTrend ?? 0,
			approvalRateTrend: data.stats.approvalRateTrend ?? 0,
		}
	}, [data?.stats, data?.enrollmentDistribution])

	// Wallet data
	const wallet = useMemo(() => {
		if (!data?.stats) {
			return { available: 0, held: 0, avgDailySpend: 0, lowBalanceThreshold: 0 }
		}
		return {
			available: data.stats.walletBalance ?? 0,
			held: data.stats.heldAmount ?? 0,
			avgDailySpend: data.stats.avgDailySpend ?? 0,
			lowBalanceThreshold: data.stats.lowBalanceThreshold ?? 0,
		}
	}, [data?.stats])

	// Enrollment chart data
	const enrollmentChartData = useMemo(() => {
		if (!data?.enrollmentChart || !Array.isArray(data.enrollmentChart)) return []
		return data.enrollmentChart.map((d) => ({ value: d.enrollments ?? 0 }))
	}, [data?.enrollmentChart])

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
					<OnboardingRequiredAlert
						onDismiss={handleDismissAlert}
						onStartOnboarding={handleStartOnboarding}
					/>
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

	// At this point we have organization and data - render full dashboard
	return (
		<div className="space-y-4 sm:space-y-6">
			{/* HEADER */}
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
					<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 min-h-5">
						{formattedDate || <span className="invisible">Loading...</span>}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<div>
									<Button.Root
										variant="primary"
										size="small"
										asChild
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
				</div>
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

			{/* ALERT BAR */}
			<DashboardAlertBar
				organizationId={organizationId}
				hasOverdue={hasOverdue}
				isLowBalance={isLowBalance}
				pendingOverdue={metrics.pendingOverdue}
				runwayDays={runwayDays}
			/>

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

			{/* PRIORITY QUEUE */}
			<DashboardPriorityQueue
				organizationId={organizationId}
				priorityEnrollments={priorityEnrollments}
				pendingTotal={metrics.pendingTotal}
				hasOverdue={hasOverdue}
			/>
		</div>
	)
}
