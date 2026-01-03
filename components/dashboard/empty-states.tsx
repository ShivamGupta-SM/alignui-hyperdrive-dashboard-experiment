"use client"

import Link from "next/link"
import type { ElementType, ReactNode } from "react"
import * as Button from "@/components/ui/primitives/button"
import * as EmptyState from "@/components/ui/feedback/empty-state"
import { CalloutWithActions } from "@/components/ui/feedback/callout"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"
import {
	Rocket,
	Megaphone,
	Check,
	ShoppingBag,
	UsersThree,
	MagnifyingGlass,
	Wallet,
	FileText,
	Plus,
	UserPlus,
	Tray,
	WarningCircle,
	WifiSlash,
	Lock,
	Bell,
	ClockCounterClockwise,
	ChartLine,
	Funnel,
	Buildings,
	CheckCircle,
	ArrowRight,
	Warning,
} from "@phosphor-icons/react"

// ============================================
// GENERIC SIMPLE EMPTY STATE
// Use this for most empty states - reduces boilerplate significantly
// ============================================

type EmptyStateColor = "primary" | "success" | "warning" | "error" | "gray"
type EmptyStateSize = "small" | "medium" | "large"

interface EmptyStateAction {
	label: string
	href?: string
	onClick?: () => void
	variant?: "primary" | "neutral" | "ghost"
	icon?: ElementType
}

interface SimpleEmptyStateProps {
	icon: ElementType
	iconColor?: EmptyStateColor
	title: string
	description: string
	size?: EmptyStateSize
	showPattern?: boolean
	actions?: EmptyStateAction[]
	children?: ReactNode // For custom content like step lists
}

/**
 * SimpleEmptyState - Generic reusable empty state component
 *
 * Use this instead of creating new empty state components.
 * Reduces ~500 lines of boilerplate to a single configurable component.
 *
 * @example
 * <SimpleEmptyState
 *   icon={Megaphone}
 *   iconColor="primary"
 *   title="No campaigns yet"
 *   description="Create your first campaign to get started."
 *   actions={[
 *     { label: "Create Campaign", href: "/campaigns/create", variant: "primary", icon: Plus }
 *   ]}
 * />
 */
export function SimpleEmptyState({
	icon: Icon,
	iconColor = "gray",
	title,
	description,
	size = "large",
	showPattern = true,
	actions = [],
	children,
}: SimpleEmptyStateProps) {
	return (
		<EmptyState.Root size={size}>
			<EmptyState.Header showPattern={showPattern}>
				<EmptyState.Icon color={iconColor}>
					<Icon className="size-full" weight="duotone" />
				</EmptyState.Icon>
			</EmptyState.Header>
			<EmptyState.Content>
				<EmptyState.Title>{title}</EmptyState.Title>
				<EmptyState.Description>{description}</EmptyState.Description>
				{children}
			</EmptyState.Content>
			{actions.length > 0 && (
				<EmptyState.Footer>
					{actions.map((action) => (
						action.href ? (
							<Button.Root key={action.label} variant={action.variant || "primary"} asChild>
								<Link href={action.href}>
									{action.icon && <Button.Icon><action.icon className="size-5" /></Button.Icon>}
									{action.label}
								</Link>
							</Button.Root>
						) : (
							<Button.Root key={action.label} variant={action.variant || "primary"} onClick={action.onClick}>
								{action.icon && <Button.Icon><action.icon className="size-5" /></Button.Icon>}
								{action.label}
							</Button.Root>
						)
					))}
				</EmptyState.Footer>
			)}
		</EmptyState.Root>
	)
}

// ============================================
// Organization Setup Required Empty State
// ============================================

interface OrganizationSetupRequiredEmptyStateProps {
	title?: string
	description?: string
}

export function OrganizationSetupRequiredEmptyState({
	title = "Organization Setup Required",
	description = "Complete your organization setup to access this feature. Your profile needs to be verified before you can continue.",
}: OrganizationSetupRequiredEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={Buildings}
			iconColor="warning"
			title={title}
			description={description}
			size="large"
			actions={[{ label: "Complete Setup", href: "/onboarding" }]}
		/>
	)
}

// ============================================
// Welcome Empty State (New Organization)
// ============================================

