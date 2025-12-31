import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Legend, CompactLegend, LegendWithValues, ColorSwatch } from "@/components/ui/data-display/legend"

const meta: Meta<typeof Legend> = {
	title: "DataDisplay/Legend",
	component: Legend,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		layout: {
			control: "select",
			options: ["horizontal", "vertical"],
		},
	},
}

export default meta
type Story = StoryObj<typeof Legend>

// Basic with string categories
export const BasicWithStrings: Story = {
	render: () => (
		<Legend categories={["Sales", "Marketing", "Engineering", "Support"]} />
	),
}

// Basic with full category objects
export const BasicWithObjects: Story = {
	render: () => (
		<Legend
			categories={[
				{ name: "Revenue", color: "green" },
				{ name: "Expenses", color: "red" },
				{ name: "Profit", color: "blue" },
			]}
		/>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			{(["sm", "md", "lg"] as const).map((size) => (
				<div key={size} className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600 capitalize">{size}</span>
					<Legend
						categories={["Category A", "Category B", "Category C"]}
						size={size}
					/>
				</div>
			))}
		</div>
	),
}

// Horizontal layout
export const HorizontalLayout: Story = {
	render: () => (
		<Legend
			categories={["North", "South", "East", "West"]}
			layout="horizontal"
		/>
	),
}

// Vertical layout
export const VerticalLayout: Story = {
	render: () => (
		<Legend
			categories={["North", "South", "East", "West"]}
			layout="vertical"
		/>
	),
}

// Custom colors
export const CustomColors: Story = {
	render: () => (
		<Legend
			categories={["Primary", "Success", "Warning", "Error", "Info"]}
			colors={["primary", "green", "orange", "red", "blue"]}
		/>
	),
}

// All preset colors
export const AllPresetColors: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Legend
				categories={[
					{ name: "Primary", color: "primary" },
					{ name: "Blue", color: "blue" },
					{ name: "Green", color: "green" },
					{ name: "Red", color: "red" },
					{ name: "Orange", color: "orange" },
					{ name: "Purple", color: "purple" },
				]}
			/>
			<Legend
				categories={[
					{ name: "Gray", color: "gray" },
					{ name: "Cyan", color: "cyan" },
					{ name: "Pink", color: "pink" },
					{ name: "Lime", color: "lime" },
				]}
			/>
		</div>
	),
}

// With custom hex colors
export const CustomHexColors: Story = {
	render: () => (
		<Legend
			categories={[
				{ name: "Sky Blue", color: "#0ea5e9" },
				{ name: "Violet", color: "#8b5cf6" },
				{ name: "Rose", color: "#f43f5e" },
				{ name: "Emerald", color: "#10b981" },
			]}
		/>
	),
}

// Interactive legend
export const InteractiveLegend: Story = {
	render: function InteractiveLegendDemo() {
		const [activeLegend, setActiveLegend] = useState<string | undefined>()

		const handleClick = (item: string) => {
			setActiveLegend(activeLegend === item ? undefined : item)
		}

		return (
			<div className="flex flex-col gap-4">
				<Legend
					categories={["Sales", "Marketing", "Engineering", "Support"]}
					onClickLegendItem={handleClick}
					activeLegend={activeLegend}
				/>
				<p className="text-paragraph-sm text-text-sub-600">
					Active: {activeLegend || "None (click to filter)"}
				</p>
			</div>
		)
	},
}

// Compact legend
export const CompactLegendStory: Story = {
	render: () => (
		<CompactLegend categories={["Revenue", "Costs", "Profit"]} />
	),
}

// Legend with values
export const LegendWithValuesStory: Story = {
	render: () => (
		<LegendWithValues
			categories={[
				{ name: "Direct", color: "primary", value: 45000 },
				{ name: "Organic", color: "green", value: 32000 },
				{ name: "Referral", color: "blue", value: 18500 },
				{ name: "Social", color: "purple", value: 12000 },
			]}
		/>
	),
}

// Legend with values - custom formatter
export const LegendWithValuesFormatted: Story = {
	render: () => (
		<LegendWithValues
			categories={[
				{ name: "North America", color: "primary", value: 45.2 },
				{ name: "Europe", color: "blue", value: 28.5 },
				{ name: "Asia Pacific", color: "green", value: 18.3 },
				{ name: "Other", color: "gray", value: 8.0 },
			]}
			valueFormatter={(v) => `${v}%`}
		/>
	),
}

// Color swatch standalone
export const ColorSwatchStory: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Small</span>
				<ColorSwatch color="primary" size="sm" />
				<ColorSwatch color="green" size="sm" />
				<ColorSwatch color="red" size="sm" />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Medium</span>
				<ColorSwatch color="primary" size="md" />
				<ColorSwatch color="green" size="md" />
				<ColorSwatch color="red" size="md" />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Large</span>
				<ColorSwatch color="primary" size="lg" />
				<ColorSwatch color="green" size="lg" />
				<ColorSwatch color="red" size="lg" />
			</div>
		</div>
	),
}

