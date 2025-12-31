import type { Meta, StoryObj } from "@storybook/react"
import { BackButton, InlineBackButton } from "@/components/ui/navigation/back-button"

const meta: Meta<typeof BackButton> = {
	title: "Navigation/BackButton",
	component: BackButton,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xsmall", "small", "medium"],
		},
	},
}

export default meta
type Story = StoryObj<typeof BackButton>

// Basic back button
export const Basic: Story = {
	render: () => (
		<BackButton onClick={() => alert("Back clicked")} />
	),
}

// With custom label
export const WithLabel: Story = {
	render: () => (
		<BackButton label="Go Back" onClick={() => alert("Back clicked")} />
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">XSmall</span>
				<BackButton size="xsmall" onClick={() => {}} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Small</span>
				<BackButton size="small" onClick={() => {}} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Medium</span>
				<BackButton size="medium" onClick={() => {}} />
			</div>
		</div>
	),
}

// All sizes with labels
export const AllSizesWithLabels: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">XSmall</span>
				<BackButton size="xsmall" label="Back" onClick={() => {}} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Small</span>
				<BackButton size="small" label="Back" onClick={() => {}} />
			</div>
			<div className="flex items-center gap-4">
				<span className="w-16 text-paragraph-sm text-text-sub-600">Medium</span>
				<BackButton size="medium" label="Back" onClick={() => {}} />
			</div>
		</div>
	),
}

// Icon only on mobile
export const IconOnlyOnMobile: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<p className="text-paragraph-sm text-text-sub-600">
				Resize your browser to see the label hide on smaller screens
			</p>
			<BackButton label="Back to Dashboard" iconOnlyOnMobile onClick={() => {}} />
		</div>
	),
}

// With href
export const WithHref: Story = {
	render: () => (
		<BackButton label="Back to Home" href="/" />
	),
}

// Inline back button
export const InlineBasic: Story = {
	render: () => (
		<InlineBackButton onClick={() => alert("Back clicked")} />
	),
}

// Inline with label
export const InlineWithLabel: Story = {
	render: () => (
		<InlineBackButton label="Previous" onClick={() => alert("Back clicked")} />
	),
}

// Inline variant
export const InlineVariant: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<InlineBackButton onClick={() => {}} />
			<InlineBackButton label="Go Back" onClick={() => {}} />
		</div>
	),
}

// Page header example
export const PageHeaderExample: Story = {
	render: () => (
		<div className="w-[600px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<BackButton label="Back to Projects" onClick={() => {}} />
			</div>
			<div className="p-6">
				<h1 className="text-heading-lg text-text-strong-950 mb-2">Project Details</h1>
				<p className="text-paragraph-sm text-text-sub-600">
					View and manage your project settings, team members, and more.
				</p>
			</div>
		</div>
	),
}

// Breadcrumb style example
export const BreadcrumbStyleExample: Story = {
	render: () => (
		<div className="w-[600px]">
			<div className="flex items-center gap-2 mb-4">
				<InlineBackButton label="Dashboard" onClick={() => {}} />
				<span className="text-text-soft-400">/</span>
				<InlineBackButton label="Settings" onClick={() => {}} />
				<span className="text-text-soft-400">/</span>
				<span className="text-paragraph-sm text-text-strong-950">Profile</span>
			</div>
			<div className="p-6 border border-stroke-soft-200 rounded-xl">
				<h1 className="text-heading-lg text-text-strong-950">Profile Settings</h1>
			</div>
		</div>
	),
}

// Modal header example
export const ModalHeaderExample: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden shadow-lg">
			<div className="p-4 border-b border-stroke-soft-200 flex items-center justify-between">
				<BackButton size="small" onClick={() => {}} />
				<h3 className="text-label-md text-text-strong-950">Edit Profile</h3>
				<div className="w-8" /> {/* Spacer for centering */}
			</div>
			<div className="p-4">
				<p className="text-paragraph-sm text-text-sub-600">
					Make changes to your profile information here.
				</p>
			</div>
		</div>
	),
}

// Wizard navigation example
export const WizardNavigationExample: Story = {
	render: () => (
		<div className="w-[500px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<div className="flex items-center justify-between mb-2">
					<BackButton size="small" label="Previous Step" onClick={() => {}} />
					<span className="text-paragraph-sm text-text-sub-600">Step 2 of 4</span>
				</div>
				<div className="w-full bg-bg-soft-200 rounded-full h-1">
					<div className="bg-primary-base h-1 rounded-full w-1/2" />
				</div>
			</div>
			<div className="p-6">
				<h2 className="text-heading-md text-text-strong-950 mb-2">Contact Information</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Please provide your contact details.
				</p>
			</div>
		</div>
	),
}

// Mobile app header example
export const MobileAppHeaderExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-3 bg-primary-base flex items-center gap-3">
				<BackButton size="small" onClick={() => {}} />
				<h3 className="text-label-md text-white flex-1">Messages</h3>
			</div>
			<div className="p-4 h-64 bg-bg-weak-50">
				<p className="text-paragraph-sm text-text-sub-600 text-center">
					Chat content goes here
				</p>
			</div>
		</div>
	),
}

// Nested navigation example
export const NestedNavigationExample: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h3 className="text-label-md text-text-strong-950">Settings</h3>
			</div>
			<div className="divide-y divide-stroke-soft-200">
				<div className="p-4">
					<BackButton label="Account Settings" size="small" onClick={() => {}} />
				</div>
				<div className="p-4">
					<BackButton label="Privacy Settings" size="small" onClick={() => {}} />
				</div>
				<div className="p-4">
					<BackButton label="Notification Settings" size="small" onClick={() => {}} />
				</div>
			</div>
		</div>
	),
}

// E-commerce checkout example
export const CheckoutExample: Story = {
	render: () => (
		<div className="w-[500px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 border-b border-stroke-soft-200 flex items-center gap-4">
				<BackButton onClick={() => {}} />
				<div>
					<h2 className="text-label-md text-text-strong-950">Checkout</h2>
					<p className="text-paragraph-xs text-text-sub-600">Complete your purchase</p>
				</div>
			</div>
			<div className="p-6">
				<div className="flex items-center gap-4 mb-4">
					<div className="size-16 bg-bg-weak-50 rounded-lg" />
					<div>
						<p className="text-label-sm text-text-strong-950">Premium Headphones</p>
						<p className="text-paragraph-sm text-text-sub-600">Qty: 1</p>
					</div>
					<span className="text-label-md text-text-strong-950 ml-auto">$299</span>
				</div>
			</div>
		</div>
	),
}

// Comparison
export const Comparison: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-4">BackButton (Button Style)</h3>
				<div className="flex gap-4">
					<BackButton size="small" onClick={() => {}} />
					<BackButton size="medium" onClick={() => {}} />
					<BackButton size="medium" onClick={() => {}} />
				</div>
			</div>
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-4">InlineBackButton (Link Style)</h3>
				<div className="flex gap-4">
					<InlineBackButton onClick={() => {}} />
					<InlineBackButton label="Back" onClick={() => {}} />
					<InlineBackButton label="Previous" onClick={() => {}} />
				</div>
			</div>
			<div>
				<h3 className="text-label-md text-text-strong-950 mb-4">With Labels</h3>
				<div className="flex gap-4">
					<BackButton label="Back" onClick={() => {}} />
					<InlineBackButton label="Previous" onClick={() => {}} />
				</div>
			</div>
		</div>
	),
}