export function WelcomeEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<EmptyState.Root size="large">
			<EmptyState.Header>
				<EmptyState.Icon color="primary">
					<Rocket className="size-full" weight="duotone" />
				</EmptyState.Icon>
			</EmptyState.Header>
			<EmptyState.Content>
				<EmptyState.Title>Welcome to Hypedrive!</EmptyState.Title>
				<EmptyState.Description>
					Let's get started with your first campaign. Create a campaign to start receiving
					enrollments from shoppers.
				</EmptyState.Description>
				<div className="text-left text-paragraph-sm text-text-sub-600 mt-4 space-y-2">
					<div className="flex items-center gap-2">
						<span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">
							1
						</span>
						<span>Fund your wallet</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">
							2
						</span>
						<span>Add your products</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">
							3
						</span>
						<span>Create your first campaign</span>
					</div>
				</div>
			</EmptyState.Content>
			<EmptyState.Footer>
				<Button.Root variant="neutral" asChild>
					<Link href={`/dashboard/${organizationId}/wallet`}>
						<Button.Icon><Wallet className="size-5" /></Button.Icon>
						Fund Wallet
					</Link>
				</Button.Root>
				<Button.Root variant="primary" asChild>
					<Link href={`/dashboard/${organizationId}/campaigns/create`}>
						<Button.Icon><Plus className="size-5" /></Button.Icon>
						Create Campaign
					</Link>
				</Button.Root>
			</EmptyState.Footer>
		</EmptyState.Root>
	)
}

// ============================================
// No Campaigns Empty State
// ============================================

export function NoCampaignsEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={Megaphone}
			iconColor="primary"
			title="No campaigns yet"
			description="Create your first campaign to start accepting enrollments from shoppers. Make sure you have products added and wallet funded first."
			size="large"
			actions={[{
				label: "Create First Campaign",
				href: `/dashboard/${organizationId}/campaigns/create`,
				icon: Plus
			}]}
		/>
	)
}

// ============================================
// No Pending Enrollments Empty State
// ============================================

export function NoPendingEnrollmentsEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={Check}
			iconColor="success"
			title="All caught up!"
			description="No enrollments require your review right now. New submissions will appear here automatically."
			size="large"
			actions={[{
				label: "View All Enrollments",
				href: `/dashboard/${organizationId}/enrollments`,
				variant: "neutral"
			}]}
		/>
	)
}

// ============================================
// No Products Empty State
// ============================================

export function NoProductsEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={ShoppingBag}
			iconColor="primary"
			title="No products yet"
			description="Products are essential for creating campaigns. Add your products with images and pricing to help shoppers understand what they'll be promoting."
			size="large"
			actions={[{
				label: "Add First Product",
				href: `/dashboard/${organizationId}/products/new`,
				icon: Plus
			}]}
		/>
	)
}

// ============================================
// No Team Members Empty State
// ============================================

interface NoTeamMembersEmptyStateProps {
	onInvite?: () => void
}

export function NoTeamMembersEmptyState({ onInvite }: NoTeamMembersEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={UsersThree}
			iconColor="primary"
			title="Invite your team"
			description="Add team members to help manage campaigns and review enrollments. Each member can have different permissions."
			size="large"
			actions={onInvite ? [{
				label: "Invite First Member",
				onClick: onInvite,
				icon: UserPlus
			}] : []}
		/>
	)
}

// ============================================
// No Search Results Empty State
// ============================================

interface NoSearchResultsEmptyStateProps {
	query: string
	onClearSearch?: () => void
	onResetFilters?: () => void
}

export function NoSearchResultsEmptyState({
	query,
	onClearSearch,
	onResetFilters,
}: NoSearchResultsEmptyStateProps) {
	return (
		<EmptyState.Root size="medium">
			<EmptyState.Header>
				<EmptyState.Icon color="gray">
					<MagnifyingGlass className="size-full" weight="duotone" />
				</EmptyState.Icon>
			</EmptyState.Header>
			<EmptyState.Content>
				<EmptyState.Title>No results match "{query}"</EmptyState.Title>
				<EmptyState.Description>
					Try adjusting your search or filters to find what you need.
				</EmptyState.Description>
			</EmptyState.Content>
			<EmptyState.Footer>
				{onClearSearch && (
					<Button.Root variant="ghost" onClick={onClearSearch}>
						Clear Search
					</Button.Root>
				)}
				{onResetFilters && (
					<Button.Root variant="ghost" onClick={onResetFilters}>
						Reset Filters
					</Button.Root>
				)}
			</EmptyState.Footer>
		</EmptyState.Root>
	)
}

// ============================================
// No Invoices Empty State
// ============================================

export function NoInvoicesEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={FileText}
			iconColor="primary"
			title="No invoices yet"
			description="Invoices will appear here once you have approved enrollments. Your first invoice will be generated at the end of the billing cycle."
			size="large"
			actions={[{
				label: "View Enrollments",
				href: `/dashboard/${organizationId}/enrollments`
			}]}
		/>
	)
}

// ============================================
// No Notifications Empty State
// ============================================

