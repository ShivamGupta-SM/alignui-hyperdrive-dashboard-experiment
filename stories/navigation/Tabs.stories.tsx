import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as TabsRoot,
	List as TabsList,
	Trigger as TabsTrigger,
	Content as TabsContent,
	Icon as TabsIcon,
} from "@/components/ui/navigation/tab-menu-horizontal"
import { House, User, Gear, Bell, ChartBar } from "@phosphor-icons/react"

const meta: Meta<typeof TabsRoot> = {
	title: "Navigation/Tabs",
	component: TabsRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof TabsRoot>

// Basic tabs
export const Basic: Story = {
	render: () => (
		<div className="w-[500px]">
			<TabsRoot defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Overview</TabsTrigger>
					<TabsTrigger value="tab2">Analytics</TabsTrigger>
					<TabsTrigger value="tab3">Reports</TabsTrigger>
					<TabsTrigger value="tab4">Settings</TabsTrigger>
				</TabsList>
				<div className="p-4">
					<TabsContent value="tab1">
						<p className="text-paragraph-sm text-text-sub-600">
							Welcome to the overview section. Here you can see a summary of your account.
						</p>
					</TabsContent>
					<TabsContent value="tab2">
						<p className="text-paragraph-sm text-text-sub-600">
							Analytics dashboard showing your performance metrics.
						</p>
					</TabsContent>
					<TabsContent value="tab3">
						<p className="text-paragraph-sm text-text-sub-600">
							Generate and view reports for your business.
						</p>
					</TabsContent>
					<TabsContent value="tab4">
						<p className="text-paragraph-sm text-text-sub-600">
							Configure your account settings here.
						</p>
					</TabsContent>
				</div>
			</TabsRoot>
		</div>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<div className="w-[600px]">
			<TabsRoot defaultValue="home">
				<TabsList>
					<TabsTrigger value="home">
						<TabsIcon as={House} />
						Home
					</TabsTrigger>
					<TabsTrigger value="profile">
						<TabsIcon as={User} />
						Profile
					</TabsTrigger>
					<TabsTrigger value="analytics">
						<TabsIcon as={ChartBar} />
						Analytics
					</TabsTrigger>
					<TabsTrigger value="notifications">
						<TabsIcon as={Bell} />
						Notifications
					</TabsTrigger>
					<TabsTrigger value="settings">
						<TabsIcon as={Gear} />
						Settings
					</TabsTrigger>
				</TabsList>
				<div className="p-4">
					<TabsContent value="home">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-md text-text-strong-950 mb-2">Welcome Home</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Your dashboard overview and quick actions.
							</p>
						</div>
					</TabsContent>
					<TabsContent value="profile">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-md text-text-strong-950 mb-2">Your Profile</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Manage your personal information and preferences.
							</p>
						</div>
					</TabsContent>
					<TabsContent value="analytics">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-md text-text-strong-950 mb-2">Analytics</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								View your performance metrics and insights.
							</p>
						</div>
					</TabsContent>
					<TabsContent value="notifications">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-md text-text-strong-950 mb-2">Notifications</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Manage your notification preferences.
							</p>
						</div>
					</TabsContent>
					<TabsContent value="settings">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-md text-text-strong-950 mb-2">Settings</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Configure your account and application settings.
							</p>
						</div>
					</TabsContent>
				</div>
			</TabsRoot>
		</div>
	),
}

// Icon only
export const IconOnly: Story = {
	render: () => (
		<div className="w-[400px]">
			<TabsRoot defaultValue="home">
				<TabsList>
					<TabsTrigger value="home">
						<TabsIcon as={House} />
					</TabsTrigger>
					<TabsTrigger value="profile">
						<TabsIcon as={User} />
					</TabsTrigger>
					<TabsTrigger value="analytics">
						<TabsIcon as={ChartBar} />
					</TabsTrigger>
					<TabsTrigger value="settings">
						<TabsIcon as={Gear} />
					</TabsTrigger>
				</TabsList>
			</TabsRoot>
		</div>
	),
}

// Dashboard example
export const DashboardExample: Story = {
	render: () => (
		<div className="w-[600px] p-6 bg-bg-white-0 rounded-xl shadow-regular-md">
			<h2 className="text-heading-sm text-text-strong-950 mb-4">Account Dashboard</h2>
			<TabsRoot defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="billing">Billing</TabsTrigger>
					<TabsTrigger value="team">Team</TabsTrigger>
				</TabsList>
				<div className="py-4">
					<TabsContent value="overview">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-bg-weak-50 rounded-lg">
								<p className="text-label-xs text-text-sub-600 mb-1">Total Users</p>
								<p className="text-heading-md text-text-strong-950">1,234</p>
							</div>
							<div className="p-4 bg-bg-weak-50 rounded-lg">
								<p className="text-label-xs text-text-sub-600 mb-1">Revenue</p>
								<p className="text-heading-md text-text-strong-950">$45,678</p>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="activity">
						<div className="space-y-3">
							<div className="p-3 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-strong-950">New user signup</p>
								<p className="text-paragraph-xs text-text-sub-600">2 minutes ago</p>
							</div>
							<div className="p-3 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-strong-950">Payment received</p>
								<p className="text-paragraph-xs text-text-sub-600">1 hour ago</p>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="billing">
						<p className="text-paragraph-sm text-text-sub-600">
							Manage your billing information and view invoices.
						</p>
					</TabsContent>
					<TabsContent value="team">
						<p className="text-paragraph-sm text-text-sub-600">
							Invite team members and manage permissions.
						</p>
					</TabsContent>
				</div>
			</TabsRoot>
		</div>
	),
}
