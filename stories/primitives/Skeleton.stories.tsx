import type { Meta, StoryObj } from "@storybook/react"
import {
	Skeleton,
	SkeletonText,
	SkeletonAvatar,
	SkeletonButton,
	SkeletonCard,
} from "@/components/ui/primitives/skeleton"

const meta: Meta<typeof Skeleton> = {
	title: "Primitives/Skeleton",
	component: Skeleton,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Skeleton>

// Basic skeleton
export const Basic: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<Skeleton width="100%" height={20} />
			<Skeleton width="80%" height={20} />
			<Skeleton width="60%" height={20} />
		</div>
	),
}

// Variants
export const Variants: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Rectangular</span>
				<Skeleton variant="rectangular" width={200} height={100} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Rounded</span>
				<Skeleton variant="rounded" width={200} height={100} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Circular</span>
				<Skeleton variant="circular" width={80} height={80} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Text</span>
				<Skeleton variant="text" width={200} height={16} />
			</div>
		</div>
	),
}

// Animation types
export const Animations: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Shimmer (default)</span>
				<Skeleton animation="shimmer" width={200} height={40} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Pulse</span>
				<Skeleton animation="pulse" width={200} height={40} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">None</span>
				<Skeleton animation="none" width={200} height={40} />
			</div>
		</div>
	),
}

// Text skeleton
export const Text: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">3 lines (default)</span>
				<SkeletonText />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">5 lines</span>
				<SkeletonText lines={5} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Large gap</span>
				<SkeletonText lines={3} gap="large" />
			</div>
		</div>
	),
}

// Avatar skeleton
export const Avatar: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4 items-end">
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="20" />
				<span className="text-paragraph-xs text-text-sub-600">20</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="24" />
				<span className="text-paragraph-xs text-text-sub-600">24</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="32" />
				<span className="text-paragraph-xs text-text-sub-600">32</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="40" />
				<span className="text-paragraph-xs text-text-sub-600">40</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="48" />
				<span className="text-paragraph-xs text-text-sub-600">48</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="56" />
				<span className="text-paragraph-xs text-text-sub-600">56</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="64" />
				<span className="text-paragraph-xs text-text-sub-600">64</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SkeletonAvatar size="80" />
				<span className="text-paragraph-xs text-text-sub-600">80</span>
			</div>
		</div>
	),
}

// Button skeleton
export const Button: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<SkeletonButton size="small" />
				<span className="text-paragraph-sm text-text-sub-600">Small</span>
			</div>
			<div className="flex items-center gap-4">
				<SkeletonButton size="medium" />
				<span className="text-paragraph-sm text-text-sub-600">Medium</span>
			</div>
			<div className="flex items-center gap-4">
				<SkeletonButton size="large" />
				<span className="text-paragraph-sm text-text-sub-600">Large</span>
			</div>
			<div className="flex items-center gap-4">
				<SkeletonButton size="xlarge" />
				<span className="text-paragraph-sm text-text-sub-600">X-Large</span>
			</div>
		</div>
	),
}

// Card skeleton
export const Card: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<SkeletonCard />
			<SkeletonCard showAvatar={false} lines={3} />
		</div>
	),
}

// User profile loading
export const UserProfile: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4 p-6 rounded-xl border border-stroke-soft-200">
			<div className="flex items-center gap-4">
				<SkeletonAvatar size="64" />
				<div className="flex-1">
					<Skeleton variant="text" height={20} width="60%" className="mb-2" />
					<Skeleton variant="text" height={16} width="80%" />
				</div>
			</div>
			<SkeletonText lines={3} />
			<div className="flex gap-2">
				<SkeletonButton size="medium" className="flex-1" />
				<SkeletonButton size="medium" className="flex-1" />
			</div>
		</div>
	),
}

// Article loading
export const ArticleLoading: Story = {
	render: () => (
		<div className="w-[500px] flex flex-col gap-6">
			<Skeleton variant="rounded" height={200} width="100%" />
			<div className="flex items-center gap-3">
				<SkeletonAvatar size="40" />
				<div className="flex-1">
					<Skeleton variant="text" height={16} width="40%" className="mb-1" />
					<Skeleton variant="text" height={14} width="30%" />
				</div>
			</div>
			<Skeleton variant="text" height={28} width="80%" />
			<SkeletonText lines={5} gap="medium" />
		</div>
	),
}

// Dashboard cards loading
export const DashboardCards: Story = {
	render: () => (
		<div className="flex gap-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="w-64 p-4 rounded-xl border border-stroke-soft-200">
					<div className="flex justify-between items-start mb-4">
						<div>
							<Skeleton variant="text" height={14} width={80} className="mb-2" />
							<Skeleton variant="text" height={28} width={100} />
						</div>
						<Skeleton variant="circular" width={40} height={40} />
					</div>
					<Skeleton variant="rounded" height={60} width="100%" />
				</div>
			))}
		</div>
	),
}

// List loading
export const ListLoading: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-3">
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-stroke-soft-200">
					<SkeletonAvatar size="40" />
					<div className="flex-1">
						<Skeleton variant="text" height={16} width="70%" className="mb-1" />
						<Skeleton variant="text" height={14} width="50%" />
					</div>
					<SkeletonButton size="small" />
				</div>
			))}
		</div>
	),
}
