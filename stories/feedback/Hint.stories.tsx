import type { Meta, StoryObj } from "@storybook/react"
import { Root as HintRoot, Icon as HintIcon } from "@/components/ui/feedback/hint"
import { Info, WarningCircle, CheckCircle, Lightning } from "@phosphor-icons/react"

const meta: Meta<typeof HintRoot> = {
	title: "Feedback/Hint",
	component: HintRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof HintRoot>

// Basic hint
export const Basic: Story = {
	render: () => (
		<HintRoot>
			<span>This is a helpful hint message.</span>
		</HintRoot>
	),
}

// With icon
export const WithIcon: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<HintRoot>
				<HintIcon as={Info} />
				<span>This field is optional.</span>
			</HintRoot>
			<HintRoot>
				<HintIcon as={Lightning} />
				<span>Pro tip: Use keyboard shortcuts for faster navigation.</span>
			</HintRoot>
		</div>
	),
}

// Error state
export const ErrorState: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<HintRoot hasError>
				<HintIcon as={WarningCircle} />
				<span>This field is required.</span>
			</HintRoot>
			<HintRoot hasError>
				<HintIcon as={WarningCircle} />
				<span>Please enter a valid email address.</span>
			</HintRoot>
			<HintRoot hasError>
				<HintIcon as={WarningCircle} />
				<span>Password must be at least 8 characters.</span>
			</HintRoot>
		</div>
	),
}

// Disabled state
export const DisabledState: Story = {
	render: () => (
		<HintRoot disabled>
			<HintIcon as={Info} />
			<span>This hint is for a disabled field.</span>
		</HintRoot>
	),
}

// Success hint
export const SuccessHint: Story = {
	render: () => (
		<HintRoot className="text-success-base">
			<HintIcon as={CheckCircle} className="text-success-base" />
			<span>Email is available!</span>
		</HintRoot>
	),
}

// Form field example
export const FormFieldExample: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Email</label>
				<input
					type="email"
					placeholder="john@example.com"
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
				<HintRoot>
					<HintIcon as={Info} />
					<span>We&apos;ll never share your email with anyone else.</span>
				</HintRoot>
			</div>
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Password</label>
				<input
					type="password"
					placeholder="Enter password"
					className="px-3 py-2.5 rounded-lg border border-error-base text-paragraph-sm"
				/>
				<HintRoot hasError>
					<HintIcon as={WarningCircle} />
					<span>Password must be at least 8 characters.</span>
				</HintRoot>
			</div>
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-sub-600">Username (disabled)</label>
				<input
					type="text"
					placeholder="username"
					disabled
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm bg-bg-weak-50 cursor-not-allowed"
				/>
				<HintRoot disabled>
					<HintIcon as={Info} />
					<span>Username cannot be changed.</span>
				</HintRoot>
			</div>
		</div>
	),
}

// Multiple hints
export const MultipleHints: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label className="text-label-sm text-text-strong-950">Password</label>
				<input
					type="password"
					placeholder="Enter password"
					className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
				<div className="flex flex-col gap-1">
					<HintRoot className="text-success-base">
						<HintIcon as={CheckCircle} className="text-success-base" />
						<span>At least 8 characters</span>
					</HintRoot>
					<HintRoot className="text-success-base">
						<HintIcon as={CheckCircle} className="text-success-base" />
						<span>Contains a number</span>
					</HintRoot>
					<HintRoot hasError>
						<HintIcon as={WarningCircle} />
						<span>Contains a special character</span>
					</HintRoot>
					<HintRoot>
						<HintIcon as={Info} />
						<span>Contains an uppercase letter</span>
					</HintRoot>
				</div>
			</div>
		</div>
	),
}

// All states comparison
export const AllStates: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-sub-600">Default</span>
				<HintRoot>
					<HintIcon as={Info} />
					<span>Default hint message</span>
				</HintRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-sub-600">Error</span>
				<HintRoot hasError>
					<HintIcon as={WarningCircle} />
					<span>Error hint message</span>
				</HintRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-label-sm text-text-sub-600">Disabled</span>
				<HintRoot disabled>
					<HintIcon as={Info} />
					<span>Disabled hint message</span>
				</HintRoot>
			</div>
		</div>
	),
}
