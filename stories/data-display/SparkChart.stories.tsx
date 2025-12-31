import type { Meta, StoryObj } from "@storybook/react"
import { SparkChart, TrendIndicator } from "@/components/ui/data-display/spark-chart"

const meta: Meta<typeof SparkChart> = {
	title: "DataDisplay/SparkChart",
	component: SparkChart,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
		},
		variant: {
			control: "select",
			options: ["area", "line", "bar"],
		},
	},
}

export default meta
type Story = StoryObj<typeof SparkChart>

// Sample data
const sampleData = [
	{ value: 10 },
	{ value: 25 },
	{ value: 18 },
	{ value: 35 },
	{ value: 28 },
	{ value: 42 },
	{ value: 38 },
	{ value: 55 },
	{ value: 48 },
	{ value: 60 },
]

const volatileData = [
	{ value: 45 },
	{ value: 20 },
	{ value: 65 },
	{ value: 30 },
	{ value: 55 },
	{ value: 15 },
	{ value: 70 },
	{ value: 40 },
	{ value: 25 },
	{ value: 50 },
]

const downtrendData = [
	{ value: 80 },
	{ value: 75 },
	{ value: 68 },
	{ value: 72 },
	{ value: 60 },
	{ value: 55 },
	{ value: 48 },
	{ value: 45 },
	{ value: 38 },
	{ value: 30 },
]

// Basic area chart
export const BasicArea: Story = {
	render: () => <SparkChart data={sampleData} variant="area" />,
}

// Basic line chart
export const BasicLine: Story = {
	render: () => <SparkChart data={sampleData} variant="line" />,
}

// Basic bar chart
export const BasicBar: Story = {
	render: () => <SparkChart data={sampleData} variant="bar" />,
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="area" />
				<span className="text-paragraph-xs text-text-sub-600">Area</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="line" />
				<span className="text-paragraph-xs text-text-sub-600">Line</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="bar" />
				<span className="text-paragraph-xs text-text-sub-600">Bar</span>
			</div>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			{(["xs", "sm", "md", "lg"] as const).map((size) => (
				<div key={size} className="flex items-center gap-4">
					<span className="w-20 text-paragraph-xs text-text-sub-600 capitalize">{size}</span>
					<SparkChart data={sampleData} size={size} variant="area" />
				</div>
			))}
		</div>
	),
}

// Custom colors
export const CustomColors: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} color="var(--color-success-base)" />
				<span className="text-paragraph-xs text-text-sub-600">Success</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={downtrendData} color="var(--color-error-base)" />
				<span className="text-paragraph-xs text-text-sub-600">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={volatileData} color="var(--color-warning-base)" />
				<span className="text-paragraph-xs text-text-sub-600">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} color="var(--color-information-base)" />
				<span className="text-paragraph-xs text-text-sub-600">Info</span>
			</div>
		</div>
	),
}

// Line with dots
export const LineWithDots: Story = {
	render: () => (
		<SparkChart data={sampleData} variant="line" dot size="lg" />
	),
}

// Line with custom stroke width
export const LineCustomStroke: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="line" strokeWidth={1} />
				<span className="text-paragraph-xs text-text-sub-600">Thin (1px)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="line" strokeWidth={2} />
				<span className="text-paragraph-xs text-text-sub-600">Default (2px)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="line" strokeWidth={3} />
				<span className="text-paragraph-xs text-text-sub-600">Thick (3px)</span>
			</div>
		</div>
	),
}

// Area with custom opacity
export const AreaCustomOpacity: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="area" fillOpacity={0.1} showGradient={false} />
				<span className="text-paragraph-xs text-text-sub-600">Low opacity</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="area" showGradient />
				<span className="text-paragraph-xs text-text-sub-600">Gradient (default)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="area" fillOpacity={0.5} showGradient={false} />
				<span className="text-paragraph-xs text-text-sub-600">High opacity</span>
			</div>
		</div>
	),
}

// Bar with custom radius
export const BarCustomRadius: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="bar" barRadius={0} />
				<span className="text-paragraph-xs text-text-sub-600">Sharp</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="bar" barRadius={2} />
				<span className="text-paragraph-xs text-text-sub-600">Rounded (default)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SparkChart data={sampleData} variant="bar" barRadius={6} />
				<span className="text-paragraph-xs text-text-sub-600">Very rounded</span>
			</div>
		</div>
	),
}

// Empty state
export const EmptyState: Story = {
	render: () => <SparkChart data={[]} />,
}

// Trend indicator
export const TrendIndicatorStory: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="w-32 text-paragraph-sm text-text-sub-600">Positive change:</span>
				<TrendIndicator value={125} previousValue={100} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-32 text-paragraph-sm text-text-sub-600">Negative change:</span>
				<TrendIndicator value={80} previousValue={100} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-32 text-paragraph-sm text-text-sub-600">No change:</span>
				<TrendIndicator value={100} previousValue={100} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-32 text-paragraph-sm text-text-sub-600">Without %:</span>
				<TrendIndicator value={150} previousValue={100} showPercentage={false} />
			</div>
		</div>
	),
}

