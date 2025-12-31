import type { Meta, StoryObj } from "@storybook/react"
import * as List from "@/components/ui/data-display/list"
import { House, User, Gear, Bell, Folder, File, Star, Heart, ShieldCheck, CreditCard, Envelope, Calendar, ChartBar, Lightning, Check, CaretRight, Trash, PencilSimple } from "@phosphor-icons/react"

const meta: Meta<typeof List.Root> = {
	title: "Data Display/List",
	component: List.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "divided", "bordered"],
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		interactive: {
			control: "boolean",
		},
	},
}

export default meta
type Story = StoryObj<typeof List.Root>

// Basic list
export const Basic: Story = {
	render: () => (
		<List.Root className="w-64">
			<List.Item>
				<List.ItemIcon autoSize>
					<House weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Dashboard</List.ItemTitle>
				</List.ItemContent>
			</List.Item>
			<List.Item>
				<List.ItemIcon autoSize>
					<User weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Profile</List.ItemTitle>
				</List.ItemContent>
			</List.Item>
			<List.Item>
				<List.ItemIcon autoSize>
					<Gear weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Settings</List.ItemTitle>
				</List.ItemContent>
			</List.Item>
		</List.Root>
	),
}

// With descriptions
export const WithDescriptions: Story = {
	render: () => (
		<List.Root className="w-80">
			<List.Item>
				<List.ItemIcon autoSize>
					<User weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Account</List.ItemTitle>
					<List.ItemDescription>Manage your account settings</List.ItemDescription>
				</List.ItemContent>
			</List.Item>
			<List.Item>
				<List.ItemIcon autoSize>
					<Bell weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Notifications</List.ItemTitle>
					<List.ItemDescription>Configure notification preferences</List.ItemDescription>
				</List.ItemContent>
			</List.Item>
			<List.Item>
				<List.ItemIcon autoSize>
					<ShieldCheck weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Privacy</List.ItemTitle>
					<List.ItemDescription>Control your privacy settings</List.ItemDescription>
				</List.ItemContent>
			</List.Item>
		</List.Root>
	),
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Default</p>
				<List.Root variant="default" className="w-72">
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Documents</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Images</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Videos</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Divided</p>
				<List.Root variant="divided" className="w-72">
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Documents</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Images</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Videos</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Bordered</p>
				<List.Root variant="bordered" className="w-72">
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Documents</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Images</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<Folder weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>Videos</List.ItemTitle>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small</p>
				<List.Root size="sm" variant="divided" className="w-64">
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>document.pdf</List.ItemTitle>
							<List.ItemDescription>2.4 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>report.xlsx</List.ItemTitle>
							<List.ItemDescription>1.2 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Medium (Default)</p>
				<List.Root size="md" variant="divided" className="w-64">
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>document.pdf</List.ItemTitle>
							<List.ItemDescription>2.4 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>report.xlsx</List.ItemTitle>
							<List.ItemDescription>1.2 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Large</p>
				<List.Root size="lg" variant="divided" className="w-64">
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>document.pdf</List.ItemTitle>
							<List.ItemDescription>2.4 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
					<List.Item>
						<List.ItemIcon autoSize>
							<File weight="duotone" />
						</List.ItemIcon>
						<List.ItemContent>
							<List.ItemTitle>report.xlsx</List.ItemTitle>
							<List.ItemDescription>1.2 MB</List.ItemDescription>
						</List.ItemContent>
					</List.Item>
				</List.Root>
			</div>
		</div>
	),
}

// Interactive list
export const Interactive: Story = {
	render: () => (
		<List.Root interactive variant="divided" className="w-72">
			<List.Item onClick={() => console.log("Dashboard clicked")}>
				<List.ItemIcon autoSize>
					<House weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Dashboard</List.ItemTitle>
					<List.ItemDescription>View analytics</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<CaretRight className="size-4 text-text-soft-400" />
				</List.ItemAction>
			</List.Item>
			<List.Item onClick={() => console.log("Settings clicked")}>
				<List.ItemIcon autoSize>
					<Gear weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Settings</List.ItemTitle>
					<List.ItemDescription>Configure app</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<CaretRight className="size-4 text-text-soft-400" />
				</List.ItemAction>
			</List.Item>
			<List.Item onClick={() => console.log("Profile clicked")}>
				<List.ItemIcon autoSize>
					<User weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Profile</List.ItemTitle>
					<List.ItemDescription>Edit your info</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<CaretRight className="size-4 text-text-soft-400" />
				</List.ItemAction>
			</List.Item>
		</List.Root>
	),
}

