import type { Meta, StoryObj } from "@storybook/react"
import * as VerticalStepper from "@/components/ui/primitives/vertical-stepper"
import { useState } from "react"
import { CaretRight, ArrowRight, Check } from "@phosphor-icons/react"

const meta: Meta<typeof VerticalStepper.Root> = {
	title: "Primitives/VerticalStepper",
	component: VerticalStepper.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof VerticalStepper.Root>

// Basic vertical stepper
export const Basic: Story = {
	render: () => (
		<VerticalStepper.Root className="w-80">
			<VerticalStepper.Item state="completed">
				<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
				Create Account
				<VerticalStepper.Arrow />
			</VerticalStepper.Item>
			<VerticalStepper.Item state="active">
				<VerticalStepper.ItemIndicator>2</VerticalStepper.ItemIndicator>
				Verify Email
				<VerticalStepper.Arrow />
			</VerticalStepper.Item>
			<VerticalStepper.Item state="default">
				<VerticalStepper.ItemIndicator>3</VerticalStepper.ItemIndicator>
				Complete Profile
				<VerticalStepper.Arrow />
			</VerticalStepper.Item>
		</VerticalStepper.Root>
	),
}

// All states
export const AllStates: Story = {
	render: () => (
		<div className="w-80 space-y-4">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Completed</p>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
					Step Completed
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Active</p>
				<VerticalStepper.Item state="active">
					<VerticalStepper.ItemIndicator>2</VerticalStepper.ItemIndicator>
					Step Active
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Default</p>
				<VerticalStepper.Item state="default">
					<VerticalStepper.ItemIndicator>3</VerticalStepper.ItemIndicator>
					Step Default
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
			</div>
		</div>
	),
}

// Interactive stepper
export const Interactive: Story = {
	render: function InteractiveDemo() {
		const [currentStep, setCurrentStep] = useState(1)
		const steps = ["Create Account", "Verify Email", "Complete Profile", "Start Using"]

		const getState = (index: number) => {
			if (index < currentStep) return "completed"
			if (index === currentStep) return "active"
			return "default"
		}

		return (
			<div className="w-80 space-y-4">
				<VerticalStepper.Root>
					{steps.map((step, index) => (
						<VerticalStepper.Item
							key={index}
							state={getState(index)}
							onClick={() => setCurrentStep(index)}
						>
							<VerticalStepper.ItemIndicator>{index + 1}</VerticalStepper.ItemIndicator>
							{step}
							<VerticalStepper.Arrow />
						</VerticalStepper.Item>
					))}
				</VerticalStepper.Root>
				<div className="flex gap-3">
					<button
						onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
						disabled={currentStep === 0}
						className="flex-1 px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Previous
					</button>
					<button
						onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
						disabled={currentStep === steps.length - 1}
						className="flex-1 px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		)
	},
}

// Without arrow
export const WithoutArrow: Story = {
	render: () => (
		<VerticalStepper.Root className="w-80">
			<VerticalStepper.Item state="completed">
				<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
				Create Account
			</VerticalStepper.Item>
			<VerticalStepper.Item state="active">
				<VerticalStepper.ItemIndicator>2</VerticalStepper.ItemIndicator>
				Verify Email
			</VerticalStepper.Item>
			<VerticalStepper.Item state="default">
				<VerticalStepper.ItemIndicator>3</VerticalStepper.ItemIndicator>
				Complete Profile
			</VerticalStepper.Item>
		</VerticalStepper.Root>
	),
}

// Custom arrow icon
export const CustomArrowIcon: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Default (CaretRight)</p>
				<VerticalStepper.Root className="w-80">
					<VerticalStepper.Item state="active">
						<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
						Step 1
						<VerticalStepper.Arrow />
					</VerticalStepper.Item>
				</VerticalStepper.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">ArrowRight</p>
				<VerticalStepper.Root className="w-80">
					<VerticalStepper.Item state="active">
						<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
						Step 1
						<VerticalStepper.Arrow as={ArrowRight} />
					</VerticalStepper.Item>
				</VerticalStepper.Root>
			</div>
		</div>
	),
}

// Onboarding wizard example
export const OnboardingWizardExample: Story = {
	render: function OnboardingDemo() {
		const [step, setStep] = useState(0)
		const steps = [
			{ label: "Welcome", description: "Get started with our platform" },
			{ label: "Connect Account", description: "Link your existing accounts" },
			{ label: "Set Preferences", description: "Customize your experience" },
			{ label: "Invite Team", description: "Bring your colleagues aboard" },
		]

		const getState = (index: number) => {
			if (index < step) return "completed"
			if (index === step) return "active"
			return "default"
		}

		return (
			<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
					<h3 className="text-heading-sm text-text-strong-950">Getting Started</h3>
					<p className="text-paragraph-xs text-text-sub-600">Complete these steps to set up your account</p>
				</div>
				<div className="p-4">
					<VerticalStepper.Root>
						{steps.map((s, index) => (
							<VerticalStepper.Item
								key={index}
								state={getState(index)}
								onClick={() => setStep(index)}
								className="cursor-pointer"
							>
								<VerticalStepper.ItemIndicator>{index + 1}</VerticalStepper.ItemIndicator>
								<div className="flex-1">
									<p className="text-label-sm">{s.label}</p>
									<p className="text-paragraph-xs text-text-soft-400">{s.description}</p>
								</div>
								<VerticalStepper.Arrow />
							</VerticalStepper.Item>
						))}
					</VerticalStepper.Root>
				</div>
				<div className="p-4 border-t border-stroke-soft-200">
					<button
						onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
						className="w-full px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
					>
						{step === steps.length - 1 ? "Complete Setup" : "Continue"}
					</button>
				</div>
			</div>
		)
	},
}

