import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Callout, CalloutWithActions, InlineCallout, QuoteCallout } from "@/components/ui/feedback/callout"
import { ButtonRoot } from "@/components/ui/primitives"
import { Rocket, Bell, ShieldCheck } from "@phosphor-icons/react"

const meta: Meta<typeof Callout> = {
	title: "Feedback/Callout",
	component: Callout,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Callout>

// Basic callout
export const Basic: Story = {
	render: () => (
		<div className="w-96">
			<Callout title="Information" variant="info">
				This is an informational callout message with helpful content.
			</Callout>
		</div>
	),
}

// All variants
export const Variants: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<Callout title="Information" variant="info">
				This is an informational message to help guide users.
			</Callout>
			<Callout title="Success" variant="success">
				Your changes have been saved successfully.
			</Callout>
			<Callout title="Warning" variant="warning">
				Please review your changes before proceeding.
			</Callout>
			<Callout title="Error" variant="error">
				An error occurred while processing your request.
			</Callout>
			<Callout title="Neutral" variant="neutral">
				This is a neutral message for general information.
			</Callout>
			<Callout title="Pro Tip" variant="tip">
				Use keyboard shortcuts for faster navigation.
			</Callout>
		</div>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<Callout title="Small Size" variant="info" size="sm">
				This is a small callout with compact padding.
			</Callout>
			<Callout title="Medium Size (Default)" variant="info" size="md">
				This is a medium callout with standard padding.
			</Callout>
			<Callout title="Large Size" variant="info" size="lg">
				This is a large callout with more generous padding.
			</Callout>
		</div>
	),
}

// Dismissible
export const Dismissible: Story = {
	render: function DismissibleCallout() {
		const [show1, setShow1] = useState(true)
		const [show2, setShow2] = useState(true)

		return (
			<div className="w-96 flex flex-col gap-4">
				{show1 && (
					<Callout
						title="Dismissible Callout"
						variant="info"
						dismissible
						onDismiss={() => setShow1(false)}
					>
						Click the X button to dismiss this callout.
					</Callout>
				)}
				{show2 && (
					<Callout
						title="Another Dismissible"
						variant="success"
						dismissible
						onDismiss={() => setShow2(false)}
					>
						This one can also be dismissed.
					</Callout>
				)}
				{!show1 && !show2 && (
					<ButtonRoot
						variant="basic"
						onClick={() => {
							setShow1(true)
							setShow2(true)
						}}
					>
						Reset Callouts
					</ButtonRoot>
				)}
			</div>
		)
	},
}

// Custom icon
export const CustomIcon: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<Callout
				title="New Feature"
				variant="tip"
				icon={<Rocket className="size-5" weight="duotone" />}
			>
				Check out our latest feature that just launched!
			</Callout>
			<Callout
				title="Notifications"
				variant="info"
				icon={<Bell className="size-5" weight="duotone" />}
			>
				You have 5 unread notifications.
			</Callout>
			<Callout
				title="Security Update"
				variant="warning"
				icon={<ShieldCheck className="size-5" weight="duotone" />}
			>
				Please update your password for better security.
			</Callout>
		</div>
	),
}

// Without icon
export const WithoutIcon: Story = {
	render: () => (
		<div className="w-96">
			<Callout title="No Icon" variant="neutral" showIcon={false}>
				This callout displays without an icon for a cleaner look.
			</Callout>
		</div>
	),
}

// Title only
export const TitleOnly: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<Callout title="Quick tip: Press Ctrl+S to save" variant="tip" />
			<Callout title="Your session will expire in 5 minutes" variant="warning" />
			<Callout title="All systems operational" variant="success" />
		</div>
	),
}

// With actions
export const WithActions: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<CalloutWithActions
				title="New Update Available"
				variant="info"
				actions={
					<>
						<ButtonRoot variant="basic" size="small">
							Later
						</ButtonRoot>
						<ButtonRoot variant="primary" size="small">
							Update Now
						</ButtonRoot>
					</>
				}
			>
				A new version is available. Update now to get the latest features.
			</CalloutWithActions>
			<CalloutWithActions
				title="Delete Confirmation"
				variant="error"
				actions={
					<>
						<ButtonRoot variant="basic" size="small">
							Cancel
						</ButtonRoot>
						<ButtonRoot variant="error" size="small">
							Delete
						</ButtonRoot>
					</>
				}
			>
				Are you sure you want to delete this item? This action cannot be undone.
			</CalloutWithActions>
		</div>
	),
}

// Inline callout
export const InlineCallouts: Story = {
	render: () => (
		<div className="flex flex-col gap-4 items-start">
			<InlineCallout variant="info">Inline info message</InlineCallout>
			<InlineCallout variant="success">Inline success message</InlineCallout>
			<InlineCallout variant="warning">Inline warning message</InlineCallout>
			<InlineCallout variant="error">Inline error message</InlineCallout>
			<InlineCallout variant="tip">Inline tip message</InlineCallout>
		</div>
	),
}

// Quote callout
export const QuoteCallouts: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<QuoteCallout>
				The only way to do great work is to love what you do.
			</QuoteCallout>
			<QuoteCallout author="Steve Jobs">
				The only way to do great work is to love what you do.
			</QuoteCallout>
			<QuoteCallout author="Albert Einstein">
				Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the
				world.
			</QuoteCallout>
		</div>
	),
}

// Form context example
export const FormContext: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-4">
			<Callout title="Account Settings" variant="neutral">
				Changes to your account settings will take effect immediately.
			</Callout>
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Email</label>
				<input
					type="email"
					placeholder="john@example.com"
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Password</label>
				<input
					type="password"
					placeholder="Enter password"
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</div>
			<Callout title="Important" variant="warning" size="sm">
				Changing your email will require re-verification.
			</Callout>
		</div>
	),
}