export function NoNotificationsEmptyState() {
	return (
		<SimpleEmptyState
			icon={Tray}
			iconColor="gray"
			title="No notifications"
			description="You're all caught up! New notifications will appear here."
			size="medium"
			showPattern={false}
		/>
	)
}

// ============================================
// Error Empty State
// ============================================

interface ErrorEmptyStateProps {
	title?: string
	description?: string
	onRetry?: () => void
}

export function ErrorEmptyState({
	title = "Something went wrong",
	description = "We encountered an error while loading this content. Please try again.",
	onRetry,
}: ErrorEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={WarningCircle}
			iconColor="error"
			title={title}
			description={description}
			size="large"
			actions={onRetry ? [{ label: "Try Again", onClick: onRetry }] : []}
		/>
	)
}

// ============================================
// Network Error Empty State
// ============================================

interface NetworkErrorEmptyStateProps {
	onRetry?: () => void
}

export function NetworkErrorEmptyState({ onRetry }: NetworkErrorEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={WifiSlash}
			iconColor="warning"
			title="Connection lost"
			description="Please check your internet connection and try again."
			size="large"
			actions={onRetry ? [{ label: "Retry", onClick: onRetry }] : []}
		/>
	)
}

// ============================================
// Permission Denied Empty State
// ============================================

export function PermissionDeniedEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={Lock}
			iconColor="error"
			title="Access denied"
			description="You don't have permission to view this content. Contact your organization admin for access."
			size="large"
			actions={[{
				label: "Go to Dashboard",
				href: organizationId ? `/dashboard/${organizationId}` : "/dashboard",
				variant: "neutral"
			}]}
		/>
	)
}

// ============================================
// No Wallet Transactions Empty State
// ============================================

interface NoWalletTransactionsEmptyStateProps {
	onAddFunds?: () => void
}

export function NoWalletTransactionsEmptyState({
	onAddFunds,
}: NoWalletTransactionsEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={Wallet}
			iconColor="gray"
			title="No transactions yet"
			description="Add funds to your wallet to get started with campaigns."
			size="medium"
			actions={onAddFunds ? [{ label: "Add Funds", onClick: onAddFunds, icon: Plus }] : []}
		/>
	)
}

// ============================================
// No Enrollments Empty State
// ============================================

export function NoEnrollmentsEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={UserPlus}
			iconColor="primary"
			title="No enrollments yet"
			description="Once shoppers enroll in your campaigns, they'll appear here for review. Create and activate a campaign to start receiving enrollments."
			size="large"
			actions={[{
				label: "Create Campaign",
				href: `/dashboard/${organizationId}/campaigns/create`,
				icon: Plus
			}]}
		/>
	)
}

// ============================================
// No Filtered Results Empty State
// ============================================

interface NoFilteredResultsEmptyStateProps {
	entityName: string
	onResetFilters?: () => void
}

export function NoFilteredResultsEmptyState({
	entityName,
	onResetFilters,
}: NoFilteredResultsEmptyStateProps) {
	return (
		<SimpleEmptyState
			icon={Funnel}
			iconColor="gray"
			title={`No ${entityName} match your filters`}
			description="Try adjusting your filters or search criteria to find what you're looking for."
			size="medium"
			actions={onResetFilters ? [{ label: "Reset All Filters", onClick: onResetFilters, variant: "ghost" }] : []}
		/>
	)
}

// ============================================
// No Activity Empty State
// ============================================

export function NoActivityEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={ClockCounterClockwise}
			iconColor="gray"
			title="No recent activity"
			description="Your recent actions and updates will appear here."
			size="medium"
			actions={organizationId ? [{
				label: "Browse Campaigns",
				href: `/dashboard/${organizationId}/campaigns`,
				variant: "neutral"
			}] : []}
		/>
	)
}

// ============================================
// No Analytics Data Empty State
// ============================================

export function NoAnalyticsEmptyState() {
	const { organizationId } = useCurrentOrganization()

	return (
		<SimpleEmptyState
			icon={ChartLine}
			iconColor="gray"
			title="No analytics data yet"
			description="Start running campaigns to see performance metrics and insights here."
			size="large"
			actions={[{
				label: "Create Campaign",
				href: `/dashboard/${organizationId}/campaigns/create`,
				icon: Plus
			}]}
		/>
	)
}

// ============================================
// All Notifications Read Empty State
// ============================================

export function AllNotificationsReadEmptyState() {
	return (
		<SimpleEmptyState
			icon={Bell}
			iconColor="success"
			title="You're all caught up!"
			description="No new notifications. We'll let you know when something needs your attention."
			size="small"
			showPattern={false}
		/>
	)
}

// ============================================
// ONBOARDING REQUIRED ALERT
// Dismissible callout for prompting org setup
// ============================================

