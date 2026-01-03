"use client"

import { cn, formatCurrency } from "@/lib/utils"
import { Wallet, Clock, Check } from "@phosphor-icons/react"
import { SimpleStatCard } from "@/components/dashboard/stat-card"
import { useCurrentOrganization } from "@/hooks"

interface DashboardMetricsProps {
	wallet: {
		available: number
		lowBalanceThreshold: number
	}
	metrics: {
		pendingTotal: number
		pendingOverdue: number
	}
	approvalRate: number
}

/**
 * Dashboard metrics section
 * Shows wallet balance, pending enrollments, and approval rate stat cards
 */
export function DashboardMetrics({
	wallet,
	metrics,
	approvalRate,
}: DashboardMetricsProps) {
	const { organizationId } = useCurrentOrganization()
	const isLowBalance = wallet.available < wallet.lowBalanceThreshold
	const hasOverdue = metrics.pendingOverdue > 0

	return (
		<div className="grid grid-cols-3 gap-2 sm:gap-3">
			{/* WALLET */}
			<SimpleStatCard
				icon={<Wallet weight="duotone" />}
				value={formatCurrency(wallet.available)}
				label="Available"
				href={`/dashboard/${organizationId}/wallet`}
				iconColor={isLowBalance ? "warning" : "success"}
				className={cn(isLowBalance && "ring-warning-base/20")}
			/>

			{/* PENDING */}
			<SimpleStatCard
				icon={<Clock weight="duotone" />}
				value={metrics.pendingTotal}
				label="Pending"
				href={`/dashboard/${organizationId}/enrollments?status=awaiting_review`}
				iconColor={hasOverdue ? "error" : "neutral"}
				className={cn(hasOverdue && "ring-error-base/20")}
			/>

			{/* APPROVAL RATE */}
			<SimpleStatCard
				icon={<Check weight="duotone" />}
				value={`${approvalRate}%`}
				label="Approval"
				iconColor="primary"
			/>
		</div>
	)
}
