import type { Meta, StoryObj } from "@storybook/react"
import { Metric, MetricCard, ComparisonMetric, MetricGroup } from "@/components/ui/data-display/metric"
import { CurrencyDollar, Users, ShoppingCart, TrendUp, Eye, Package, Clock } from "@phosphor-icons/react"

const meta: Meta<typeof Metric> = {
	title: "DataDisplay/Metric",
	component: Metric,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg", "xl"],
		},
		deltaType: {
			control: "select",
			options: ["increase", "decrease", "unchanged", "moderateIncrease", "moderateDecrease"],
		},
	},
}

export default meta
type Story = StoryObj<typeof Metric>

// Basic metric
export const Basic: Story = {
	render: () => <Metric value="$24,500" label="Total Revenue" />,
}

// With delta (increase)
export const WithIncrease: Story = {
	render: () => (
		<Metric value="$24,500" label="Total Revenue" delta="+12.5%" deltaType="increase" />
	),
}

// With delta (decrease)
export const WithDecrease: Story = {
	render: () => (
		<Metric value="1,234" label="Active Users" delta="-5.2%" deltaType="decrease" />
	),
}

// With description
export const WithDescription: Story = {
	render: () => (
		<Metric
			value="$24,500"
			label="Total Revenue"
			delta="+12.5%"
			deltaType="increase"
			description="Compared to last month"
		/>
	),
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			<div>
				<span className="text-paragraph-xs text-text-sub-600 mb-2 block">Small</span>
				<Metric size="sm" value="$12,345" label="Revenue" delta="+8.5%" deltaType="increase" />
			</div>
			<div>
				<span className="text-paragraph-xs text-text-sub-600 mb-2 block">Medium (default)</span>
				<Metric size="md" value="$12,345" label="Revenue" delta="+8.5%" deltaType="increase" />
			</div>
			<div>
				<span className="text-paragraph-xs text-text-sub-600 mb-2 block">Large</span>
				<Metric size="lg" value="$12,345" label="Revenue" delta="+8.5%" deltaType="increase" />
			</div>
			<div>
				<span className="text-paragraph-xs text-text-sub-600 mb-2 block">Extra Large</span>
				<Metric size="xl" value="$12,345" label="Revenue" delta="+8.5%" deltaType="increase" />
			</div>
		</div>
	),
}

// All delta types
export const DeltaTypes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<Metric value="$24,500" label="Increase" delta="+12.5%" deltaType="increase" />
			<Metric value="$24,500" label="Decrease" delta="-8.3%" deltaType="decrease" />
			<Metric value="$24,500" label="Unchanged" delta="0%" deltaType="unchanged" />
			<Metric value="$24,500" label="Moderate Increase" delta="+3.2%" deltaType="moderateIncrease" />
			<Metric value="$24,500" label="Moderate Decrease" delta="-2.1%" deltaType="moderateDecrease" />
		</div>
	),
}

// Metric card
export const MetricCardExample: Story = {
	render: () => (
		<MetricCard
			label="Total Revenue"
			value="$48,574"
			delta="+12.5%"
			deltaType="increase"
			description="vs. last month"
			icon={<CurrencyDollar className="size-5" />}
		/>
	),
}

// Multiple metric cards
export const MetricCardsGrid: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4 w-[600px]">
			<MetricCard
				label="Total Revenue"
				value="$48,574"
				delta="+12.5%"
				deltaType="increase"
				icon={<CurrencyDollar className="size-5" />}
			/>
			<MetricCard
				label="Active Users"
				value="2,345"
				delta="+8.1%"
				deltaType="increase"
				icon={<Users className="size-5" />}
			/>
			<MetricCard
				label="Orders"
				value="1,234"
				delta="-3.2%"
				deltaType="decrease"
				icon={<ShoppingCart className="size-5" />}
			/>
			<MetricCard
				label="Conversion"
				value="3.24%"
				delta="+0.5%"
				deltaType="moderateIncrease"
				icon={<TrendUp className="size-5" />}
			/>
		</div>
	),
}

// Comparison metric
export const ComparisonMetricExample: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<ComparisonMetric label="Monthly Revenue" previousValue={10000} currentValue={12500} />
			<ComparisonMetric label="Active Users" previousValue={500} currentValue={450} />
			<ComparisonMetric label="Conversion Rate" previousValue={3.2} currentValue={3.2} />
		</div>
	),
}

// Custom delta format
export const CustomDeltaFormat: Story = {
	render: () => (
		<ComparisonMetric
			label="Revenue"
			previousValue={10000}
			currentValue={15000}
			formatDelta={(current, previous) => `+$${(current - previous).toLocaleString()}`}
		/>
	),
}

// Metric group
export const MetricGroupExample: Story = {
	render: () => (
		<MetricGroup columns={3}>
			<Metric label="Users" value="12,345" delta="+5.2%" deltaType="increase" />
			<Metric label="Sessions" value="45,678" delta="+12.8%" deltaType="increase" />
			<Metric label="Bounce Rate" value="32.4%" delta="-2.1%" deltaType="decrease" />
		</MetricGroup>
	),
}

// Dashboard example
export const DashboardExample: Story = {
	render: () => (
		<div className="w-[800px] p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-6">Analytics Overview</h2>
			<div className="grid grid-cols-4 gap-4">
				<MetricCard
					size="sm"
					label="Page Views"
					value="124.5K"
					delta="+14.2%"
					deltaType="increase"
					icon={<Eye className="size-5" />}
				/>
				<MetricCard
					size="sm"
					label="Visitors"
					value="45.2K"
					delta="+8.5%"
					deltaType="increase"
					icon={<Users className="size-5" />}
				/>
				<MetricCard
					size="sm"
					label="Orders"
					value="1,847"
					delta="-2.3%"
					deltaType="decrease"
					icon={<Package className="size-5" />}
				/>
				<MetricCard
					size="sm"
					label="Avg. Time"
					value="4m 32s"
					delta="+18.7%"
					deltaType="increase"
					icon={<Clock className="size-5" />}
				/>
			</div>
		</div>
	),
}

