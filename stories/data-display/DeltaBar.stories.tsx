import type { Meta, StoryObj } from "@storybook/react"
import { DeltaBar, LabeledDeltaBar, ComparisonDeltaBar } from "@/components/ui/data-display/delta-bar"

const meta: Meta<typeof DeltaBar> = {
	title: "DataDisplay/DeltaBar",
	component: DeltaBar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
		},
		value: {
			control: { type: "range", min: -100, max: 100, step: 1 },
		},
	},
}

export default meta
type Story = StoryObj<typeof DeltaBar>

// Basic positive delta
export const PositiveDelta: Story = {
	render: () => (
		<div className="w-80">
			<DeltaBar value={45} />
		</div>
	),
}

// Basic negative delta
export const NegativeDelta: Story = {
	render: () => (
		<div className="w-80">
			<DeltaBar value={-35} />
		</div>
	),
}

// Neutral (zero) value
export const NeutralValue: Story = {
	render: () => (
		<div className="w-80">
			<DeltaBar value={0} />
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Extra Small</span>
				<DeltaBar value={60} size="xs" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Small</span>
				<DeltaBar value={40} size="sm" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Medium (default)</span>
				<DeltaBar value={-30} size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Large</span>
				<DeltaBar value={-50} size="lg" />
			</div>
		</div>
	),
}

// Without marker
export const WithoutMarker: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<DeltaBar value={50} showMarker={false} />
			<DeltaBar value={-50} showMarker={false} />
		</div>
	),
}

// Custom colors
export const CustomColors: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Default (Green/Red)</span>
				<DeltaBar value={40} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Blue/Orange</span>
				<DeltaBar value={60} positiveColor="bg-information-base" negativeColor="bg-warning-base" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Purple/Pink (Negative)</span>
				<DeltaBar value={-45} positiveColor="bg-feature-base" negativeColor="bg-pink-500" />
			</div>
		</div>
	),
}

// Labeled delta bar
export const LabeledDeltaBarStory: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<LabeledDeltaBar label="Revenue Growth" value={25} />
			<LabeledDeltaBar label="Customer Churn" value={-15} />
			<LabeledDeltaBar label="User Engagement" value={0} />
		</div>
	),
}

// Labeled without value display
export const LabeledWithoutValue: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<LabeledDeltaBar label="Conversion Rate" value={35} showValue={false} />
			<LabeledDeltaBar label="Bounce Rate" value={-20} showValue={false} />
		</div>
	),
}

// Custom value formatter
export const CustomValueFormatter: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<LabeledDeltaBar
				label="Stock Price"
				value={12.5}
				formatValue={(v) => `${v > 0 ? "+" : ""}$${v.toFixed(2)}`}
			/>
			<LabeledDeltaBar
				label="Temperature"
				value={-5}
				formatValue={(v) => `${v > 0 ? "+" : ""}${v}C`}
			/>
		</div>
	),
}

// Comparison delta bar
export const ComparisonDeltaBarStory: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-8">
			<ComparisonDeltaBar label="Monthly Sales" startValue={1000} endValue={1250} />
			<ComparisonDeltaBar label="Active Users" startValue={500} endValue={400} />
			<ComparisonDeltaBar label="Orders" startValue={200} endValue={200} />
		</div>
	),
}

// Comparison without labels
export const ComparisonWithoutLabels: Story = {
	render: () => (
		<div className="w-80">
			<ComparisonDeltaBar startValue={80} endValue={120} showLabels={false} />
		</div>
	),
}

// KPI dashboard example
export const KPIDashboardExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-6">Quarter Performance</h3>
			<div className="flex flex-col gap-6">
				<LabeledDeltaBar label="Revenue" value={28} size="lg" />
				<LabeledDeltaBar label="Profit Margin" value={-5} size="lg" />
				<LabeledDeltaBar label="Market Share" value={12} size="lg" />
				<LabeledDeltaBar label="Customer Acquisition" value={35} size="lg" />
				<LabeledDeltaBar label="Employee Satisfaction" value={-2} size="lg" />
			</div>
		</div>
	),
}

// Stock performance example
export const StockPerformanceExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Portfolio Performance</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">Weekly change vs. market</p>
			<div className="flex flex-col gap-4">
				{[
					{ name: "AAPL", value: 4.2 },
					{ name: "GOOGL", value: -2.1 },
					{ name: "MSFT", value: 6.8 },
					{ name: "AMZN", value: -0.5 },
					{ name: "TSLA", value: 12.3 },
				].map((stock) => (
					<LabeledDeltaBar
						key={stock.name}
						label={stock.name}
						value={stock.value}
						size="sm"
						formatValue={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
					/>
				))}
			</div>
		</div>
	),
}

// Comparison dashboard
export const ComparisonDashboardExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Year over Year</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">2023 vs 2024</p>
			<div className="flex flex-col gap-6">
				<ComparisonDeltaBar label="Website Traffic" startValue={45000} endValue={62000} />
				<ComparisonDeltaBar label="Leads Generated" startValue={1200} endValue={980} />
				<ComparisonDeltaBar label="Conversion Rate" startValue={3.2} endValue={4.1} />
				<ComparisonDeltaBar label="Avg Order Value" startValue={89} endValue={105} />
			</div>
		</div>
	),
}

// Interactive playground
export const InteractivePlayground: Story = {
	args: {
		value: 50,
		size: "md",
		showMarker: true,
	},
	render: (args) => (
		<div className="w-80">
			<DeltaBar {...args} />
			<p className="text-paragraph-sm text-text-sub-600 mt-4 text-center">
				Value: {args.value}% ({(args.value ?? 0) >= 0 ? "Positive" : "Negative"})
			</p>
		</div>
	),
}
