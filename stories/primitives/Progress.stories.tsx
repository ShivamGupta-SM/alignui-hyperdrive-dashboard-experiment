import type { Meta, StoryObj } from "@storybook/react"
import { Root as ProgressRoot, WithLabel as ProgressWithLabel, Steps as ProgressSteps } from "@/components/ui/primitives/progress-bar"

const meta: Meta<typeof ProgressRoot> = {
	title: "Primitives/Progress",
	component: ProgressRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ProgressRoot>

// Basic progress
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<ProgressRoot value={60} />
		</div>
	),
}

// Different values
export const Values: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">0%</span>
				<ProgressRoot value={0} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">25%</span>
				<ProgressRoot value={25} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">50%</span>
				<ProgressRoot value={50} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">75%</span>
				<ProgressRoot value={75} />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">100%</span>
				<ProgressRoot value={100} />
			</div>
		</div>
	),
}

// Colors
export const Colors: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Primary</span>
				<ProgressRoot value={60} color="primary" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Blue</span>
				<ProgressRoot value={60} color="blue" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Green</span>
				<ProgressRoot value={60} color="green" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Orange</span>
				<ProgressRoot value={60} color="orange" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Red</span>
				<ProgressRoot value={60} color="red" />
			</div>
		</div>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Extra Small</span>
				<ProgressRoot value={60} size="xs" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Small</span>
				<ProgressRoot value={60} size="sm" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Medium</span>
				<ProgressRoot value={60} size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-text-sub-600">Large</span>
				<ProgressRoot value={60} size="lg" />
			</div>
		</div>
	),
}

// Indeterminate
export const Indeterminate: Story = {
	render: () => (
		<div className="w-80">
			<ProgressRoot isIndeterminate color="primary" />
		</div>
	),
}

// With label
export const WithLabel: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<ProgressWithLabel value={65} label="Uploading..." labelPosition="top" />
			<ProgressWithLabel value={45} label="Processing" labelPosition="bottom" />
			<ProgressWithLabel value={80} labelPosition="inline" />
		</div>
	),
}

// Steps progress
export const StepsProgress: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<ProgressSteps steps={4} currentStep={1} />
			<ProgressSteps steps={4} currentStep={2} />
			<ProgressSteps steps={4} currentStep={3} />
			<ProgressSteps steps={4} currentStep={4} />
		</div>
	),
}

// Steps with labels
export const StepsWithLabels: Story = {
	render: () => (
		<div className="w-96">
			<ProgressSteps
				steps={4}
				currentStep={2}
				labels={["Details", "Payment", "Review", "Complete"]}
				color="primary"
			/>
		</div>
	),
}

// Usage examples
export const UsageExamples: Story = {
	render: () => (
		<div className="w-96 p-6 bg-bg-white-0 rounded-xl shadow-regular-md flex flex-col gap-6">
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-3">File Upload</h3>
				<ProgressWithLabel value={72} label="document.pdf" color="blue" />
			</div>
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-3">Storage Used</h3>
				<ProgressWithLabel value={85} label="8.5 GB of 10 GB" color="orange" />
			</div>
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-3">Checkout Progress</h3>
				<ProgressSteps
					steps={3}
					currentStep={2}
					labels={["Cart", "Shipping", "Payment"]}
					color="green"
				/>
			</div>
		</div>
	),
}
