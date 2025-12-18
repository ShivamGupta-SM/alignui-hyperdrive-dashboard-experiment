import { PageHeaderSkeleton } from "@/components/dashboard/loading-skeletons"

export default function WalletLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="rounded-xl border border-stroke-soft-200 p-6 space-y-4">
				<div className="h-4 w-32 animate-pulse rounded bg-bg-soft-200" />
				<div className="h-12 w-48 animate-pulse rounded bg-bg-soft-200" />
				<div className="h-4 w-64 animate-pulse rounded bg-bg-soft-200" />
			</div>
			<div className="space-y-4">
				<div className="h-6 w-32 animate-pulse rounded bg-bg-soft-200" />
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="rounded-lg border border-stroke-soft-200 p-4 space-y-2">
						<div className="flex items-center justify-between">
							<div className="h-5 w-32 animate-pulse rounded bg-bg-soft-200" />
							<div className="h-5 w-24 animate-pulse rounded bg-bg-soft-200" />
						</div>
						<div className="h-4 w-48 animate-pulse rounded bg-bg-soft-200" />
					</div>
				))}
			</div>
		</div>
	)
}
