import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/dashboard/loading-skeletons"

export default function ProductsLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="flex gap-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="h-10 w-32 animate-pulse rounded-10 bg-bg-soft-200" />
				))}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-xl border border-stroke-soft-200 p-4 space-y-3">
						<div className="h-32 w-full animate-pulse rounded-lg bg-bg-soft-200" />
						<div className="h-5 w-3/4 animate-pulse rounded bg-bg-soft-200" />
						<div className="h-4 w-full animate-pulse rounded bg-bg-soft-200" />
						<div className="h-4 w-2/3 animate-pulse rounded bg-bg-soft-200" />
					</div>
				))}
			</div>
		</div>
	)
}