interface OnboardingRequiredAlertProps {
	/** Handler when user dismisses the alert */
	onDismiss: () => void
	/** Handler when user clicks "Start Onboarding" */
	onStartOnboarding: () => void
	/** Custom title (optional) */
	title?: string
	/** Custom description (optional) */
	description?: string
}

/**
 * OnboardingRequiredAlert - Dismissible warning callout for organization setup
 *
 * Use this when you need to show a dismissible warning that prompts the user
 * to complete their organization setup. Replaces ~20 lines of inline JSX.
 *
 * @example
 * <OnboardingRequiredAlert
 *   onDismiss={handleDismissAlert}
 *   onStartOnboarding={handleStartOnboarding}
 * />
 */
export function OnboardingRequiredAlert({
	onDismiss,
	onStartOnboarding,
	title = "Complete Your Organization Setup",
	description = "To access all dashboard features, create campaigns, and manage enrollments, you need to complete your organization setup. This will only take a few minutes.",
}: OnboardingRequiredAlertProps) {
	return (
		<CalloutWithActions
			variant="warning"
			title={title}
			dismissible
			onDismiss={onDismiss}
			actions={
				<>
					<Button.Root
						variant="primary"
						size="small"
						onClick={onStartOnboarding}
					>
						<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
						Start Onboarding
					</Button.Root>
					<Button.Root
						variant="ghost"
						size="small"
						onClick={onDismiss}
					>
						Maybe Later
					</Button.Root>
				</>
			}
		>
			{description}
		</CalloutWithActions>
	)
}

// ============================================
// ONBOARDING SETUP CARD
// Reusable component for organization setup prompts
// ============================================

const DEFAULT_ONBOARDING_BENEFITS = [
	"Create Campaigns",
	"Manage Products",
	"Track Enrollments",
]

interface OnboardingSetupCardProps {
	/** Variant determines the icon background color and shape */
	variant?: "primary" | "warning" | "warning-minimal"
	/** Title of the card */
	title?: string
	/** Description text */
	description?: string
	/** Benefits list to display (pass empty array to hide) */
	benefits?: string[]
	/** Button label */
	buttonLabel?: string
	/** Click handler for the action button */
	onAction: () => void
}

/**
 * Reusable onboarding setup card for dashboard empty states.
 * Use this instead of duplicating the organization setup UI pattern.
 */
export function OnboardingSetupCard({
	variant = "primary",
	title = "Organization Setup Required",
	description = "Complete your organization setup to access dashboard features, create campaigns, and manage enrollments.",
	benefits = DEFAULT_ONBOARDING_BENEFITS,
	buttonLabel = "Complete Onboarding",
	onAction,
}: OnboardingSetupCardProps) {
	const isMinimal = variant === "warning-minimal"
	const iconBgClass = variant === "primary"
		? "bg-primary-base rounded-xl"
		: "bg-warning-lighter rounded-full"
	const iconColorClass = variant === "primary" ? "text-white" : "text-warning-base"

	return (
		<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-8 sm:p-12 text-center">
			<div className={`max-w-md mx-auto ${isMinimal ? "space-y-4" : "space-y-6"}`}>
				<div className="flex justify-center">
					<div className={`flex size-16 items-center justify-center ${iconBgClass}`}>
						{variant === "primary" ? (
							<Buildings weight="duotone" className="size-8 text-white" />
						) : (
							<Warning weight="duotone" className={`size-8 ${iconColorClass}`} />
						)}
					</div>
				</div>

				<div className={isMinimal ? "" : "space-y-2"}>
					<h3 className={`${isMinimal ? "text-title-h6" : "text-title-h5 font-semibold"} text-text-strong-950`}>
						{title}
					</h3>
					<p className={`text-paragraph-sm text-text-sub-600 ${isMinimal ? "mt-2" : ""}`}>
						{description}
					</p>
				</div>

				{!isMinimal && benefits.length > 0 && (
					<div className="flex flex-wrap justify-center gap-3 text-left">
						{benefits.map((benefit) => (
							<div
								key={benefit}
								className="flex items-center gap-2 rounded-lg bg-bg-white-0 ring-1 ring-stroke-soft-200 px-3 py-2"
							>
								<CheckCircle weight="fill" className="size-4 shrink-0 text-success-base" />
								<span className="text-paragraph-xs text-text-sub-600">{benefit}</span>
							</div>
						))}
					</div>
				)}

				<Button.Root
					variant="primary"
					size="medium"
					onClick={onAction}
				>
					<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
					{isMinimal ? "Start Onboarding" : buttonLabel}
				</Button.Root>
			</div>
		</div>
	)
}
