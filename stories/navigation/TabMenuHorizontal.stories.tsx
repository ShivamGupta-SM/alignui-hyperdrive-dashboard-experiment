import type { Meta, StoryObj } from "@storybook/react"
import * as TabMenuHorizontal from "@/components/ui/navigation/tab-menu-horizontal"
import { House, User, Gear, Bell, ChartBar, Folder, Envelope, Calendar, CreditCard, ShieldCheck } from "@phosphor-icons/react"

const meta: Meta<typeof TabMenuHorizontal.Root> = {
	title: "Navigation/TabMenuHorizontal",
	component: TabMenuHorizontal.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof TabMenuHorizontal.Root>

// Basic tabs
export const Basic: Story = {
	render: () => (
		<TabMenuHorizontal.Root defaultValue="tab1">
			<TabMenuHorizontal.List>
				<TabMenuHorizontal.Trigger value="tab1">Overview</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab2">Analytics</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab3">Reports</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab4">Settings</TabMenuHorizontal.Trigger>
			</TabMenuHorizontal.List>
			<TabMenuHorizontal.Content value="tab1">
				<div className="p-4">Overview content goes here</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="tab2">
				<div className="p-4">Analytics content goes here</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="tab3">
				<div className="p-4">Reports content goes here</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="tab4">
				<div className="p-4">Settings content goes here</div>
			</TabMenuHorizontal.Content>
		</TabMenuHorizontal.Root>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<TabMenuHorizontal.Root defaultValue="home">
			<TabMenuHorizontal.List>
				<TabMenuHorizontal.Trigger value="home">
					<TabMenuHorizontal.Icon as={House} />
					Home
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="profile">
					<TabMenuHorizontal.Icon as={User} />
					Profile
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="notifications">
					<TabMenuHorizontal.Icon as={Bell} />
					Notifications
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="settings">
					<TabMenuHorizontal.Icon as={Gear} />
					Settings
				</TabMenuHorizontal.Trigger>
			</TabMenuHorizontal.List>
			<TabMenuHorizontal.Content value="home">
				<div className="p-4">Home content</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="profile">
				<div className="p-4">Profile content</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="notifications">
				<div className="p-4">Notifications content</div>
			</TabMenuHorizontal.Content>
			<TabMenuHorizontal.Content value="settings">
				<div className="p-4">Settings content</div>
			</TabMenuHorizontal.Content>
		</TabMenuHorizontal.Root>
	),
}

// Icon only
export const IconOnly: Story = {
	render: () => (
		<TabMenuHorizontal.Root defaultValue="home">
			<TabMenuHorizontal.List>
				<TabMenuHorizontal.Trigger value="home">
					<TabMenuHorizontal.Icon as={House} />
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="analytics">
					<TabMenuHorizontal.Icon as={ChartBar} />
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="files">
					<TabMenuHorizontal.Icon as={Folder} />
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="mail">
					<TabMenuHorizontal.Icon as={Envelope} />
				</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="calendar">
					<TabMenuHorizontal.Icon as={Calendar} />
				</TabMenuHorizontal.Trigger>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	),
}

// Many tabs
export const ManyTabs: Story = {
	render: () => (
		<div className="w-[600px]">
			<TabMenuHorizontal.Root defaultValue="tab1">
				<TabMenuHorizontal.List>
					<TabMenuHorizontal.Trigger value="tab1">Overview</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab2">Analytics</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab3">Reports</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab4">Users</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab5">Products</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab6">Orders</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger value="tab7">Settings</TabMenuHorizontal.Trigger>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>
		</div>
	),
}

// Disabled tab
export const DisabledTab: Story = {
	render: () => (
		<TabMenuHorizontal.Root defaultValue="tab1">
			<TabMenuHorizontal.List>
				<TabMenuHorizontal.Trigger value="tab1">Active</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab2">Available</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab3" disabled>Disabled</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="tab4">Another</TabMenuHorizontal.Trigger>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	),
}

// Dashboard example
export const DashboardExample: Story = {
	render: () => (
		<div className="w-[700px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h2 className="text-heading-md text-text-strong-950">Dashboard</h2>
			</div>
			<TabMenuHorizontal.Root defaultValue="overview">
				<div className="border-b border-stroke-soft-200">
					<TabMenuHorizontal.List>
						<TabMenuHorizontal.Trigger value="overview">
							<TabMenuHorizontal.Icon as={House} />
							Overview
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="analytics">
							<TabMenuHorizontal.Icon as={ChartBar} />
							Analytics
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="reports">
							<TabMenuHorizontal.Icon as={Folder} />
							Reports
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="settings">
							<TabMenuHorizontal.Icon as={Gear} />
							Settings
						</TabMenuHorizontal.Trigger>
					</TabMenuHorizontal.List>
				</div>
				<TabMenuHorizontal.Content value="overview">
					<div className="p-6">
						<div className="grid grid-cols-3 gap-4">
							<div className="p-4 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-sub-600">Total Users</p>
								<p className="text-heading-lg text-text-strong-950">12,345</p>
							</div>
							<div className="p-4 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-sub-600">Revenue</p>
								<p className="text-heading-lg text-text-strong-950">$54,321</p>
							</div>
							<div className="p-4 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-sub-600">Orders</p>
								<p className="text-heading-lg text-text-strong-950">1,234</p>
							</div>
						</div>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="analytics">
					<div className="p-6 h-48 flex items-center justify-center bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-sub-600">Analytics charts would go here</p>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="reports">
					<div className="p-6 h-48 flex items-center justify-center bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-sub-600">Reports list would go here</p>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="settings">
					<div className="p-6 h-48 flex items-center justify-center bg-bg-weak-50">
						<p className="text-paragraph-sm text-text-sub-600">Settings form would go here</p>
					</div>
				</TabMenuHorizontal.Content>
			</TabMenuHorizontal.Root>
		</div>
	),
}

// Account settings example
export const AccountSettingsExample: Story = {
	render: () => (
		<div className="w-[600px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h2 className="text-heading-md text-text-strong-950">Account Settings</h2>
				<p className="text-paragraph-sm text-text-sub-600">Manage your account preferences</p>
			</div>
			<TabMenuHorizontal.Root defaultValue="profile">
				<div className="border-b border-stroke-soft-200 px-4">
					<TabMenuHorizontal.List>
						<TabMenuHorizontal.Trigger value="profile">
							<TabMenuHorizontal.Icon as={User} />
							Profile
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="security">
							<TabMenuHorizontal.Icon as={ShieldCheck} />
							Security
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="billing">
							<TabMenuHorizontal.Icon as={CreditCard} />
							Billing
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="notifications">
							<TabMenuHorizontal.Icon as={Bell} />
							Notifications
						</TabMenuHorizontal.Trigger>
					</TabMenuHorizontal.List>
				</div>
				<TabMenuHorizontal.Content value="profile">
					<div className="p-6">
						<h3 className="text-label-md text-text-strong-950 mb-4">Profile Information</h3>
						<div className="space-y-4">
							<div>
								<label className="text-label-sm text-text-strong-950 block mb-1">Name</label>
								<input className="w-full p-2 border border-stroke-soft-200 rounded-lg" defaultValue="John Doe" />
							</div>
							<div>
								<label className="text-label-sm text-text-strong-950 block mb-1">Email</label>
								<input className="w-full p-2 border border-stroke-soft-200 rounded-lg" defaultValue="john@example.com" />
							</div>
						</div>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="security">
					<div className="p-6">
						<h3 className="text-label-md text-text-strong-950 mb-4">Security Settings</h3>
						<p className="text-paragraph-sm text-text-sub-600">Manage your password and 2FA settings</p>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="billing">
					<div className="p-6">
						<h3 className="text-label-md text-text-strong-950 mb-4">Billing Information</h3>
						<p className="text-paragraph-sm text-text-sub-600">Manage your payment methods and invoices</p>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="notifications">
					<div className="p-6">
						<h3 className="text-label-md text-text-strong-950 mb-4">Notification Preferences</h3>
						<p className="text-paragraph-sm text-text-sub-600">Choose what notifications you want to receive</p>
					</div>
				</TabMenuHorizontal.Content>
			</TabMenuHorizontal.Root>
		</div>
	),
}

// Product detail example
export const ProductDetailExample: Story = {
	render: () => (
		<div className="w-[500px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="h-48 bg-bg-weak-50 flex items-center justify-center">
				<span className="text-text-sub-600">Product Image</span>
			</div>
			<div className="p-4">
				<h2 className="text-heading-md text-text-strong-950">Premium Headphones</h2>
				<p className="text-heading-lg text-primary-base">$299.00</p>
			</div>
			<TabMenuHorizontal.Root defaultValue="description">
				<div className="border-t border-stroke-soft-200">
					<TabMenuHorizontal.List>
						<TabMenuHorizontal.Trigger value="description">Description</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="specs">Specifications</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="reviews">Reviews (24)</TabMenuHorizontal.Trigger>
					</TabMenuHorizontal.List>
				</div>
				<TabMenuHorizontal.Content value="description">
					<div className="p-4">
						<p className="text-paragraph-sm text-text-sub-600">
							Experience premium sound quality with our state-of-the-art wireless headphones.
							Featuring active noise cancellation and 30-hour battery life.
						</p>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="specs">
					<div className="p-4">
						<ul className="space-y-2 text-paragraph-sm text-text-sub-600">
							<li>Driver: 40mm</li>
							<li>Frequency: 20Hz - 20kHz</li>
							<li>Battery: 30 hours</li>
							<li>Connectivity: Bluetooth 5.2</li>
						</ul>
					</div>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="reviews">
					<div className="p-4">
						<p className="text-paragraph-sm text-text-sub-600">Customer reviews would be displayed here</p>
					</div>
				</TabMenuHorizontal.Content>
			</TabMenuHorizontal.Root>
		</div>
	),
}

// Code editor example
export const CodeEditorExample: Story = {
	render: () => (
		<div className="w-[600px] border border-stroke-soft-200 rounded-xl overflow-hidden bg-gray-900">
			<TabMenuHorizontal.Root defaultValue="index">
				<div className="bg-gray-800 border-b border-gray-700">
					<TabMenuHorizontal.List>
						<TabMenuHorizontal.Trigger value="index" className="text-gray-300 data-[state=active]:text-white">
							index.tsx
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="styles" className="text-gray-300 data-[state=active]:text-white">
							styles.css
						</TabMenuHorizontal.Trigger>
						<TabMenuHorizontal.Trigger value="config" className="text-gray-300 data-[state=active]:text-white">
							config.ts
						</TabMenuHorizontal.Trigger>
					</TabMenuHorizontal.List>
				</div>
				<TabMenuHorizontal.Content value="index">
					<pre className="p-4 text-sm text-gray-300 font-mono">
{`export default function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
    </div>
  )
}`}
					</pre>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="styles">
					<pre className="p-4 text-sm text-gray-300 font-mono">
{`.app {
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  color: #333;
}`}
					</pre>
				</TabMenuHorizontal.Content>
				<TabMenuHorizontal.Content value="config">
					<pre className="p-4 text-sm text-gray-300 font-mono">
{`export const config = {
  apiUrl: 'https://api.example.com',
  debug: true,
}`}
					</pre>
				</TabMenuHorizontal.Content>
			</TabMenuHorizontal.Root>
		</div>
	),
}

// Simple text tabs
export const SimpleTextTabs: Story = {
	render: () => (
		<TabMenuHorizontal.Root defaultValue="all">
			<TabMenuHorizontal.List>
				<TabMenuHorizontal.Trigger value="all">All</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="active">Active</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="completed">Completed</TabMenuHorizontal.Trigger>
				<TabMenuHorizontal.Trigger value="archived">Archived</TabMenuHorizontal.Trigger>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	),
}
