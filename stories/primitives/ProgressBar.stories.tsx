import type { Meta, StoryObj } from "@storybook/react"
import { useState, useEffect } from "react"
import {
	Root as ProgressBarRoot,
	WithLabel as ProgressBarWithLabel,
	Steps as ProgressBarSteps,
} from "@/components/ui/primitives/progress-bar"

const meta: Meta<typeof ProgressBarRoot> = {
	title: "Primitives/ProgressBar",
	component: ProgressBarRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		color: {
			control: "select",
			options: ["blue", "red", "orange", "green", "primary"],
		},
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
		},
		value: {
			control: { type: "range", min: 0, max: 100, step: 1 },
		},
	},
}

export default meta
type Story = StoryObj<typeof ProgressBarRoot>

// Basic progress bar
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<ProgressBarRoot value={60} />
		</div>
	),
}

// All colors
export const Colors: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Blue (default)</span>
				<ProgressBarRoot color="blue" value={75} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Primary</span>
				<ProgressBarRoot color="primary" value={75} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Green</span>
				<ProgressBarRoot color="green" value={75} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Orange</span>
				<ProgressBarRoot color="orange" value={75} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Red</span>
				<ProgressBarRoot color="red" value={75} />
			</div>
		</div>
	),
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Extra Small (xs)</span>
				<ProgressBarRoot size="xs" value={60} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Small (sm - default)</span>
				<ProgressBarRoot size="sm" value={60} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Medium (md)</span>
				<ProgressBarRoot size="md" value={60} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Large (lg)</span>
				<ProgressBarRoot size="lg" value={60} />
			</div>
		</div>
	),
}

// Indeterminate
export const Indeterminate: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Loading...</span>
				<ProgressBarRoot isIndeterminate color="primary" />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Processing...</span>
				<ProgressBarRoot isIndeterminate color="blue" />
			</div>
		</div>
	),
}

// With label - top position
export const WithLabelTop: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<ProgressBarWithLabel
				value={45}
				label="Storage"
				labelPosition="top"
				color="primary"
			/>
			<ProgressBarWithLabel
				value={72}
				label="Bandwidth"
				labelPosition="top"
				color="blue"
			/>
		</div>
	),
}

// With label - bottom position
export const WithLabelBottom: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<ProgressBarWithLabel
				value={85}
				label="Upload complete"
				labelPosition="bottom"
				color="green"
			/>
			<ProgressBarWithLabel
				value={30}
				label="Downloading..."
				labelPosition="bottom"
				color="primary"
			/>
		</div>
	),
}

// With label - inline position
export const WithLabelInline: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<ProgressBarWithLabel
				value={65}
				labelPosition="inline"
				color="primary"
			/>
			<ProgressBarWithLabel
				value={90}
				labelPosition="inline"
				color="green"
			/>
		</div>
	),
}

// Stepped progress
export const SteppedProgress: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">3 steps, current: 2</span>
				<ProgressBarSteps steps={3} currentStep={2} color="primary" />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">4 steps with labels</span>
				<ProgressBarSteps
					steps={4}
					currentStep={2}
					color="primary"
					labels={["Start", "Info", "Review", "Done"]}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">5 steps, current: 4</span>
				<ProgressBarSteps steps={5} currentStep={4} color="green" />
			</div>
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
					return prev + 10
				})
			}, 500)
			return () => clearInterval(timer)
		}, [])

		return (
			<div className="w-80 flex flex-col gap-4">
				<ProgressBarWithLabel
					value={progress}
					label="Uploading file..."
					color="primary"
					labelPosition="top"
				/>
			</div>
		)
	},
}

// File upload example
export const FileUploadExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-4">
			<div className="flex items-start gap-3 mb-4">
				<div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center">
					<span className="text-label-sm text-text-sub-600">PDF</span>
				</div>
				<div className="flex-1">
					<p className="text-label-sm text-text-strong-950">Document.pdf</p>
					<p className="text-paragraph-xs text-text-sub-600">2.4 MB</p>
				</div>
			</div>
			<ProgressBarWithLabel
				value={68}
				label="Uploading..."
				labelPosition="bottom"
				color="primary"
			/>
		</div>
	),
}

// Storage usage example
export const StorageUsageExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-4">
			<h3 className="text-label-md text-text-strong-950 mb-4">Storage</h3>
			<div className="space-y-4">
				<ProgressBarWithLabel
					value={75}
					max={100}
					label="Documents"
					color="blue"
					labelPosition="top"
				/>
				<ProgressBarWithLabel
					value={45}
					max={100}
					label="Images"
					color="green"
					labelPosition="top"
				/>
				<ProgressBarWithLabel
					value={92}
					max={100}
					label="Videos"
					color="red"
					labelPosition="top"
				/>
			</div>
			<div className="mt-4 pt-4 border-t border-stroke-soft-200">
				<div className="flex items-center justify-between text-paragraph-sm">
					<span className="text-text-sub-600">Total used</span>
					<span className="text-text-strong-950 font-medium">24.5 GB of 50 GB</span>
				</div>
			</div>
		</div>
	),
}

// Goal tracking example
export const GoalTrackingExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-label-md text-text-strong-950">Monthly Goal</h3>
				<span className="text-label-sm text-success-base">On track</span>
			</div>
			<ProgressBarWithLabel
				value={8500}
				max={10000}
				label="Revenue target"
				color="green"
				labelPosition="top"
			/>
			<p className="text-paragraph-xs text-text-sub-600 mt-2">
				$8,500 of $10,000 achieved
			</p>
		</div>
	),
}

// Onboarding steps example
export const OnboardingStepsExample: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl p-6">
			<h3 className="text-label-lg text-text-strong-950 mb-2">Complete your profile</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">
				Finish setting up your account to get started
			</p>
			<ProgressBarSteps
				steps={4}
				currentStep={2}
				color="primary"
				labels={["Account", "Profile", "Preferences", "Complete"]}
			/>
		</div>
	),
}

// Multiple values comparison
export const ValueComparison: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-strong-950">0%</span>
				<ProgressBarRoot value={0} color="primary" size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-strong-950">25%</span>
				<ProgressBarRoot value={25} color="primary" size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-strong-950">50%</span>
				<ProgressBarRoot value={50} color="primary" size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-strong-950">75%</span>
				<ProgressBarRoot value={75} color="primary" size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-strong-950">100%</span>
				<ProgressBarRoot value={100} color="primary" size="md" />
			</div>
		</div>
	),
}
