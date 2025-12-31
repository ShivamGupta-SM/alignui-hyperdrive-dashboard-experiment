import type { Meta, StoryObj } from "@storybook/react"
import {
	AvatarRoot,
	AvatarImage,
	AvatarIndicator,
	AvatarStatus,
	AvatarGroup,
	AvatarWithFallback,
} from "@/components/ui/primitives"

const meta: Meta<typeof AvatarRoot> = {
	title: "Primitives/Avatar",
	component: AvatarRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["80", "72", "64", "56", "48", "40", "32", "24", "20"],
			description: "Size of the avatar in pixels",
		},
		color: {
			control: "select",
			options: ["gray", "yellow", "blue", "sky", "purple", "red"],
			description: "Background color for initials fallback",
		},
		placeholderType: {
			control: "select",
			options: ["user", "company"],
			description: "Type of placeholder icon when no content",
		},
	},
}

export default meta
type Story = StoryObj<typeof AvatarRoot>

// Basic with image
export const WithImage: Story = {
	render: (args) => (
		<AvatarRoot {...args}>
			<AvatarImage
				src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
				alt="User avatar"
			/>
		</AvatarRoot>
	),
	args: {
		size: "80",
	},
}

// With initials
export const WithInitials: Story = {
	render: (args) => <AvatarRoot {...args}>JD</AvatarRoot>,
	args: {
		size: "80",
		color: "blue",
	},
}

// Placeholder
export const Placeholder: Story = {
	args: {
		size: "80",
		placeholderType: "user",
	},
}

export const CompanyPlaceholder: Story = {
	args: {
		size: "80",
		placeholderType: "company",
	},
}

// Size variants
export const AllSizes: Story = {
	render: () => (
		<div className="flex items-end gap-4">
			<AvatarRoot size="80" color="blue">
				80
			</AvatarRoot>
			<AvatarRoot size="72" color="purple">
				72
			</AvatarRoot>
			<AvatarRoot size="64" color="sky">
				64
			</AvatarRoot>
			<AvatarRoot size="56" color="yellow">
				56
			</AvatarRoot>
			<AvatarRoot size="48" color="red">
				48
			</AvatarRoot>
			<AvatarRoot size="40" color="gray">
				40
			</AvatarRoot>
			<AvatarRoot size="32" color="blue">
				32
			</AvatarRoot>
			<AvatarRoot size="24" color="purple">
				24
			</AvatarRoot>
			<AvatarRoot size="20" color="sky">
				20
			</AvatarRoot>
		</div>
	),
}

// Color variants
export const AllColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<AvatarRoot size="48" color="gray">
				GR
			</AvatarRoot>
			<AvatarRoot size="48" color="yellow">
				YE
			</AvatarRoot>
			<AvatarRoot size="48" color="blue">
				BL
			</AvatarRoot>
			<AvatarRoot size="48" color="sky">
				SK
			</AvatarRoot>
			<AvatarRoot size="48" color="purple">
				PU
			</AvatarRoot>
			<AvatarRoot size="48" color="red">
				RE
			</AvatarRoot>
		</div>
	),
}

// With status indicator
export const WithStatus: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<AvatarRoot size="56">
				<AvatarImage
					src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
					alt="User"
				/>
				<AvatarIndicator position="bottom">
					<AvatarStatus status="online" />
				</AvatarIndicator>
			</AvatarRoot>
			<AvatarRoot size="56">
				<AvatarImage
					src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
					alt="User"
				/>
				<AvatarIndicator position="bottom">
					<AvatarStatus status="away" />
				</AvatarIndicator>
			</AvatarRoot>
			<AvatarRoot size="56">
				<AvatarImage
					src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
					alt="User"
				/>
				<AvatarIndicator position="bottom">
					<AvatarStatus status="busy" />
				</AvatarIndicator>
			</AvatarRoot>
			<AvatarRoot size="56">
				<AvatarImage
					src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
					alt="User"
				/>
				<AvatarIndicator position="bottom">
					<AvatarStatus status="offline" />
				</AvatarIndicator>
			</AvatarRoot>
		</div>
	),
}

// Status variants
export const StatusVariants: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<AvatarStatus status="online" />
				<span className="text-xs text-text-sub-600">Online</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarStatus status="away" />
				<span className="text-xs text-text-sub-600">Away</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarStatus status="busy" />
				<span className="text-xs text-text-sub-600">Busy</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarStatus status="offline" />
				<span className="text-xs text-text-sub-600">Offline</span>
			</div>
		</div>
	),
}

// Avatar Group
export const Group: Story = {
	render: () => (
		<AvatarGroup size="40" max={4}>
			<AvatarRoot>
				<AvatarImage
					src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
					alt="User 1"
				/>
			</AvatarRoot>
			<AvatarRoot>
				<AvatarImage
					src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
					alt="User 2"
				/>
			</AvatarRoot>
			<AvatarRoot>
				<AvatarImage
					src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
					alt="User 3"
				/>
			</AvatarRoot>
			<AvatarRoot>
				<AvatarImage
					src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
					alt="User 4"
				/>
			</AvatarRoot>
			<AvatarRoot color="purple">JD</AvatarRoot>
			<AvatarRoot color="blue">AB</AvatarRoot>
		</AvatarGroup>
	),
}

// Avatar Group Spacing
export const GroupSpacing: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-sm text-text-sub-600 mb-2">Tight spacing</p>
				<AvatarGroup size="40" spacing="tight">
					<AvatarRoot color="blue">A</AvatarRoot>
					<AvatarRoot color="purple">B</AvatarRoot>
					<AvatarRoot color="sky">C</AvatarRoot>
					<AvatarRoot color="yellow">D</AvatarRoot>
				</AvatarGroup>
			</div>
			<div>
				<p className="text-sm text-text-sub-600 mb-2">Normal spacing</p>
				<AvatarGroup size="40" spacing="normal">
					<AvatarRoot color="blue">A</AvatarRoot>
					<AvatarRoot color="purple">B</AvatarRoot>
					<AvatarRoot color="sky">C</AvatarRoot>
					<AvatarRoot color="yellow">D</AvatarRoot>
				</AvatarGroup>
			</div>
			<div>
				<p className="text-sm text-text-sub-600 mb-2">Loose spacing</p>
				<AvatarGroup size="40" spacing="loose">
					<AvatarRoot color="blue">A</AvatarRoot>
					<AvatarRoot color="purple">B</AvatarRoot>
					<AvatarRoot color="sky">C</AvatarRoot>
					<AvatarRoot color="yellow">D</AvatarRoot>
				</AvatarGroup>
			</div>
		</div>
	),
}

// Avatar with Fallback
export const WithFallback: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<AvatarWithFallback
					size="56"
					src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
					name="John Doe"
				/>
				<span className="text-xs text-text-sub-600">With Image</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarWithFallback size="56" name="John Doe" color="blue" />
				<span className="text-xs text-text-sub-600">Fallback</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarWithFallback
					size="56"
					src="https://invalid-url.com/broken.jpg"
					name="Jane Smith"
					color="purple"
				/>
				<span className="text-xs text-text-sub-600">Error → Fallback</span>
			</div>
		</div>
	),
}