// Chart legend example
export const ChartLegendExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Revenue by Source</h3>
			<div className="h-48 bg-bg-weak-50 rounded-lg mb-4 flex items-center justify-center">
				<span className="text-paragraph-sm text-text-sub-600">[Chart Placeholder]</span>
			</div>
			<Legend
				categories={["Direct Sales", "Online Store", "Partners", "Affiliates"]}
				colors={["primary", "green", "blue", "purple"]}
			/>
		</div>
	),
}

// Pie chart legend example
export const PieChartLegendExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Traffic Distribution</h3>
			<div className="flex items-center gap-6">
				<div className="size-32 bg-bg-weak-50 rounded-full flex items-center justify-center shrink-0">
					<span className="text-paragraph-xs text-text-sub-600">[Pie]</span>
				</div>
				<LegendWithValues
					categories={[
						{ name: "Organic", color: "green", value: 45 },
						{ name: "Direct", color: "primary", value: 30 },
						{ name: "Referral", color: "blue", value: 15 },
						{ name: "Social", color: "purple", value: 10 },
					]}
					valueFormatter={(v) => `${v}%`}
					size="sm"
				/>
			</div>
		</div>
	),
}

// Dashboard card example
export const DashboardCardExample: Story = {
	render: function DashboardCardDemo() {
		const [activeLegend, setActiveLegend] = useState<string | undefined>()

		return (
			<div className="w-full max-w-xl p-6 border border-stroke-soft-200 rounded-xl">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-label-md text-text-strong-950">Sales Performance</h3>
						<p className="text-paragraph-sm text-text-sub-600">Last 12 months</p>
					</div>
					<CompactLegend
						categories={["This Year", "Last Year"]}
						colors={["primary", "gray"]}
						onClickLegendItem={setActiveLegend}
						activeLegend={activeLegend}
					/>
				</div>
				<div className="h-64 bg-bg-weak-50 rounded-lg flex items-center justify-center">
					<span className="text-paragraph-sm text-text-sub-600">
						{activeLegend ? `Showing: ${activeLegend}` : "[Line Chart]"}
					</span>
				</div>
			</div>
		)
	},
}

// Stacked bar chart legend
export const StackedBarChartLegend: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Quarterly Revenue</h3>
			<div className="h-48 bg-bg-weak-50 rounded-lg mb-4 flex items-center justify-center">
				<span className="text-paragraph-sm text-text-sub-600">[Stacked Bar Chart]</span>
			</div>
			<Legend
				categories={[
					{ name: "Product A", color: "primary" },
					{ name: "Product B", color: "blue" },
					{ name: "Product C", color: "green" },
					{ name: "Product D", color: "orange" },
				]}
			/>
		</div>
	),
}

// Multiple charts with shared legend
export const SharedLegendExample: Story = {
	render: function SharedLegendDemo() {
		const [activeLegend, setActiveLegend] = useState<string | undefined>()
		const categories = ["North", "South", "East", "West"]

		return (
			<div className="w-full max-w-2xl p-6 border border-stroke-soft-200 rounded-xl">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-label-md text-text-strong-950">Regional Performance</h3>
					<Legend
						categories={categories}
						onClickLegendItem={setActiveLegend}
						activeLegend={activeLegend}
						size="sm"
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="h-40 bg-bg-weak-50 rounded-lg flex items-center justify-center">
						<span className="text-paragraph-sm text-text-sub-600">Revenue</span>
					</div>
					<div className="h-40 bg-bg-weak-50 rounded-lg flex items-center justify-center">
						<span className="text-paragraph-sm text-text-sub-600">Users</span>
					</div>
					<div className="h-40 bg-bg-weak-50 rounded-lg flex items-center justify-center">
						<span className="text-paragraph-sm text-text-sub-600">Orders</span>
					</div>
					<div className="h-40 bg-bg-weak-50 rounded-lg flex items-center justify-center">
						<span className="text-paragraph-sm text-text-sub-600">Conversion</span>
					</div>
				</div>
				{activeLegend && (
					<p className="text-paragraph-sm text-text-sub-600 mt-4 text-center">
						Filtering by: {activeLegend}
					</p>
				)}
			</div>
		)
	},
}

// Analytics breakdown example
export const AnalyticsBreakdownExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Page Views</h3>
			<p className="text-heading-lg text-text-strong-950 mb-4">1.2M</p>
			<LegendWithValues
				categories={[
					{ name: "Desktop", color: "primary", value: 680000 },
					{ name: "Mobile", color: "green", value: 420000 },
					{ name: "Tablet", color: "orange", value: 100000 },
				]}
				valueFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
			/>
		</div>
	),
}

// Compact inline legend
export const CompactInlineExample: Story = {
	render: () => (
		<div className="flex items-center gap-4 p-4 bg-bg-weak-50 rounded-lg">
			<span className="text-label-sm text-text-strong-950">Sales by Region:</span>
			<CompactLegend
				categories={[
					{ name: "NA", color: "primary", value: "$45K" },
					{ name: "EU", color: "blue", value: "$32K" },
					{ name: "APAC", color: "green", value: "$18K" },
				]}
			/>
		</div>
	),
}
