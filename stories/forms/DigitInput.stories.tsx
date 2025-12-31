import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Root as DigitInput } from "@/components/ui/forms/digit-input"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof DigitInput> = {
	title: "Forms/DigitInput",
	component: DigitInput,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DigitInput>

// Basic 4-digit input
export const Basic: Story = {
	render: function BasicDigitInput() {
		const [otp, setOtp] = useState("")

		return (
			<div className="flex flex-col items-center gap-4">
				<DigitInput value={otp} onChange={setOtp} numInputs={4} />
				<p className="text-paragraph-sm text-text-sub-600">Value: {otp || "(empty)"}</p>
			</div>
		)
	},
}

// 6-digit OTP
export const SixDigit: Story = {
	render: function SixDigitInput() {
		const [otp, setOtp] = useState("")

		return (
			<div className="flex flex-col items-center gap-4">
				<DigitInput value={otp} onChange={setOtp} numInputs={6} />
				<p className="text-paragraph-sm text-text-sub-600">Enter your 6-digit code</p>
			</div>
		)
	},
}

// With placeholder
export const WithPlaceholder: Story = {
	render: function PlaceholderInput() {
		const [otp, setOtp] = useState("")

		return (
			<DigitInput value={otp} onChange={setOtp} numInputs={4} placeholder="0" />
		)
	},
}

// Input type password
export const Password: Story = {
	render: function PasswordInput() {
		const [pin, setPin] = useState("")

		return (
			<div className="flex flex-col items-center gap-4">
				<DigitInput value={pin} onChange={setPin} numInputs={4} inputType="password" />
				<p className="text-paragraph-sm text-text-sub-600">Enter your PIN</p>
			</div>
		)
	},
}

// Error state
export const ErrorState: Story = {
	render: function ErrorStateInput() {
		const [otp, setOtp] = useState("1234")

		return (
			<div className="flex flex-col items-center gap-4">
				<DigitInput value={otp} onChange={setOtp} numInputs={4} hasError />
				<p className="text-paragraph-sm text-error-base">Invalid code. Please try again.</p>
			</div>
		)
	},
}

// Disabled state
export const DisabledState: Story = {
	render: () => (
		<DigitInput value="1234" onChange={() => {}} numInputs={4} disabled />
	),
}

// Phone verification example
export const PhoneVerificationExample: Story = {
	render: function PhoneVerification() {
		const [otp, setOtp] = useState("")
		const [isSubmitting, setIsSubmitting] = useState(false)

		const handleVerify = () => {
			setIsSubmitting(true)
			setTimeout(() => setIsSubmitting(false), 1500)
		}

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-lg text-text-strong-950 text-center mb-2">Verify your phone</h3>
				<p className="text-paragraph-sm text-text-sub-600 text-center mb-6">
					Enter the 6-digit code sent to +91 98765 43210
				</p>
				<div className="flex justify-center mb-6">
					<DigitInput value={otp} onChange={setOtp} numInputs={6} />
				</div>
				<ButtonRoot
					variant="primary"
					className="w-full"
					disabled={otp.length < 6 || isSubmitting}
					onClick={handleVerify}
				>
					{isSubmitting ? "Verifying..." : "Verify"}
				</ButtonRoot>
				<p className="text-paragraph-xs text-text-sub-600 text-center mt-4">
					Didn&apos;t receive the code?{" "}
					<button className="text-primary-base hover:underline">Resend</button>
				</p>
			</div>
		)
	},
}

// Email verification example
export const EmailVerificationExample: Story = {
	render: function EmailVerification() {
		const [otp, setOtp] = useState("")

		return (
			<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
				<div className="size-16 rounded-full bg-primary-lighter flex items-center justify-center mx-auto mb-4">
					<span className="text-heading-sm text-primary-base">@</span>
				</div>
				<h3 className="text-label-lg text-text-strong-950 text-center mb-2">Check your email</h3>
				<p className="text-paragraph-sm text-text-sub-600 text-center mb-6">
					We&apos;ve sent a 4-digit verification code to <strong>john@example.com</strong>
				</p>
				<div className="flex justify-center mb-6">
					<DigitInput value={otp} onChange={setOtp} numInputs={4} />
				</div>
				<div className="flex gap-3">
					<ButtonRoot variant="basic" className="flex-1">
						Cancel
					</ButtonRoot>
					<ButtonRoot variant="primary" className="flex-1" disabled={otp.length < 4}>
						Confirm
					</ButtonRoot>
				</div>
			</div>
		)
	},
}

