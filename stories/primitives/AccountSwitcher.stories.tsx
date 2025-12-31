import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { AccountSwitcher } from "@/components/ui/primitives/account-switcher"
import { Gear, User, Bell, CreditCard, ShieldCheck, Question } from "@phosphor-icons/react"

const meta: Meta<typeof AccountSwitcher> = {
	title: "Primitives/AccountSwitcher",
	component: AccountSwitcher,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AccountSwitcher>

// Sample accounts
const sampleAccounts = [
	{ id: "1", name: "John Doe", email: "john@example.com", avatar: undefined },
	{ id: "2", name: "Acme Corp", email: "admin@acme.com", avatar: undefined },
	{ id: "3", name: "Personal", email: "john.personal@gmail.com", avatar: undefined },
]

// Basic account switcher
export const Basic: Story = {
	render: function BasicDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={sampleAccounts}
				onAccountChange={setSelectedId}
			/>
		)
	},
}

// With status
export const WithStatus: Story = {
	render: function WithStatusDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const accountsWithStatus = sampleAccounts.map((acc, i) => ({
			...acc,
			status: (["online", "away", "busy"] as const)[i % 3],
		}))

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={accountsWithStatus}
				onAccountChange={setSelectedId}
			/>
		)
	},
}

// All status variants
export const AllStatusVariants: Story = {
	render: () => {
		const accountsWithStatus = (status: "online" | "offline" | "busy" | "away") =>
			sampleAccounts.map((acc) => ({ ...acc, status }))

		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-4">
					<span className="w-20 text-paragraph-sm text-text-sub-600">Online</span>
					<AccountSwitcher
						selectedAccountId={sampleAccounts[0].id}
						accounts={accountsWithStatus("online")}
						onAccountChange={() => {}}
					/>
				</div>
				<div className="flex items-center gap-4">
					<span className="w-20 text-paragraph-sm text-text-sub-600">Away</span>
					<AccountSwitcher
						selectedAccountId={sampleAccounts[0].id}
						accounts={accountsWithStatus("away")}
						onAccountChange={() => {}}
					/>
				</div>
				<div className="flex items-center gap-4">
					<span className="w-20 text-paragraph-sm text-text-sub-600">Busy</span>
					<AccountSwitcher
						selectedAccountId={sampleAccounts[0].id}
						accounts={accountsWithStatus("busy")}
						onAccountChange={() => {}}
					/>
				</div>
				<div className="flex items-center gap-4">
					<span className="w-20 text-paragraph-sm text-text-sub-600">Offline</span>
					<AccountSwitcher
						selectedAccountId={sampleAccounts[0].id}
						accounts={accountsWithStatus("offline")}
						onAccountChange={() => {}}
					/>
				</div>
			</div>
		)
	},
}

// With menu items
export const WithMenuItems: Story = {
	render: function WithMenuItemsDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)

		const menuItems = [
			{ icon: <User weight="duotone" className="size-5" />, label: "Profile", onClick: () => alert("Profile clicked") },
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Settings", onClick: () => alert("Settings clicked") },
			{ icon: <Bell weight="duotone" className="size-5" />, label: "Notifications", onClick: () => alert("Notifications clicked") },
		]

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={sampleAccounts}
				onAccountChange={setSelectedId}
				menuItems={menuItems}
			/>
		)
	},
}

// With add account
export const WithAddAccount: Story = {
	render: function WithAddAccountDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const [accounts, setAccounts] = useState(sampleAccounts)

		const handleAddAccount = () => {
			const newAccount = {
				id: String(accounts.length + 1),
				name: `New Account ${accounts.length + 1}`,
				email: `new${accounts.length + 1}@example.com`,
				avatar: undefined,
			}
			setAccounts([...accounts, newAccount])
		}

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={accounts}
				onAccountChange={setSelectedId}
				onAddAccount={handleAddAccount}
			/>
		)
	},
}

// Full featured
export const FullFeatured: Story = {
	render: function FullFeaturedDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const accountsWithStatus = sampleAccounts.map((acc) => ({ ...acc, status: "online" as const }))

		const menuItems = [
			{ icon: <User weight="duotone" className="size-5" />, label: "View Profile", onClick: () => {} },
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Account Settings", onClick: () => {} },
			{ icon: <Bell weight="duotone" className="size-5" />, label: "Notifications", onClick: () => {} },
			{ icon: <CreditCard weight="duotone" className="size-5" />, label: "Billing", onClick: () => {} },
			{ icon: <ShieldCheck weight="duotone" className="size-5" />, label: "Privacy", onClick: () => {} },
			{ icon: <Question weight="duotone" className="size-5" />, label: "Help & Support", onClick: () => {} },
		]

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={accountsWithStatus}
				onAccountChange={setSelectedId}
				onAddAccount={() => alert("Add account")}
				menuItems={menuItems}
			/>
		)
	},
}

// Single account
export const SingleAccount: Story = {
	render: function SingleAccountDemo() {
		const account = { ...sampleAccounts[0], status: "online" as const }

		return (
			<AccountSwitcher
				selectedAccountId={account.id}
				accounts={[account]}
				onAccountChange={() => {}}
			/>
		)
	},
}

// Many accounts
export const ManyAccounts: Story = {
	render: function ManyAccountsDemo() {
		const manyAccounts = [
			...sampleAccounts,
			{ id: "4", name: "Marketing Team", email: "marketing@company.com", avatar: undefined },
			{ id: "5", name: "Sales Team", email: "sales@company.com", avatar: undefined },
			{ id: "6", name: "Support Team", email: "support@company.com", avatar: undefined },
		]
		const [selectedId, setSelectedId] = useState(manyAccounts[0].id)

		return (
			<AccountSwitcher
				selectedAccountId={selectedId}
				accounts={manyAccounts}
				onAccountChange={setSelectedId}
				onAddAccount={() => {}}
			/>
		)
	},
}

