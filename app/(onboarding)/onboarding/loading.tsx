import { FormSkeleton } from "@/components/dashboard/loading-skeletons"

export default function OnboardingLoading() {
	return (
		<div className="w-full max-w-2xl mx-auto space-y-8">
			{/* Stepper Skeleton */}
			<div className="flex items-center justify-between">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex items-center gap-2">
						<div className="h-8 w-8 animate-pulse rounded-full bg-bg-soft-200" />
						<div className="h-4 w-20 animate-pulse rounded bg-bg-soft-200" />
						{i < 3 && <div className="h-px w-12 animate-pulse bg-bg-soft-200" />}
					</div>
				))}
			</div>
			<FormSkeleton />
		</div>
	)
}
