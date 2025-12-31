import type { Meta, StoryObj } from "@storybook/react"
import { BarList, BarListWithHeader } from "@/components/ui/data-display/bar-list"
import { Globe, ShoppingCart, Envelope, Users } from "@phosphor-icons/react"

const meta: Meta<typeof BarList> = {
	title: "DataDisplay/BarList",
	component: BarList,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		color: {
			control: "select",
			options: ["primary", "blue", "green", "red", "orange", "purple", "gray"],
		},
		sortOrder: {
			control: "select",
			options: ["ascending", "descending", "none"],
		},
	},
}

export default meta
type Story = StoryObj<typeof BarList>

// Basic bar list
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "Google", value: 456 },
					{ name: "Facebook", value: 351 },
					{ name: "Twitter", value: 271 },
					{ name: "LinkedIn", value: 191 },
					{ name: "Reddit", value: 91 },
				]}
			/>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => {
		const data = [
			{ name: "Item A", value: 100 },
			{ name: "Item B", value: 75 },
			{ name: "Item C", value: 50 },
		]

		return (
			<div className="flex gap-12">
				<div className="w-64">
					<h4 className="text-label-sm text-text-sub-600 mb-3">Small</h4>
					<BarList data={data} size="sm" />
				</div>
				<div className="w-64">
					<h4 className="text-label-sm text-text-sub-600 mb-3">Medium</h4>
					<BarList data={data} size="md" />
				</div>
				<div className="w-64">
					<h4 className="text-label-sm text-text-sub-600 mb-3">Large</h4>
					<BarList data={data} size="lg" />
				</div>
			</div>
		)
	},
}

// All colors
export const AllColors: Story = {
	render: () => (
		<div className="flex flex-wrap gap-8">
			{(["primary", "blue", "green", "red", "orange", "purple", "gray"] as const).map((color) => (
				<div key={color} className="w-56">
					<h4 className="text-label-sm text-text-sub-600 mb-3 capitalize">{color}</h4>
					<BarList
						data={[
							{ name: "First", value: 100 },
							{ name: "Second", value: 60 },
							{ name: "Third", value: 30 },
						]}
						color={color}
					/>
				</div>
			))}
		</div>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "Website", value: 2341, icon: <Globe size={16} weight="fill" /> },
					{ name: "E-commerce", value: 1892, icon: <ShoppingCart size={16} weight="fill" /> },
					{ name: "Email", value: 1456, icon: <Envelope size={16} weight="fill" /> },
					{ name: "Referral", value: 987, icon: <Users size={16} weight="fill" /> },
				]}
			/>
		</div>
	),
}

// Mixed colors per item
export const MixedColors: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "Completed", value: 156, color: "green" },
					{ name: "In Progress", value: 89, color: "blue" },
					{ name: "Pending", value: 67, color: "orange" },
					{ name: "Failed", value: 23, color: "red" },
				]}
			/>
		</div>
	),
}

// With links
export const WithLinks: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "/home", value: 5234, href: "#" },
					{ name: "/products", value: 4123, href: "#" },
					{ name: "/about", value: 2891, href: "#" },
					{ name: "/contact", value: 1567, href: "#" },
					{ name: "/blog", value: 987, href: "#" },
				]}
				color="blue"
			/>
		</div>
	),
}

// Sort order variations
export const SortOrderVariations: Story = {
	render: () => {
		const data = [
			{ name: "Alpha", value: 50 },
			{ name: "Beta", value: 100 },
			{ name: "Gamma", value: 25 },
			{ name: "Delta", value: 75 },
		]

		return (
			<div className="flex gap-12">
				<div className="w-56">
					<h4 className="text-label-sm text-text-sub-600 mb-3">Descending (default)</h4>
					<BarList data={data} sortOrder="descending" />
				</div>
				<div className="w-56">
					<h4 className="text-label-sm text-text-sub-600 mb-3">Ascending</h4>
					<BarList data={data} sortOrder="ascending" />
				</div>
				<div className="w-56">
					<h4 className="text-label-sm text-text-sub-600 mb-3">None (original order)</h4>
					<BarList data={data} sortOrder="none" />
				</div>
			</div>
		)
	},
}