// Two-factor authentication
export const TwoFactorAuth: Story = {
	render: function TwoFactorAuthExample() {
		const [code, setCode] = useState("")

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<div className="flex items-center gap-3 mb-4">
					<div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center">
						<span className="text-label-md text-text-sub-600">2FA</span>
					</div>
					<div>
						<h3 className="text-label-md text-text-strong-950">Two-factor authentication</h3>
						<p className="text-paragraph-xs text-text-sub-600">Enter code from your app</p>
					</div>
				</div>
				<div className="flex justify-center mb-4">
					<DigitInput value={code} onChange={setCode} numInputs={6} />
				</div>
				<ButtonRoot variant="primary" className="w-full" disabled={code.length < 6}>
					Authenticate
				</ButtonRoot>
			</div>
		)
	},
}

// PIN setup
export const PINSetup: Story = {
	render: function PINSetupExample() {
		const [pin, setPin] = useState("")
		const [confirmPin, setConfirmPin] = useState("")
		const [step, setStep] = useState<"enter" | "confirm">("enter")

		const handleContinue = () => {
			if (step === "enter" && pin.length === 4) {
				setStep("confirm")
			}
		}

		const pinsMatch = step === "confirm" && pin === confirmPin && confirmPin.length === 4

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-lg text-text-strong-950 text-center mb-2">
					{step === "enter" ? "Create your PIN" : "Confirm your PIN"}
				</h3>
				<p className="text-paragraph-sm text-text-sub-600 text-center mb-6">
					{step === "enter"
						? "Enter a 4-digit PIN to secure your account"
						: "Re-enter your PIN to confirm"}
				</p>
				<div className="flex justify-center mb-6">
					{step === "enter" ? (
						<DigitInput value={pin} onChange={setPin} numInputs={4} inputType="password" />
					) : (
						<DigitInput
							value={confirmPin}
							onChange={setConfirmPin}
							numInputs={4}
							inputType="password"
							hasError={confirmPin.length === 4 && pin !== confirmPin}
						/>
					)}
				</div>
				{step === "confirm" && confirmPin.length === 4 && pin !== confirmPin && (
					<p className="text-paragraph-xs text-error-base text-center mb-4">PINs do not match</p>
				)}
				<ButtonRoot
					variant="primary"
					className="w-full"
					disabled={step === "enter" ? pin.length < 4 : !pinsMatch}
					onClick={handleContinue}
				>
					{step === "enter" ? "Continue" : "Confirm PIN"}
				</ButtonRoot>
				{step === "confirm" && (
					<button
						className="w-full mt-3 text-paragraph-sm text-text-sub-600 hover:text-text-strong-950"
						onClick={() => {
							setStep("enter")
							setConfirmPin("")
						}}
					>
						Go back
					</button>
				)}
			</div>
		)
	},
}

// Payment verification
export const PaymentVerification: Story = {
	render: function PaymentVerificationExample() {
		const [cvv, setCvv] = useState("")

		return (
			<div className="w-72 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Confirm Payment</h3>
				<div className="p-4 bg-bg-weak-50 rounded-lg mb-4">
					<p className="text-paragraph-xs text-text-sub-600 mb-1">Card ending in</p>
					<p className="text-label-md text-text-strong-950">**** **** **** 4242</p>
				</div>
				<div className="mb-4">
					<label className="text-label-sm text-text-sub-600 mb-2 block">Enter CVV</label>
					<div className="w-32">
						<DigitInput value={cvv} onChange={setCvv} numInputs={3} inputType="password" />
					</div>
				</div>
				<ButtonRoot variant="primary" className="w-full" disabled={cvv.length < 3}>
					Pay $99.00
				</ButtonRoot>
			</div>
		)
	},
}

// Auto-submit on complete
export const AutoSubmitExample: Story = {
	render: function AutoSubmitDemo() {
		const [otp, setOtp] = useState("")
		const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")

		const handleChange = (value: string) => {
			setOtp(value)
			if (value.length === 6) {
				setStatus("verifying")
				setTimeout(() => {
					if (value === "123456") {
						setStatus("success")
					} else {
						setStatus("error")
						setTimeout(() => {
							setOtp("")
							setStatus("idle")
						}, 1500)
					}
				}, 1000)
			}
		}

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-lg text-text-strong-950 text-center mb-2">Auto-submit Demo</h3>
				<p className="text-paragraph-sm text-text-sub-600 text-center mb-6">
					Enter 123456 to see success, any other code for error
				</p>
				<div className="flex justify-center mb-4">
					<DigitInput
						value={otp}
						onChange={handleChange}
						numInputs={6}
						hasError={status === "error"}
						disabled={status === "verifying" || status === "success"}
					/>
				</div>
				<div className="text-center">
					{status === "idle" && (
						<p className="text-paragraph-sm text-text-sub-600">Enter code to auto-verify</p>
					)}
					{status === "verifying" && (
						<p className="text-paragraph-sm text-text-sub-600">Verifying...</p>
					)}
					{status === "success" && (
						<p className="text-paragraph-sm text-success-base">Verification successful!</p>
					)}
					{status === "error" && (
						<p className="text-paragraph-sm text-error-base">Invalid code. Try again.</p>
					)}
				</div>
			</div>
		)
	},
}
