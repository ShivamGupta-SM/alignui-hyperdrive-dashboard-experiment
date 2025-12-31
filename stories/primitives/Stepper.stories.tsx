import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as StepperRoot,
	Item as StepperItem,
	Trigger as StepperTrigger,
	Indicator as StepperIndicator,
	Title as StepperTitle,
	Description as StepperDescription,
	Separator as StepperSeparator,
	Content as StepperContent,
} from "@/components/ui/primitives/stepper"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof StepperRoot> = {
	title: "Primitives/Stepper",
	component: StepperRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof StepperRoot>

// Basic horizontal stepper
export const Basic: Story = {
	render: function BasicStepper() {
		const [step, setStep] = useState(1)

		return (
			<div className="w-[600px] flex flex-col gap-8">
				<StepperRoot activeStep={step} orientation="horizontal">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Account</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Profile</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Confirm</StepperTitle>
							</StepperContent>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
				<div className="flex justify-center gap-4">
					<ButtonRoot variant="basic" onClick={() => setStep(Math.max(0, step - 1))}>
						Previous
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => setStep(Math.min(2, step + 1))}>
						Next
					</ButtonRoot>
				</div>
			</div>
		)
	},
}

// Vertical stepper
export const Vertical: Story = {
	render: function VerticalStepper() {
		const [step, setStep] = useState(1)

		return (
			<div className="w-80 flex flex-col gap-8">
				<StepperRoot activeStep={step} orientation="vertical">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Create account</StepperTitle>
								<StepperDescription>Enter your email and password</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Complete profile</StepperTitle>
								<StepperDescription>Add your personal information</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Verify email</StepperTitle>
								<StepperDescription>Confirm your email address</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={3}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Get started</StepperTitle>
								<StepperDescription>Start using the platform</StepperDescription>
							</div>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
				<div className="flex gap-4">
					<ButtonRoot variant="basic" onClick={() => setStep(Math.max(0, step - 1))}>
						Previous
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => setStep(Math.min(3, step + 1))}>
						Next
					</ButtonRoot>
				</div>
			</div>
		)
	},
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-12">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Small</span>
				<StepperRoot activeStep={1} orientation="horizontal" size="small">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 1</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 2</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 3</StepperTitle>
							</StepperContent>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Medium (default)</span>
				<StepperRoot activeStep={1} orientation="horizontal" size="medium">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 1</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 2</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 3</StepperTitle>
							</StepperContent>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Large</span>
				<StepperRoot activeStep={1} orientation="horizontal" size="large">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 1</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 2</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Step 3</StepperTitle>
							</StepperContent>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
			</div>
		</div>
	),
}

// With error
export const WithError: Story = {
	render: () => (
		<div className="w-[600px]">
			<StepperRoot activeStep={1} orientation="horizontal">
				<StepperItem step={0}>
					<StepperTrigger>
						<StepperIndicator />
						<StepperContent>
							<StepperTitle>Account</StepperTitle>
						</StepperContent>
					</StepperTrigger>
					<StepperSeparator />
				</StepperItem>
				<StepperItem step={1} hasError>
					<StepperTrigger>
						<StepperIndicator />
						<StepperContent>
							<StepperTitle>Payment</StepperTitle>
						</StepperContent>
					</StepperTrigger>
					<StepperSeparator />
				</StepperItem>
				<StepperItem step={2}>
					<StepperTrigger>
						<StepperIndicator />
						<StepperContent>
							<StepperTitle>Confirm</StepperTitle>
						</StepperContent>
					</StepperTrigger>
				</StepperItem>
			</StepperRoot>
		</div>
	),
}

// Clickable steps
export const Clickable: Story = {
	render: function ClickableStepper() {
		const [step, setStep] = useState(2)

		return (
			<div className="w-[600px] flex flex-col gap-4">
				<StepperRoot activeStep={step} orientation="horizontal" clickable onStepClick={setStep}>
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Account</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Profile</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Review</StepperTitle>
							</StepperContent>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={3}>
						<StepperTrigger>
							<StepperIndicator />
							<StepperContent>
								<StepperTitle>Complete</StepperTitle>
							</StepperContent>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>
				<p className="text-center text-paragraph-sm text-text-sub-600">
					Click on any step to navigate. Current step: {step + 1}
				</p>
			</div>
		)
	},
}

// Checkout form example
export const CheckoutExample: Story = {
	render: function CheckoutStepper() {
		const [step, setStep] = useState(0)

		const steps = [
			{ title: "Shipping", description: "Enter shipping address" },
			{ title: "Payment", description: "Add payment method" },
			{ title: "Review", description: "Review your order" },
			{ title: "Confirmation", description: "Order confirmed" },
		]

		return (
			<div className="w-[700px] p-6 border border-stroke-soft-200 rounded-xl">
				<StepperRoot activeStep={step} orientation="horizontal" className="mb-8">
					{steps.map((s, i) => (
						<StepperItem key={s.title} step={i}>
							<StepperTrigger>
								<StepperIndicator />
								<StepperContent>
									<StepperTitle>{s.title}</StepperTitle>
								</StepperContent>
							</StepperTrigger>
							{i < steps.length - 1 && <StepperSeparator />}
						</StepperItem>
					))}
				</StepperRoot>

				<div className="min-h-[200px] p-6 bg-bg-weak-50 rounded-lg mb-6">
					<h3 className="text-label-lg text-text-strong-950 mb-2">{steps[step].title}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{steps[step].description}</p>
				</div>

				<div className="flex justify-between">
					<ButtonRoot
						variant="basic"
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
					>
						Previous
					</ButtonRoot>
					<ButtonRoot
						variant="primary"
						onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
						disabled={step === steps.length - 1}
					>
						{step === steps.length - 2 ? "Place Order" : "Continue"}
					</ButtonRoot>
				</div>
			</div>
		)
	},
}

// Onboarding flow
export const OnboardingFlow: Story = {
	render: function OnboardingStepper() {
		const [step, setStep] = useState(0)

		return (
			<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
				<h2 className="text-heading-sm text-text-strong-950 mb-6">Welcome! Let&apos;s get started</h2>

				<StepperRoot activeStep={step} orientation="vertical" size="small" className="mb-6">
					<StepperItem step={0}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Create your account</StepperTitle>
								<StepperDescription>Set up email and password</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={1}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Choose your plan</StepperTitle>
								<StepperDescription>Select a subscription plan</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={2}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>Invite team members</StepperTitle>
								<StepperDescription>Add your colleagues</StepperDescription>
							</div>
						</StepperTrigger>
						<StepperSeparator />
					</StepperItem>
					<StepperItem step={3}>
						<StepperTrigger>
							<StepperIndicator />
							<div className="flex flex-col">
								<StepperTitle>You&apos;re all set!</StepperTitle>
								<StepperDescription>Start using the platform</StepperDescription>
							</div>
						</StepperTrigger>
					</StepperItem>
				</StepperRoot>

				<div className="flex gap-3">
					<ButtonRoot
						variant="basic"
						className="flex-1"
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
					>
						Back
					</ButtonRoot>
					<ButtonRoot
						variant="primary"
						className="flex-1"
						onClick={() => setStep(Math.min(3, step + 1))}
					>
						{step === 3 ? "Get Started" : "Continue"}
					</ButtonRoot>
				</div>
			</div>
		)
	},
}