// Custom value formatter
export const CustomValueFormatter: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "Enterprise", value: 45000 },
					{ name: "Professional", value: 28000 },
					{ name: "Starter", value: 15000 },
					{ name: "Free", value: 8000 },
				]}
				valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
				color="green"
			/>
		</div>
	),
}

// With header
export const WithHeader: Story = {
	render: () => (
		<div className="w-80">
			<BarListWithHeader
				title="Top Traffic Sources"
				subtitle="Last 30 days"
				data={[
					{ name: "Google", value: 12500 },
					{ name: "Direct", value: 8400 },
					{ name: "Facebook", value: 4200 },
					{ name: "Twitter", value: 2100 },
				]}
			/>
		</div>
	),
}

// Analytics dashboard example
export const AnalyticsDashboardExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-label-md text-text-strong-950">Page Views</h3>
					<p className="text-paragraph-sm text-text-sub-600">Top performing pages</p>
				</div>
				<span className="text-heading-sm text-text-strong-950">45.2K</span>
			</div>
			<BarList
				data={[
					{ name: "/dashboard", value: 12453, icon: <Globe size={14} /> },
					{ name: "/products/electronics", value: 8721, icon: <Globe size={14} /> },
					{ name: "/checkout", value: 6532, icon: <Globe size={14} /> },
					{ name: "/account/settings", value: 4891, icon: <Globe size={14} /> },
					{ name: "/help", value: 2345, icon: <Globe size={14} /> },
				]}
				valueFormatter={(v) => v.toLocaleString()}
			/>
		</div>
	),
}

// Sales leaderboard example
export const SalesLeaderboardExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-1">Sales Leaderboard</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">Q4 2024</p>
			<BarList
				data={[
					{ name: "Sarah Johnson", value: 125000 },
					{ name: "Michael Chen", value: 98000 },
					{ name: "Emily Davis", value: 87500 },
					{ name: "David Kim", value: 76000 },
					{ name: "Lisa Wang", value: 65000 },
				]}
				valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
				color="green"
				size="lg"
			/>
		</div>
	),
}

// Product categories example
export const ProductCategoriesExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-6">Sales by Category</h3>
			<BarList
				data={[
					{ name: "Electronics", value: 45000, color: "blue" },
					{ name: "Clothing", value: 32000, color: "purple" },
					{ name: "Home & Garden", value: 28000, color: "green" },
					{ name: "Sports", value: 21000, color: "orange" },
					{ name: "Books", value: 15000, color: "gray" },
				]}
				valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
			/>
		</div>
	),
}

// Country breakdown example
export const CountryBreakdownExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-6">Users by Country</h3>
			<BarList
				data={[
					{ name: "United States", value: 45678 },
					{ name: "India", value: 32456 },
					{ name: "United Kingdom", value: 21345 },
					{ name: "Germany", value: 18234 },
					{ name: "Canada", value: 15678 },
					{ name: "Australia", value: 12345 },
					{ name: "France", value: 9876 },
				]}
				valueFormatter={(v) => v.toLocaleString()}
				size="sm"
			/>
		</div>
	),
}

// Task status example
export const TaskStatusExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-label-md text-text-strong-950">Task Status</h3>
				<span className="text-label-sm text-text-sub-600">Total: 156</span>
			</div>
			<BarList
				data={[
					{ name: "Completed", value: 78, color: "green" },
					{ name: "In Progress", value: 45, color: "blue" },
					{ name: "Blocked", value: 12, color: "red" },
					{ name: "Not Started", value: 21, color: "gray" },
				]}
				sortOrder="none"
			/>
		</div>
	),
}

// Without animation
export const WithoutAnimation: Story = {
	render: () => (
		<div className="w-80">
			<BarList
				data={[
					{ name: "Item A", value: 100 },
					{ name: "Item B", value: 75 },
					{ name: "Item C", value: 50 },
					{ name: "Item D", value: 25 },
				]}
				showAnimation={false}
			/>
		</div>
	),
}
