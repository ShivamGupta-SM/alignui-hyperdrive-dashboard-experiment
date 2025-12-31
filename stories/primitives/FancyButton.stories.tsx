import type { Meta, StoryObj } from "@storybook/react"
import { Root as FancyButtonRoot, Icon as FancyButtonIcon } from "@/components/ui/primitives/fancy-button"
import {
	Plus,
	ArrowRight,
	Download,
	Trash,
	Heart,
	Star,
	ShoppingCart,
	Lightning,
	Rocket,
	Play,
	Check,
	Upload,
	Share,
	PaperPlaneTilt,
} from "@phosphor-icons/react"

const meta: Meta<typeof FancyButtonRoot> = {
	title: "Primitives/FancyButton",
	component: FancyButtonRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["neutral", "primary", "destructive", "basic"],
		},
		size: {
			control: "select",
			options: ["medium", "small", "xsmall"],
		},
		disabled: {
			control: "boolean",
		},
	},
}

export default meta
type Story = StoryObj<typeof FancyButtonRoot>

// Basic fancy button
export const Basic: Story = {
	render: () => (
		<FancyButtonRoot>
			Click me
		</FancyButtonRoot>
	),
}

// All variants
export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FancyButtonRoot variant="neutral">Neutral</FancyButtonRoot>
			<FancyButtonRoot variant="primary">Primary</FancyButtonRoot>
			<FancyButtonRoot variant="destructive">Destructive</FancyButtonRoot>
			<FancyButtonRoot variant="basic">Basic</FancyButtonRoot>
		</div>
	),
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Medium (default)</span>
				<div className="flex items-center gap-4">
					<FancyButtonRoot size="medium">Medium</FancyButtonRoot>
					<FancyButtonRoot size="medium" variant="primary">Medium</FancyButtonRoot>
					<FancyButtonRoot size="medium" variant="destructive">Medium</FancyButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Small</span>
				<div className="flex items-center gap-4">
					<FancyButtonRoot size="small">Small</FancyButtonRoot>
					<FancyButtonRoot size="small" variant="primary">Small</FancyButtonRoot>
					<FancyButtonRoot size="small" variant="destructive">Small</FancyButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">XSmall</span>
				<div className="flex items-center gap-4">
					<FancyButtonRoot size="xsmall">XSmall</FancyButtonRoot>
					<FancyButtonRoot size="xsmall" variant="primary">XSmall</FancyButtonRoot>
					<FancyButtonRoot size="xsmall" variant="destructive">XSmall</FancyButtonRoot>
				</div>
			</div>
		</div>
	),
}

// With leading icon
export const WithLeadingIcon: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FancyButtonRoot variant="neutral">
				<FancyButtonIcon as={Plus} />
				Create
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary">
				<FancyButtonIcon as={Download} />
				Download
			</FancyButtonRoot>
			<FancyButtonRoot variant="destructive">
				<FancyButtonIcon as={Trash} />
				Delete
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic">
				<FancyButtonIcon as={Heart} />
				Like
			</FancyButtonRoot>
		</div>
	),
}

// With trailing icon
export const WithTrailingIcon: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FancyButtonRoot variant="neutral">
				Continue
				<FancyButtonIcon as={ArrowRight} />
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary">
				Get Started
				<FancyButtonIcon as={Rocket} />
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic">
				Learn More
				<FancyButtonIcon as={ArrowRight} />
			</FancyButtonRoot>
		</div>
	),
}

// Disabled state
export const Disabled: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FancyButtonRoot variant="neutral" disabled>
				<FancyButtonIcon as={Plus} />
				Neutral Disabled
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary" disabled>
				<FancyButtonIcon as={Plus} />
				Primary Disabled
			</FancyButtonRoot>
			<FancyButtonRoot variant="destructive" disabled>
				<FancyButtonIcon as={Trash} />
				Destructive Disabled
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic" disabled>
				<FancyButtonIcon as={Plus} />
				Basic Disabled
			</FancyButtonRoot>
		</div>
	),
}

// Icon only buttons
export const IconOnly: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FancyButtonRoot variant="neutral" aria-label="Add">
				<FancyButtonIcon as={Plus} />
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary" aria-label="Play">
				<FancyButtonIcon as={Play} />
			</FancyButtonRoot>
			<FancyButtonRoot variant="destructive" aria-label="Delete">
				<FancyButtonIcon as={Trash} />
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic" aria-label="Star">
				<FancyButtonIcon as={Star} />
			</FancyButtonRoot>
		</div>
	),
}

// E-commerce examples
export const EcommerceButtons: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<FancyButtonRoot variant="primary" className="w-full">
				<FancyButtonIcon as={ShoppingCart} />
				Add to Cart
			</FancyButtonRoot>
			<FancyButtonRoot variant="neutral" className="w-full">
				Buy Now
				<FancyButtonIcon as={Lightning} />
			</FancyButtonRoot>
			<div className="flex gap-4">
				<FancyButtonRoot variant="basic" className="flex-1">
					<FancyButtonIcon as={Heart} />
					Wishlist
				</FancyButtonRoot>
				<FancyButtonRoot variant="basic" className="flex-1">
					<FancyButtonIcon as={Share} />
					Share
				</FancyButtonRoot>
			</div>
		</div>
	),
}

