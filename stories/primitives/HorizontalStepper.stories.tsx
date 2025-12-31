import type { Meta, StoryObj } from "@storybook/react"
import * as HorizontalStepper from "@/components/ui/primitives/horizontal-stepper"
import { useState } from "react"
import { Check, ArrowRight, CaretRight, Minus } from "@phosphor-icons/react"

const meta: Meta<typeof HorizontalStepper.Root> = {
	title: "Primitives/HorizontalStepper",
	component: HorizontalStepper.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof HorizontalStepper.Root>

// Basic horizontal stepper
export const Basic: Story = {
	render: () => (
		<HorizontalStepper.Root>
			<HorizontalStepper.Item state="completed">
				<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
				Cart
			</HorizontalStepper.Item>
			<HorizontalStepper.SeparatorIcon />
			<HorizontalStepper.Item state="active">
				<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
				Shipping
			</HorizontalStepper.Item>
			<HorizontalStepper.SeparatorIcon />
			<HorizontalStepper.Item state="default">
				<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
				Payment
			</HorizontalStepper.Item>
		</HorizontalStepper.Root>
	),
}

// All states
export const AllStates: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Completed</p>
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
					Step Completed
				</HorizontalStepper.Item>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Active</p>
				<HorizontalStepper.Item state="active">
					<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
					Step Active
				</HorizontalStepper.Item>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Default</p>
				<HorizontalStepper.Item state="default">
					<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
					Step Default
				</HorizontalStepper.Item>
			</div>
		</div>
	),
}

// Interactive stepper
export const Interactive: Story = {
	render: function InteractiveDemo() {
		const [currentStep, setCurrentStep] = useState(1)
		const steps = ["Account", "Profile", "Settings", "Review"]

		const getState = (index: number) => {
			if (index < currentStep) return "completed"
			if (index === currentStep) return "active"
			return "default"
		}

		return (
			<div className="space-y-6">
				<HorizontalStepper.Root>
					{steps.map((step, index) => (
						<>
							<HorizontalStepper.Item
								key={index}
								state={getState(index)}
								onClick={() => setCurrentStep(index)}
							>
								<HorizontalStepper.ItemIndicator>{index + 1}</HorizontalStepper.ItemIndicator>
								{step}
							</HorizontalStepper.Item>
							{index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
						</>
					))}
				</HorizontalStepper.Root>
				<div className="flex justify-center gap-3">
					<button
						onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
						disabled={currentStep === 0}
						className="px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Previous
					</button>
					<button
						onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
						disabled={currentStep === steps.length - 1}
						className="px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		)
	},
}

// Custom separator icon
export const CustomSeparatorIcon: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Default (CaretRight)</p>
				<HorizontalStepper.Root>
					<HorizontalStepper.Item state="completed">
						<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
						Step 1
					</HorizontalStepper.Item>
					<HorizontalStepper.SeparatorIcon />
					<HorizontalStepper.Item state="active">
						<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
						Step 2
					</HorizontalStepper.Item>
				</HorizontalStepper.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Arrow</p>
				<HorizontalStepper.Root>
					<HorizontalStepper.Item state="completed">
						<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
						Step 1
					</HorizontalStepper.Item>
					<HorizontalStepper.SeparatorIcon as={ArrowRight} />
					<HorizontalStepper.Item state="active">
						<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
						Step 2
					</HorizontalStepper.Item>
				</HorizontalStepper.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Minus</p>
				<HorizontalStepper.Root>
					<HorizontalStepper.Item state="completed">
						<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
						Step 1
					</HorizontalStepper.Item>
					<HorizontalStepper.SeparatorIcon as={Minus} />
					<HorizontalStepper.Item state="active">
						<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
						Step 2
					</HorizontalStepper.Item>
				</HorizontalStepper.Root>
			</div>
		</div>
	),
}

