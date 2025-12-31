import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as AvatarGroupRoot,
	Item as AvatarGroupItem,
} from "@/components/ui/primitives/avatar-group"
import { Root as AvatarRoot, Image as AvatarImage } from "@/components/ui/primitives/avatar"

const meta: Meta<typeof AvatarGroupRoot> = {
	title: "Primitives/AvatarGroup",
	component: AvatarGroupRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AvatarGroupRoot>

const sampleAvatars = [
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
	"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
	"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
	"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
]

// Basic avatar group
export const Basic: Story = {
	render: () => (
		<AvatarGroupRoot size="40">
			{sampleAvatars.slice(0, 4).map((src, i) => (
				<AvatarGroupItem key={i}>
					<AvatarRoot size="40">
						<AvatarImage src={src} alt={`User ${i + 1}`} />
					</AvatarRoot>
				</AvatarGroupItem>
			))}
		</AvatarGroupRoot>
	),
}

// With max limit
export const WithMaxLimit: Story = {
	render: () => (
		<AvatarGroupRoot size="40" max={3}>
			{sampleAvatars.map((src, i) => (
				<AvatarGroupItem key={i}>
					<AvatarRoot size="40">
						<AvatarImage src={src} alt={`User ${i + 1}`} />
					</AvatarRoot>
				</AvatarGroupItem>
			))}
		</AvatarGroupRoot>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6 items-start">
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 20</span>
				<AvatarGroupRoot size="20">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="20">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 24</span>
				<AvatarGroupRoot size="24">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="24">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 32</span>
				<AvatarGroupRoot size="32">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="32">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 40 (Default)</span>
				<AvatarGroupRoot size="40">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="40">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 48</span>
				<AvatarGroupRoot size="48">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="48">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Size 56</span>
				<AvatarGroupRoot size="56">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="56">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
		</div>
	),
}

// Direction
export const Direction: Story = {
	render: () => (
		<div className="flex flex-col gap-6 items-start">
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Direction: Left (Default)</span>
				<AvatarGroupRoot size="40" direction="left">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="40">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Direction: Right</span>
				<AvatarGroupRoot size="40" direction="right">
					{sampleAvatars.slice(0, 4).map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="40">
								<AvatarImage src={src} alt={`User ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
		</div>
	),
}

// Team members example
export const TeamMembers: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<AvatarGroupRoot size="32" max={4}>
				{sampleAvatars.map((src, i) => (
					<AvatarGroupItem key={i}>
						<AvatarRoot size="32">
							<AvatarImage src={src} alt={`Team member ${i + 1}`} />
						</AvatarRoot>
					</AvatarGroupItem>
				))}
			</AvatarGroupRoot>
			<span className="text-paragraph-sm text-text-sub-600">6 team members</span>
		</div>
	),
}

// Card with avatar group
export const InCard: Story = {
	render: () => (
		<div className="w-80 p-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-label-md text-text-strong-950">Project Contributors</h3>
				<span className="text-label-sm text-primary-base">View all</span>
			</div>
			<div className="flex items-center justify-between">
				<AvatarGroupRoot size="40" max={5}>
					{sampleAvatars.map((src, i) => (
						<AvatarGroupItem key={i}>
							<AvatarRoot size="40">
								<AvatarImage src={src} alt={`Contributor ${i + 1}`} />
							</AvatarRoot>
						</AvatarGroupItem>
					))}
				</AvatarGroupRoot>
			</div>
		</div>
	),
}

// Large overflow count
export const LargeOverflow: Story = {
	render: () => {
		const manyAvatars = Array.from({ length: 150 }, (_, i) => sampleAvatars[i % sampleAvatars.length])

		return (
			<div className="flex flex-col gap-4 items-start">
				<div className="flex flex-col gap-2">
					<span className="text-label-xs text-text-sub-600">150 users (shows 99+)</span>
					<AvatarGroupRoot size="40" max={3}>
						{manyAvatars.map((src, i) => (
							<AvatarGroupItem key={i}>
								<AvatarRoot size="40">
									<AvatarImage src={src} alt={`User ${i + 1}`} />
								</AvatarRoot>
							</AvatarGroupItem>
						))}
					</AvatarGroupRoot>
				</div>
			</div>
		)
	},
}