// Call to action examples
export const CallToAction: Story = {
	render: () => (
		<div className="flex flex-col items-center gap-6 p-8 rounded-xl bg-bg-weak-50">
			<div className="text-center">
				<h3 className="text-heading-sm text-text-strong-950 mb-2">Ready to get started?</h3>
				<p className="text-paragraph-sm text-text-sub-600">
					Join thousands of users already using our platform.
				</p>
			</div>
			<div className="flex gap-4">
				<FancyButtonRoot variant="primary" size="medium">
					<FancyButtonIcon as={Rocket} />
					Start Free Trial
				</FancyButtonRoot>
				<FancyButtonRoot variant="basic" size="medium">
					Learn More
					<FancyButtonIcon as={ArrowRight} />
				</FancyButtonRoot>
			</div>
		</div>
	),
}

// Upload example
export const UploadButton: Story = {
	render: () => (
		<div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-stroke-soft-200 rounded-xl">
			<div className="text-center">
				<p className="text-label-sm text-text-strong-950 mb-1">Upload your file</p>
				<p className="text-paragraph-xs text-text-sub-600">PNG, JPG up to 10MB</p>
			</div>
			<FancyButtonRoot variant="neutral">
				<FancyButtonIcon as={Upload} />
				Choose File
			</FancyButtonRoot>
		</div>
	),
}

// Form actions
export const FormActions: Story = {
	render: () => (
		<div className="flex flex-col gap-6 w-80">
			<div className="space-y-4">
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-strong-950">Email</label>
					<input
						type="email"
						placeholder="you@example.com"
						className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-strong-950">Message</label>
					<textarea
						placeholder="Your message..."
						rows={3}
						className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm resize-none"
					/>
				</div>
			</div>
			<div className="flex gap-3">
				<FancyButtonRoot variant="basic" className="flex-1">Cancel</FancyButtonRoot>
				<FancyButtonRoot variant="primary" className="flex-1">
					<FancyButtonIcon as={PaperPlaneTilt} />
					Send
				</FancyButtonRoot>
			</div>
		</div>
	),
}

// Success and error states
export const StateButtons: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Action buttons</span>
				<div className="flex gap-4">
					<FancyButtonRoot variant="primary">
						<FancyButtonIcon as={Check} />
						Confirm
					</FancyButtonRoot>
					<FancyButtonRoot variant="destructive">
						<FancyButtonIcon as={Trash} />
						Delete
					</FancyButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Secondary actions</span>
				<div className="flex gap-4">
					<FancyButtonRoot variant="basic">Cancel</FancyButtonRoot>
					<FancyButtonRoot variant="neutral">Save Draft</FancyButtonRoot>
				</div>
			</div>
		</div>
	),
}

// Size comparison with icons
export const SizeComparisonWithIcons: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex items-end gap-4">
				<FancyButtonRoot size="xsmall" variant="primary">
					<FancyButtonIcon as={Plus} />
					XSmall
				</FancyButtonRoot>
				<FancyButtonRoot size="small" variant="primary">
					<FancyButtonIcon as={Plus} />
					Small
				</FancyButtonRoot>
				<FancyButtonRoot size="medium" variant="primary">
					<FancyButtonIcon as={Plus} />
					Medium
				</FancyButtonRoot>
			</div>
		</div>
	),
}

// All variants grid
export const AllVariantsGrid: Story = {
	render: () => (
		<div className="grid grid-cols-4 gap-4">
			<div className="col-span-4 text-label-sm text-text-sub-600 border-b pb-2">Enabled States</div>
			<FancyButtonRoot variant="neutral">
				<FancyButtonIcon as={Plus} />
				Neutral
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary">
				<FancyButtonIcon as={Plus} />
				Primary
			</FancyButtonRoot>
			<FancyButtonRoot variant="destructive">
				<FancyButtonIcon as={Trash} />
				Destructive
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic">
				<FancyButtonIcon as={Plus} />
				Basic
			</FancyButtonRoot>

			<div className="col-span-4 text-label-sm text-text-sub-600 border-b pb-2 mt-4">Disabled States</div>
			<FancyButtonRoot variant="neutral" disabled>
				<FancyButtonIcon as={Plus} />
				Neutral
			</FancyButtonRoot>
			<FancyButtonRoot variant="primary" disabled>
				<FancyButtonIcon as={Plus} />
				Primary
			</FancyButtonRoot>
			<FancyButtonRoot variant="destructive" disabled>
				<FancyButtonIcon as={Trash} />
				Destructive
			</FancyButtonRoot>
			<FancyButtonRoot variant="basic" disabled>
				<FancyButtonIcon as={Plus} />
				Basic
			</FancyButtonRoot>
		</div>
	),
}
