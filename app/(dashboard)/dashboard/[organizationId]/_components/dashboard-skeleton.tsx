"use client"

import { Skeleton } from "@/components/ui/primitives/skeleton"

/**
 * Dashboard loading skeleton component
 * Shows placeholder UI while dashboard data is loading
 */
export function DashboardSkeleton() {
	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header skeleton */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<div className="min-w-0">
					<Skeleton className="h-6 sm:h-8 w-28 sm:w-32" />
					<Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mt-0.5" />
				</div>
				<Skeleton className="h-8 sm:h-9 w-24 sm:w-32" />
			</div>

			{/* Metrics skeleton - 3 columns on all screens */}
			<div className="grid grid-cols-3 gap-2 sm:gap-3">
				<Skeleton className="h-20 sm:h-28 rounded-xl" />
				<Skeleton className="h-20 sm:h-28 rounded-xl" />
				<Skeleton className="h-20 sm:h-28 rounded-xl" />
			</div>

			{/* Main grid skeleton */}
			<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
				<Skeleton className="lg:col-span-5 h-48 sm:h-64 rounded-xl" />
				<Skeleton className="lg:col-span-7 h-48 sm:h-64 rounded-xl" />
			</div>

			{/* Priority queue skeleton */}
			<Skeleton className="h-36 sm:h-48 rounded-xl" />
		</div>
	)
}
