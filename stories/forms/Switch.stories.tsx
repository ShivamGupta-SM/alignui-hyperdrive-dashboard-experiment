import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Root as SwitchRoot, LabeledSwitch, SwitchGroup } from "@/components/ui/forms/switch"

const meta: Meta<typeof SwitchRoot> = {
	title: "Forms/Switch",
	component: SwitchRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SwitchRoot>

// Basic switch
export const Basic: Story = {
	render: function BasicSwitch() {
		const [checked, setChecked] = useState(false)
		return <SwitchRoot checked={checked} onCheckedChange={setChecked} />
	},
}

// Sizes
export const Sizes: Story = {
	render: function SizesSwitch() {
		const [sm, setSm] = useState(true)
		const [md, setMd] = useState(true)
		const [lg, setLg] = useState(true)

		return (
			<div className="flex items-center gap-6">
				<div className="flex flex-col items-center gap-2">
					<SwitchRoot size="sm" checked={sm} onCheckedChange={setSm} />
					<span className="text-xs text-text-sub-600">Small</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<SwitchRoot size="md" checked={md} onCheckedChange={setMd} />
					<span className="text-xs text-text-sub-600">Medium</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<SwitchRoot size="lg" checked={lg} onCheckedChange={setLg} />
					<span className="text-xs text-text-sub-600">Large</span>
				</div>
			</div>
		)
	},
}

// Disabled
export const Disabled: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<div className="flex flex-col items-center gap-2">
				<SwitchRoot disabled />
				<span className="text-xs text-text-sub-600">Disabled Off</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SwitchRoot disabled defaultChecked />
				<span className="text-xs text-text-sub-600">Disabled On</span>
			</div>
		</div>
	),
}

// With error
export const WithError: Story = {
	render: function ErrorSwitch() {
		const [checked, setChecked] = useState(false)
		return (
			<div className="flex flex-col gap-2">
				<SwitchRoot
					checked={checked}
					onCheckedChange={setChecked}
					hasError
					errorId="switch-error"
				/>
				<span id="switch-error" className="text-error-base text-sm">
					This field is required
				</span>
			</div>
		)
	},
}

// Labeled switch
export const Labeled: Story = {
	render: function LabeledSwitchStory() {
		const [checked, setChecked] = useState(false)
		return (
			<LabeledSwitch
				checked={checked}
				onCheckedChange={setChecked}
				label="Enable notifications"
			/>
		)
	},
}

// Labeled with description
export const LabeledWithDescription: Story = {
	render: function LabeledWithDescStory() {
		const [checked, setChecked] = useState(true)
		return (
			<LabeledSwitch
				checked={checked}
				onCheckedChange={setChecked}
				label="Email notifications"
				description="Receive email updates about your account activity"
			/>
		)
	},
}

// Label position
export const LabelPosition: Story = {
	render: function LabelPositionStory() {
		const [left, setLeft] = useState(true)
		const [right, setRight] = useState(true)

		return (
			<div className="flex flex-col gap-4">
				<LabeledSwitch
					checked={right}
					onCheckedChange={setRight}
					label="Label on right"
					labelPosition="right"
				/>
				<LabeledSwitch
					checked={left}
					onCheckedChange={setLeft}
					label="Label on left"
					labelPosition="left"
				/>
			</div>
		)
	},
}

// Switch group
export const Group: Story = {
	render: function SwitchGroupStory() {
		const [email, setEmail] = useState(true)
		const [sms, setSms] = useState(false)
		const [push, setPush] = useState(false)

		return (
			<SwitchGroup label="Notification Settings">
				<LabeledSwitch
					checked={email}
					onCheckedChange={setEmail}
					label="Email"
					description="Get notified via email"
				/>
				<LabeledSwitch
					checked={sms}
					onCheckedChange={setSms}
					label="SMS"
					description="Get notified via text message"
				/>
				<LabeledSwitch
					checked={push}
					onCheckedChange={setPush}
					label="Push notifications"
					description="Get notified on your device"
				/>
			</SwitchGroup>
		)
	},
}

// Form example
export const FormExample: Story = {
	render: function FormExampleStory() {
		const [darkMode, setDarkMode] = useState(false)
		const [autoSave, setAutoSave] = useState(true)
		const [analytics, setAnalytics] = useState(false)

		return (
			<div className="w-80 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
				<h3 className="text-label-lg text-text-strong-950 mb-4">Settings</h3>
				<div className="flex flex-col gap-4">
					<LabeledSwitch
						checked={darkMode}
						onCheckedChange={setDarkMode}
						label="Dark mode"
						description="Use dark theme"
					/>
					<LabeledSwitch
						checked={autoSave}
						onCheckedChange={setAutoSave}
						label="Auto-save"
						description="Automatically save changes"
					/>
					<LabeledSwitch
						checked={analytics}
						onCheckedChange={setAnalytics}
						label="Analytics"
						description="Allow anonymous usage data"
					/>
				</div>
			</div>
		)
	},
}
