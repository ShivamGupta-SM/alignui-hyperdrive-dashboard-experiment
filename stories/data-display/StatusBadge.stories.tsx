import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as StatusBadgeRoot,
	Icon as StatusBadgeIcon,
	Dot as StatusBadgeDot,
} from "@/components/ui/data-display/status-badge"
import { CheckCircle, Warning, XCircle, Clock, Prohibit } from "@phosphor-icons/react"

const meta: Meta<typeof StatusBadgeRoot> = {
	title: "DataDisplay/StatusBadge",
	component: StatusBadgeRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["stroke", "light", "pastel"],
		},
		status: {
			control: "select",
			options: ["completed", "pending", "failed", "disabled", "active", "churned", "weak", "medium", "strong"],
		},
	},
}

export default meta
type Story = StoryObj<typeof StatusBadgeRoot>

// Basic with dot
export const BasicWithDot: Story = {
	render: () => (
		<StatusBadgeRoot status="completed">
			<StatusBadgeDot />
			Completed
		</StatusBadgeRoot>
	),
}

// Basic with icon
export const BasicWithIcon: Story = {
	render: () => (
		<StatusBadgeRoot status="completed">
			<StatusBadgeIcon as={CheckCircle} weight="fill" />
			Completed
		</StatusBadgeRoot>
	),
}

// Stroke variant - all statuses
export const StrokeVariant: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<StatusBadgeRoot variant="stroke" status="completed">
				<StatusBadgeDot />
				Completed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="stroke" status="pending">
				<StatusBadgeDot />
				Pending
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="stroke" status="failed">
				<StatusBadgeDot />
				Failed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="stroke" status="disabled">
				<StatusBadgeDot />
				Disabled
			</StatusBadgeRoot>
		</div>
	),
}

// Light variant - all statuses
export const LightVariant: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<StatusBadgeRoot variant="light" status="completed">
				<StatusBadgeDot />
				Completed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="pending">
				<StatusBadgeDot />
				Pending
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="failed">
				<StatusBadgeDot />
				Failed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="disabled">
				<StatusBadgeDot />
				Disabled
			</StatusBadgeRoot>
		</div>
	),
}

// Pastel variant - all statuses
export const PastelVariant: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<StatusBadgeRoot variant="pastel" status="active">
				<StatusBadgeDot />
				Active
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="completed">
				<StatusBadgeDot />
				Completed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="strong">
				<StatusBadgeDot />
				Strong
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="pending">
				<StatusBadgeDot />
				Pending
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="medium">
				<StatusBadgeDot />
				Medium
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="churned">
				<StatusBadgeDot />
				Churned
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="failed">
				<StatusBadgeDot />
				Failed
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="weak">
				<StatusBadgeDot />
				Weak
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="pastel" status="disabled">
				<StatusBadgeDot />
				Disabled
			</StatusBadgeRoot>
		</div>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<StatusBadgeRoot variant="light" status="completed">
				<StatusBadgeIcon as={CheckCircle} weight="fill" />
				Approved
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="pending">
				<StatusBadgeIcon as={Clock} weight="fill" />
				In Review
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="failed">
				<StatusBadgeIcon as={XCircle} weight="fill" />
				Rejected
			</StatusBadgeRoot>
			<StatusBadgeRoot variant="light" status="disabled">
				<StatusBadgeIcon as={Prohibit} weight="fill" />
				Cancelled
			</StatusBadgeRoot>
		</div>
	),
}

// Order status example
export const OrderStatusExample: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 border-b border-stroke-soft-200 bg-bg-weak-50">
				<h3 className="text-label-md text-text-strong-950">Recent Orders</h3>
			</div>
			<div className="divide-y divide-stroke-soft-200">
				{[
					{ id: "ORD-001", product: "Wireless Headphones", status: "completed", statusLabel: "Delivered" },
					{ id: "ORD-002", product: "Smart Watch", status: "pending", statusLabel: "Processing" },
					{ id: "ORD-003", product: "Laptop Stand", status: "pending", statusLabel: "Shipped" },
					{ id: "ORD-004", product: "USB Cable", status: "failed", statusLabel: "Cancelled" },
				].map((order) => (
					<div key={order.id} className="p-4 flex items-center justify-between">
						<div>
							<p className="text-label-sm text-text-strong-950">{order.product}</p>
							<p className="text-paragraph-xs text-text-sub-600">{order.id}</p>
						</div>
						<StatusBadgeRoot variant="light" status={order.status as "completed" | "pending" | "failed"}>
							<StatusBadgeDot />
							{order.statusLabel}
						</StatusBadgeRoot>
					</div>
				))}
			</div>
		</div>
	),
}

// User status example
export const UserStatusExample: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			{[
				{ name: "John Doe", email: "john@example.com", status: "active", avatar: "JD" },
				{ name: "Jane Smith", email: "jane@example.com", status: "pending", avatar: "JS" },
				{ name: "Bob Wilson", email: "bob@example.com", status: "churned", avatar: "BW" },
				{ name: "Alice Brown", email: "alice@example.com", status: "disabled", avatar: "AB" },
			].map((user) => (
				<div key={user.email} className="flex items-center gap-4 p-4 border border-stroke-soft-200 rounded-xl">
					<div className="size-10 rounded-full bg-primary-base flex items-center justify-center text-static-white text-label-sm">
						{user.avatar}
					</div>
					<div className="flex-1">
						<p className="text-label-sm text-text-strong-950">{user.name}</p>
						<p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
					</div>
					<StatusBadgeRoot variant="pastel" status={user.status as "active" | "pending" | "churned" | "disabled"}>
						<StatusBadgeDot />
						{user.status.charAt(0).toUpperCase() + user.status.slice(1)}
					</StatusBadgeRoot>
				</div>
			))}
		</div>
	),
}

