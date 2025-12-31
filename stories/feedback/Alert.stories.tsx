import type { Meta, StoryObj } from "@storybook/react"
import { Root as AlertRoot, Icon as AlertIcon, DismissibleAlert, AlertWithAction } from "@/components/ui/feedback/alert"
import { WarningCircle, CheckCircle, Info, Warning, MagicWand } from "@phosphor-icons/react"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof AlertRoot> = {
	title: "Feedback/Alert",
	component: AlertRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AlertRoot>

// Status variants with filled
export const StatusFilled: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertRoot status="success" variant="filled">
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>Your changes have been saved successfully.</span>
			</AlertRoot>
			<AlertRoot status="error" variant="filled">
				<AlertIcon as={WarningCircle} weight="fill" />
				<span>An error occurred while processing your request.</span>
			</AlertRoot>
			<AlertRoot status="warning" variant="filled">
				<AlertIcon as={Warning} weight="fill" />
				<span>Your session will expire in 5 minutes.</span>
			</AlertRoot>
			<AlertRoot status="information" variant="filled">
				<AlertIcon as={Info} weight="fill" />
				<span>New features are available in the latest update.</span>
			</AlertRoot>
			<AlertRoot status="feature" variant="filled">
				<AlertIcon as={MagicWand} weight="fill" />
				<span>Try our new AI-powered assistant!</span>
			</AlertRoot>
		</div>
	),
}

// Light variant
export const StatusLight: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertRoot status="success" variant="light">
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>Your changes have been saved successfully.</span>
			</AlertRoot>
			<AlertRoot status="error" variant="light">
				<AlertIcon as={WarningCircle} weight="fill" />
				<span>An error occurred while processing your request.</span>
			</AlertRoot>
			<AlertRoot status="warning" variant="light">
				<AlertIcon as={Warning} weight="fill" />
				<span>Your session will expire in 5 minutes.</span>
			</AlertRoot>
			<AlertRoot status="information" variant="light">
				<AlertIcon as={Info} weight="fill" />
				<span>New features are available in the latest update.</span>
			</AlertRoot>
		</div>
	),
}

// Lighter variant
export const StatusLighter: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertRoot status="success" variant="lighter">
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>Your changes have been saved successfully.</span>
			</AlertRoot>
			<AlertRoot status="error" variant="lighter">
				<AlertIcon as={WarningCircle} weight="fill" />
				<span>An error occurred while processing your request.</span>
			</AlertRoot>
			<AlertRoot status="warning" variant="lighter">
				<AlertIcon as={Warning} weight="fill" />
				<span>Your session will expire in 5 minutes.</span>
			</AlertRoot>
			<AlertRoot status="information" variant="lighter">
				<AlertIcon as={Info} weight="fill" />
				<span>New features are available in the latest update.</span>
			</AlertRoot>
		</div>
	),
}

// Stroke variant
export const Stroke: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertRoot status="success" variant="stroke">
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>Your changes have been saved successfully.</span>
			</AlertRoot>
			<AlertRoot status="error" variant="stroke">
				<AlertIcon as={WarningCircle} weight="fill" />
				<span>An error occurred while processing your request.</span>
			</AlertRoot>
			<AlertRoot status="warning" variant="stroke">
				<AlertIcon as={Warning} weight="fill" />
				<span>Your session will expire in 5 minutes.</span>
			</AlertRoot>
		</div>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertRoot status="information" variant="lighter" size="xsmall">
				<AlertIcon as={Info} weight="fill" />
				<span>Extra small alert</span>
			</AlertRoot>
			<AlertRoot status="information" variant="lighter" size="small">
				<AlertIcon as={Info} weight="fill" />
				<span>Small alert (default)</span>
			</AlertRoot>
			<AlertRoot status="information" variant="lighter" size="large">
				<AlertIcon as={Info} weight="fill" />
				<span>Large alert with more content space</span>
			</AlertRoot>
		</div>
	),
}

// Dismissible alert
export const Dismissible: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<DismissibleAlert status="success" variant="lighter" size="large">
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>This alert can be dismissed by clicking the close button.</span>
			</DismissibleAlert>
			<DismissibleAlert status="warning" variant="lighter" size="large">
				<AlertIcon as={Warning} weight="fill" />
				<span>Click the X to dismiss this alert.</span>
			</DismissibleAlert>
		</div>
	),
}

// Auto-dismiss alert
export const AutoDismiss: Story = {
	render: () => (
		<div className="w-96">
			<DismissibleAlert
				status="success"
				variant="lighter"
				size="large"
				autoDismiss={5000}
			>
				<AlertIcon as={CheckCircle} weight="fill" />
				<span>This alert will auto-dismiss in 5 seconds.</span>
			</DismissibleAlert>
		</div>
	),
}

// Alert with action
export const WithAction: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-3">
			<AlertWithAction
				status="error"
				variant="lighter"
				size="large"
				action={
					<ButtonRoot variant="error" size="xsmall">
						Retry
					</ButtonRoot>
				}
			>
				<AlertIcon as={WarningCircle} weight="fill" />
				<span>Failed to upload file. Please try again.</span>
			</AlertWithAction>
			<AlertWithAction
				status="information"
				variant="lighter"
				size="large"
				action={
					<ButtonRoot variant="primary" size="xsmall">
						Learn more
					</ButtonRoot>
				}
			>
				<AlertIcon as={Info} weight="fill" />
				<span>New features are available in this update.</span>
			</AlertWithAction>
		</div>
	),
}

// Real-world examples
export const RealWorldExamples: Story = {
	render: () => (
		<div className="w-[450px] p-6 bg-bg-white-0 rounded-xl shadow-regular-md flex flex-col gap-4">
			<h3 className="text-heading-sm text-text-strong-950">Notifications</h3>
			<DismissibleAlert status="success" variant="lighter" size="large">
				<AlertIcon as={CheckCircle} weight="fill" />
				<div className="flex flex-col">
					<span className="text-label-sm">Payment Successful</span>
					<span className="text-paragraph-xs text-text-sub-600">
						Your payment of $99.00 has been processed.
					</span>
				</div>
			</DismissibleAlert>
			<DismissibleAlert status="warning" variant="lighter" size="large">
				<AlertIcon as={Warning} weight="fill" />
				<div className="flex flex-col">
					<span className="text-label-sm">Subscription Expiring</span>
					<span className="text-paragraph-xs text-text-sub-600">
						Your subscription expires in 3 days.
					</span>
				</div>
			</DismissibleAlert>
			<DismissibleAlert status="error" variant="lighter" size="large">
				<AlertIcon as={WarningCircle} weight="fill" />
				<div className="flex flex-col">
					<span className="text-label-sm">Action Required</span>
					<span className="text-paragraph-xs text-text-sub-600">
						Please verify your email address.
					</span>
				</div>
			</DismissibleAlert>
		</div>
	),
}