// Checkout steps example
export const CheckoutStepsExample: Story = {
	render: function CheckoutDemo() {
		const [currentStep, setCurrentStep] = useState(1)
		const steps = [
			{ label: "Shopping Cart", subtitle: "3 items" },
			{ label: "Shipping Info", subtitle: "Enter address" },
			{ label: "Payment", subtitle: "Secure checkout" },
			{ label: "Review Order", subtitle: "Confirm details" },
		]

		const getState = (index: number) => {
			if (index < currentStep) return "completed"
			if (index === currentStep) return "active"
			return "default"
		}

		return (
			<div className="flex gap-6">
				<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
					<VerticalStepper.Root>
						{steps.map((step, index) => (
							<VerticalStepper.Item
								key={index}
								state={getState(index)}
								onClick={() => index < currentStep && setCurrentStep(index)}
								className={index < currentStep ? "cursor-pointer" : ""}
							>
								<VerticalStepper.ItemIndicator>{index + 1}</VerticalStepper.ItemIndicator>
								<div className="flex-1">
									<p className="text-label-sm">{step.label}</p>
									<p className="text-paragraph-xs text-text-soft-400">{step.subtitle}</p>
								</div>
								<VerticalStepper.Arrow />
							</VerticalStepper.Item>
						))}
					</VerticalStepper.Root>
				</div>
				<div className="flex-1 max-w-sm p-6 border border-stroke-soft-200 rounded-xl">
					<h3 className="text-heading-sm text-text-strong-950 mb-2">{steps[currentStep].label}</h3>
					<p className="text-paragraph-sm text-text-sub-600 mb-6">
						{steps[currentStep].subtitle}
					</p>
					<div className="h-32 bg-bg-weak-50 rounded-lg mb-6 flex items-center justify-center">
						<p className="text-paragraph-sm text-text-soft-400">Form content here</p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
							disabled={currentStep === 0}
							className="flex-1 px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
						>
							Back
						</button>
						<button
							onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
							className="flex-1 px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
						>
							{currentStep === steps.length - 1 ? "Place Order" : "Continue"}
						</button>
					</div>
				</div>
			</div>
		)
	},
}

// Task checklist example
export const TaskChecklistExample: Story = {
	render: function TaskDemo() {
		const [tasks, setTasks] = useState([
			{ id: 1, label: "Create project", completed: true },
			{ id: 2, label: "Set up repository", completed: true },
			{ id: 3, label: "Configure CI/CD", completed: false },
			{ id: 4, label: "Deploy to staging", completed: false },
			{ id: 5, label: "Launch production", completed: false },
		])

		const toggleTask = (id: number) => {
			setTasks(tasks.map(task =>
				task.id === id ? { ...task, completed: !task.completed } : task
			))
		}

		const completedCount = tasks.filter(t => t.completed).length

		return (
			<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-label-md text-text-strong-950">Project Tasks</h3>
					<span className="text-paragraph-xs text-text-sub-600">
						{completedCount}/{tasks.length} complete
					</span>
				</div>
				<VerticalStepper.Root>
					{tasks.map((task, index) => (
						<VerticalStepper.Item
							key={task.id}
							state={task.completed ? "completed" : index === tasks.findIndex(t => !t.completed) ? "active" : "default"}
							onClick={() => toggleTask(task.id)}
							className="cursor-pointer"
						>
							<VerticalStepper.ItemIndicator>{index + 1}</VerticalStepper.ItemIndicator>
							<span className={task.completed ? "line-through" : ""}>{task.label}</span>
						</VerticalStepper.Item>
					))}
				</VerticalStepper.Root>
			</div>
		)
	},
}

// Course progress example
export const CourseProgressExample: Story = {
	render: () => (
		<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-1">React Fundamentals</h3>
			<p className="text-paragraph-xs text-text-sub-600 mb-4">3 of 5 lessons completed</p>

			<VerticalStepper.Root>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Introduction to React</p>
						<p className="text-paragraph-xs text-success-base">Completed</p>
					</div>
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>2</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Components & Props</p>
						<p className="text-paragraph-xs text-success-base">Completed</p>
					</div>
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>3</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">State Management</p>
						<p className="text-paragraph-xs text-success-base">Completed</p>
					</div>
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
				<VerticalStepper.Item state="active">
					<VerticalStepper.ItemIndicator>4</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Hooks</p>
						<p className="text-paragraph-xs text-primary-base">In Progress</p>
					</div>
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
				<VerticalStepper.Item state="default">
					<VerticalStepper.ItemIndicator>5</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Advanced Patterns</p>
						<p className="text-paragraph-xs text-text-soft-400">Not started</p>
					</div>
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
			</VerticalStepper.Root>
		</div>
	),
}