// Header example
export const HeaderExample: Story = {
	render: function HeaderExampleDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const accountsWithStatus = sampleAccounts.map((acc) => ({ ...acc, status: "online" as const }))

		const menuItems = [
			{ icon: <User weight="duotone" className="size-5" />, label: "Profile", onClick: () => {} },
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Settings", onClick: () => {} },
		]

		return (
			<div className="w-[600px] border border-stroke-soft-200 rounded-xl overflow-hidden">
				<header className="p-4 bg-bg-white-0 border-b border-stroke-soft-200 flex items-center justify-between">
					<h1 className="text-label-lg text-text-strong-950">Dashboard</h1>
					<AccountSwitcher
						selectedAccountId={selectedId}
						accounts={accountsWithStatus}
						onAccountChange={setSelectedId}
						menuItems={menuItems}
					/>
				</header>
				<div className="p-6 h-48 bg-bg-weak-50">
					<p className="text-paragraph-sm text-text-sub-600">Dashboard content</p>
				</div>
			</div>
		)
	},
}

// Sidebar example
export const SidebarExample: Story = {
	render: function SidebarExampleDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const accountsWithStatus = sampleAccounts.map((acc) => ({ ...acc, status: "online" as const }))

		const menuItems = [
			{ icon: <User weight="duotone" className="size-5" />, label: "Profile", onClick: () => {} },
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Settings", onClick: () => {} },
		]

		return (
			<div className="w-64 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
					<AccountSwitcher
						selectedAccountId={selectedId}
						accounts={accountsWithStatus}
						onAccountChange={setSelectedId}
						menuItems={menuItems}
					/>
				</div>
				<nav className="p-2">
					{["Dashboard", "Projects", "Team", "Reports", "Settings"].map((item) => (
						<button
							key={item}
							type="button"
							className="w-full text-left px-3 py-2 text-paragraph-sm text-text-sub-600 hover:bg-bg-weak-50 rounded-lg"
						>
							{item}
						</button>
					))}
				</nav>
			</div>
		)
	},
}

// Workspace switcher example
export const WorkspaceSwitcherExample: Story = {
	render: function WorkspaceSwitcherDemo() {
		const workspaces = [
			{ id: "1", name: "Personal Workspace", email: "Free Plan", avatar: undefined },
			{ id: "2", name: "Acme Corporation", email: "Pro Plan", avatar: undefined },
			{ id: "3", name: "Side Project", email: "Free Plan", avatar: undefined },
		]
		const [selectedId, setSelectedId] = useState(workspaces[0].id)

		const menuItems = [
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Workspace Settings", onClick: () => {} },
			{ icon: <CreditCard weight="duotone" className="size-5" />, label: "Upgrade Plan", onClick: () => {} },
		]

		return (
			<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
				<p className="text-paragraph-xs text-text-sub-600 mb-2">Current Workspace</p>
				<AccountSwitcher
					selectedAccountId={selectedId}
					accounts={workspaces}
					onAccountChange={setSelectedId}
					onAddAccount={() => alert("Create new workspace")}
					menuItems={menuItems}
				/>
			</div>
		)
	},
}

// Team switcher example
export const TeamSwitcherExample: Story = {
	render: function TeamSwitcherDemo() {
		const teams = [
			{ id: "1", name: "Engineering", email: "12 members", avatar: undefined },
			{ id: "2", name: "Design", email: "8 members", avatar: undefined },
			{ id: "3", name: "Marketing", email: "6 members", avatar: undefined },
			{ id: "4", name: "Sales", email: "10 members", avatar: undefined },
		]
		const [selectedId, setSelectedId] = useState(teams[0].id)

		return (
			<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
				<p className="text-paragraph-xs text-text-sub-600 mb-2">Select Team</p>
				<AccountSwitcher
					selectedAccountId={selectedId}
					accounts={teams}
					onAccountChange={setSelectedId}
				/>
			</div>
		)
	},
}

// Compact header example
export const CompactHeaderExample: Story = {
	render: function CompactHeaderDemo() {
		const [selectedId, setSelectedId] = useState(sampleAccounts[0].id)
		const accountsWithStatus = sampleAccounts.map((acc) => ({ ...acc, status: "online" as const }))

		const menuItems = [
			{ icon: <User weight="duotone" className="size-5" />, label: "Profile", onClick: () => {} },
			{ icon: <Gear weight="duotone" className="size-5" />, label: "Settings", onClick: () => {} },
		]

		return (
			<div className="w-[800px] border border-stroke-soft-200 rounded-xl overflow-hidden">
				<header className="px-4 py-2 bg-bg-white-0 border-b border-stroke-soft-200 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-label-md text-text-strong-950">App Name</h1>
						<nav className="flex gap-1">
							{["Home", "Projects", "Team", "Settings"].map((item) => (
								<button
									key={item}
									type="button"
									className="px-3 py-1.5 text-paragraph-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg"
								>
									{item}
								</button>
							))}
						</nav>
					</div>
					<AccountSwitcher
						selectedAccountId={selectedId}
						accounts={accountsWithStatus}
						onAccountChange={setSelectedId}
						menuItems={menuItems}
						compact
					/>
				</header>
				<div className="p-6 h-48 bg-bg-weak-50">
					<p className="text-paragraph-sm text-text-sub-600">Page content</p>
				</div>
			</div>
		)
	},
}
