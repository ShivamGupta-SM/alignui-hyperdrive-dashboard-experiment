import type { Meta, StoryObj } from "@storybook/react"
import { Root as LinkButtonRoot, Icon as LinkButtonIcon } from "@/components/ui/primitives/link-button"
import {
	ArrowRight,
	ArrowUpRight,
	Download,
	Eye,
	CaretRight,
	Info,
	Question,
	ArrowLeft,
} from "@phosphor-icons/react"

const meta: Meta<typeof LinkButtonRoot> = {
	title: "Primitives/LinkButton",
	component: LinkButtonRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["gray", "black", "primary", "error"],
		},
		size: {
			control: "select",
			options: ["medium", "small"],
		},
		underline: {
			control: "boolean",
		},
		disabled: {
			control: "boolean",
		},
	},
}

export default meta
type Story = StoryObj<typeof LinkButtonRoot>

// Basic link button
export const Basic: Story = {
	render: () => <LinkButtonRoot>Learn more</LinkButtonRoot>,
}

// All variants
export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<LinkButtonRoot variant="gray">Gray link</LinkButtonRoot>
			<LinkButtonRoot variant="black">Black link</LinkButtonRoot>
			<LinkButtonRoot variant="primary">Primary link</LinkButtonRoot>
			<LinkButtonRoot variant="error">Error link</LinkButtonRoot>
		</div>
	),
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Medium (default)</span>
				<div className="flex items-center gap-6">
					<LinkButtonRoot size="medium" variant="gray">Medium link</LinkButtonRoot>
					<LinkButtonRoot size="medium" variant="primary">Medium link</LinkButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Small</span>
				<div className="flex items-center gap-6">
					<LinkButtonRoot size="small" variant="gray">Small link</LinkButtonRoot>
					<LinkButtonRoot size="small" variant="primary">Small link</LinkButtonRoot>
				</div>
			</div>
		</div>
	),
}

// With trailing icon
export const WithTrailingIcon: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<LinkButtonRoot variant="primary">
				Learn more
				<LinkButtonIcon as={ArrowRight} />
			</LinkButtonRoot>
			<LinkButtonRoot variant="gray">
				View details
				<LinkButtonIcon as={CaretRight} />
			</LinkButtonRoot>
			<LinkButtonRoot variant="black">
				Open link
				<LinkButtonIcon as={ArrowUpRight} />
			</LinkButtonRoot>
		</div>
	),
}

// With leading icon
export const WithLeadingIcon: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<LinkButtonRoot variant="gray">
				<LinkButtonIcon as={ArrowLeft} />
				Go back
			</LinkButtonRoot>
			<LinkButtonRoot variant="primary">
				<LinkButtonIcon as={Download} />
				Download
			</LinkButtonRoot>
			<LinkButtonRoot variant="gray">
				<LinkButtonIcon as={Eye} />
				Preview
			</LinkButtonRoot>
		</div>
	),
}

// Always underlined
export const AlwaysUnderlined: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<LinkButtonRoot variant="gray" underline>Gray underlined</LinkButtonRoot>
			<LinkButtonRoot variant="black" underline>Black underlined</LinkButtonRoot>
			<LinkButtonRoot variant="primary" underline>Primary underlined</LinkButtonRoot>
			<LinkButtonRoot variant="error" underline>Error underlined</LinkButtonRoot>
		</div>
	),
}

// Disabled state
export const Disabled: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<LinkButtonRoot disabled>Disabled gray</LinkButtonRoot>
			<LinkButtonRoot variant="primary" disabled>
				Disabled primary
				<LinkButtonIcon as={ArrowRight} />
			</LinkButtonRoot>
		</div>
	),
}

// In paragraph context
export const InParagraph: Story = {
	render: () => (
		<div className="max-w-md">
			<p className="text-paragraph-sm text-text-sub-600">
				By signing up, you agree to our{" "}
				<LinkButtonRoot variant="primary" underline>
					Terms of Service
				</LinkButtonRoot>{" "}
				and{" "}
				<LinkButtonRoot variant="primary" underline>
					Privacy Policy
				</LinkButtonRoot>
				. If you have questions, please visit our{" "}
				<LinkButtonRoot variant="primary">
					Help Center
					<LinkButtonIcon as={ArrowUpRight} />
				</LinkButtonRoot>
				.
			</p>
		</div>
	),
}

