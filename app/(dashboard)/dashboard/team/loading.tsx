import { PageHeaderSkeleton } from "@/components/dashboard/loading-skeletons"

export default function TeamLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="space-y-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="rounded-lg border border-stroke-soft-200 p-4">
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 animate-pulse rounded-full bg-bg-soft-200" />
							<div className="flex-1 space-y-2">
								<div className="h-5 w-32 animate-pulse rounded bg-bg-soft-200" />
								<div className="h-4 w-48 animate-pulse rounded bg-bg-soft-200" />
							</div>
							<div className="h-8 w-24 animate-pulse rounded bg-bg-soft-200" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
