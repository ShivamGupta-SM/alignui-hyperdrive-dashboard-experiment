import type { Meta, StoryObj } from "@storybook/react"
import * as TabMenuVertical from "@/components/ui/navigation/tab-menu-vertical"
import { House, User, Gear, Bell, ChartBar, Folder, Envelope, Calendar, CreditCard, ShieldCheck, Users, Package, FileText, Question } from "@phosphor-icons/react"

const meta: Meta<typeof TabMenuVertical.Root> = {
	title: "Navigation/TabMenuVertical",
	component: TabMenuVertical.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof TabMenuVertical.Root>

// Basic tabs
export const Basic: Story = {
	render: () => (
		<div className="w-[500px] flex">
			<TabMenuVertical.Root defaultValue="tab1">
				<TabMenuVertical.List>
					<TabMenuVertical.Trigger value="tab1">General</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="tab2">Security</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="tab3">Notifications</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="tab4">Billing</TabMenuVertical.Trigger>
				</TabMenuVertical.List>
				<div className="flex-1 ml-4">
					<TabMenuVertical.Content value="tab1">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">General settings content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="tab2">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Security settings content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="tab3">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Notification settings content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="tab4">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Billing settings content</div>
					</TabMenuVertical.Content>
				</div>
			</TabMenuVertical.Root>
		</div>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<div className="w-[600px] flex">
			<TabMenuVertical.Root defaultValue="home">
				<TabMenuVertical.List>
					<TabMenuVertical.Trigger value="home">
						<TabMenuVertical.Icon as={House} />
						Dashboard
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="profile">
						<TabMenuVertical.Icon as={User} />
						Profile
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="analytics">
						<TabMenuVertical.Icon as={ChartBar} />
						Analytics
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="settings">
						<TabMenuVertical.Icon as={Gear} />
						Settings
					</TabMenuVertical.Trigger>
				</TabMenuVertical.List>
				<div className="flex-1 ml-4">
					<TabMenuVertical.Content value="home">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Dashboard content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="profile">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Profile content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="analytics">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Analytics content</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="settings">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Settings content</div>
					</TabMenuVertical.Content>
				</div>
			</TabMenuVertical.Root>
		</div>
	),
}

// With arrow icons
export const WithArrowIcons: Story = {
	render: () => (
		<div className="w-[600px] flex">
			<TabMenuVertical.Root defaultValue="general">
				<TabMenuVertical.List>
					<TabMenuVertical.Trigger value="general">
						<TabMenuVertical.Icon as={Gear} />
						General
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="security">
						<TabMenuVertical.Icon as={ShieldCheck} />
						Security
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="notifications">
						<TabMenuVertical.Icon as={Bell} />
						Notifications
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="billing">
						<TabMenuVertical.Icon as={CreditCard} />
						Billing
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
				</TabMenuVertical.List>
				<div className="flex-1 ml-4">
					<TabMenuVertical.Content value="general">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">General settings</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="security">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Security settings</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="notifications">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Notification settings</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="billing">
						<div className="p-4 border border-stroke-soft-200 rounded-lg">Billing settings</div>
					</TabMenuVertical.Content>
				</div>
			</TabMenuVertical.Root>
		</div>
	),
}

// Disabled tab
export const DisabledTab: Story = {
	render: () => (
		<TabMenuVertical.Root defaultValue="tab1">
			<TabMenuVertical.List>
				<TabMenuVertical.Trigger value="tab1">Active</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="tab2">Available</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="tab3" disabled>Disabled</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="tab4">Another</TabMenuVertical.Trigger>
			</TabMenuVertical.List>
		</TabMenuVertical.Root>
	),
}

// Settings page example
export const SettingsPageExample: Story = {
	render: () => (
		<div className="w-[700px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h2 className="text-heading-md text-text-strong-950">Settings</h2>
				<p className="text-paragraph-sm text-text-sub-600">Manage your account settings and preferences</p>
			</div>
			<div className="flex p-4">
				<TabMenuVertical.Root defaultValue="profile">
					<TabMenuVertical.List className="w-48">
						<TabMenuVertical.Trigger value="profile">
							<TabMenuVertical.Icon as={User} />
							Profile
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="account">
							<TabMenuVertical.Icon as={Gear} />
							Account
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="security">
							<TabMenuVertical.Icon as={ShieldCheck} />
							Security
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="notifications">
							<TabMenuVertical.Icon as={Bell} />
							Notifications
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="billing">
							<TabMenuVertical.Icon as={CreditCard} />
							Billing
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="team">
							<TabMenuVertical.Icon as={Users} />
							Team
						</TabMenuVertical.Trigger>
					</TabMenuVertical.List>
					<div className="flex-1 ml-6">
						<TabMenuVertical.Content value="profile">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Profile Settings</h3>
								<div>
									<label className="text-label-sm text-text-strong-950 block mb-1">Display Name</label>
									<input className="w-full p-2 border border-stroke-soft-200 rounded-lg" defaultValue="John Doe" />
								</div>
								<div>
									<label className="text-label-sm text-text-strong-950 block mb-1">Bio</label>
									<textarea className="w-full p-2 border border-stroke-soft-200 rounded-lg" rows={3} defaultValue="Software developer based in NYC" />
								</div>
							</div>
						</TabMenuVertical.Content>
						<TabMenuVertical.Content value="account">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Account Settings</h3>
								<p className="text-paragraph-sm text-text-sub-600">Manage your account details</p>
							</div>
						</TabMenuVertical.Content>
						<TabMenuVertical.Content value="security">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Security Settings</h3>
								<p className="text-paragraph-sm text-text-sub-600">Password and 2FA settings</p>
							</div>
						</TabMenuVertical.Content>
						<TabMenuVertical.Content value="notifications">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Notification Preferences</h3>
								<p className="text-paragraph-sm text-text-sub-600">Choose what notifications you receive</p>
							</div>
						</TabMenuVertical.Content>
						<TabMenuVertical.Content value="billing">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Billing Information</h3>
								<p className="text-paragraph-sm text-text-sub-600">Manage payment methods and invoices</p>
							</div>
						</TabMenuVertical.Content>
						<TabMenuVertical.Content value="team">
							<div className="space-y-4">
								<h3 className="text-label-lg text-text-strong-950">Team Management</h3>
								<p className="text-paragraph-sm text-text-sub-600">Invite and manage team members</p>
							</div>
						</TabMenuVertical.Content>
					</div>
				</TabMenuVertical.Root>
			</div>
		</div>
	),
}

// Dashboard sidebar example
export const DashboardSidebarExample: Story = {
	render: () => (
		<div className="w-[800px] flex border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="w-56 bg-bg-weak-50 border-r border-stroke-soft-200 p-4">
				<h2 className="text-label-lg text-text-strong-950 mb-4 px-2">Admin Panel</h2>
				<TabMenuVertical.Root defaultValue="dashboard">
					<TabMenuVertical.List>
						<TabMenuVertical.Trigger value="dashboard">
							<TabMenuVertical.Icon as={House} />
							Dashboard
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="analytics">
							<TabMenuVertical.Icon as={ChartBar} />
							Analytics
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="users">
							<TabMenuVertical.Icon as={Users} />
							Users
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="products">
							<TabMenuVertical.Icon as={Package} />
							Products
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="orders">
							<TabMenuVertical.Icon as={FileText} />
							Orders
						</TabMenuVertical.Trigger>
						<TabMenuVertical.Trigger value="settings">
							<TabMenuVertical.Icon as={Gear} />
							Settings
						</TabMenuVertical.Trigger>
					</TabMenuVertical.List>
				</TabMenuVertical.Root>
			</div>
			<div className="flex-1 p-6">
				<div className="h-64 bg-bg-weak-50 rounded-lg flex items-center justify-center">
					<p className="text-paragraph-sm text-text-sub-600">Main content area</p>
				</div>
			</div>
		</div>
	),
}

// Help center example
export const HelpCenterExample: Story = {
	render: () => (
		<div className="w-[600px] flex">
			<TabMenuVertical.Root defaultValue="getting-started">
				<TabMenuVertical.List className="w-48">
					<TabMenuVertical.Trigger value="getting-started">
						<TabMenuVertical.Icon as={House} />
						Getting Started
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="account">
						<TabMenuVertical.Icon as={User} />
						Account
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="billing">
						<TabMenuVertical.Icon as={CreditCard} />
						Billing
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="integrations">
						<TabMenuVertical.Icon as={Package} />
						Integrations
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
					<TabMenuVertical.Trigger value="faq">
						<TabMenuVertical.Icon as={Question} />
						FAQ
						<TabMenuVertical.ArrowIcon />
					</TabMenuVertical.Trigger>
				</TabMenuVertical.List>
				<div className="flex-1 ml-6">
					<TabMenuVertical.Content value="getting-started">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-lg text-text-strong-950 mb-2">Getting Started</h3>
							<p className="text-paragraph-sm text-text-sub-600 mb-4">
								Learn the basics of using our platform.
							</p>
							<ul className="space-y-2 text-paragraph-sm text-primary-base">
								<li>• Creating your first project</li>
								<li>• Inviting team members</li>
								<li>• Setting up integrations</li>
							</ul>
						</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="account">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-lg text-text-strong-950 mb-2">Account Help</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Manage your account settings and preferences.
							</p>
						</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="billing">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-lg text-text-strong-950 mb-2">Billing Help</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Information about payments and invoices.
							</p>
						</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="integrations">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-lg text-text-strong-950 mb-2">Integrations</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Connect with your favorite tools.
							</p>
						</div>
					</TabMenuVertical.Content>
					<TabMenuVertical.Content value="faq">
						<div className="p-4 bg-bg-weak-50 rounded-lg">
							<h3 className="text-label-lg text-text-strong-950 mb-2">FAQ</h3>
							<p className="text-paragraph-sm text-text-sub-600">
								Frequently asked questions.
							</p>
						</div>
					</TabMenuVertical.Content>
				</div>
			</TabMenuVertical.Root>
		</div>
	),
}

// Many tabs example
export const ManyTabsExample: Story = {
	render: () => (
		<div className="h-80 overflow-auto">
			<TabMenuVertical.Root defaultValue="tab1">
				<TabMenuVertical.List>
					{Array.from({ length: 15 }, (_, i) => (
						<TabMenuVertical.Trigger key={i} value={`tab${i + 1}`}>
							<TabMenuVertical.Icon as={Folder} />
							Category {i + 1}
						</TabMenuVertical.Trigger>
					))}
				</TabMenuVertical.List>
			</TabMenuVertical.Root>
		</div>
	),
}

// Icon only
export const IconOnly: Story = {
	render: () => (
		<TabMenuVertical.Root defaultValue="home">
			<TabMenuVertical.List>
				<TabMenuVertical.Trigger value="home">
					<TabMenuVertical.Icon as={House} />
				</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="analytics">
					<TabMenuVertical.Icon as={ChartBar} />
				</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="mail">
					<TabMenuVertical.Icon as={Envelope} />
				</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="calendar">
					<TabMenuVertical.Icon as={Calendar} />
				</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="settings">
					<TabMenuVertical.Icon as={Gear} />
				</TabMenuVertical.Trigger>
			</TabMenuVertical.List>
		</TabMenuVertical.Root>
	),
}

// Simple text tabs
export const SimpleTextTabs: Story = {
	render: () => (
		<TabMenuVertical.Root defaultValue="overview">
			<TabMenuVertical.List>
				<TabMenuVertical.Trigger value="overview">Overview</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="features">Features</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="pricing">Pricing</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="docs">Documentation</TabMenuVertical.Trigger>
				<TabMenuVertical.Trigger value="support">Support</TabMenuVertical.Trigger>
			</TabMenuVertical.List>
		</TabMenuVertical.Root>
	),
}