// Navigation links
export const NavigationLinks: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<LinkButtonRoot variant="gray">
				<LinkButtonIcon as={Info} />
				About us
			</LinkButtonRoot>
			<LinkButtonRoot variant="gray">
				<LinkButtonIcon as={Question} />
				FAQ
			</LinkButtonRoot>
			<LinkButtonRoot variant="gray">
				Contact
				<LinkButtonIcon as={ArrowRight} />
			</LinkButtonRoot>
		</div>
	),
}

// Card footer actions
export const CardFooterActions: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4">
				<h3 className="text-label-md text-text-strong-950 mb-2">Premium Plan</h3>
				<p className="text-paragraph-sm text-text-sub-600">
					Get access to all features with our premium subscription.
				</p>
			</div>
			<div className="flex items-center justify-between px-4 py-3 border-t border-stroke-soft-200 bg-bg-weak-50">
				<LinkButtonRoot variant="gray" size="small">
					Compare plans
				</LinkButtonRoot>
				<LinkButtonRoot variant="primary" size="small">
					Learn more
					<LinkButtonIcon as={ArrowRight} />
				</LinkButtonRoot>
			</div>
		</div>
	),
}

// Inline help links
export const InlineHelpLinks: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Email address</label>
				<input
					type="email"
					placeholder="you@example.com"
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
				<div className="flex items-center justify-between">
					<span className="text-paragraph-xs text-text-sub-600">We'll never share your email.</span>
					<LinkButtonRoot variant="gray" size="small">
						Why?
					</LinkButtonRoot>
				</div>
			</div>
		</div>
	),
}

// Breadcrumb-style links
export const BreadcrumbLinks: Story = {
	render: () => (
		<div className="flex items-center gap-2 text-paragraph-sm">
			<LinkButtonRoot variant="gray" size="small">Home</LinkButtonRoot>
			<span className="text-text-soft-400">/</span>
			<LinkButtonRoot variant="gray" size="small">Products</LinkButtonRoot>
			<span className="text-text-soft-400">/</span>
			<span className="text-text-strong-950">Electronics</span>
		</div>
	),
}

// Error context links
export const ErrorContextLinks: Story = {
	render: () => (
		<div className="p-4 bg-error-lighter border border-error-base rounded-lg">
			<p className="text-paragraph-sm text-error-base">
				Your payment failed.{" "}
				<LinkButtonRoot variant="error" underline>
					Update payment method
				</LinkButtonRoot>{" "}
				or{" "}
				<LinkButtonRoot variant="error" underline>
					contact support
				</LinkButtonRoot>
				.
			</p>
		</div>
	),
}

// All states comparison
export const AllStatesComparison: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-8">
			<div className="flex flex-col gap-4">
				<span className="text-label-sm text-text-sub-600 border-b pb-2">Normal</span>
				<LinkButtonRoot variant="gray">Gray link</LinkButtonRoot>
				<LinkButtonRoot variant="black">Black link</LinkButtonRoot>
				<LinkButtonRoot variant="primary">Primary link</LinkButtonRoot>
				<LinkButtonRoot variant="error">Error link</LinkButtonRoot>
			</div>
			<div className="flex flex-col gap-4">
				<span className="text-label-sm text-text-sub-600 border-b pb-2">Disabled</span>
				<LinkButtonRoot variant="gray" disabled>Gray link</LinkButtonRoot>
				<LinkButtonRoot variant="black" disabled>Black link</LinkButtonRoot>
				<LinkButtonRoot variant="primary" disabled>Primary link</LinkButtonRoot>
				<LinkButtonRoot variant="error" disabled>Error link</LinkButtonRoot>
			</div>
		</div>
	),
}
