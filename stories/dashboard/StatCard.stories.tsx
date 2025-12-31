import type { Meta, StoryObj } from "@storybook/react"
import { SimpleStatCard, WalletCard, StatCard, WalletStatCard } from "@/components/dashboard/stat-card"
import {
	Users,
	ShoppingCart,
	CurrencyDollar,
	ChartLineUp,
	Wallet,
	Package,
	TrendUp,
	Megaphone,
} from "@phosphor-icons/react"

const meta: Meta<typeof StatCard> = {
	title: "Dashboard/StatCard",
	component: StatCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof StatCard>

// Simple stat cards
export const SimpleCards: Story = {
	render: () => (
		<div className="grid grid-cols-4 gap-4 w-[800px]">
			<SimpleStatCard
				icon={<Users className="size-5" />}
				value={1250}
				label="Total Users"
				iconColor="primary"
			/>
			<SimpleStatCard
				icon={<ShoppingCart className="size-5" />}
				value={342}
				label="Orders"
				iconColor="success"
			/>
			<SimpleStatCard
				icon={<CurrencyDollar className="size-5" />}
				value="₹45,231"
				label="Revenue"
				iconColor="warning"
			/>
			<SimpleStatCard
				icon={<ChartLineUp className="size-5" />}
				value="+12.5%"
				label="Growth"
				iconColor="success"
			/>
		</div>
	),
}

// Clickable stat cards
export const ClickableCards: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4 w-[600px]">
			<SimpleStatCard
				icon={<Megaphone className="size-5" />}
				value={12}
				label="Active Campaigns"
				iconColor="primary"
				href="/campaigns"
			/>
			<SimpleStatCard
				icon={<Users className="size-5" />}
				value={48}
				label="Enrollments"
				iconColor="success"
				href="/enrollments"
			/>
			<SimpleStatCard
				icon={<Package className="size-5" />}
				value={25}
				label="Products"
				iconColor="neutral"
				href="/products"
			/>
		</div>
	),
}

// Wallet cards
export const WalletCards: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4 w-[400px]">
			<WalletCard
				balance={125000}
				label="Wallet Balance"
				onAddFunds={() => alert("Add funds clicked")}
			/>
			<WalletCard
				balance={15000}
				lowBalanceThreshold={50000}
				label="Wallet Balance"
				onAddFunds={() => alert("Add funds clicked")}
			/>
		</div>
	),
}

// Advanced stat cards with variants
export const Variants: Story = {
	render: () => (
		<div className="grid grid-cols-4 gap-4 w-[800px]">
			<StatCard
				variant="default"
				icon={<Users className="size-5" />}
				value="1,250"
				label="Total Users"
			/>
			<StatCard
				variant="primary"
				icon={<Wallet className="size-5" />}
				value="₹1,25,000"
				label="Wallet Balance"
			/>
			<StatCard
				variant="success"
				icon={<TrendUp className="size-5" />}
				value="+24%"
				label="Growth Rate"
			/>
			<StatCard
				variant="warning"
				icon={<Wallet className="size-5" />}
				value="₹15,000"
				label="Low Balance"
				badge={{ text: "Low", variant: "warning" }}
			/>
		</div>
	),
}

// With actions
export const WithActions: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4 w-[600px]">
			<StatCard
				variant="default"
				icon={<Users className="size-5" />}
				value="48"
				label="Pending Approvals"
				action={{
					label: "View All",
					onClick: () => alert("View all clicked"),
				}}
			/>
			<StatCard
				variant="primary"
				icon={<Wallet className="size-5" />}
				value="₹1,25,000"
				label="Available Balance"
				action={{
					label: "Add Funds",
					onClick: () => alert("Add funds clicked"),
				}}
			/>
			<StatCard
				variant="warning"
				icon={<Wallet className="size-5" />}
				value="₹5,000"
				label="Low Balance"
				action={{
					label: "Top Up Now",
					onClick: () => alert("Top up clicked"),
				}}
			/>
		</div>
	),
}

// Wallet stat card
export const WalletStatCards: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4 w-[400px]">
			<WalletStatCard
				availableBalance={125000}
				heldAmount={15000}
				onAddFunds={() => alert("Add funds clicked")}
			/>
			<WalletStatCard
				availableBalance={8000}
				lowBalanceThreshold={50000}
				onAddFunds={() => alert("Add funds clicked")}
			/>
		</div>
	),
}

// Compact size
export const CompactSize: Story = {
	render: () => (
		<div className="grid grid-cols-4 gap-3 w-[600px]">
			<StatCard
				size="compact"
				icon={<Users className="size-4" />}
				value="125"
				label="Users"
			/>
			<StatCard
				size="compact"
				icon={<ShoppingCart className="size-4" />}
				value="42"
				label="Orders"
			/>
			<StatCard
				size="compact"
				icon={<CurrencyDollar className="size-4" />}
				value="₹45K"
				label="Revenue"
			/>
			<StatCard
				size="compact"
				icon={<ChartLineUp className="size-4" />}
				value="+12%"
				label="Growth"
			/>
		</div>
	),
}

// Dashboard grid example
export const DashboardGrid: Story = {
	render: () => (
		<div className="w-[900px] p-6 bg-bg-weak-50 rounded-xl">
			<h2 className="text-title-h5 text-text-strong-950 mb-4">Dashboard Overview</h2>
			<div className="grid grid-cols-4 gap-4">
				<WalletStatCard
					availableBalance={245000}
					heldAmount={35000}
					onAddFunds={() => alert("Add funds")}
				/>
				<SimpleStatCard
					icon={<Megaphone className="size-5" />}
					value={8}
					label="Active Campaigns"
					iconColor="primary"
					href="/campaigns"
				/>
				<SimpleStatCard
					icon={<Users className="size-5" />}
					value={156}
					label="Total Enrollments"
					iconColor="success"
					href="/enrollments"
				/>
				<SimpleStatCard
					icon={<Package className="size-5" />}
					value={32}
					label="Products"
					iconColor="neutral"
					href="/products"
				/>
			</div>
		</div>
	),
}
