import type { Meta, StoryObj } from "@storybook/react"
import * as AvatarGroupCompact from "@/components/ui/primitives/avatar-group-compact"
import * as Avatar from "@/components/ui/primitives/avatar"

const meta: Meta<typeof AvatarGroupCompact.Root> = {
	title: "Primitives/AvatarGroupCompact",
	component: AvatarGroupCompact.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["40", "32", "24"],
		},
		variant: {
			control: "select",
			options: ["default", "stroke"],
		},
	},
}

export default meta
type Story = StoryObj<typeof AvatarGroupCompact.Root>

// Sample avatar URLs
const avatarUrls = [
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
]

// Basic avatar group
export const Basic: Story = {
	render: () => (
		<AvatarGroupCompact.Root>
			<AvatarGroupCompact.Stack>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[0]} alt="User 1" />
				</Avatar.Root>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[1]} alt="User 2" />
				</Avatar.Root>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[2]} alt="User 3" />
				</Avatar.Root>
			</AvatarGroupCompact.Stack>
			<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
		</AvatarGroupCompact.Root>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Size 40</p>
				<AvatarGroupCompact.Root size="40">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Size 32</p>
				<AvatarGroupCompact.Root size="32">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Size 24</p>
				<AvatarGroupCompact.Root size="24">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
			</div>
		</div>
	),
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Default</p>
				<AvatarGroupCompact.Root variant="default">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Stroke</p>
				<AvatarGroupCompact.Root variant="stroke">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
			</div>
		</div>
	),
}

// With initials fallback
export const WithInitials: Story = {
	render: () => (
		<AvatarGroupCompact.Root>
			<AvatarGroupCompact.Stack>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[0]} alt="John Doe" />
				</Avatar.Root>
				<Avatar.Root size="40" color="blue">
					<Avatar.Indicator>JD</Avatar.Indicator>
				</Avatar.Root>
				<Avatar.Root size="40" color="purple">
					<Avatar.Indicator>SM</Avatar.Indicator>
				</Avatar.Root>
			</AvatarGroupCompact.Stack>
			<AvatarGroupCompact.Overflow>+3</AvatarGroupCompact.Overflow>
		</AvatarGroupCompact.Root>
	),
}

// Team members example
export const TeamMembersExample: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<AvatarGroupCompact.Root size="32">
				<AvatarGroupCompact.Stack>
					<Avatar.Root size="32">
						<Avatar.Image src={avatarUrls[0]} alt="Alice" />
					</Avatar.Root>
					<Avatar.Root size="32">
						<Avatar.Image src={avatarUrls[1]} alt="Bob" />
					</Avatar.Root>
					<Avatar.Root size="32">
						<Avatar.Image src={avatarUrls[2]} alt="Charlie" />
					</Avatar.Root>
				</AvatarGroupCompact.Stack>
				<AvatarGroupCompact.Overflow>+12</AvatarGroupCompact.Overflow>
			</AvatarGroupCompact.Root>
			<span className="text-paragraph-sm text-text-sub-600">15 team members</span>
		</div>
	),
}

// Project collaborators example
export const ProjectCollaboratorsExample: Story = {
	render: () => (
		<div className="p-4 border border-stroke-soft-200 rounded-xl w-72">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-label-md text-text-strong-950">Collaborators</h3>
				<button className="text-label-sm text-primary-base hover:text-primary-darker">
					Manage
				</button>
			</div>
			<AvatarGroupCompact.Root variant="stroke">
				<AvatarGroupCompact.Stack>
					<Avatar.Root size="40">
						<Avatar.Image src={avatarUrls[0]} alt="User 1" />
					</Avatar.Root>
					<Avatar.Root size="40">
						<Avatar.Image src={avatarUrls[1]} alt="User 2" />
					</Avatar.Root>
					<Avatar.Root size="40">
						<Avatar.Image src={avatarUrls[2]} alt="User 3" />
					</Avatar.Root>
					<Avatar.Root size="40">
						<Avatar.Image src={avatarUrls[3]} alt="User 4" />
					</Avatar.Root>
				</AvatarGroupCompact.Stack>
				<AvatarGroupCompact.Overflow>+8</AvatarGroupCompact.Overflow>
			</AvatarGroupCompact.Root>
		</div>
	),
}

// Comment thread example
export const CommentThreadExample: Story = {
	render: () => (
		<div className="p-4 bg-bg-weak-50 rounded-xl w-80">
			<p className="text-paragraph-sm text-text-sub-600 mb-3">
				12 people are discussing this topic
			</p>
			<div className="flex items-center justify-between">
				<AvatarGroupCompact.Root size="24">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[0]} alt="User 1" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[1]} alt="User 2" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[2]} alt="User 3" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[3]} alt="User 4" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[4]} alt="User 5" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+7</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
				<button className="text-label-sm text-primary-base hover:text-primary-darker">
					Join discussion
				</button>
			</div>
		</div>
	),
}

