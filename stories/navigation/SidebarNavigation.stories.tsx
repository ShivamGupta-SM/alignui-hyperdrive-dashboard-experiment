import type { Meta, StoryObj } from "@storybook/react"
import * as Sidebar from "@/components/ui/navigation/sidebar-navigation"
import { House, ChartBar, Folder, Users, Gear, Bell, CreditCard, ShieldCheck, Question, SignOut, Package, FileText, Calendar, Envelope, Star, Lightning } from "@phosphor-icons/react"

const meta: Meta<typeof Sidebar.Root> = {
	title: "Navigation/SidebarNavigation",
	component: Sidebar.Root,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Sidebar.Root>

// Basic sidebar
export const Basic: Story = {
	render: () => (
		<Sidebar.Root>
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
				<span className="text-label-lg text-text-strong-950">Acme Inc</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ChartBar}>
						Analytics
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Folder}>
						Projects
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Team
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Gear}>
						Settings
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
		</Sidebar.Root>
	),
}

// With search
export const WithSearch: Story = {
	render: () => (
		<Sidebar.Root>
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
				<span className="text-label-lg text-text-strong-950">Acme Inc</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Search placeholder="Search..." className="mb-4" />
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ChartBar}>
						Analytics
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Folder}>
						Projects
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Team
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
		</Sidebar.Root>
	),
}

// With nav groups
export const WithNavGroups: Story = {
	render: () => (
		<Sidebar.Root>
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
				<span className="text-label-lg text-text-strong-950">Acme Inc</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.NavGroup>
					<Sidebar.NavGroupLabel>Main</Sidebar.NavGroupLabel>
					<Sidebar.Nav>
						<Sidebar.NavItem href="#" icon={House} isActive>
							Dashboard
						</Sidebar.NavItem>
						<Sidebar.NavItem href="#" icon={ChartBar}>
							Analytics
						</Sidebar.NavItem>
						<Sidebar.NavItem href="#" icon={Folder}>
							Projects
						</Sidebar.NavItem>
					</Sidebar.Nav>
				</Sidebar.NavGroup>
				<Sidebar.Divider />
				<Sidebar.NavGroup>
					<Sidebar.NavGroupLabel>Management</Sidebar.NavGroupLabel>
					<Sidebar.Nav>
						<Sidebar.NavItem href="#" icon={Users}>
							Team
						</Sidebar.NavItem>
						<Sidebar.NavItem href="#" icon={CreditCard}>
							Billing
						</Sidebar.NavItem>
						<Sidebar.NavItem href="#" icon={Gear}>
							Settings
						</Sidebar.NavItem>
					</Sidebar.Nav>
				</Sidebar.NavGroup>
			</Sidebar.Content>
		</Sidebar.Root>
	),
}

// With badges
export const WithBadges: Story = {
	render: () => (
		<Sidebar.Root>
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
				<span className="text-label-lg text-text-strong-950">Acme Inc</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem
						href="#"
						icon={Bell}
						badge={
							<span className="px-1.5 py-0.5 text-[10px] font-medium bg-error-base text-white rounded-full">
								5
							</span>
						}
					>
						Notifications
					</Sidebar.NavItem>
					<Sidebar.NavItem
						href="#"
						icon={Envelope}
						badge={
							<span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-base text-white rounded-full">
								12
							</span>
						}
					>
						Messages
					</Sidebar.NavItem>
					<Sidebar.NavItem
						href="#"
						icon={Package}
						badge={
							<span className="px-1.5 py-0.5 text-[10px] font-medium bg-success-base text-white rounded">
								NEW
							</span>
						}
					>
						Products
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
		</Sidebar.Root>
	),
}

// With footer
export const WithFooter: Story = {
	render: () => (
		<Sidebar.Root className="h-[500px]">
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
				<span className="text-label-lg text-text-strong-950">Acme Inc</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ChartBar}>
						Analytics
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Folder}>
						Projects
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Team
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
			<Sidebar.Footer>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={Gear}>
						Settings
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Question}>
						Help
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={SignOut}>
						Sign Out
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Footer>
		</Sidebar.Root>
	),
}