// Application process example
export const ApplicationProcessExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-heading-sm text-text-strong-950 mb-2">Application Status</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">Software Engineer - Frontend</p>

			<VerticalStepper.Root>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>1</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Application Submitted</p>
						<p className="text-paragraph-xs text-text-soft-400">Dec 20, 2024</p>
					</div>
				</VerticalStepper.Item>
				<VerticalStepper.Item state="completed">
					<VerticalStepper.ItemIndicator>2</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Resume Screening</p>
						<p className="text-paragraph-xs text-text-soft-400">Dec 22, 2024</p>
					</div>
				</VerticalStepper.Item>
				<VerticalStepper.Item state="active">
					<VerticalStepper.ItemIndicator>3</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Technical Interview</p>
						<p className="text-paragraph-xs text-primary-base">Scheduled: Jan 3, 2025</p>
					</div>
				</VerticalStepper.Item>
				<VerticalStepper.Item state="default">
					<VerticalStepper.ItemIndicator>4</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Final Interview</p>
						<p className="text-paragraph-xs text-text-soft-400">Pending</p>
					</div>
				</VerticalStepper.Item>
				<VerticalStepper.Item state="default">
					<VerticalStepper.ItemIndicator>5</VerticalStepper.ItemIndicator>
					<div className="flex-1">
						<p className="text-label-sm">Offer</p>
						<p className="text-paragraph-xs text-text-soft-400">Pending</p>
					</div>
				</VerticalStepper.Item>
			</VerticalStepper.Root>
		</div>
	),
}

// Settings wizard example
export const SettingsWizardExample: Story = {
	render: function SettingsDemo() {
		const [step, setStep] = useState(0)
		const steps = [
			{ label: "General", icon: "1" },
			{ label: "Notifications", icon: "2" },
			{ label: "Privacy", icon: "3" },
			{ label: "Security", icon: "4" },
		]

		const getState = (index: number) => {
			if (index < step) return "completed"
			if (index === step) return "active"
			return "default"
		}

		return (
			<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Settings Setup</h3>
				<VerticalStepper.Root>
					{steps.map((s, index) => (
						<VerticalStepper.Item
							key={index}
							state={getState(index)}
							onClick={() => setStep(index)}
							className="cursor-pointer"
						>
							<VerticalStepper.ItemIndicator>{s.icon}</VerticalStepper.ItemIndicator>
							{s.label}
							<VerticalStepper.Arrow />
						</VerticalStepper.Item>
					))}
				</VerticalStepper.Root>
				<div className="mt-4 pt-4 border-t border-stroke-soft-200 flex gap-3">
					<button
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
						className="flex-1 px-3 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Back
					</button>
					<button
						onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
						className="flex-1 px-3 py-2 bg-primary-base text-white rounded-lg text-label-sm"
					>
						{step === steps.length - 1 ? "Finish" : "Next"}
					</button>
				</div>
			</div>
		)
	},
}

// Sidebar navigation style example
export const SidebarNavigationExample: Story = {
	render: function SidebarDemo() {
		const [activeStep, setActiveStep] = useState(1)
		const steps = [
			"Dashboard Overview",
			"User Management",
			"Content Settings",
			"Analytics Reports",
			"System Configuration",
		]

		return (
			<div className="flex gap-4">
				<div className="w-64 p-3 bg-bg-weak-50 rounded-xl">
					<VerticalStepper.Root>
						{steps.map((step, index) => (
							<VerticalStepper.Item
								key={index}
								state={index === activeStep ? "active" : "default"}
								onClick={() => setActiveStep(index)}
								className="cursor-pointer"
							>
								<VerticalStepper.ItemIndicator>{index + 1}</VerticalStepper.ItemIndicator>
								{step}
								<VerticalStepper.Arrow />
							</VerticalStepper.Item>
						))}
					</VerticalStepper.Root>
				</div>
				<div className="flex-1 max-w-sm p-6 border border-stroke-soft-200 rounded-xl">
					<h2 className="text-heading-md text-text-strong-950 mb-2">{steps[activeStep]}</h2>
					<p className="text-paragraph-sm text-text-sub-600">
						Configure and manage {steps[activeStep].toLowerCase()} settings.
					</p>
				</div>
			</div>
		)
	},
}

// Many steps
export const ManySteps: Story = {
	render: () => (
		<VerticalStepper.Root className="w-80">
			{[1, 2, 3, 4, 5, 6, 7].map((num) => (
				<VerticalStepper.Item
					key={num}
					state={num < 4 ? "completed" : num === 4 ? "active" : "default"}
				>
					<VerticalStepper.ItemIndicator>{num}</VerticalStepper.ItemIndicator>
					Step {num}
					<VerticalStepper.Arrow />
				</VerticalStepper.Item>
			))}
		</VerticalStepper.Root>
	),
}
