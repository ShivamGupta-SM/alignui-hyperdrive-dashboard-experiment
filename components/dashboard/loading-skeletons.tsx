"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

// Base Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
	return <div className={cn("animate-pulse rounded-10 bg-bg-soft-200", className)} {...props} />
}

// Stat Card Skeleton
export function StatCardSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
			<div className="flex items-center gap-2 mb-3">
				<Skeleton className="size-5 rounded-full" />
				<Skeleton className="h-4 w-24" />
			</div>
			<Skeleton className="h-8 w-32 mb-2" />
			<Skeleton className="h-3 w-20" />
			<Skeleton className="h-8 w-full mt-4" />
		</div>
	)
}

// Campaign Card Skeleton
export function CampaignCardSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
					<Skeleton className="h-4 w-full max-w-xs" />
				</div>
				<Skeleton className="h-8 w-24" />
			</div>
			<div className="space-y-3">
				<div className="flex justify-between">
					<Skeleton className="h-3 w-20" />
					<Skeleton className="h-3 w-16" />
				</div>
				<Skeleton className="h-2 w-full rounded-full" />
			</div>
			<div className="flex items-center gap-4 mt-4 pt-4 border-t border-stroke-soft-200">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-24" />
			</div>
		</div>
	)
}

// Enrollment Card Skeleton
export function EnrollmentCardSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
			<div className="flex items-start gap-4">
				<Skeleton className="size-10 rounded-full" />
				<div className="flex-1">
					<div className="flex items-center justify-between gap-2 mb-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-5 w-20 rounded-full" />
					</div>
					<div className="flex items-center gap-3">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-20" />
					</div>
					<Skeleton className="h-3 w-40 mt-2" />
				</div>
				<Skeleton className="h-8 w-20" />
			</div>
		</div>
	)
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5, rowId = "row" }: { columns?: number; rowId?: string }) {
	return (
		<tr className="border-b border-stroke-soft-200">
			{Array.from({ length: columns }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders with no identity
				<td key={`${rowId}-col-${i}`} className="py-3 px-4">
					<Skeleton className="h-4 w-full max-w-[120px]" />
				</td>
			))}
		</tr>
	)
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<table className="w-full">
				<thead className="bg-bg-weak-50">
					<tr>
						{Array.from({ length: columns }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
							<th key={`th-${i}`} className="py-3 px-4 text-left">
								<Skeleton className="h-4 w-20" />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
						<TableRowSkeleton key={`tr-${i}`} rowId={`tr-${i}`} columns={columns} />
					))}
				</tbody>
			</table>
		</div>
	)
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCardSkeleton />
			<StatCardSkeleton />
			<StatCardSkeleton />
			<StatCardSkeleton />
		</div>
	)
}

// Chart Skeleton
export function ChartSkeleton({ height = 250 }: { height?: number }) {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-8 w-24" />
			</div>
			<Skeleton className="w-full" style={{ height }} />
			<div className="flex items-center justify-center gap-6 mt-4">
				<div className="flex items-center gap-2">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-16" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-16" />
				</div>
			</div>
		</div>
	)
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
	return (
		<div className="flex items-center justify-between">
			<div>
				<Skeleton className="h-8 w-48 mb-2" />
				<Skeleton className="h-4 w-64" />
			</div>
			<Skeleton className="h-10 w-36" />
		</div>
	)
}

// Card Grid Skeleton
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
				<CampaignCardSkeleton key={`card-${i}`} />
			))}
		</div>
	)
}

// List Skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
				<EnrollmentCardSkeleton key={`list-${i}`} />
			))}
		</div>
	)
}

// Form Skeleton
export function FormSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6 space-y-6">
			<div>
				<Skeleton className="h-4 w-24 mb-2" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div>
				<Skeleton className="h-4 w-24 mb-2" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div>
				<Skeleton className="h-4 w-24 mb-2" />
				<Skeleton className="h-24 w-full" />
			</div>
			<div className="flex justify-end gap-3">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-24" />
			</div>
		</div>
	)
}

