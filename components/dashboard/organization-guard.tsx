"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useOrganizationContext } from "@/contexts/organization-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CalloutWithActions } from "@/components/ui/callout"
import * as Button from "@/components/ui/button"
import { ArrowRight, Warning, Building, Sparkle, CheckCircle, Circle, Dot, Plus, Megaphone, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react"
import { Skeleton } from "@/components/ui/skeleton"

interface OrganizationGuardProps {
	children: React.ReactNode
	/**
	 * Show onboarding alert instead of blocking
	 * @default true
	 */
	showAlert?: boolean
	/**
	 * Custom message for onboarding alert
	 */
	message?: string
	/**
	 * Custom empty state when alert is dismissed
	 */
	emptyState?: React.ReactNode
	/**
	 * Page type for skeleton wireframe (campaigns, products, enrollments, etc.)
	 */
	pageType?: "campaigns" | "products" | "enrollments" | "dashboard" | "default"
}

/**
 * Standard component to handle "no organization" state
 * Industry Standard: Centralized organization state handling
 * 
 * Usage:
 * ```tsx
 * <OrganizationGuard>
 *   <YourPageContent />
 * </OrganizationGuard>
 * ```
 */
export function OrganizationGuard({
	children,
	showAlert = true,
	message = "To access this feature, you need to complete your organization setup. This will only take a few minutes.",
	emptyState,
	pageType = "default",
}: OrganizationGuardProps) {
	const router = useRouter()
	const { hasOrganization, isLoading } = useOrganizationContext()
	const [dismissedAlert, setDismissedAlert] = useLocalStorage<boolean>(
		"organization-guard-alert-dismissed",
		false
	)

	// Show loading state
	if (isLoading) {
		return (
			<div className="space-y-5 sm:space-y-6">
				<div className="animate-pulse">
					<div className="h-8 w-48 bg-bg-soft-200 rounded mb-4" />
					<div className="h-40 bg-bg-soft-200 rounded-xl" />
				</div>
			</div>
		)
	}

	// If has organization, render children
	if (hasOrganization) {
		return <>{children}</>
	}

	// No organization - show alert or empty state
	const showOnboardingAlert = showAlert && !dismissedAlert

	// Render page skeleton wireframe based on page type
	const renderPageSkeleton = () => {
		switch (pageType) {
			case "campaigns":
				return (
					<div className="space-y-5 sm:space-y-6 opacity-30 blur-sm pointer-events-none">
						{/* Header */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<Skeleton className="h-8 w-48 mb-2" />
								<Skeleton className="h-4 w-64" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-20" />
								<Skeleton className="h-9 w-32" />
							</div>
						</div>
						
						{/* Stats Grid */}
						<div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="rounded-xl border border-stroke-soft-200 p-3 sm:p-4">
									<Skeleton className="h-9 w-9 rounded-lg mb-3" />
									<Skeleton className="h-4 w-16 mb-1" />
									<Skeleton className="h-6 w-12" />
								</div>
							))}
						</div>
						
						{/* Filters */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex gap-2">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} className="h-9 w-20" />
								))}
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-48" />
								<Skeleton className="h-9 w-20" />
							</div>
						</div>
						
						{/* Campaign Cards Grid */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="rounded-xl border border-stroke-soft-200 p-4 space-y-3">
									<Skeleton className="h-32 w-full rounded-lg" />
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
									<div className="flex gap-2">
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-20" />
									</div>
								</div>
							))}
						</div>
					</div>
				)
			case "products":
				return (
					<div className="space-y-5 sm:space-y-6 opacity-30 blur-sm pointer-events-none">
						{/* Header */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<Skeleton className="h-8 w-40 mb-2" />
								<Skeleton className="h-4 w-56" />
							</div>
							<Skeleton className="h-9 w-32" />
						</div>
						
						{/* Products Grid */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="rounded-xl border border-stroke-soft-200 p-4 space-y-3">
									<Skeleton className="h-48 w-full rounded-lg" />
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-full" />
								</div>
							))}
						</div>
					</div>
				)
			case "enrollments":
				return (
					<div className="space-y-5 sm:space-y-6 opacity-30 blur-sm pointer-events-none">
						{/* Header */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<Skeleton className="h-8 w-48 mb-2" />
								<Skeleton className="h-4 w-64" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-32" />
							</div>
						</div>
						
						{/* Filters */}
						<div className="flex gap-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-9 w-24" />
							))}
						</div>
						
						{/* Enrollments List */}
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="rounded-xl border border-stroke-soft-200 p-4">
									<div className="flex items-center gap-4">
										<Skeleton className="h-12 w-12 rounded-lg" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-5 w-48" />
											<Skeleton className="h-4 w-32" />
										</div>
										<Skeleton className="h-8 w-24" />
									</div>
								</div>
							))}
						</div>
					</div>
				)
			case "dashboard":
				return (
					<div className="space-y-5 sm:space-y-6 opacity-30 blur-sm pointer-events-none">
						{/* Header */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<Skeleton className="h-8 w-40 mb-2" />
								<Skeleton className="h-4 w-56" />
							</div>
						</div>
						
						{/* Stats Grid */}
						<div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="rounded-xl border border-stroke-soft-200 p-3 sm:p-4">
									<Skeleton className="h-9 w-9 rounded-lg mb-3" />
									<Skeleton className="h-4 w-16 mb-1" />
									<Skeleton className="h-6 w-12" />
								</div>
							))}
						</div>
						
						{/* Charts */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-stroke-soft-200 p-4">
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-48 w-full" />
							</div>
							<div className="rounded-xl border border-stroke-soft-200 p-4">
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-48 w-full" />
							</div>
						</div>
					</div>
				)
			default:
				return (
					<div className="space-y-5 sm:space-y-6 opacity-30 blur-sm pointer-events-none">
						<Skeleton className="h-8 w-48 mb-4" />
						<div className="rounded-xl border border-stroke-soft-200 p-6 space-y-4">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-32 w-full" />
						</div>
					</div>
				)
		}
	}

	return (
		<div className="relative min-h-[600px]">
			{/* Background: Page Skeleton Wireframe */}
			{renderPageSkeleton()}
			
			{/* Foreground: Organization Overlay - Centered */}
			<div className="absolute inset-0 flex items-center justify-center z-10 py-8">
				<div className="w-full max-w-2xl mx-auto px-4">
					{showOnboardingAlert && (
						<div className="relative overflow-hidden rounded-xl border border-primary-base/20 bg-gradient-to-br from-primary-alpha-10 via-primary-alpha-5 to-bg-weak-50 p-6 sm:p-8 backdrop-blur-sm bg-bg-white-0/95 shadow-2xl">
							{/* Decorative background elements - Enhanced */}
							<div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary-base/5 blur-2xl" />
							<div className="absolute -bottom-4 -left-4 size-24 rounded-full bg-primary-base/5 blur-xl" />
							<div className="absolute right-1/4 top-1/4 size-16 rounded-full bg-primary-base/3 blur-lg" />
							
							{/* Pattern overlay - SVG decorative pattern */}
							<svg
								className="absolute inset-0 h-full w-full opacity-[0.03]"
								aria-hidden="true"
							>
								<defs>
									<pattern id="org-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
										<circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-primary-base" />
									</pattern>
								</defs>
								<rect width="100%" height="100%" fill="url(#org-pattern)" />
							</svg>
							
							{/* Floating decorative elements */}
							<div className="absolute right-12 top-8">
								<Circle weight="fill" className="size-2 text-primary-base/20 animate-pulse" />
							</div>
							<div className="absolute right-20 top-16">
								<Dot weight="fill" className="size-1.5 text-primary-base/15" />
							</div>
							<div className="absolute left-16 bottom-12">
								<Circle weight="fill" className="size-1.5 text-primary-base/15 animate-pulse delay-300" />
							</div>
							
							<div className="relative">
								<div className="flex items-start gap-4">
									{/* Icon with gradient background - Enhanced with glow */}
									<div className="flex shrink-0 relative">
										{/* Glow effect */}
										<div className="absolute inset-0 rounded-xl bg-primary-base/30 blur-md animate-pulse" />
										<div className="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-base to-primary-base/80 shadow-lg shadow-primary-base/20 ring-2 ring-primary-base/20">
											<Building weight="duotone" className="size-6 text-white" />
										</div>
										{/* Small sparkle decoration */}
										<div className="absolute -right-1 -top-1">
											<Sparkle weight="fill" className="size-3 text-primary-base animate-pulse" />
										</div>
									</div>
									
									<div className="flex-1 space-y-3">
										<div>
											<h3 className="flex items-center gap-2 text-title-h6 font-semibold text-text-strong-950">
												<Sparkle weight="fill" className="size-5 text-primary-base animate-pulse" />
												Complete Your Organization Setup
											</h3>
											<p className="mt-2 text-paragraph-sm text-text-sub-600">
												{message}
											</p>
										</div>
										
										<div className="flex flex-wrap items-center gap-3">
											<Button.Root
												variant="primary"
												size="small"
												onClick={() => router.push("/onboarding")}
												className="shadow-md shadow-primary-base/20 hover:shadow-lg hover:shadow-primary-base/30 transition-shadow"
											>
												<Button.Icon as={ArrowRight} />
												Start Onboarding
											</Button.Root>
											<Button.Root
												variant="ghost"
												size="small"
												onClick={() => setDismissedAlert(true)}
											>
												Maybe Later
											</Button.Root>
										</div>
									</div>
									
									{/* Dismiss button */}
									<button
										onClick={() => setDismissedAlert(true)}
										className="shrink-0 rounded-lg p-1.5 text-text-sub-500 transition-colors hover:bg-bg-soft-200 hover:text-text-strong-950"
										aria-label="Dismiss"
									>
										<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Custom empty state or default */}
					{dismissedAlert && (
						emptyState || (
							<div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-gradient-to-br from-bg-weak-50 via-bg-weak-50 to-primary-alpha-5 p-8 sm:p-12 text-center backdrop-blur-sm bg-bg-white-0/95 shadow-2xl">
						{/* Decorative background - Enhanced */}
						<div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary-base/5 blur-3xl" />
						<div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary-base/5 blur-2xl" />
						<div className="absolute right-1/3 top-1/3 size-24 rounded-full bg-primary-base/3 blur-2xl" />
						
						{/* Pattern overlay - SVG decorative pattern */}
						<svg
							className="absolute inset-0 h-full w-full opacity-[0.02]"
							aria-hidden="true"
						>
							<defs>
								<pattern id="org-empty-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
									<circle cx="30" cy="30" r="2" fill="currentColor" className="text-primary-base" />
									<circle cx="10" cy="10" r="1" fill="currentColor" className="text-primary-base" />
									<circle cx="50" cy="50" r="1" fill="currentColor" className="text-primary-base" />
								</pattern>
							</defs>
							<rect width="100%" height="100%" fill="url(#org-empty-pattern)" />
						</svg>
						
						{/* Floating decorative dots */}
						<div className="absolute right-16 top-12">
							<Circle weight="fill" className="size-2 text-primary-base/15 animate-pulse" />
						</div>
						<div className="absolute left-20 top-20">
							<Dot weight="fill" className="size-1.5 text-primary-base/10" />
						</div>
						<div className="absolute right-24 bottom-16">
							<Circle weight="fill" className="size-1.5 text-primary-base/10 animate-pulse delay-500" />
						</div>
						<div className="absolute left-16 bottom-20">
							<Dot weight="fill" className="size-1 text-primary-base/10" />
						</div>
						
						<div className="relative max-w-md mx-auto space-y-6">
							{/* Icon with animated gradient - Enhanced */}
							<div className="flex justify-center">
								<div className="relative">
									{/* Outer glow rings */}
									<div className="absolute inset-0 animate-pulse rounded-full bg-primary-base/20 blur-xl" />
									<div className="absolute inset-0 -m-2 animate-pulse delay-300 rounded-full bg-primary-base/10 blur-2xl" />
									{/* Main icon container */}
									<div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-base via-primary-base/90 to-primary-base/80 shadow-xl shadow-primary-base/30 ring-2 ring-primary-base/20">
										<Building weight="duotone" className="size-10 text-white" />
									</div>
									{/* Sparkle decorations around icon */}
									<div className="absolute -right-2 -top-2">
										<Sparkle weight="fill" className="size-5 animate-pulse text-primary-base" />
									</div>
									<div className="absolute -left-1 top-1/2 -translate-y-1/2">
										<Sparkle weight="fill" className="size-3 text-primary-base/60 animate-pulse delay-500" />
									</div>
									<div className="absolute -bottom-1 right-1/2 translate-x-1/2">
										<Sparkle weight="fill" className="size-3 text-primary-base/60 animate-pulse delay-700" />
									</div>
								</div>
							</div>
							
							<div className="space-y-2">
								<h3 className="text-title-h5 font-semibold text-text-strong-950">
									Organization Setup Required
								</h3>
								<p className="text-paragraph-sm text-text-sub-600">
									Complete your organization setup to access this feature and unlock all the powerful tools we have to offer.
								</p>
							</div>
							
							{/* Feature highlights - Enhanced with subtle animations */}
							<div className="flex flex-wrap justify-center gap-4 text-left">
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2 ring-1 ring-stroke-soft-200/50 hover:ring-stroke-soft-200 transition-all">
									<CheckCircle weight="fill" className="size-4 shrink-0 text-success-base" />
									<span className="text-paragraph-xs text-text-sub-600">Create Campaigns</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2 ring-1 ring-stroke-soft-200/50 hover:ring-stroke-soft-200 transition-all">
									<CheckCircle weight="fill" className="size-4 shrink-0 text-success-base" />
									<span className="text-paragraph-xs text-text-sub-600">Manage Products</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2 ring-1 ring-stroke-soft-200/50 hover:ring-stroke-soft-200 transition-all">
									<CheckCircle weight="fill" className="size-4 shrink-0 text-success-base" />
									<span className="text-paragraph-xs text-text-sub-600">Track Enrollments</span>
								</div>
							</div>
							
							<Button.Root 
								variant="primary" 
								size="medium" 
								onClick={() => router.push("/onboarding")}
								className="mx-auto shadow-lg shadow-primary-base/20 hover:shadow-xl hover:shadow-primary-base/30 transition-shadow"
							>
								<Button.Icon as={ArrowRight} />
								Complete Onboarding
							</Button.Root>
							</div>
						</div>
					)
				)}
				</div>
			</div>
		</div>
	)
}



