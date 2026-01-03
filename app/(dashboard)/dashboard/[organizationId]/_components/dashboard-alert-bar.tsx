"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import * as Button from "@/components/ui/primitives/button"
import { Warning } from "@phosphor-icons/react"
import { useCurrentOrganization } from "@/hooks"

interface DashboardAlertBarProps {
	hasOverdue: boolean
	isLowBalance: boolean
	pendingOverdue: number
	runwayDays: number
}

/**
 * Dashboard alert bar component
 * Shows urgent alerts for overdue enrollments or low wallet balance
 */
export function DashboardAlertBar({
	hasOverdue,
	isLowBalance,
	pendingOverdue,
	runwayDays,
}: DashboardAlertBarProps) {
	const { organizationId } = useCurrentOrganization()
	if (!hasOverdue && !isLowBalance) {
		return null
	}

	return (
		<div
			className={cn(
				"rounded-xl p-3 flex items-start sm:items-center gap-3",
				hasOverdue
					? "bg-linear-to-r from-error-lighter to-error-lighter/50 ring-1 ring-inset ring-error-base/20"
					: "bg-linear-to-r from-warning-lighter to-warning-lighter/50 ring-1 ring-inset ring-warning-base/20"
			)}
		>
			<div
				className={cn(
					"flex size-9 sm:size-10 items-center justify-center rounded-full shrink-0",
					hasOverdue ? "bg-error-base text-white" : "bg-warning-base text-white"
				)}
			>
				<Warning weight="fill" className="size-4 sm:size-5" />
			</div>
			<div className="flex-1 min-w-0">
				<p
					className={cn(
						"text-label-xs sm:text-label-sm font-medium",
						hasOverdue ? "text-error-dark" : "text-warning-dark"
					)}
				>
					{hasOverdue
						? `${pendingOverdue} enrollments overdue`
						: `Low balance · ${runwayDays} days runway`}
				</p>
				<p className="text-paragraph-xs text-text-sub-600 mt-0.5 line-clamp-1">
					{hasOverdue ? "Reviews pending over 48 hours" : "Add funds to keep campaigns running"}
				</p>
			</div>
			<Button.Root
				variant={hasOverdue ? "error" : "primary"}
				size="xsmall"
				asChild
				className="shrink-0"
			>
				<Link
					href={
						hasOverdue ? `/dashboard/${organizationId}/enrollments?status=awaiting_review` : `/dashboard/${organizationId}/wallet`
					}
				>
					{hasOverdue ? "Review" : "Add Funds"}
				</Link>
			</Button.Root>
		</div>
	)
}