// Slim variant
export const SlimVariant: Story = {
	render: () => (
		<Sidebar.Root variant="slim" className="h-[500px]">
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
					A
				</div>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ChartBar}>
						Analytics
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Folder}>
						Projects
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Team
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Gear}>
						Settings
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
			<Sidebar.Footer>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={SignOut}>
						Sign Out
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Footer>
		</Sidebar.Root>
	),
}

// Admin panel example
export const AdminPanelExample: Story = {
	render: () => (
		<div className="flex h-[600px]">
			<Sidebar.Root activeUrl="/dashboard">
				<Sidebar.Header>
					<div className="size-8 rounded-lg bg-gradient-to-br from-primary-base to-primary-dark flex items-center justify-center text-white font-bold">
						H
					</div>
					<span className="text-label-lg text-text-strong-950">Hyperdrive</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Search placeholder="Search..." className="mb-4" />
					<Sidebar.NavGroup>
						<Sidebar.NavGroupLabel>Overview</Sidebar.NavGroupLabel>
						<Sidebar.Nav>
							<Sidebar.NavItem href="/dashboard" icon={House}>
								Dashboard
							</Sidebar.NavItem>
							<Sidebar.NavItem href="/analytics" icon={ChartBar}>
								Analytics
							</Sidebar.NavItem>
						</Sidebar.Nav>
					</Sidebar.NavGroup>
					<Sidebar.Divider />
					<Sidebar.NavGroup>
						<Sidebar.NavGroupLabel>Content</Sidebar.NavGroupLabel>
						<Sidebar.Nav>
							<Sidebar.NavItem
								href="/projects"
								icon={Folder}
								badge={<span className="text-paragraph-xs text-text-soft-400">24</span>}
							>
								Projects
							</Sidebar.NavItem>
							<Sidebar.NavItem href="/products" icon={Package}>
								Products
							</Sidebar.NavItem>
							<Sidebar.NavItem href="/orders" icon={FileText}>
								Orders
							</Sidebar.NavItem>
						</Sidebar.Nav>
					</Sidebar.NavGroup>
					<Sidebar.Divider />
					<Sidebar.NavGroup>
						<Sidebar.NavGroupLabel>Organization</Sidebar.NavGroupLabel>
						<Sidebar.Nav>
							<Sidebar.NavItem href="/team" icon={Users}>
								Team
							</Sidebar.NavItem>
							<Sidebar.NavItem href="/calendar" icon={Calendar}>
								Calendar
							</Sidebar.NavItem>
						</Sidebar.Nav>
					</Sidebar.NavGroup>
				</Sidebar.Content>
				<Sidebar.Footer>
					<Sidebar.Nav>
						<Sidebar.NavItem href="/settings" icon={Gear}>
							Settings
						</Sidebar.NavItem>
						<Sidebar.NavItem href="/help" icon={Question}>
							Help & Support
						</Sidebar.NavItem>
					</Sidebar.Nav>
				</Sidebar.Footer>
			</Sidebar.Root>
			<div className="flex-1 p-6 bg-bg-weak-50">
				<h1 className="text-heading-lg text-text-strong-950">Dashboard</h1>
				<p className="text-paragraph-sm text-text-sub-600">Welcome to the admin panel</p>
			</div>
		</div>
	),
}

