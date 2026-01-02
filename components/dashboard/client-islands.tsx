/**
 * Dashboard Client Islands
 *
 * SSOT: Shared client components for dashboard pages.
 * Consolidates duplicate code from:
 * - app/(dashboard)/dashboard/components/dashboard-client-islands.tsx
 * - app/(dashboard)/dashboard/[organizationId]/components/dashboard-client-islands.tsx
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { cn, getHoursAgo, formatTimeAgoShort as formatTimeAgo } from "@/lib/utils"
import * as Button from "@/components/ui/primitives/button"
import { Plus } from "@phosphor-icons/react"
import { THRESHOLDS, ANIMATION } from "@/lib/types/constants"
import { useFormattedDate, useHydratedTime } from "@/hooks/ui/use-mounted"

// ============================================
// Dashboard Header (needs client for date formatting)
// ============================================
interface DashboardHeaderProps {
	organizationId: string
	title?: string
	showCreateButton?: boolean
	createButtonLabel?: string
	createButtonHref?: string
}

export function DashboardHeader({
	organizationId,
	title = "Dashboard",
	showCreateButton = true,
	createButtonLabel = "New Campaign",
	createButtonHref,
}: DashboardHeaderProps) {
	const dateString = useFormattedDate()

	const href = createButtonHref ?? `/dashboard/${organizationId}/campaigns/create`

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
			<div className="min-w-0">
				<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">{title}</h1>
				<p className="text-paragraph-xs text-text-sub-600 mt-0.5 min-h-[1.25rem]">
					{dateString || <span className="invisible">Loading...</span>}
				</p>
			</div>
			{showCreateButton && (
				<Button.Root variant="primary" size="small" asChild className="shrink-0">
					<Link href={href}>
						<Button.Icon><Plus className="size-5" /></Button.Icon>
						<span className="hidden sm:inline">{createButtonLabel}</span>
					</Link>
				</Button.Root>
			)}
		</div>
	)
}

// ============================================
// Priority Enrollment Item (needs client for time ago calculation)
// ============================================
export interface PendingEnrollment {
	id: string
	orderId?: string
	orderValue?: number
	createdAt: string | Date
	shopper?: { name?: string }
	campaign?: {
		title?: string
		product?: { image?: string }
	}
}

interface PriorityEnrollmentItemProps {
	enrollment: PendingEnrollment
	organizationId: string
}

export function PriorityEnrollmentItem({ enrollment, organizationId }: PriorityEnrollmentItemProps) {
	const currentTime = useHydratedTime(ANIMATION.TIME_UPDATE_INTERVAL)
	const hoursAgo = currentTime ? getHoursAgo(enrollment.createdAt, currentTime) : 0
	const overdue = hoursAgo > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS
	const highValue = (enrollment.orderValue || 0) >= THRESHOLDS.HIGH_VALUE_ORDER

	return (
		<div
			className={cn(
				"p-3 sm:p-4 transition-colors hover:bg-bg-weak-50",
				overdue && "bg-error-lighter/20"
			)}
		>
			{/* Mobile layout */}
			<div className="flex items-start gap-3 sm:hidden">
				<div className="relative size-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
					{enrollment.campaign?.product?.image && (
						<Image
							src={enrollment.campaign.product.image}
							alt="Product"
							fill
							sizes="48px"
							className="object-contain p-1.5"
						/>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-label-xs text-text-strong-950 truncate">
							{enrollment.campaign?.title}
						</span>
						{overdue && (
							<span className="text-label-xs font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded">
								Overdue
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-1">
						<span>{enrollment.shopper?.name}</span>
						<span>•</span>
						<span className="font-medium text-text-strong-950">
							₹{(enrollment.orderValue || 0).toLocaleString("en-IN")}
						</span>
					</div>
					<div className="flex items-center justify-between mt-2">
						<span className="text-label-xs text-text-soft-400">{formatTimeAgo(hoursAgo)}</span>
						<Button.Root variant="primary" size="xsmall" asChild>
							<Link href={`/dashboard/${organizationId}/enrollments/${enrollment.id}`}>Review</Link>
						</Button.Root>
					</div>
				</div>
			</div>

			{/* Desktop layout */}
			<div className="hidden sm:flex items-center gap-4">
				<div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
					{enrollment.campaign?.product?.image && (
						<Image
							src={enrollment.campaign.product.image}
							alt="Product"
							fill
							sizes="40px"
							className="object-contain p-1"
						/>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-label-sm text-text-strong-950 truncate">
							{enrollment.campaign?.title}
						</span>
						{overdue && (
							<span className="text-label-xs font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded shrink-0">
								Overdue
							</span>
						)}
						{highValue && !overdue && (
							<span className="text-label-xs font-medium text-information-base bg-information-lighter px-1.5 py-0.5 rounded shrink-0">
								High Value
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-0.5">
						<span>{enrollment.shopper?.name}</span>
						<span>•</span>
						<span className="text-text-soft-400">{formatTimeAgo(hoursAgo)}</span>
					</div>
				</div>

				<div className="text-right shrink-0">
					<div className="text-label-sm text-text-strong-950 font-medium">
						₹{(enrollment.orderValue || 0).toLocaleString("en-IN")}
					</div>
					<div className="text-label-xs text-text-soft-400 font-mono">{enrollment.orderId}</div>
				</div>

				<Button.Root variant="primary" size="xsmall" asChild className="shrink-0">
					<Link href={`/dashboard/${organizationId}/enrollments/${enrollment.id}`}>Review</Link>
				</Button.Root>
			</div>
		</div>
	)
}

// ============================================
// Live Time Display (for real-time updates)
// ============================================
interface LiveTimeDisplayProps {
	timestamp: string | Date
	format?: "short" | "full"
	updateInterval?: number
}

export function LiveTimeDisplay({
	timestamp,
	// format prop reserved for future use (full date format)
	format: _format = "short",
	updateInterval = ANIMATION.TIME_UPDATE_INTERVAL,
}: LiveTimeDisplayProps) {
	const currentTime = useHydratedTime(updateInterval)

	if (!currentTime) return <span className="invisible">...</span>

	const hoursAgo = getHoursAgo(timestamp, currentTime)
	return <span>{formatTimeAgo(hoursAgo)}</span>
}
