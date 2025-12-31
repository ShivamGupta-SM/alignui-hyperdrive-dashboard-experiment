import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as PinInputRoot,
	Group as PinInputGroup,
	Slot as PinInputSlot,
	Separator as PinInputSeparator,
	Label as PinInputLabel,
	Description as PinInputDescription,
} from "@/components/ui/forms/pin-input"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof PinInputRoot> = {
	title: "Forms/PinInput",
	component: PinInputRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof PinInputRoot>

// Basic pin input
export const Basic: Story = {
	render: () => (
		<PinInputRoot>
			<PinInputGroup maxLength={4}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSlot index={3} />
			</PinInputGroup>
		</PinInputRoot>
	),
}

// With label and description
export const WithLabelAndDescription: Story = {
	render: () => (
		<PinInputRoot>
			<PinInputLabel>Verification Code</PinInputLabel>
			<PinInputGroup maxLength={4}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSlot index={3} />
			</PinInputGroup>
			<PinInputDescription>Enter the 4-digit code sent to your phone</PinInputDescription>
		</PinInputRoot>
	),
}

// With separator
export const WithSeparator: Story = {
	render: () => (
		<PinInputRoot>
			<PinInputLabel>Enter PIN</PinInputLabel>
			<PinInputGroup maxLength={6}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSeparator />
				<PinInputSlot index={3} />
				<PinInputSlot index={4} />
				<PinInputSlot index={5} />
			</PinInputGroup>
		</PinInputRoot>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-8 items-start">
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Small</span>
				<PinInputRoot size="small">
					<PinInputGroup maxLength={4}>
						<PinInputSlot index={0} />
						<PinInputSlot index={1} />
						<PinInputSlot index={2} />
						<PinInputSlot index={3} />
					</PinInputGroup>
				</PinInputRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Medium (Default)</span>
				<PinInputRoot size="medium">
					<PinInputGroup maxLength={4}>
						<PinInputSlot index={0} />
						<PinInputSlot index={1} />
						<PinInputSlot index={2} />
						<PinInputSlot index={3} />
					</PinInputGroup>
				</PinInputRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-xs text-text-sub-600">Large</span>
				<PinInputRoot size="large">
					<PinInputGroup maxLength={4}>
						<PinInputSlot index={0} />
						<PinInputSlot index={1} />
						<PinInputSlot index={2} />
						<PinInputSlot index={3} />
					</PinInputGroup>
				</PinInputRoot>
			</div>
		</div>
	),
}

// Error state
export const ErrorState: Story = {
	render: () => (
		<PinInputRoot hasError>
			<PinInputLabel>Verification Code</PinInputLabel>
			<PinInputGroup maxLength={4}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSlot index={3} />
			</PinInputGroup>
			<PinInputDescription className="text-error-base">
				Invalid code. Please try again.
			</PinInputDescription>
		</PinInputRoot>
	),
}

// Disabled state
export const DisabledState: Story = {
	render: () => (
		<PinInputRoot disabled>
			<PinInputLabel>Verification Code</PinInputLabel>
			<PinInputGroup maxLength={4}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSlot index={3} />
			</PinInputGroup>
			<PinInputDescription>This field is disabled</PinInputDescription>
		</PinInputRoot>
	),
}

// 6 digit code
export const SixDigitCode: Story = {
	render: () => (
		<PinInputRoot>
			<PinInputLabel>Authentication Code</PinInputLabel>
			<PinInputGroup maxLength={6}>
				<PinInputSlot index={0} />
				<PinInputSlot index={1} />
				<PinInputSlot index={2} />
				<PinInputSlot index={3} />
				<PinInputSlot index={4} />
				<PinInputSlot index={5} />
			</PinInputGroup>
			<PinInputDescription>Enter the 6-digit code from your authenticator app</PinInputDescription>
		</PinInputRoot>
	),
}

// OTP verification example
export const OTPVerification: Story = {
	render: () => (
		<div className="w-80 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-center">
			<h2 className="text-heading-sm text-text-strong-950 mb-2">Verify Your Email</h2>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">
				We&apos;ve sent a verification code to your email address. Please enter it below.
			</p>
			<PinInputRoot className="items-center">
				<PinInputGroup maxLength={6}>
					<PinInputSlot index={0} />
					<PinInputSlot index={1} />
					<PinInputSlot index={2} />
					<PinInputSeparator />
					<PinInputSlot index={3} />
					<PinInputSlot index={4} />
					<PinInputSlot index={5} />
				</PinInputGroup>
			</PinInputRoot>
			<div className="mt-6 flex flex-col gap-3">
				<ButtonRoot variant="primary" className="w-full">
					Verify
				</ButtonRoot>
				<p className="text-paragraph-sm text-text-sub-600">
					Didn&apos;t receive the code?{" "}
					<button type="button" className="text-primary-base hover:underline">
						Resend
					</button>
				</p>
			</div>
		</div>
	),
}

// Two-factor authentication example
export const TwoFactorAuth: Story = {
	render: () => (
		<div className="w-96 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<h2 className="text-heading-sm text-text-strong-950 mb-2">Two-Factor Authentication</h2>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">
				Open your authenticator app and enter the 6-digit code to continue.
			</p>
			<PinInputRoot size="small">
				<PinInputGroup maxLength={6}>
					<PinInputSlot index={0} />
					<PinInputSlot index={1} />
					<PinInputSlot index={2} />
					<PinInputSlot index={3} />
					<PinInputSlot index={4} />
					<PinInputSlot index={5} />
				</PinInputGroup>
			</PinInputRoot>
			<div className="mt-6 flex gap-3">
				<ButtonRoot variant="basic" className="flex-1">
					Cancel
				</ButtonRoot>
				<ButtonRoot variant="primary" className="flex-1">
					Verify
				</ButtonRoot>
			</div>
		</div>
	),
}