// Sidebar Skeleton
export function SidebarSkeleton() {
	return (
		<div className="flex h-full w-[280px] flex-col p-3">
			{/* Org Switcher */}
			<div className="flex items-center gap-3 p-2 mb-4">
				<Skeleton className="size-9 rounded-lg" />
				<div className="flex-1">
					<Skeleton className="h-4 w-24 mb-1" />
					<Skeleton className="h-3 w-16" />
				</div>
			</div>

			{/* Nav Items */}
			<div className="space-y-1">
				{Array.from({ length: 7 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
					<div key={`nav-${i}`} className="flex items-center gap-3 px-3 py-2.5">
						<Skeleton className="size-5" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>

			<div className="flex-1" />

			{/* Footer Nav */}
			<div className="pt-3 space-y-1">
				{Array.from({ length: 2 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
					<div key={`footer-${i}`} className="flex items-center gap-3 px-3 py-2.5">
						<Skeleton className="size-5" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
		</div>
	)
}

// Full Page Loading
export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
	return (
		<div className="flex h-full min-h-[400px] flex-col items-center justify-center">
			<div className="relative">
				<div className="size-12 rounded-full border-4 border-stroke-soft-200" />
				<div className="absolute inset-0 size-12 rounded-full border-4 border-primary-base border-t-transparent animate-spin" />
			</div>
			<p className="mt-4 text-paragraph-sm text-text-sub-600">{message}</p>
		</div>
	)
}

// Inline Loading Spinner
export function InlineLoading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "size-4 border-2",
		md: "size-6 border-2",
		lg: "size-8 border-3",
	}

	return (
		<div className="flex items-center gap-2">
			<div
				className={cn(
					"rounded-full border-stroke-soft-200 border-t-primary-base animate-spin",
					sizeClasses[size]
				)}
			/>
		</div>
	)
}

// Dashboard Page Loading
export function DashboardPageLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<DashboardStatsSkeleton />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ChartSkeleton />
				<ChartSkeleton />
			</div>
		</div>
	)
}

// Campaigns Page Loading
export function CampaignsPageLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
				<div className="flex gap-2">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
						<Skeleton key={`tab-${i}`} className="h-10 w-24 rounded-10" />
					))}
				</div>
			</div>
			<CardGridSkeleton count={4} />
		</div>
	)
}

// Enrollments Page Loading
export function EnrollmentsPageLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 flex-1 max-w-xs" />
					<Skeleton className="h-10 w-32 ml-auto" />
				</div>
			</div>
			<ListSkeleton count={5} />
		</div>
	)
}

// Settings Page Loading
export function SettingsPageLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<FormSkeleton />
			<FormSkeleton />
		</div>
	)
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
			<div className="flex items-center gap-4 mb-6">
				<Skeleton className="size-16 rounded-full" />
				<div className="flex-1">
					<Skeleton className="h-6 w-32 mb-2" />
					<Skeleton className="h-4 w-48" />
				</div>
				<Skeleton className="h-10 w-28" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Skeleton className="h-4 w-20 mb-2" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div>
					<Skeleton className="h-4 w-20 mb-2" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	)
}

// Notification Item Skeleton
export function NotificationItemSkeleton() {
	return (
		<div className="flex items-start gap-3 p-3">
			<Skeleton className="size-8 rounded-full shrink-0" />
			<div className="flex-1 min-w-0">
				<Skeleton className="h-4 w-3/4 mb-1" />
				<Skeleton className="h-3 w-full mb-2" />
				<Skeleton className="h-3 w-20" />
			</div>
		</div>
	)
}

// Notification List Skeleton
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="divide-y divide-stroke-soft-200">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
				<NotificationItemSkeleton key={`notification-${i}`} />
			))}
		</div>
	)
}

// Activity Feed Skeleton
export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-16" />
			</div>
			<div className="space-y-4">
				{Array.from({ length: count }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
					<div key={`activity-${i}`} className="flex items-start gap-3">
						<Skeleton className="size-8 rounded-full shrink-0" />
						<div className="flex-1">
							<Skeleton className="h-4 w-full max-w-xs mb-1" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

// Wallet Balance Skeleton
export function WalletBalanceSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-10 w-28" />
			</div>
			<div className="grid grid-cols-3 gap-4">
				<div>
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-full" />
				</div>
				<div>
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-full" />
				</div>
				<div>
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-full" />
				</div>
			</div>
		</div>
	)
}