// Stock ticker example
export const StockTickerExample: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			{[
				{ symbol: "AAPL", price: 189.34, change: 2.5, data: sampleData, color: "var(--color-success-base)" },
				{ symbol: "GOOGL", price: 142.56, change: -1.2, data: downtrendData, color: "var(--color-error-base)" },
				{ symbol: "MSFT", price: 378.91, change: 0.8, data: volatileData, color: "var(--color-success-base)" },
			].map((stock) => (
				<div
					key={stock.symbol}
					className="flex items-center gap-4 p-4 border border-stroke-soft-200 rounded-lg"
				>
					<div className="w-16">
						<span className="text-label-md text-text-strong-950">{stock.symbol}</span>
					</div>
					<SparkChart data={stock.data} size="sm" color={stock.color} />
					<div className="flex flex-col items-end">
						<span className="text-label-sm text-text-strong-950">${stock.price}</span>
						<span className={`text-paragraph-xs ${stock.change >= 0 ? "text-success-base" : "text-error-base"}`}>
							{stock.change >= 0 ? "+" : ""}{stock.change}%
						</span>
					</div>
				</div>
			))}
		</div>
	),
}

// Metrics card example
export const MetricsCardExample: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4">
			{[
				{ title: "Revenue", value: "$45.2K", trend: sampleData, positive: true },
				{ title: "Users", value: "12,456", trend: downtrendData, positive: false },
				{ title: "Orders", value: "1,234", trend: sampleData, positive: true },
				{ title: "Bounce Rate", value: "32.5%", trend: volatileData, positive: false },
			].map((metric) => (
				<div
					key={metric.title}
					className="p-4 border border-stroke-soft-200 rounded-xl"
				>
					<div className="flex items-center justify-between mb-2">
						<span className="text-paragraph-sm text-text-sub-600">{metric.title}</span>
						<SparkChart
							data={metric.trend}
							size="xs"
							color={metric.positive ? "var(--color-success-base)" : "var(--color-error-base)"}
						/>
					</div>
					<span className="text-heading-sm text-text-strong-950">{metric.value}</span>
				</div>
			))}
		</div>
	),
}

// Table with sparklines example
export const TableWithSparklinesExample: Story = {
	render: () => (
		<div className="w-full max-w-2xl">
			<table className="w-full">
				<thead>
					<tr className="border-b border-stroke-soft-200">
						<th className="text-left py-3 text-label-sm text-text-sub-600">Product</th>
						<th className="text-left py-3 text-label-sm text-text-sub-600">Sales</th>
						<th className="text-left py-3 text-label-sm text-text-sub-600">Trend (7 days)</th>
						<th className="text-right py-3 text-label-sm text-text-sub-600">Change</th>
					</tr>
				</thead>
				<tbody>
					{[
						{ name: "Widget Pro", sales: 1234, trend: sampleData, change: 12.5 },
						{ name: "Gadget Plus", sales: 987, trend: downtrendData, change: -8.2 },
						{ name: "Tool Basic", sales: 756, trend: volatileData, change: 3.1 },
						{ name: "Device Max", sales: 543, trend: sampleData, change: 25.0 },
					].map((product) => (
						<tr key={product.name} className="border-b border-stroke-soft-200">
							<td className="py-3 text-paragraph-sm text-text-strong-950">{product.name}</td>
							<td className="py-3 text-paragraph-sm text-text-sub-600">{product.sales.toLocaleString()}</td>
							<td className="py-3">
								<SparkChart
									data={product.trend}
									size="xs"
									color={product.change >= 0 ? "var(--color-success-base)" : "var(--color-error-base)"}
									variant="line"
								/>
							</td>
							<td className="py-3 text-right">
								<TrendIndicator
									value={product.sales}
									previousValue={product.sales / (1 + product.change / 100)}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	),
}

// Dashboard widget example
export const DashboardWidgetExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-start justify-between mb-4">
				<div>
					<p className="text-paragraph-sm text-text-sub-600">Total Revenue</p>
					<h3 className="text-heading-lg text-text-strong-950">$84,254</h3>
				</div>
				<TrendIndicator value={84254} previousValue={72000} />
			</div>
			<SparkChart
				data={[
					{ value: 55000 },
					{ value: 62000 },
					{ value: 58000 },
					{ value: 72000 },
					{ value: 68000 },
					{ value: 78000 },
					{ value: 84254 },
				]}
				size="lg"
				color="var(--color-primary-base)"
			/>
			<p className="text-paragraph-xs text-text-sub-600 mt-2">Last 7 days</p>
		</div>
	),
}

// Comparison example
export const ComparisonExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Performance Comparison</h3>
			<div className="flex flex-col gap-4">
				{[
					{ name: "This Week", data: sampleData, color: "var(--color-primary-base)" },
					{ name: "Last Week", data: downtrendData, color: "var(--color-faded-base)" },
				].map((series) => (
					<div key={series.name} className="flex items-center gap-4">
						<span className="w-24 text-paragraph-sm text-text-sub-600">{series.name}</span>
						<SparkChart data={series.data} color={series.color} size="sm" variant="line" />
					</div>
				))}
			</div>
		</div>
	),
}