// E-commerce metrics
export const EcommerceMetrics: Story = {
	render: () => (
		<div className="w-[700px] p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-heading-sm text-text-strong-950">Sales Performance</h2>
				<span className="text-paragraph-sm text-text-sub-600">Last 30 days</span>
			</div>
			<div className="grid grid-cols-3 gap-6 mb-6">
				<Metric
					size="lg"
					label="Gross Revenue"
					value="$124,500"
					delta="+23.5%"
					deltaType="increase"
					description="vs. previous period"
				/>
				<Metric
					size="lg"
					label="Net Revenue"
					value="$98,200"
					delta="+18.2%"
					deltaType="increase"
					description="After refunds"
				/>
				<Metric
					size="lg"
					label="AOV"
					value="$67.50"
					delta="+5.1%"
					deltaType="moderateIncrease"
					description="Average order value"
				/>
			</div>
			<div className="border-t border-stroke-soft-200 pt-6">
				<MetricGroup columns={4}>
					<Metric size="sm" label="Orders" value="1,847" delta="+12%" deltaType="increase" />
					<Metric size="sm" label="Items Sold" value="4,523" delta="+8%" deltaType="increase" />
					<Metric size="sm" label="Refunds" value="$2,340" delta="-15%" deltaType="decrease" />
					<Metric size="sm" label="Returns" value="23" delta="-5%" deltaType="decrease" />
				</MetricGroup>
			</div>
		</div>
	),
}

// KPI header
export const KPIHeader: Story = {
	render: () => (
		<div className="w-full max-w-4xl p-6 bg-gradient-to-r from-primary-base to-primary-dark rounded-xl text-static-white">
			<h2 className="text-label-md text-static-white/80 mb-4">This Month's Performance</h2>
			<div className="grid grid-cols-4 gap-8">
				<div>
					<p className="text-paragraph-sm text-static-white/60 mb-1">Total Sales</p>
					<p className="text-title-h3 font-semibold">$89,400</p>
					<p className="text-paragraph-xs text-static-white/60 mt-1">+24% vs last month</p>
				</div>
				<div>
					<p className="text-paragraph-sm text-static-white/60 mb-1">New Customers</p>
					<p className="text-title-h3 font-semibold">1,234</p>
					<p className="text-paragraph-xs text-static-white/60 mt-1">+18% vs last month</p>
				</div>
				<div>
					<p className="text-paragraph-sm text-static-white/60 mb-1">Active Users</p>
					<p className="text-title-h3 font-semibold">8,547</p>
					<p className="text-paragraph-xs text-static-white/60 mt-1">+12% vs last month</p>
				</div>
				<div>
					<p className="text-paragraph-sm text-static-white/60 mb-1">Conversion</p>
					<p className="text-title-h3 font-semibold">3.24%</p>
					<p className="text-paragraph-xs text-static-white/60 mt-1">+0.5% vs last month</p>
				</div>
			</div>
		</div>
	),
}

// Financial summary
export const FinancialSummary: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h3 className="text-label-md text-text-strong-950">Financial Summary</h3>
				<p className="text-paragraph-xs text-text-sub-600">Q4 2024</p>
			</div>
			<div className="p-4 space-y-6">
				<Metric
					size="lg"
					label="Total Revenue"
					value="$1.24M"
					delta="+32.5%"
					deltaType="increase"
				/>
				<div className="border-t border-stroke-soft-200 pt-4">
					<MetricGroup columns={2}>
						<Metric size="sm" label="Expenses" value="$485K" delta="+8%" deltaType="moderateIncrease" />
						<Metric size="sm" label="Profit" value="$755K" delta="+45%" deltaType="increase" />
					</MetricGroup>
				</div>
				<div className="border-t border-stroke-soft-200 pt-4">
					<Metric
						size="md"
						label="Profit Margin"
						value="60.8%"
						delta="+5.2%"
						deltaType="increase"
						description="Above target of 55%"
					/>
				</div>
			</div>
		</div>
	),
}

// Compact stats row
export const CompactStatsRow: Story = {
	render: () => (
		<div className="flex items-center gap-8 p-4 border border-stroke-soft-200 rounded-xl">
			<Metric size="sm" label="Views" value="12.4K" />
			<div className="h-8 w-px bg-stroke-soft-200" />
			<Metric size="sm" label="Clicks" value="2.1K" />
			<div className="h-8 w-px bg-stroke-soft-200" />
			<Metric size="sm" label="CTR" value="16.9%" delta="+2.3%" deltaType="increase" />
			<div className="h-8 w-px bg-stroke-soft-200" />
			<Metric size="sm" label="Conversions" value="342" delta="+18%" deltaType="increase" />
		</div>
	),
}

// Real-time metrics
export const RealTimeMetrics: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-label-md text-text-strong-950">Live Stats</h3>
				<div className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-success-base animate-pulse" />
					<span className="text-paragraph-xs text-text-sub-600">Live</span>
				</div>
			</div>
			<div className="space-y-4">
				<Metric size="md" label="Active Users" value="1,234" delta="+45" deltaType="increase" />
				<Metric size="md" label="Requests/min" value="8,547" delta="+234" deltaType="increase" />
				<Metric size="md" label="Avg Response" value="45ms" delta="-12ms" deltaType="decrease" />
			</div>
		</div>
	),
}
