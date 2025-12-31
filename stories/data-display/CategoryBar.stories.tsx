import type { Meta, StoryObj } from "@storybook/react"
import { CategoryBar, CategoryBarMarker } from "@/components/ui/data-display/category-bar"

const meta: Meta<typeof CategoryBar> = {
	title: "DataDisplay/CategoryBar",
	component: CategoryBar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
		},
	},
}

export default meta
type Story = StoryObj<typeof CategoryBar>

// Basic category bar
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<CategoryBar
				data={[
					{ name: "Electronics", value: 120 },
					{ name: "Clothing", value: 80 },
					{ name: "Food", value: 60 },
				]}
			/>
		</div>
	),
}

// With labels
export const WithLabels: Story = {
	render: () => (
		<div className="w-96">
			<CategoryBar
				data={[
					{ name: "Direct", value: 450 },
					{ name: "Organic", value: 300 },
					{ name: "Referral", value: 180 },
					{ name: "Social", value: 120 },
				]}
				showLabels
			/>
		</div>
	),
}

// Custom colors
export const CustomColors: Story = {
	render: () => (
		<div className="w-80">
			<CategoryBar
				data={[
					{ name: "Success", value: 50, color: "var(--color-success-base)" },
					{ name: "Warning", value: 30, color: "var(--color-warning-base)" },
					{ name: "Error", value: 20, color: "var(--color-error-base)" },
				]}
				showLabels
			/>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => {
		const data = [
			{ name: "A", value: 40 },
			{ name: "B", value: 35 },
			{ name: "C", value: 25 },
		]

		return (
			<div className="w-80 flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600">Extra Small</span>
					<CategoryBar data={data} size="xs" showTooltip={false} />
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600">Small</span>
					<CategoryBar data={data} size="sm" showTooltip={false} />
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600">Medium (default)</span>
					<CategoryBar data={data} size="md" showTooltip={false} />
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600">Large</span>
					<CategoryBar data={data} size="lg" showTooltip={false} />
				</div>
			</div>
		)
	},
}

// Without tooltip
export const WithoutTooltip: Story = {
	render: () => (
		<div className="w-80">
			<CategoryBar
				data={[
					{ name: "Category A", value: 100 },
					{ name: "Category B", value: 75 },
					{ name: "Category C", value: 50 },
				]}
				showTooltip={false}
			/>
		</div>
	),
}

// Many categories
export const ManyCategories: Story = {
	render: () => (
		<div className="w-96">
			<CategoryBar
				data={[
					{ name: "Jan", value: 120 },
					{ name: "Feb", value: 95 },
					{ name: "Mar", value: 140 },
					{ name: "Apr", value: 80 },
					{ name: "May", value: 110 },
					{ name: "Jun", value: 125 },
					{ name: "Jul", value: 90 },
					{ name: "Aug", value: 105 },
				]}
				showLabels
			/>
		</div>
	),
}

// Category bar marker - basic
export const MarkerBasic: Story = {
	render: () => (
		<div className="w-80">
			<CategoryBarMarker value={65} />
		</div>
	),
}

// Marker with custom thresholds
export const MarkerCustomThresholds: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Low (20) - Default thresholds [33, 66]</span>
				<CategoryBarMarker value={20} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Medium (50)</span>
				<CategoryBarMarker value={50} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">High (80)</span>
				<CategoryBarMarker value={80} />
			</div>
		</div>
	),
}

// Marker with custom colors and thresholds
export const MarkerCustomColorsAndThresholds: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Cold/Warm/Hot (thresholds: 40, 70)</span>
				<CategoryBarMarker
					value={55}
					thresholds={[40, 70]}
					rangeColors={[
						"var(--color-information-base)",
						"var(--color-warning-base)",
						"var(--color-error-base)",
					]}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Gradient (thresholds: 25, 75)</span>
				<CategoryBarMarker
					value={85}
					thresholds={[25, 75]}
					rangeColors={[
						"#9333ea",
						"#ec4899",
						"#f97316",
					]}
				/>
			</div>
		</div>
	),
}

