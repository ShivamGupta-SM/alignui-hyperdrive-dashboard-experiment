import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
	Content as PopoverContent,
	Close as PopoverClose,
} from "@/components/ui/layout/popover"
import { ButtonRoot } from "@/components/ui/primitives"
import { X, Bell, Gear, User, Question } from "@phosphor-icons/react"

const meta: Meta<typeof PopoverRoot> = {
	title: "Layout/Popover",
	component: PopoverRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof PopoverRoot>

// Basic popover
export const Basic: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<ButtonRoot variant="primary">Open Popover</ButtonRoot>
			</PopoverTrigger>
			<PopoverContent>
				<h4 className="text-label-md text-text-strong-950 mb-2">Popover Title</h4>
				<p className="text-paragraph-sm text-text-sub-600">
					This is the popover content. You can put any content here.
				</p>
			</PopoverContent>
		</PopoverRoot>
	),
}

// With close button
export const WithCloseButton: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<ButtonRoot variant="primary">Open Popover</ButtonRoot>
			</PopoverTrigger>
			<PopoverContent className="relative pr-10">
				<PopoverClose>
					<X className="size-4 text-text-sub-600 hover:text-text-strong-950" />
				</PopoverClose>
				<h4 className="text-label-md text-text-strong-950 mb-2">Dismissible Popover</h4>
				<p className="text-paragraph-sm text-text-sub-600">
					Click the X button or outside to close this popover.
				</p>
			</PopoverContent>
		</PopoverRoot>
	),
}

// Different alignments
export const Alignments: Story = {
	render: () => (
		<div className="flex gap-4">
			<PopoverRoot>
				<PopoverTrigger asChild>
					<ButtonRoot variant="basic">Start</ButtonRoot>
				</PopoverTrigger>
				<PopoverContent align="start">
					<p className="text-paragraph-sm text-text-sub-600">Aligned to start</p>
				</PopoverContent>
			</PopoverRoot>
			<PopoverRoot>
				<PopoverTrigger asChild>
					<ButtonRoot variant="basic">Center</ButtonRoot>
				</PopoverTrigger>
				<PopoverContent align="center">
					<p className="text-paragraph-sm text-text-sub-600">Aligned to center</p>
				</PopoverContent>
			</PopoverRoot>
			<PopoverRoot>
				<PopoverTrigger asChild>
					<ButtonRoot variant="basic">End</ButtonRoot>
				</PopoverTrigger>
				<PopoverContent align="end">
					<p className="text-paragraph-sm text-text-sub-600">Aligned to end</p>
				</PopoverContent>
			</PopoverRoot>
		</div>
	),
}

// Without arrow
export const WithoutArrow: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<ButtonRoot variant="primary">No Arrow</ButtonRoot>
			</PopoverTrigger>
			<PopoverContent showArrow={false}>
				<h4 className="text-label-md text-text-strong-950 mb-2">No Arrow</h4>
				<p className="text-paragraph-sm text-text-sub-600">
					This popover does not have an arrow indicator.
				</p>
			</PopoverContent>
		</PopoverRoot>
	),
}

// Notification popover
export const NotificationPopover: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<button className="relative p-2 rounded-lg hover:bg-bg-weak-50 transition-colors">
					<Bell className="size-5 text-text-sub-600" />
					<span className="absolute top-1 right-1 size-2 bg-error-base rounded-full" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0">
				<div className="p-4 border-b border-stroke-soft-200">
					<h4 className="text-label-md text-text-strong-950">Notifications</h4>
				</div>
				<div className="max-h-80 overflow-y-auto">
					<div className="p-4 border-b border-stroke-soft-200 hover:bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-strong-950">New message received</p>
						<p className="text-paragraph-xs text-text-sub-600">2 minutes ago</p>
					</div>
					<div className="p-4 border-b border-stroke-soft-200 hover:bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-strong-950">Your report is ready</p>
						<p className="text-paragraph-xs text-text-sub-600">1 hour ago</p>
					</div>
					<div className="p-4 hover:bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-strong-950">Welcome to the platform!</p>
						<p className="text-paragraph-xs text-text-sub-600">Yesterday</p>
					</div>
				</div>
				<div className="p-3 border-t border-stroke-soft-200">
					<button className="w-full text-center text-label-sm text-primary-base hover:text-primary-darker">
						View all notifications
					</button>
				</div>
			</PopoverContent>
		</PopoverRoot>
	),
}

// User menu popover
export const UserMenuPopover: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<button className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-weak-50 transition-colors">
					<div className="size-8 rounded-full bg-primary-base flex items-center justify-center text-white text-sm font-medium">
						JD
					</div>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-0" align="end">
				<div className="p-4 border-b border-stroke-soft-200">
					<p className="text-label-sm text-text-strong-950">John Doe</p>
					<p className="text-paragraph-xs text-text-sub-600">john@example.com</p>
				</div>
				<div className="p-2">
					<button className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-bg-weak-50 transition-colors">
						<User className="size-4 text-text-sub-600" />
						<span className="text-paragraph-sm text-text-strong-950">Profile</span>
					</button>
					<button className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-bg-weak-50 transition-colors">
						<Gear className="size-4 text-text-sub-600" />
						<span className="text-paragraph-sm text-text-strong-950">Settings</span>
					</button>
					<button className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-bg-weak-50 transition-colors">
						<Question className="size-4 text-text-sub-600" />
						<span className="text-paragraph-sm text-text-strong-950">Help</span>
					</button>
				</div>
				<div className="p-2 border-t border-stroke-soft-200">
					<button className="w-full p-2 rounded-lg text-left text-paragraph-sm text-error-base hover:bg-error-lighter transition-colors">
						Sign out
					</button>
				</div>
			</PopoverContent>
		</PopoverRoot>
	),
}

// Form popover
export const FormPopover: Story = {
	render: () => (
		<PopoverRoot>
			<PopoverTrigger asChild>
				<ButtonRoot variant="primary">Quick Add</ButtonRoot>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<h4 className="text-label-md text-text-strong-950 mb-4">Add new item</h4>
				<div className="flex flex-col gap-3">
					<div>
						<label className="text-label-sm text-text-sub-600 mb-1 block">Name</label>
						<input
							type="text"
							placeholder="Enter name"
							className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
						/>
					</div>
					<div>
						<label className="text-label-sm text-text-sub-600 mb-1 block">Description</label>
						<input
							type="text"
							placeholder="Enter description"
							className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
						/>
					</div>
					<div className="flex gap-2 justify-end mt-2">
						<PopoverClose asChild>
							<ButtonRoot variant="basic" size="small">Cancel</ButtonRoot>
						</PopoverClose>
						<ButtonRoot variant="primary" size="small">Add</ButtonRoot>
					</div>
				</div>
			</PopoverContent>
		</PopoverRoot>
	),
}
