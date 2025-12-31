import type { Meta, StoryObj } from "@storybook/react"
import { BadgeRoot, BadgeIcon, BadgeDot } from "@/components/ui/data-display"
import { Star, Lightning, Check, Warning, Info } from "@phosphor-icons/react"

const meta: Meta<typeof BadgeRoot> = {
	title: "Data Display/Badge",
	component: BadgeRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["filled", "light", "lighter", "soft", "stroke"],
			description: "Visual style variant",
		},
		color: {
			control: "select",
			options: ["gray", "blue", "orange", "red", "green", "yellow", "purple", "sky", "pink", "teal"],
			description: "Color of the badge",
		},
		size: {
			control: "select",
			options: ["small", "medium"],
			description: "Size of the badge",
		},
	},
}

export default meta
type Story = StoryObj<typeof BadgeRoot>

// Basic badge
export const Basic: Story = {
	args: {
		children: "Badge",
		variant: "filled",
		color: "blue",
		size: "medium",
	},
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2 items-center">
				<BadgeRoot variant="filled" color="blue">Filled</BadgeRoot>
				<BadgeRoot variant="light" color="blue">Light</BadgeRoot>
				<BadgeRoot variant="lighter" color="blue">Lighter</BadgeRoot>
				<BadgeRoot variant="soft" color="blue">Soft</BadgeRoot>
				<BadgeRoot variant="stroke" color="blue">Stroke</BadgeRoot>
			</div>
		</div>
	),
}

// All colors
export const AllColors: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<BadgeRoot variant="filled" color="gray">Gray</BadgeRoot>
			<BadgeRoot variant="filled" color="blue">Blue</BadgeRoot>
			<BadgeRoot variant="filled" color="orange">Orange</BadgeRoot>
			<BadgeRoot variant="filled" color="red">Red</BadgeRoot>
			<BadgeRoot variant="filled" color="green">Green</BadgeRoot>
			<BadgeRoot variant="filled" color="yellow">Yellow</BadgeRoot>
			<BadgeRoot variant="filled" color="purple">Purple</BadgeRoot>
			<BadgeRoot variant="filled" color="sky">Sky</BadgeRoot>
			<BadgeRoot variant="filled" color="pink">Pink</BadgeRoot>
			<BadgeRoot variant="filled" color="teal">Teal</BadgeRoot>
		</div>
	),
}

// With icons
export const WithIcon: Story = {
	render: () => (
		<div className="flex gap-2">
			<BadgeRoot variant="filled" color="blue">
				<BadgeIcon>
					<Star weight="fill" />
				</BadgeIcon>
				Featured
			</BadgeRoot>
			<BadgeRoot variant="filled" color="green">
				<BadgeIcon>
					<Check weight="bold" />
				</BadgeIcon>
				Verified
			</BadgeRoot>
			<BadgeRoot variant="filled" color="yellow">
				<BadgeIcon>
					<Lightning weight="fill" />
				</BadgeIcon>
				Pro
			</BadgeRoot>
		</div>
	),
}

// With dot
export const WithDot: Story = {
	render: () => (
		<div className="flex gap-2">
			<BadgeRoot variant="light" color="green">
				<BadgeDot />
				Active
			</BadgeRoot>
			<BadgeRoot variant="light" color="red">
				<BadgeDot />
				Inactive
			</BadgeRoot>
			<BadgeRoot variant="light" color="yellow">
				<BadgeDot />
				Pending
			</BadgeRoot>
		</div>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex gap-2 items-center">
			<BadgeRoot variant="filled" color="blue" size="small">Small</BadgeRoot>
			<BadgeRoot variant="filled" color="blue" size="medium">Medium</BadgeRoot>
		</div>
	),
}

// Status badges
export const StatusBadges: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<BadgeRoot variant="soft" color="green">
					<BadgeDot />
					Active
				</BadgeRoot>
				<BadgeRoot variant="soft" color="red">
					<BadgeDot />
					Inactive
				</BadgeRoot>
				<BadgeRoot variant="soft" color="yellow">
					<BadgeDot />
					Pending
				</BadgeRoot>
				<BadgeRoot variant="soft" color="blue">
					<BadgeDot />
					Processing
				</BadgeRoot>
			</div>
			<div className="flex gap-2">
				<BadgeRoot variant="light" color="green">
					<BadgeIcon>
						<Check weight="bold" />
					</BadgeIcon>
					Approved
				</BadgeRoot>
				<BadgeRoot variant="light" color="red">
					<BadgeIcon>
						<Warning weight="fill" />
					</BadgeIcon>
					Rejected
				</BadgeRoot>
				<BadgeRoot variant="light" color="blue">
					<BadgeIcon>
						<Info weight="fill" />
					</BadgeIcon>
					Info
				</BadgeRoot>
			</div>
		</div>
	),
}

// Use cases
export const UseCases: Story = {
	render: () => (
		<div className="flex flex-col gap-4 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
			<div className="flex items-center justify-between">
				<span className="text-label-md">Campaign Status</span>
				<BadgeRoot variant="soft" color="green">
					<BadgeDot />
					Live
				</BadgeRoot>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-label-md">Subscription</span>
				<BadgeRoot variant="filled" color="purple">
					<BadgeIcon>
						<Star weight="fill" />
					</BadgeIcon>
					Premium
				</BadgeRoot>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-label-md">Verification</span>
				<BadgeRoot variant="light" color="blue">
					<BadgeIcon>
						<Check weight="bold" />
					</BadgeIcon>
					Verified
				</BadgeRoot>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-label-md">Priority</span>
				<BadgeRoot variant="stroke" color="red">High</BadgeRoot>
			</div>
		</div>
	),
}
