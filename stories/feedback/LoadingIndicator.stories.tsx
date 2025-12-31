import type { Meta, StoryObj } from "@storybook/react"
import { LoadingIndicator } from "@/components/ui/feedback/loading-indicator"

const meta: Meta<typeof LoadingIndicator> = {
	title: "Feedback/LoadingIndicator",
	component: LoadingIndicator,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof LoadingIndicator>

// Simple type (default)
export const Simple: Story = {
	render: () => <LoadingIndicator type="simple" />,
}

// Spinner type
export const Spinner: Story = {
	render: () => <LoadingIndicator type="spinner" />,
}

// Dots type
export const Dots: Story = {
	render: () => <LoadingIndicator type="dots" />,
}

// All types comparison
export const AllTypes: Story = {
	render: () => (
		<div className="flex gap-12">
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator type="simple" />
				<span className="text-paragraph-sm text-text-sub-600">Simple</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator type="spinner" />
				<span className="text-paragraph-sm text-text-sub-600">Spinner</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator type="dots" />
				<span className="text-paragraph-sm text-text-sub-600">Dots</span>
			</div>
		</div>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex gap-12 items-end">
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator size="small" />
				<span className="text-paragraph-sm text-text-sub-600">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator size="medium" />
				<span className="text-paragraph-sm text-text-sub-600">Medium</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator size="large" />
				<span className="text-paragraph-sm text-text-sub-600">Large</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<LoadingIndicator size="xlarge" />
				<span className="text-paragraph-sm text-text-sub-600">X-Large</span>
			</div>
		</div>
	),
}

// With label
export const WithLabel: Story = {
	render: () => (
		<div className="flex gap-12">
			<LoadingIndicator type="simple" label="Loading..." />
			<LoadingIndicator type="spinner" label="Processing..." />
			<LoadingIndicator type="dots" label="Please wait..." />
		</div>
	),
}

// Size with labels
export const SizeWithLabels: Story = {
	render: () => (
		<div className="flex gap-12 items-start">
			<LoadingIndicator size="small" label="Loading" />
			<LoadingIndicator size="medium" label="Loading" />
			<LoadingIndicator size="large" label="Loading" />
			<LoadingIndicator size="xlarge" label="Loading" />
		</div>
	),
}

// Page loading
export const PageLoading: Story = {
	render: () => (
		<div className="flex items-center justify-center w-96 h-64 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<LoadingIndicator size="large" label="Loading page..." />
		</div>
	),
}

// Button loading state
export const ButtonLoading: Story = {
	render: () => (
		<div className="flex gap-4">
			<button
				disabled
				className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-base text-white opacity-75"
			>
				<LoadingIndicator type="spinner" size="small" className="!gap-0" />
				<span>Saving...</span>
			</button>
			<button
				disabled
				className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-white-0 border border-stroke-soft-200 opacity-75"
			>
				<LoadingIndicator type="simple" size="small" className="!gap-0" />
				<span>Loading...</span>
			</button>
		</div>
	),
}

// Card loading
export const CardLoading: Story = {
	render: () => (
		<div className="w-80 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<div className="flex flex-col items-center justify-center gap-4 py-8">
				<LoadingIndicator type="dots" size="large" />
				<div className="text-center">
					<p className="text-label-sm text-text-strong-950">Loading data</p>
					<p className="text-paragraph-sm text-text-sub-600">This may take a moment</p>
				</div>
			</div>
		</div>
	),
}

// Overlay loading
export const OverlayLoading: Story = {
	render: () => (
		<div className="relative w-96 h-64 rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
			{/* Content underneath */}
			<div className="p-6">
				<h3 className="text-heading-sm text-text-strong-950 mb-2">Dashboard</h3>
				<p className="text-paragraph-sm text-text-sub-600">
					This content is loading in the background...
				</p>
			</div>

			{/* Overlay */}
			<div className="absolute inset-0 bg-bg-white-0/80 backdrop-blur-sm flex items-center justify-center">
				<LoadingIndicator size="large" label="Refreshing..." />
			</div>
		</div>
	),
}

// Upload progress simulation
export const UploadProgress: Story = {
	render: () => (
		<div className="w-80 p-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<div className="flex items-center gap-3">
				<LoadingIndicator type="spinner" size="medium" className="!gap-0" />
				<div className="flex-1">
					<p className="text-label-sm text-text-strong-950">Uploading files...</p>
					<p className="text-paragraph-xs text-text-sub-600">3 of 5 files uploaded</p>
				</div>
			</div>
		</div>
	),
}

// Inline loading
export const InlineLoading: Story = {
	render: () => (
		<div className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
			<LoadingIndicator type="spinner" size="small" className="!gap-0" />
			<span>Checking availability...</span>
		</div>
	),
}