// Task board example
export const TaskBoardExample: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4">
			{[
				{ column: "To Do", tasks: [{ title: "Design mockups", status: "pending" }, { title: "Research competitors", status: "disabled" }] },
				{ column: "In Progress", tasks: [{ title: "Build dashboard", status: "pending" }, { title: "API integration", status: "pending" }] },
				{ column: "Done", tasks: [{ title: "Setup project", status: "completed" }, { title: "Create roadmap", status: "completed" }] },
			].map((col) => (
				<div key={col.column} className="border border-stroke-soft-200 rounded-xl p-4">
					<h4 className="text-label-sm text-text-strong-950 mb-3">{col.column}</h4>
					<div className="space-y-2">
						{col.tasks.map((task, i) => (
							<div key={i} className="p-3 bg-bg-weak-50 rounded-lg">
								<p className="text-paragraph-sm text-text-strong-950 mb-2">{task.title}</p>
								<StatusBadgeRoot variant="stroke" status={task.status as "completed" | "pending" | "disabled"}>
									<StatusBadgeDot />
									{task.status === "completed" ? "Done" : task.status === "pending" ? "Active" : "Blocked"}
								</StatusBadgeRoot>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	),
}

// Health indicator example
export const HealthIndicatorExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-4">
			<h3 className="text-label-md text-text-strong-950 mb-4">System Health</h3>
			<div className="space-y-3">
				{[
					{ service: "API Server", health: "strong" },
					{ service: "Database", health: "medium" },
					{ service: "Cache", health: "strong" },
					{ service: "CDN", health: "weak" },
					{ service: "Auth Service", health: "strong" },
				].map((item) => (
					<div key={item.service} className="flex items-center justify-between">
						<span className="text-paragraph-sm text-text-sub-600">{item.service}</span>
						<StatusBadgeRoot variant="pastel" status={item.health as "strong" | "medium" | "weak"}>
							<StatusBadgeDot />
							{item.health === "strong" ? "Healthy" : item.health === "medium" ? "Degraded" : "Critical"}
						</StatusBadgeRoot>
					</div>
				))}
			</div>
		</div>
	),
}

// Payment status example
export const PaymentStatusExample: Story = {
	render: () => (
		<div className="w-full max-w-2xl">
			<table className="w-full">
				<thead>
					<tr className="border-b border-stroke-soft-200">
						<th className="text-left py-3 text-label-sm text-text-sub-600">Invoice</th>
						<th className="text-left py-3 text-label-sm text-text-sub-600">Amount</th>
						<th className="text-left py-3 text-label-sm text-text-sub-600">Date</th>
						<th className="text-left py-3 text-label-sm text-text-sub-600">Status</th>
					</tr>
				</thead>
				<tbody>
					{[
						{ id: "INV-001", amount: "$1,200", date: "Dec 15, 2024", status: "completed", label: "Paid" },
						{ id: "INV-002", amount: "$850", date: "Dec 20, 2024", status: "pending", label: "Pending" },
						{ id: "INV-003", amount: "$2,100", date: "Dec 22, 2024", status: "failed", label: "Failed" },
						{ id: "INV-004", amount: "$450", date: "Dec 28, 2024", status: "pending", label: "Processing" },
					].map((invoice) => (
						<tr key={invoice.id} className="border-b border-stroke-soft-200">
							<td className="py-3 text-paragraph-sm text-text-strong-950">{invoice.id}</td>
							<td className="py-3 text-paragraph-sm text-text-strong-950">{invoice.amount}</td>
							<td className="py-3 text-paragraph-sm text-text-sub-600">{invoice.date}</td>
							<td className="py-3">
								<StatusBadgeRoot variant="light" status={invoice.status as "completed" | "pending" | "failed"}>
									<StatusBadgeIcon
										as={invoice.status === "completed" ? CheckCircle : invoice.status === "failed" ? XCircle : Clock}
										weight="fill"
									/>
									{invoice.label}
								</StatusBadgeRoot>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	),
}

// Subscription tiers example
export const SubscriptionTiersExample: Story = {
	render: () => (
		<div className="flex gap-4">
			{[
				{ tier: "Free", users: "1,234", trend: "weak" },
				{ tier: "Pro", users: "567", trend: "medium" },
				{ tier: "Enterprise", users: "89", trend: "strong" },
			].map((plan) => (
				<div key={plan.tier} className="w-48 p-4 border border-stroke-soft-200 rounded-xl">
					<div className="flex items-center justify-between mb-2">
						<span className="text-label-md text-text-strong-950">{plan.tier}</span>
						<StatusBadgeRoot variant="pastel" status={plan.trend as "weak" | "medium" | "strong"}>
							<StatusBadgeDot />
						</StatusBadgeRoot>
					</div>
					<p className="text-heading-sm text-text-strong-950">{plan.users}</p>
					<p className="text-paragraph-xs text-text-sub-600">active users</p>
				</div>
			))}
		</div>
	),
}