// E-commerce sidebar example
export const EcommerceSidebarExample: Story = {
	render: () => (
		<Sidebar.Root className="h-[550px]">
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-success-base flex items-center justify-center text-white">
					<Package className="size-5" />
				</div>
				<span className="text-label-lg text-text-strong-950">Store Admin</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Overview
					</Sidebar.NavItem>
					<Sidebar.NavItem
						href="#"
						icon={FileText}
						badge={
							<span className="px-1.5 py-0.5 text-[10px] font-medium bg-warning-base text-white rounded-full">
								3
							</span>
						}
					>
						Orders
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Package}>
						Products
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Customers
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ChartBar}>
						Analytics
					</Sidebar.NavItem>
				</Sidebar.Nav>
				<Sidebar.Divider />
				<Sidebar.NavGroup>
					<Sidebar.NavGroupLabel>Marketing</Sidebar.NavGroupLabel>
					<Sidebar.Nav>
						<Sidebar.NavItem
							href="#"
							icon={Star}
							badge={<span className="text-paragraph-xs text-success-base">+15%</span>}
						>
							Promotions
						</Sidebar.NavItem>
						<Sidebar.NavItem href="#" icon={Lightning}>
							Campaigns
						</Sidebar.NavItem>
					</Sidebar.Nav>
				</Sidebar.NavGroup>
			</Sidebar.Content>
			<Sidebar.Footer>
				<div className="p-3 bg-primary-base/10 rounded-lg mb-3">
					<p className="text-label-sm text-primary-base mb-1">Upgrade to Pro</p>
					<p className="text-paragraph-xs text-text-sub-600">Get access to all features</p>
				</div>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={Gear}>
						Settings
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Footer>
		</Sidebar.Root>
	),
}

// Security focused sidebar
export const SecuritySidebarExample: Story = {
	render: () => (
		<Sidebar.Root className="h-[500px]">
			<Sidebar.Header>
				<div className="size-8 rounded-lg bg-error-base flex items-center justify-center text-white">
					<ShieldCheck className="size-5" />
				</div>
				<span className="text-label-lg text-text-strong-950">Security Hub</span>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Nav>
					<Sidebar.NavItem href="#" icon={House} isActive>
						Dashboard
					</Sidebar.NavItem>
					<Sidebar.NavItem
						href="#"
						icon={Bell}
						badge={
							<span className="size-2 rounded-full bg-error-base" />
						}
					>
						Alerts
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={ShieldCheck}>
						Vulnerabilities
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={Users}>
						Access Control
					</Sidebar.NavItem>
					<Sidebar.NavItem href="#" icon={FileText}>
						Audit Logs
					</Sidebar.NavItem>
				</Sidebar.Nav>
			</Sidebar.Content>
		</Sidebar.Root>
	),
}

// Comparison
export const Comparison: Story = {
	render: () => (
		<div className="flex gap-4 h-[400px]">
			<div>
				<p className="text-paragraph-sm text-text-sub-600 mb-2">Default</p>
				<Sidebar.Root>
					<Sidebar.Header>
						<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
							A
						</div>
						<span className="text-label-lg text-text-strong-950">Acme</span>
					</Sidebar.Header>
					<Sidebar.Content>
						<Sidebar.Nav>
							<Sidebar.NavItem href="#" icon={House} isActive>
								Dashboard
							</Sidebar.NavItem>
							<Sidebar.NavItem href="#" icon={ChartBar}>
								Analytics
							</Sidebar.NavItem>
							<Sidebar.NavItem href="#" icon={Gear}>
								Settings
							</Sidebar.NavItem>
						</Sidebar.Nav>
					</Sidebar.Content>
				</Sidebar.Root>
			</div>
			<div>
				<p className="text-paragraph-sm text-text-sub-600 mb-2">Slim</p>
				<Sidebar.Root variant="slim">
					<Sidebar.Header>
						<div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white font-bold">
							A
						</div>
					</Sidebar.Header>
					<Sidebar.Content>
						<Sidebar.Nav>
							<Sidebar.NavItem href="#" icon={House} isActive>
								Dashboard
							</Sidebar.NavItem>
							<Sidebar.NavItem href="#" icon={ChartBar}>
								Analytics
							</Sidebar.NavItem>
							<Sidebar.NavItem href="#" icon={Gear}>
								Settings
							</Sidebar.NavItem>
						</Sidebar.Nav>
					</Sidebar.Content>
				</Sidebar.Root>
			</div>
		</div>
	),
}
