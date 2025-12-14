import { PageHeaderSkeleton, TableSkeleton } from "@/components/dashboard/loading-skeletons"

export default function InvoicesLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<TableSkeleton rows={8} columns={4} />
		</div>
	)
}