// With actions
export const WithActions: Story = {
	render: () => (
		<List.Root variant="divided" className="w-80">
			<List.Item>
				<List.ItemIcon autoSize>
					<File weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>design-spec.pdf</List.ItemTitle>
					<List.ItemDescription>Updated 2 hours ago</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<div className="flex gap-1">
						<button className="p-1 rounded hover:bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950">
							<PencilSimple className="size-4" />
						</button>
						<button className="p-1 rounded hover:bg-bg-weak-50 text-text-sub-600 hover:text-error-base">
							<Trash className="size-4" />
						</button>
					</div>
				</List.ItemAction>
			</List.Item>
			<List.Item>
				<List.ItemIcon autoSize>
					<File weight="duotone" />
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>meeting-notes.docx</List.ItemTitle>
					<List.ItemDescription>Updated yesterday</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<div className="flex gap-1">
						<button className="p-1 rounded hover:bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950">
							<PencilSimple className="size-4" />
						</button>
						<button className="p-1 rounded hover:bg-bg-weak-50 text-text-sub-600 hover:text-error-base">
							<Trash className="size-4" />
						</button>
					</div>
				</List.ItemAction>
			</List.Item>
		</List.Root>
	),
}

// Simple list item helper
export const SimpleListItemExample: Story = {
	render: () => (
		<List.Root variant="divided" className="w-72">
			<List.SimpleListItem
				icon={<House weight="duotone" className="size-5" />}
				title="Home"
				description="Go to homepage"
			/>
			<List.SimpleListItem
				icon={<Star weight="duotone" className="size-5" />}
				title="Favorites"
				description="View saved items"
			/>
			<List.SimpleListItem
				icon={<Gear weight="duotone" className="size-5" />}
				title="Settings"
				description="Configure options"
			/>
		</List.Root>
	),
}

// Ordered list
export const OrderedListExample: Story = {
	render: () => (
		<List.OrderedList variant="divided" className="w-72">
			<li className="py-2 text-paragraph-sm text-text-sub-600">First step in the process</li>
			<li className="py-2 text-paragraph-sm text-text-sub-600">Second step to follow</li>
			<li className="py-2 text-paragraph-sm text-text-sub-600">Third and final step</li>
		</List.OrderedList>
	),
}

// Bulleted list
export const BulletedListExample: Story = {
	render: () => (
		<List.BulletedList className="w-72">
			<li className="py-1 text-paragraph-sm text-text-sub-600">Feature one benefit</li>
			<li className="py-1 text-paragraph-sm text-text-sub-600">Feature two benefit</li>
			<li className="py-1 text-paragraph-sm text-text-sub-600">Feature three benefit</li>
		</List.BulletedList>
	),
}

// Settings menu example
export const SettingsMenuExample: Story = {
	render: () => (
		<div className="w-72 p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-3">Settings</h3>
			<List.Root interactive variant="default">
				<List.Item className="py-2 px-2 rounded-lg">
					<List.ItemIcon autoSize>
						<User weight="duotone" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Account</List.ItemTitle>
					</List.ItemContent>
					<List.ItemAction>
						<CaretRight className="size-4 text-text-soft-400" />
					</List.ItemAction>
				</List.Item>
				<List.Item className="py-2 px-2 rounded-lg">
					<List.ItemIcon autoSize>
						<Bell weight="duotone" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Notifications</List.ItemTitle>
					</List.ItemContent>
					<List.ItemAction>
						<CaretRight className="size-4 text-text-soft-400" />
					</List.ItemAction>
				</List.Item>
				<List.Item className="py-2 px-2 rounded-lg">
					<List.ItemIcon autoSize>
						<ShieldCheck weight="duotone" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Privacy & Security</List.ItemTitle>
					</List.ItemContent>
					<List.ItemAction>
						<CaretRight className="size-4 text-text-soft-400" />
					</List.ItemAction>
				</List.Item>
				<List.Item className="py-2 px-2 rounded-lg">
					<List.ItemIcon autoSize>
						<CreditCard weight="duotone" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Billing</List.ItemTitle>
					</List.ItemContent>
					<List.ItemAction>
						<CaretRight className="size-4 text-text-soft-400" />
					</List.ItemAction>
				</List.Item>
			</List.Root>
		</div>
	),
}

// Feature list example
export const FeatureListExample: Story = {
	render: () => (
		<div className="w-80 p-6 bg-gradient-to-br from-primary-lighter to-primary-base/10 rounded-xl">
			<h3 className="text-heading-md text-text-strong-950 mb-4">Pro Features</h3>
			<List.Root size="md">
				<List.Item className="mb-2">
					<List.ItemIcon>
						<div className="size-5 rounded-full bg-success-base flex items-center justify-center">
							<Check weight="bold" className="size-3 text-white" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Unlimited projects</List.ItemTitle>
					</List.ItemContent>
				</List.Item>
				<List.Item className="mb-2">
					<List.ItemIcon>
						<div className="size-5 rounded-full bg-success-base flex items-center justify-center">
							<Check weight="bold" className="size-3 text-white" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Priority support</List.ItemTitle>
					</List.ItemContent>
				</List.Item>
				<List.Item className="mb-2">
					<List.ItemIcon>
						<div className="size-5 rounded-full bg-success-base flex items-center justify-center">
							<Check weight="bold" className="size-3 text-white" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Advanced analytics</List.ItemTitle>
					</List.ItemContent>
				</List.Item>
				<List.Item className="mb-2">
					<List.ItemIcon>
						<div className="size-5 rounded-full bg-success-base flex items-center justify-center">
							<Check weight="bold" className="size-3 text-white" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Custom integrations</List.ItemTitle>
					</List.ItemContent>
				</List.Item>
			</List.Root>
		</div>
	),
}