// Task assignees example
export const TaskAssigneesExample: Story = {
	render: () => (
		<div className="flex items-center gap-4 p-3 border border-stroke-soft-200 rounded-lg">
			<div className="flex-1">
				<p className="text-label-sm text-text-strong-950">Design system update</p>
				<p className="text-paragraph-xs text-text-sub-600">Due in 3 days</p>
			</div>
			<AvatarGroupCompact.Root size="24">
				<AvatarGroupCompact.Stack>
					<Avatar.Root size="24">
						<Avatar.Image src={avatarUrls[0]} alt="Assignee 1" />
					</Avatar.Root>
					<Avatar.Root size="24">
						<Avatar.Image src={avatarUrls[1]} alt="Assignee 2" />
					</Avatar.Root>
				</AvatarGroupCompact.Stack>
			</AvatarGroupCompact.Root>
		</div>
	),
}

// Online users example
export const OnlineUsersExample: Story = {
	render: () => (
		<div className="flex items-center gap-2 px-3 py-2 bg-success-lighter rounded-full">
			<span className="size-2 rounded-full bg-success-base" />
			<AvatarGroupCompact.Root size="24">
				<AvatarGroupCompact.Stack>
					<Avatar.Root size="24">
						<Avatar.Image src={avatarUrls[0]} alt="Online user 1" />
					</Avatar.Root>
					<Avatar.Root size="24">
						<Avatar.Image src={avatarUrls[1]} alt="Online user 2" />
					</Avatar.Root>
					<Avatar.Root size="24">
						<Avatar.Image src={avatarUrls[2]} alt="Online user 3" />
					</Avatar.Root>
				</AvatarGroupCompact.Stack>
				<AvatarGroupCompact.Overflow>+4</AvatarGroupCompact.Overflow>
			</AvatarGroupCompact.Root>
			<span className="text-label-xs text-success-base">7 online</span>
		</div>
	),
}

// Without overflow
export const WithoutOverflow: Story = {
	render: () => (
		<AvatarGroupCompact.Root>
			<AvatarGroupCompact.Stack>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[0]} alt="User 1" />
				</Avatar.Root>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[1]} alt="User 2" />
				</Avatar.Root>
				<Avatar.Root size="40">
					<Avatar.Image src={avatarUrls[2]} alt="User 3" />
				</Avatar.Root>
			</AvatarGroupCompact.Stack>
		</AvatarGroupCompact.Root>
	),
}

// Meeting participants example
export const MeetingParticipantsExample: Story = {
	render: () => (
		<div className="p-4 border border-stroke-soft-200 rounded-xl w-80">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="text-label-md text-text-strong-950">Sprint Planning</h3>
					<p className="text-paragraph-xs text-text-soft-400">Today, 2:00 PM</p>
				</div>
				<span className="px-2 py-0.5 bg-success-lighter text-success-base text-label-xs rounded-full">
					Live
				</span>
			</div>
			<div className="flex items-center justify-between">
				<AvatarGroupCompact.Root size="32" variant="stroke">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[0]} alt="Participant 1" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[1]} alt="Participant 2" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[2]} alt="Participant 3" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[3]} alt="Participant 4" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+6</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
				<button className="px-3 py-1.5 bg-primary-base text-white text-label-sm rounded-lg hover:bg-primary-darker">
					Join
				</button>
			</div>
		</div>
	),
}

// Size comparison
export const SizeComparison: Story = {
	render: () => (
		<div className="flex items-end gap-6">
			<div className="flex flex-col items-center gap-2">
				<AvatarGroupCompact.Root size="40">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[0]} alt="User" />
						</Avatar.Root>
						<Avatar.Root size="40">
							<Avatar.Image src={avatarUrls[1]} alt="User" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+3</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
				<span className="text-paragraph-xs text-text-soft-400">40</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarGroupCompact.Root size="32">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[0]} alt="User" />
						</Avatar.Root>
						<Avatar.Root size="32">
							<Avatar.Image src={avatarUrls[1]} alt="User" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+3</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
				<span className="text-paragraph-xs text-text-soft-400">32</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AvatarGroupCompact.Root size="24">
					<AvatarGroupCompact.Stack>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[0]} alt="User" />
						</Avatar.Root>
						<Avatar.Root size="24">
							<Avatar.Image src={avatarUrls[1]} alt="User" />
						</Avatar.Root>
					</AvatarGroupCompact.Stack>
					<AvatarGroupCompact.Overflow>+3</AvatarGroupCompact.Overflow>
				</AvatarGroupCompact.Root>
				<span className="text-paragraph-xs text-text-soft-400">24</span>
			</div>
		</div>
	),
}