// Marker all sizes
export const MarkerAllSizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			{(["xs", "sm", "md", "lg"] as const).map((size) => (
				<div key={size} className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600 capitalize">{size}</span>
					<CategoryBarMarker value={45} size={size} />
				</div>
			))}
		</div>
	),
}

// Traffic sources example
export const TrafficSourcesExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Traffic Sources</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">Last 30 days</p>
			<CategoryBar
				data={[
					{ name: "Organic Search", value: 12500 },
					{ name: "Direct", value: 8400 },
					{ name: "Referral", value: 4200 },
					{ name: "Social Media", value: 3100 },
					{ name: "Email", value: 1800 },
				]}
				size="lg"
				showLabels
			/>
		</div>
	),
}

// Budget allocation example
export const BudgetAllocationExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Budget Allocation</h3>
			<div className="flex flex-col gap-6">
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-label-sm text-text-strong-950">Marketing</span>
						<span className="text-paragraph-sm text-text-sub-600">$45,000</span>
					</div>
					<CategoryBar
						data={[
							{ name: "Digital", value: 25000, color: "var(--color-primary-base)" },
							{ name: "Print", value: 12000, color: "var(--color-primary-lighter)" },
							{ name: "Events", value: 8000, color: "var(--color-primary-light)" },
						]}
						size="sm"
					/>
				</div>
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-label-sm text-text-strong-950">Engineering</span>
						<span className="text-paragraph-sm text-text-sub-600">$120,000</span>
					</div>
					<CategoryBar
						data={[
							{ name: "Salaries", value: 90000, color: "var(--color-success-base)" },
							{ name: "Tools", value: 20000, color: "var(--color-success-lighter)" },
							{ name: "Training", value: 10000, color: "var(--color-success-light)" },
						]}
						size="sm"
					/>
				</div>
			</div>
		</div>
	),
}

// Performance score example
export const PerformanceScoreExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-6">Performance Scores</h3>
			<div className="flex flex-col gap-6">
				{[
					{ name: "Page Load Speed", score: 85 },
					{ name: "SEO Score", score: 72 },
					{ name: "Accessibility", score: 45 },
					{ name: "Best Practices", score: 92 },
				].map((metric) => (
					<div key={metric.name} className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-label-sm text-text-strong-950">{metric.name}</span>
							<span className="text-label-sm text-text-sub-600">{metric.score}/100</span>
						</div>
						<CategoryBarMarker value={metric.score} size="sm" />
					</div>
				))}
			</div>
		</div>
	),
}

// Storage usage example
export const StorageUsageExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Storage Usage</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">42.5 GB of 100 GB used</p>
			<CategoryBar
				data={[
					{ name: "Documents", value: 15.2, color: "var(--color-information-base)" },
					{ name: "Photos", value: 18.5, color: "var(--color-success-base)" },
					{ name: "Videos", value: 8.8, color: "var(--color-warning-base)" },
					{ name: "Free", value: 57.5, color: "var(--color-bg-soft-200)" },
				]}
				size="lg"
				showLabels
			/>
		</div>
	),
}

// Survey results example
export const SurveyResultsExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Customer Satisfaction Survey</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">1,234 responses</p>
			<CategoryBar
				data={[
					{ name: "Very Satisfied", value: 456, color: "var(--color-success-base)" },
					{ name: "Satisfied", value: 389, color: "var(--color-success-lighter)" },
					{ name: "Neutral", value: 234, color: "var(--color-warning-lighter)" },
					{ name: "Dissatisfied", value: 98, color: "var(--color-error-lighter)" },
					{ name: "Very Dissatisfied", value: 57, color: "var(--color-error-base)" },
				]}
				size="lg"
				showLabels
			/>
		</div>
	),
}