// Transaction List Skeleton
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<div className="p-4 border-b border-stroke-soft-200">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-32" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-32" />
						<Skeleton className="h-9 w-24" />
					</div>
				</div>
			</div>
			<div className="divide-y divide-stroke-soft-200">
				{Array.from({ length: count }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
					<div key={`txn-${i}`} className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-full" />
							<div>
								<Skeleton className="h-4 w-32 mb-1" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<div className="text-right">
							<Skeleton className="h-4 w-20 mb-1" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

// Product Card Skeleton
export function ProductCardSkeleton() {
	return (
		<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<Skeleton className="aspect-square w-full" />
			<div className="p-4">
				<Skeleton className="h-5 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2 mb-3" />
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-8 w-16" />
				</div>
			</div>
		</div>
	)
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
				<ProductCardSkeleton key={`product-${i}`} />
			))}
		</div>
	)
}

// Team Member Skeleton
export function TeamMemberSkeleton() {
	return (
		<div className="flex items-center justify-between p-4 rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
			<div className="flex items-center gap-3">
				<Skeleton className="size-10 rounded-full" />
				<div>
					<Skeleton className="h-4 w-32 mb-1" />
					<Skeleton className="h-3 w-40" />
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-6 w-16 rounded-full" />
				<Skeleton className="size-8 rounded-lg" />
			</div>
		</div>
	)
}

// Team List Skeleton
export function TeamListSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static placeholders
				<TeamMemberSkeleton key={`team-${i}`} />
			))}
		</div>
	)
}

// Header Skeleton (for SSR)
export function HeaderSkeleton() {
	return (
		<header className="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-stroke-soft-200">
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 w-64" />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="size-9 rounded-lg" />
				<Skeleton className="size-9 rounded-lg" />
				<Skeleton className="size-9 rounded-full" />
			</div>
		</header>
	)
}

// Campaign Detail Page Loading
export function CampaignDetailLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
						<Skeleton className="h-6 w-48 mb-4" />
						<Skeleton className="h-4 w-full mb-2" />
						<Skeleton className="h-4 w-3/4 mb-4" />
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Skeleton className="h-4 w-20 mb-2" />
								<Skeleton className="h-6 w-32" />
							</div>
							<div>
								<Skeleton className="h-4 w-20 mb-2" />
								<Skeleton className="h-6 w-32" />
							</div>
						</div>
					</div>
					<ChartSkeleton />
				</div>
				<div className="space-y-6">
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
				</div>
			</div>
		</div>
	)
}

// Enrollment Detail Page Loading
export function EnrollmentDetailLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
						<div className="flex items-center gap-4 mb-6">
							<Skeleton className="size-16 rounded-full" />
							<div className="flex-1">
								<Skeleton className="h-6 w-40 mb-2" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-8 w-24 rounded-full" />
						</div>
						<div className="space-y-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>
					<ActivityFeedSkeleton count={4} />
				</div>
				<div className="space-y-6">
					<FormSkeleton />
				</div>
			</div>
		</div>
	)
}

// Product Detail Page Loading
export function ProductDetailLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
						<div className="flex gap-6">
							<Skeleton className="size-32 rounded-lg shrink-0" />
							<div className="flex-1">
								<Skeleton className="h-6 w-48 mb-2" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-3/4 mb-4" />
								<div className="flex gap-2">
									<Skeleton className="h-6 w-16 rounded-full" />
									<Skeleton className="h-6 w-20 rounded-full" />
								</div>
							</div>
						</div>
					</div>
					<CardGridSkeleton count={2} />
				</div>
				<div className="space-y-6">
					<StatCardSkeleton />
					<StatCardSkeleton />
				</div>
			</div>
		</div>
	)
}

// Create Campaign Page Loading
export function CreateCampaignLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<FormSkeleton />
			<FormSkeleton />
		</div>
	)
}

// New Product Page Loading
export function NewProductLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<FormSkeleton />
		</div>
	)
}

// Profile Page Loading
export function ProfilePageLoading() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<ProfileCardSkeleton />
			<FormSkeleton />
		</div>
	)
}