// File browser example
export const FileBrowserExample: Story = {
	render: () => (
		<div className="w-80">
			<List.Root variant="bordered">
				<List.Item className="bg-bg-weak-50">
					<List.ItemIcon>
						<Folder weight="fill" className="size-5 text-warning-base" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Documents</List.ItemTitle>
						<List.ItemDescription>12 items</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
				<List.Item className="bg-bg-weak-50">
					<List.ItemIcon>
						<Folder weight="fill" className="size-5 text-warning-base" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Images</List.ItemTitle>
						<List.ItemDescription>48 items</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
				<List.Item>
					<List.ItemIcon>
						<File weight="duotone" className="size-5 text-primary-base" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>readme.md</List.ItemTitle>
						<List.ItemDescription>4.2 KB</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
				<List.Item>
					<List.ItemIcon>
						<File weight="duotone" className="size-5 text-success-base" />
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>package.json</List.ItemTitle>
						<List.ItemDescription>2.1 KB</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
			</List.Root>
		</div>
	),
}

// Notification list example
export const NotificationListExample: Story = {
	render: () => (
		<div className="w-80 p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-label-md text-text-strong-950">Notifications</h3>
				<button className="text-label-sm text-primary-base">Mark all read</button>
			</div>
			<List.Root variant="divided">
				<List.Item className="py-3">
					<List.ItemIcon>
						<div className="size-8 rounded-full bg-primary-lighter flex items-center justify-center">
							<Envelope weight="duotone" className="size-4 text-primary-base" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>New message received</List.ItemTitle>
						<List.ItemDescription>John sent you a message</List.ItemDescription>
					</List.ItemContent>
					<List.ItemAction>
						<span className="size-2 rounded-full bg-primary-base" />
					</List.ItemAction>
				</List.Item>
				<List.Item className="py-3">
					<List.ItemIcon>
						<div className="size-8 rounded-full bg-success-lighter flex items-center justify-center">
							<Check weight="bold" className="size-4 text-success-base" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Task completed</List.ItemTitle>
						<List.ItemDescription>Design review is done</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
				<List.Item className="py-3">
					<List.ItemIcon>
						<div className="size-8 rounded-full bg-warning-lighter flex items-center justify-center">
							<Calendar weight="duotone" className="size-4 text-warning-base" />
						</div>
					</List.ItemIcon>
					<List.ItemContent>
						<List.ItemTitle>Meeting reminder</List.ItemTitle>
						<List.ItemDescription>Sprint planning in 30 min</List.ItemDescription>
					</List.ItemContent>
				</List.Item>
			</List.Root>
		</div>
	),
}

// Dashboard stats example
export const DashboardStatsExample: Story = {
	render: () => (
		<List.Root variant="bordered" size="lg" className="w-72">
			<List.Item className="justify-between">
				<List.ItemIcon>
					<div className="size-10 rounded-lg bg-primary-lighter flex items-center justify-center">
						<ChartBar weight="duotone" className="size-5 text-primary-base" />
					</div>
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Total Revenue</List.ItemTitle>
					<List.ItemDescription>This month</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<span className="text-label-lg text-text-strong-950">$12,450</span>
				</List.ItemAction>
			</List.Item>
			<List.Item className="justify-between">
				<List.ItemIcon>
					<div className="size-10 rounded-lg bg-success-lighter flex items-center justify-center">
						<User weight="duotone" className="size-5 text-success-base" />
					</div>
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Active Users</List.ItemTitle>
					<List.ItemDescription>Currently online</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<span className="text-label-lg text-text-strong-950">1,234</span>
				</List.ItemAction>
			</List.Item>
			<List.Item className="justify-between">
				<List.ItemIcon>
					<div className="size-10 rounded-lg bg-warning-lighter flex items-center justify-center">
						<Lightning weight="duotone" className="size-5 text-warning-base" />
					</div>
				</List.ItemIcon>
				<List.ItemContent>
					<List.ItemTitle>Conversion</List.ItemTitle>
					<List.ItemDescription>Last 7 days</List.ItemDescription>
				</List.ItemContent>
				<List.ItemAction>
					<span className="text-label-lg text-success-base">+12.5%</span>
				</List.ItemAction>
			</List.Item>
		</List.Root>
	),
}

// Empty list
export const EmptyList: Story = {
	render: () => (
		<List.Root variant="bordered" className="w-72 py-8 px-4 text-center">
			<List.Item className="flex-col">
				<Folder weight="duotone" className="size-12 text-text-soft-400 mb-3" />
				<p className="text-label-sm text-text-strong-950">No items found</p>
				<p className="text-paragraph-xs text-text-sub-600">Add items to see them here</p>
			</List.Item>
		</List.Root>
	),
}
