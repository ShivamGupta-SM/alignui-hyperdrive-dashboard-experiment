import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { CheckboxRoot, LabeledCheckbox, CheckboxGroup } from "@/components/ui/forms"

const meta: Meta<typeof CheckboxRoot> = {
	title: "Forms/Checkbox",
	component: CheckboxRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		checked: {
			control: "boolean",
			description: "Whether the checkbox is checked",
		},
		disabled: {
			control: "boolean",
			description: "Whether the checkbox is disabled",
		},
		hasError: {
			control: "boolean",
			description: "Whether the checkbox has an error state",
		},
	},
}

export default meta
type Story = StoryObj<typeof CheckboxRoot>

// Basic checkbox
export const Basic: Story = {
	render: function BasicCheckbox() {
		const [checked, setChecked] = useState(false)
		return (
			<CheckboxRoot
				checked={checked}
				onCheckedChange={(value) => setChecked(value === true)}
			/>
		)
	},
}

// Checked by default
export const Checked: Story = {
	render: () => <CheckboxRoot defaultChecked />,
}

// Indeterminate state
export const Indeterminate: Story = {
	render: () => <CheckboxRoot checked="indeterminate" />,
}

// Disabled states
export const DisabledUnchecked: Story = {
	render: () => <CheckboxRoot disabled />,
}

export const DisabledChecked: Story = {
	render: () => <CheckboxRoot disabled defaultChecked />,
}

// With error
export const WithError: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<CheckboxRoot hasError errorId="checkbox-error" />
			<span id="checkbox-error" className="text-error-base text-sm">
				This field is required
			</span>
		</div>
	),
}

// Labeled checkbox
export const Labeled: Story = {
	render: function LabeledCheckboxStory() {
		const [checked, setChecked] = useState(false)
		return (
			<LabeledCheckbox
				checked={checked}
				onCheckedChange={(value) => setChecked(value === true)}
				label="Accept terms and conditions"
			/>
		)
	},
}

export const LabeledWithDescription: Story = {
	render: function LabeledWithDescStory() {
		const [checked, setChecked] = useState(true)
		return (
			<LabeledCheckbox
				checked={checked}
				onCheckedChange={(value) => setChecked(value === true)}
				label="Email notifications"
				description="Receive email updates about your account activity"
			/>
		)
	},
}

// Checkbox group
export const Group: Story = {
	render: function CheckboxGroupStory() {
		const [emailChecked, setEmailChecked] = useState(true)
		const [smsChecked, setSmsChecked] = useState(false)
		const [pushChecked, setPushChecked] = useState(false)

		return (
			<CheckboxGroup label="Notification preferences">
				<LabeledCheckbox
					checked={emailChecked}
					onCheckedChange={(value) => setEmailChecked(value === true)}
					label="Email"
					description="Get notified via email"
				/>
				<LabeledCheckbox
					checked={smsChecked}
					onCheckedChange={(value) => setSmsChecked(value === true)}
					label="SMS"
					description="Get notified via text message"
				/>
				<LabeledCheckbox
					checked={pushChecked}
					onCheckedChange={(value) => setPushChecked(value === true)}
					label="Push notifications"
					description="Get notified on your device"
				/>
			</CheckboxGroup>
		)
	},
}

// All states showcase
export const AllStates: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot />
					<span className="text-xs text-text-sub-600">Unchecked</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot defaultChecked />
					<span className="text-xs text-text-sub-600">Checked</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot checked="indeterminate" />
					<span className="text-xs text-text-sub-600">Indeterminate</span>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot disabled />
					<span className="text-xs text-text-sub-600">Disabled</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot disabled defaultChecked />
					<span className="text-xs text-text-sub-600">Disabled Checked</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<CheckboxRoot hasError />
					<span className="text-xs text-text-sub-600">Error</span>
				</div>
			</div>
		</div>
	),
}

// Form example
export const FormExample: Story = {
	render: function FormExampleStory() {
		const [termsAccepted, setTermsAccepted] = useState(false)
		const [privacyAccepted, setPrivacyAccepted] = useState(false)
		const [newsletterOptIn, setNewsletterOptIn] = useState(true)

		return (
			<div className="flex flex-col gap-4 w-96 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
				<h3 className="text-label-lg text-text-strong-950">Consent Settings</h3>
				<div className="flex flex-col gap-3">
					<LabeledCheckbox
						checked={termsAccepted}
						onCheckedChange={(value) => setTermsAccepted(value === true)}
						label="I agree to the Terms of Service"
						hasError={!termsAccepted}
					/>
					<LabeledCheckbox
						checked={privacyAccepted}
						onCheckedChange={(value) => setPrivacyAccepted(value === true)}
						label="I agree to the Privacy Policy"
						hasError={!privacyAccepted}
					/>
					<LabeledCheckbox
						checked={newsletterOptIn}
						onCheckedChange={(value) => setNewsletterOptIn(value === true)}
						label="Subscribe to newsletter"
						description="Get weekly updates about new features and tips"
					/>
				</div>
				{(!termsAccepted || !privacyAccepted) && (
					<p className="text-sm text-error-base">
						Please accept the required terms to continue
					</p>
				)}
			</div>
		)
	},
}
