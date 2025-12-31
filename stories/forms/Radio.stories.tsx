import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Group as RadioGroup, Item as RadioItem, LabeledItem, Card as RadioCard } from "@/components/ui/forms/radio"
import { Package, CreditCard, Truck } from "@phosphor-icons/react"

const meta: Meta<typeof RadioGroup> = {
	title: "Forms/Radio",
	component: RadioGroup,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

// Basic radio group
export const Basic: Story = {
	render: function BasicRadio() {
		const [value, setValue] = useState("option1")
		return (
			<RadioGroup value={value} onValueChange={setValue} className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<RadioItem value="option1" />
					<label className="text-paragraph-sm text-text-strong-950">Option 1</label>
				</div>
				<div className="flex items-center gap-2">
					<RadioItem value="option2" />
					<label className="text-paragraph-sm text-text-strong-950">Option 2</label>
				</div>
				<div className="flex items-center gap-2">
					<RadioItem value="option3" />
					<label className="text-paragraph-sm text-text-strong-950">Option 3</label>
				</div>
			</RadioGroup>
		)
	},
}

// Labeled radio items
export const Labeled: Story = {
	render: function LabeledRadio() {
		const [value, setValue] = useState("email")
		return (
			<RadioGroup value={value} onValueChange={setValue} className="flex flex-col gap-3">
				<LabeledItem value="email" label="Email" description="Get notified via email" />
				<LabeledItem value="sms" label="SMS" description="Get notified via text message" />
				<LabeledItem value="push" label="Push" description="Get notified on your device" />
			</RadioGroup>
		)
	},
}

// With error state
export const WithError: Story = {
	render: function ErrorRadio() {
		const [value, setValue] = useState("")
		const hasError = !value

		return (
			<div className="flex flex-col gap-2">
				<RadioGroup
					value={value}
					onValueChange={setValue}
					hasError={hasError}
					errorId="radio-error"
					className="flex flex-col gap-3"
				>
					<LabeledItem value="yes" label="Yes" hasError={hasError} />
					<LabeledItem value="no" label="No" hasError={hasError} />
				</RadioGroup>
				{hasError && (
					<span id="radio-error" className="text-error-base text-sm">
						Please select an option
					</span>
				)}
			</div>
		)
	},
}

// Horizontal layout
export const Horizontal: Story = {
	render: function HorizontalRadio() {
		const [value, setValue] = useState("monthly")
		return (
			<RadioGroup value={value} onValueChange={setValue} className="flex gap-6">
				<div className="flex items-center gap-2">
					<RadioItem value="monthly" />
					<label className="text-paragraph-sm text-text-strong-950">Monthly</label>
				</div>
				<div className="flex items-center gap-2">
					<RadioItem value="yearly" />
					<label className="text-paragraph-sm text-text-strong-950">Yearly</label>
				</div>
			</RadioGroup>
		)
	},
}

// Radio cards
export const Cards: Story = {
	render: function RadioCards() {
		const [value, setValue] = useState("standard")
		return (
			<RadioGroup value={value} onValueChange={setValue} className="flex flex-col gap-3 w-80">
				<RadioCard
					value="standard"
					label="Standard Shipping"
					description="5-7 business days"
					icon={<Truck className="size-5" />}
				/>
				<RadioCard
					value="express"
					label="Express Shipping"
					description="2-3 business days"
					icon={<Package className="size-5" />}
				/>
				<RadioCard
					value="overnight"
					label="Overnight Shipping"
					description="Next business day"
					icon={<CreditCard className="size-5" />}
				/>
			</RadioGroup>
		)
	},
}

// Disabled state
export const Disabled: Story = {
	render: () => (
		<RadioGroup defaultValue="option1" className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<RadioItem value="option1" />
				<label className="text-paragraph-sm text-text-strong-950">Selected</label>
			</div>
			<div className="flex items-center gap-2">
				<RadioItem value="option2" disabled />
				<label className="text-paragraph-sm text-text-disabled-300">Disabled</label>
			</div>
		</RadioGroup>
	),
}

// Form example
export const FormExample: Story = {
	render: function FormExampleStory() {
		const [plan, setPlan] = useState("pro")

		return (
			<div className="w-96 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
				<h3 className="text-label-lg text-text-strong-950 mb-4">Choose your plan</h3>
				<RadioGroup value={plan} onValueChange={setPlan} className="flex flex-col gap-3">
					<RadioCard
						value="free"
						label="Free"
						description="Basic features for personal use"
					/>
					<RadioCard
						value="pro"
						label="Pro - $19/month"
						description="Advanced features for professionals"
					/>
					<RadioCard
						value="enterprise"
						label="Enterprise - Custom"
						description="Full features with dedicated support"
					/>
				</RadioGroup>
			</div>
		)
	},
}
