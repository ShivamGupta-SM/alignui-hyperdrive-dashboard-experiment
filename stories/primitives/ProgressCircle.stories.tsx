import type { Meta, StoryObj } from "@storybook/react"
import { useState, useEffect } from "react"
import { ProgressCircle } from "@/components/ui/primitives/progress-circle"
import { Check, ArrowUp, Flame } from "@phosphor-icons/react"

const meta: Meta<typeof ProgressCircle> = {
	title: "Primitives/ProgressCircle",
	component: ProgressCircle,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["small", "medium", "large", "xlarge"],
		},
		color: {
			control: "select",
			options: ["primary", "success", "warning", "error", "gray"],
		},
		value: {
			control: { type: "range", min: 0, max: 100, step: 1 },
		},
		showValue: {
			control: "boolean",
		},
	},
}

export default meta
type Story = StoryObj<typeof ProgressCircle>

// Basic progress circle
export const Basic: Story = {
	render: () => <ProgressCircle value={75} />,
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex items-end gap-8">
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle size="small" value={65} />
				<span className="text-label-sm text-text-sub-600">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle size="medium" value={65} />
				<span className="text-label-sm text-text-sub-600">Medium</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle size="large" value={65} />
				<span className="text-label-sm text-text-sub-600">Large</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle size="xlarge" value={65} />
				<span className="text-label-sm text-text-sub-600">XLarge</span>
			</div>
		</div>
	),
}

// All colors
export const Colors: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle color="primary" value={75} />
				<span className="text-label-sm text-text-sub-600">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle color="success" value={75} />
				<span className="text-label-sm text-text-sub-600">Success</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle color="warning" value={75} />
				<span className="text-label-sm text-text-sub-600">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle color="error" value={75} />
				<span className="text-label-sm text-text-sub-600">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle color="gray" value={75} />
				<span className="text-label-sm text-text-sub-600">Gray</span>
			</div>
		</div>
	),
}

// With label
export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<ProgressCircle value={85} label="Complete" size="medium" color="success" />
			<ProgressCircle value={45} label="Loading" size="medium" color="primary" />
			<ProgressCircle value={25} label="Uploading" size="medium" color="warning" />
		</div>
	),
}

// Without value
export const WithoutValue: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<ProgressCircle value={75} showValue={false} size="medium" />
			<ProgressCircle value={50} showValue={false} label="Progress" size="medium" />
		</div>
	),
}

// Custom content
export const CustomContent: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<ProgressCircle value={100} color="success" size="large">
				<Check className="size-8 text-success-base" weight="bold" />
			</ProgressCircle>
			<ProgressCircle value={85} color="primary" size="large">
				<div className="flex flex-col items-center">
					<ArrowUp className="size-6 text-primary-base" weight="bold" />
					<span className="text-label-xs text-text-sub-600">+15%</span>
				</div>
			</ProgressCircle>
			<ProgressCircle value={92} color="error" size="large">
				<Flame className="size-8 text-error-base" weight="fill" />
			</ProgressCircle>
		</div>
	),
}

// Animated progress
export const AnimatedProgress: Story = {
	render: function AnimatedProgressStory() {
		const [progress, setProgress] = useState(0)

		useEffect(() => {
			const timer = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) return 0
					return prev + 5
				})
			}, 200)
			return () => clearInterval(timer)
		}, [])

		return (
			<div className="flex items-center gap-8">
				<ProgressCircle value={progress} size="large" color="primary" />
			</div>
		)
	},
}

// Value comparison
export const ValueComparison: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<ProgressCircle value={0} size="small" />
			<ProgressCircle value={25} size="small" />
			<ProgressCircle value={50} size="small" />
			<ProgressCircle value={75} size="small" />
			<ProgressCircle value={100} size="small" color="success" />
		</div>
	),
}

// Dashboard card example
export const DashboardCardExample: Story = {
	render: () => (
		<div className="w-64 border border-stroke-soft-200 rounded-xl p-6">
			<div className="flex flex-col items-center">
				<ProgressCircle value={78} size="xlarge" color="primary" label="Score" />
				<h3 className="text-label-lg text-text-strong-950 mt-4">Performance</h3>
				<p className="text-paragraph-sm text-text-sub-600 text-center">
					Your performance is above average this month
				</p>
			</div>
		</div>
	),
}

// Stats grid example
export const StatsGridExample: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-6 p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex flex-col items-center">
				<ProgressCircle value={92} size="medium" color="success" />
				<span className="text-label-sm text-text-strong-950 mt-2">Uptime</span>
			</div>
			<div className="flex flex-col items-center">
				<ProgressCircle value={67} size="medium" color="warning" />
				<span className="text-label-sm text-text-strong-950 mt-2">CPU</span>
			</div>
			<div className="flex flex-col items-center">
				<ProgressCircle value={45} size="medium" color="primary" />
				<span className="text-label-sm text-text-strong-950 mt-2">Memory</span>
			</div>
		</div>
	),
}

// Storage usage example
export const StorageUsageExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-6">
			<div className="flex items-center gap-6">
				<ProgressCircle value={68} size="large" color="primary" />
				<div>
					<h3 className="text-label-md text-text-strong-950">Storage</h3>
					<p className="text-paragraph-sm text-text-sub-600">34 GB of 50 GB used</p>
					<button className="mt-2 text-label-sm text-primary-base hover:underline">
						Upgrade plan
					</button>
				</div>
			</div>
		</div>
	),
}

// Goal tracking example
export const GoalTrackingExample: Story = {
	render: () => (
		<div className="flex gap-6">
			{[
				{ label: "Steps", value: 75, target: "7,500 / 10,000", color: "success" as const },
				{ label: "Calories", value: 60, target: "1,200 / 2,000", color: "warning" as const },
				{ label: "Water", value: 40, target: "4 / 10 glasses", color: "primary" as const },
			].map((goal) => (
				<div
					key={goal.label}
					className="flex flex-col items-center p-4 border border-stroke-soft-200 rounded-xl"
				>
					<ProgressCircle value={goal.value} size="medium" color={goal.color} />
					<span className="text-label-sm text-text-strong-950 mt-3">{goal.label}</span>
					<span className="text-paragraph-xs text-text-sub-600">{goal.target}</span>
				</div>
			))}
		</div>
	),
}

// Custom stroke width
export const CustomStrokeWidth: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={65} size="large" strokeWidth={4} />
				<span className="text-label-sm text-text-sub-600">Thin (4px)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={65} size="large" strokeWidth={10} />
				<span className="text-label-sm text-text-sub-600">Default (10px)</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={65} size="large" strokeWidth={16} />
				<span className="text-label-sm text-text-sub-600">Thick (16px)</span>
			</div>
		</div>
	),
}

// Status indicators
export const StatusIndicators: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={100} size="small" color="success" showValue={false}>
					<Check className="size-4 text-success-base" weight="bold" />
				</ProgressCircle>
				<span className="text-label-sm text-text-strong-950">Complete</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={50} size="small" color="primary" />
				<span className="text-label-sm text-text-strong-950">In Progress</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={25} size="small" color="warning" />
				<span className="text-label-sm text-text-strong-950">Low</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<ProgressCircle value={10} size="small" color="error" />
				<span className="text-label-sm text-text-strong-950">Critical</span>
			</div>
		</div>
	),
}