// Checkout flow example
export const CheckoutFlowExample: Story = {
	render: function CheckoutDemo() {
		const [step, setStep] = useState(1)
		const steps = [
			{ label: "Cart", description: "Review your items" },
			{ label: "Shipping", description: "Choose delivery" },
			{ label: "Payment", description: "Enter payment details" },
			{ label: "Review", description: "Confirm your order" },
		]

		const getState = (index: number) => {
			if (index < step) return "completed"
			if (index === step) return "active"
			return "default"
		}

		return (
			<div className="w-[600px] p-6 border border-stroke-soft-200 rounded-xl">
				<HorizontalStepper.Root className="mb-6">
					{steps.map((s, index) => (
						<>
							<HorizontalStepper.Item
								key={index}
								state={getState(index)}
								onClick={() => index < step && setStep(index)}
								className={index < step ? "cursor-pointer" : ""}
							>
								<HorizontalStepper.ItemIndicator>{index + 1}</HorizontalStepper.ItemIndicator>
								{s.label}
							</HorizontalStepper.Item>
							{index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
						</>
					))}
				</HorizontalStepper.Root>

				<div className="p-6 bg-bg-weak-50 rounded-lg mb-6">
					<h3 className="text-heading-sm text-text-strong-950 mb-2">{steps[step].label}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{steps[step].description}</p>
				</div>

				<div className="flex justify-between">
					<button
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
						className="px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Back
					</button>
					<button
						onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
						className="px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
					>
						{step === steps.length - 1 ? "Place Order" : "Continue"}
					</button>
				</div>
			</div>
		)
	},
}

// Account creation example
export const AccountCreationExample: Story = {
	render: function AccountDemo() {
		const [currentStep, setCurrentStep] = useState(0)
		const steps = ["Create Account", "Verify Email", "Complete Profile"]

		const getState = (index: number) => {
			if (index < currentStep) return "completed"
			if (index === currentStep) return "active"
			return "default"
		}

		return (
			<div className="w-[500px] p-6 border border-stroke-soft-200 rounded-xl">
				<h2 className="text-heading-md text-text-strong-950 mb-6 text-center">Sign Up</h2>
				<HorizontalStepper.Root className="mb-8">
					{steps.map((step, index) => (
						<>
							<HorizontalStepper.Item key={index} state={getState(index)}>
								<HorizontalStepper.ItemIndicator>{index + 1}</HorizontalStepper.ItemIndicator>
								{step}
							</HorizontalStepper.Item>
							{index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
						</>
					))}
				</HorizontalStepper.Root>

				<div className="space-y-4 mb-6">
					{currentStep === 0 && (
						<>
							<input
								type="email"
								placeholder="Email address"
								className="w-full px-4 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm"
							/>
							<input
								type="password"
								placeholder="Password"
								className="w-full px-4 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm"
							/>
						</>
					)}
					{currentStep === 1 && (
						<div className="text-center py-4">
							<p className="text-paragraph-sm text-text-sub-600">
								We sent a verification code to your email.
							</p>
							<input
								type="text"
								placeholder="Enter code"
								className="mt-4 w-32 px-4 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm text-center"
							/>
						</div>
					)}
					{currentStep === 2 && (
						<>
							<input
								type="text"
								placeholder="Full name"
								className="w-full px-4 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm"
							/>
							<input
								type="text"
								placeholder="Company (optional)"
								className="w-full px-4 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm"
							/>
						</>
					)}
				</div>

				<button
					onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
					className="w-full px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
				>
					{currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
				</button>
			</div>
		)
	},
}

// Job application example
export const JobApplicationExample: Story = {
	render: () => (
		<div className="w-[600px] p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-2">Application Progress</h2>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">Track your job application status</p>

			<HorizontalStepper.Root>
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
					Applied
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
					Screening
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="active">
					<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
					Interview
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="default">
					<HorizontalStepper.ItemIndicator>4</HorizontalStepper.ItemIndicator>
					Offer
				</HorizontalStepper.Item>
			</HorizontalStepper.Root>
		</div>
	),
}

// Order tracking example
export const OrderTrackingExample: Story = {
	render: () => (
		<div className="w-[600px] p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex justify-between items-start mb-6">
				<div>
					<h2 className="text-heading-sm text-text-strong-950">Order #12345</h2>
					<p className="text-paragraph-sm text-text-sub-600">Expected delivery: Jan 5, 2025</p>
				</div>
				<span className="px-2 py-1 text-label-xs bg-primary-lighter text-primary-base rounded-full">
					In Transit
				</span>
			</div>

			<HorizontalStepper.Root>
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
					Ordered
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
					Shipped
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="active">
					<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
					In Transit
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="default">
					<HorizontalStepper.ItemIndicator>4</HorizontalStepper.ItemIndicator>
					Delivered
				</HorizontalStepper.Item>
			</HorizontalStepper.Root>
		</div>
	),
}

// Project phases example
export const ProjectPhasesExample: Story = {
	render: () => (
		<div className="w-[700px] p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-6">Project Phases</h2>

			<HorizontalStepper.Root>
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
					Discovery
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="completed">
					<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
					Design
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="active">
					<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
					Development
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="default">
					<HorizontalStepper.ItemIndicator>4</HorizontalStepper.ItemIndicator>
					Testing
				</HorizontalStepper.Item>
				<HorizontalStepper.SeparatorIcon />
				<HorizontalStepper.Item state="default">
					<HorizontalStepper.ItemIndicator>5</HorizontalStepper.ItemIndicator>
					Launch
				</HorizontalStepper.Item>
			</HorizontalStepper.Root>
		</div>
	),
}

// Minimal version
export const Minimal: Story = {
	render: () => (
		<HorizontalStepper.Root>
			<HorizontalStepper.Item state="completed">
				<HorizontalStepper.ItemIndicator>1</HorizontalStepper.ItemIndicator>
			</HorizontalStepper.Item>
			<HorizontalStepper.SeparatorIcon />
			<HorizontalStepper.Item state="active">
				<HorizontalStepper.ItemIndicator>2</HorizontalStepper.ItemIndicator>
			</HorizontalStepper.Item>
			<HorizontalStepper.SeparatorIcon />
			<HorizontalStepper.Item state="default">
				<HorizontalStepper.ItemIndicator>3</HorizontalStepper.ItemIndicator>
			</HorizontalStepper.Item>
		</HorizontalStepper.Root>
	),
}

// Many steps
export const ManySteps: Story = {
	render: () => (
		<HorizontalStepper.Root>
			{[1, 2, 3, 4, 5, 6].map((num, index) => (
				<>
					<HorizontalStepper.Item
						key={num}
						state={num < 4 ? "completed" : num === 4 ? "active" : "default"}
					>
						<HorizontalStepper.ItemIndicator>{num}</HorizontalStepper.ItemIndicator>
						Step {num}
					</HorizontalStepper.Item>
					{index < 5 && <HorizontalStepper.SeparatorIcon />}
				</>
			))}
		</HorizontalStepper.Root>
	),
}
