"use client"

import { Lightning } from "@phosphor-icons/react"
import { Tracker } from "@/components/ui/data-display/tracker"
import { SparkChart } from "@/components/ui/data-display/spark-chart"

interface DashboardEnrollmentTrendProps {
	metrics: {
		totalEnrollments: number
		approvedCount: number
		rejectedCount: number
		pendingCount: number
	}
	enrollmentChartData: { value: number }[]
	trackerData: { status: "success" | "warning" | "error"; count: number }[]
}

/**
 * Dashboard enrollment trend section
 * Shows enrollment statistics and trend visualization
 */
export function DashboardEnrollmentTrend({
	metrics,
	enrollmentChartData,
	trackerData,
}: DashboardEnrollmentTrendProps) {
	return (
		<div className="lg:col-span-7 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<div className="flex items-center justify-between p-3 sm:p-4 border-b border-stroke-soft-200">
				<div className="flex items-center gap-2">
					<Lightning weight="duotone" className="size-4 sm:size-5 text-primary-base" />
					<h2 className="text-label-xs sm:text-label-sm text-text-strong-950 font-medium">Enrollment Trend</h2>
				</div>
				<span className="text-label-xs text-text-soft-400 uppercase tracking-wide">
					14 days
				</span>
			</div>

			<div className="p-3 sm:p-4">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-paragraph-xs text-text-sub-600">
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-full bg-success-base" /> Approved
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-full bg-warning-base" /> Pending
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-full bg-error-base" /> Rejected
					</span>
				</div>
				<Tracker data={trackerData} size="lg" className="mb-4" />

				<SparkChart
					data={enrollmentChartData}
					variant="area"
					size="lg"
					color="var(--color-primary-base)"
					className="w-full h-20 sm:h-24"
				/>
			</div>

			<div className="grid grid-cols-4 border-t border-stroke-soft-200 divide-x divide-stroke-soft-200">
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-text-strong-950 font-semibold">
						{metrics.totalEnrollments}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">Total</div>
				</div>
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-success-base font-semibold">
						{metrics.approvedCount}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 hidden sm:block">Approved</div>
					<div className="text-paragraph-xs text-text-sub-600 mt-0.5 sm:hidden">Ok</div>
				</div>
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-error-base font-semibold">
						{metrics.rejectedCount}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 hidden sm:block">Rejected</div>
					<div className="text-paragraph-xs text-text-sub-600 mt-0.5 sm:hidden">No</div>
				</div>
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-warning-base font-semibold">
						{metrics.pendingCount}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 hidden sm:block">Pending</div>
					<div className="text-paragraph-xs text-text-sub-600 mt-0.5 sm:hidden">Wait</div>
				</div>
			</div>
		</div>
	)
}
