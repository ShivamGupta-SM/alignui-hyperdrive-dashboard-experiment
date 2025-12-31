"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import * as Button from "@/components/ui/primitives/button"
import { ArrowRight } from "@phosphor-icons/react"
import { THRESHOLDS } from "@/lib/types/constants"
import { DISPLAY_LIMITS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils/format"
import { formatTimeAgoShort } from "@/lib/utils/date"

interface PriorityEnrollment {
	id: string
	hoursAgo: number
	orderValue?: number | null
	orderId?: string | null
	campaign?: {
		title?: string | null
		product?: {
			image?: string | null
		} | null
	} | null
	shopper?: {
		name?: string | null
	} | null
}

interface DashboardPriorityQueueProps {
	organizationId: string
	priorityEnrollments: PriorityEnrollment[]
	pendingTotal: number
	hasOverdue: boolean
}

/**
 * Dashboard priority queue section
 * Shows pending enrollments that need review with priority indicators
 */
export function DashboardPriorityQueue({
	organizationId,
	priorityEnrollments,
	pendingTotal,
	hasOverdue,
}: DashboardPriorityQueueProps) {
	const isEnrollmentOverdue = (hoursAgo: number) => hoursAgo > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS

	return (
		<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<div className="flex items-center justify-between p-3 sm:p-4 border-b border-stroke-soft-200">
				<div className="flex items-center gap-2">
					<h2 className="text-label-xs sm:text-label-sm text-text-strong-950 font-medium">Priority Reviews</h2>
					<span
						className={cn(
							"text-label-xs font-medium px-2 py-0.5 rounded-full",
							hasOverdue
								? "bg-error-lighter text-error-base"
								: "bg-warning-lighter text-warning-base"
						)}
					>
						{pendingTotal}
					</span>
				</div>
				<Link
					href={`/dashboard/${organizationId}/enrollments?status=awaiting_review`}
					className="text-paragraph-xs text-primary-base hover:underline"
				>
					View all
				</Link>
			</div>

			<div className="divide-y divide-stroke-soft-200">
				{priorityEnrollments.map((enrollment) => {
					const overdue = isEnrollmentOverdue(enrollment.hoursAgo)
					const highValue = (enrollment.orderValue || 0) >= THRESHOLDS.HIGH_VALUE_ORDER

					return (
						<div
							key={enrollment.id}
							className={cn(
								"p-3 sm:p-4 transition-colors hover:bg-bg-weak-50",
								overdue && "bg-error-lighter/20"
							)}
						>
							{/* Mobile layout */}
							<div className="flex items-start gap-2.5 sm:hidden">
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
									<div className="flex items-center gap-1.5 flex-wrap">
										<span className="text-label-xs text-text-strong-950 truncate max-w-[120px]">
											{enrollment.campaign?.title}
										</span>
										{overdue && (
											<span className="text-[10px] font-medium text-error-base bg-error-lighter px-1 py-0.5 rounded">
												Overdue
											</span>
										)}
									</div>
									<div className="flex items-center gap-1.5 text-[11px] text-text-sub-600 mt-0.5">
										<span className="truncate max-w-[80px]">{enrollment.shopper?.name}</span>
										<span>•</span>
										<span className="font-medium text-text-strong-950">
											{formatCurrency(enrollment.orderValue || 0)}
										</span>
									</div>
									<div className="flex items-center justify-between mt-1.5">
										<span className="text-[10px] text-text-soft-400">
											{formatTimeAgoShort(enrollment.hoursAgo)}
										</span>
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
										<span className="text-text-soft-400">
											{formatTimeAgoShort(enrollment.hoursAgo)}
										</span>
									</div>
								</div>

								<div className="text-right shrink-0">
									<div className="text-label-sm text-text-strong-950 font-medium">
										{formatCurrency(enrollment.orderValue || 0)}
									</div>
									<div className="text-label-xs text-text-soft-400 font-mono">
										{enrollment.orderId}
									</div>
								</div>

								<Button.Root variant="primary" size="xsmall" asChild className="shrink-0">
									<Link href={`/dashboard/${organizationId}/enrollments/${enrollment.id}`}>Review</Link>
								</Button.Root>
							</div>
						</div>
					)
				})}
			</div>

			{pendingTotal > DISPLAY_LIMITS.PRIORITY_ENROLLMENTS && (
				<Link
					href={`/dashboard/${organizationId}/enrollments?status=awaiting_review`}
					className="flex items-center justify-center gap-2 p-3 text-paragraph-xs text-primary-base hover:bg-bg-weak-50 transition-colors border-t border-stroke-soft-200"
				>
					View all {pendingTotal} pending
					<ArrowRight weight="bold" className="size-3" />
				</Link>
			)}
		</div>
	)
}
