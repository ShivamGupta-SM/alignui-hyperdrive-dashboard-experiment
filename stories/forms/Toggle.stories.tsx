import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Root as ToggleRoot } from "@/components/ui/forms/toggle"

const meta: Meta<typeof ToggleRoot> = {
	title: "Forms/Toggle",
	component: ToggleRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ToggleRoot>

// Basic toggle
export const Basic: Story = {
	render: function BasicToggle() {
		const [checked, setChecked] = useState(false)
		return <ToggleRoot checked={checked} onCheckedChange={setChecked} />
	},
}

// With label
export const WithLabel: Story = {
	render: function WithLabelToggle() {
		const [checked, setChecked] = useState(false)
		return (
			<ToggleRoot
				checked={checked}
				onCheckedChange={setChecked}
				label="Enable notifications"
			/>
		)
	},
}

// With label and hint
export const WithLabelAndHint: Story = {
	render: function WithLabelHintToggle() {
		const [checked, setChecked] = useState(true)
		return (
			<ToggleRoot
				checked={checked}
				onCheckedChange={setChecked}
				label="Email notifications"
				hint="Receive email updates about your account activity"
			/>
		)
	},
}

// Sizes
export const Sizes: Story = {
	render: function SizesToggle() {
		const [small, setSmall] = useState(true)
		const [medium, setMedium] = useState(true)

		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-label-xs text-text-sub-600">Small</span>
					<ToggleRoot
						size="small"
						checked={small}
						onCheckedChange={setSmall}
						label="Small toggle"
						hint="This is a small toggle"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-label-xs text-text-sub-600">Medium</span>
					<ToggleRoot
						size="medium"
						checked={medium}
						onCheckedChange={setMedium}
						label="Medium toggle"
						hint="This is a medium toggle"
					/>
				</div>
			</div>
		)
	},
}

// Variants
export const Variants: Story = {
	render: function VariantsToggle() {
		const [default1, setDefault1] = useState(true)
		const [slim1, setSlim1] = useState(true)

		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-label-xs text-text-sub-600">Default Variant</span>
					<ToggleRoot
						variant="default"
						checked={default1}
						onCheckedChange={setDefault1}
						label="Default toggle"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-label-xs text-text-sub-600">Slim Variant</span>
					<ToggleRoot
						variant="slim"
						checked={slim1}
						onCheckedChange={setSlim1}
						label="Slim toggle"
					/>
				</div>
			</div>
		)
	},
}

// Disabled state
export const DisabledState: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<ToggleRoot
				disabled
				checked={false}
				label="Disabled (unchecked)"
				hint="This toggle is disabled"
			/>
			<ToggleRoot
				disabled
				checked
				label="Disabled (checked)"
				hint="This toggle is disabled"
			/>
		</div>
	),
}

// Settings example
export const SettingsExample: Story = {
	render: function SettingsToggles() {
		const [notifications, setNotifications] = useState(true)
		const [email, setEmail] = useState(true)
		const [sms, setSms] = useState(false)
		const [marketing, setMarketing] = useState(false)

		return (
			<div className="w-96 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
				<h3 className="text-label-lg text-text-strong-950 mb-4">Notification Settings</h3>
				<div className="flex flex-col gap-4">
					<ToggleRoot
						checked={notifications}
						onCheckedChange={setNotifications}
						label="Push notifications"
						hint="Receive push notifications on your device"
						size="medium"
					/>
					<ToggleRoot
						checked={email}
						onCheckedChange={setEmail}
						label="Email notifications"
						hint="Receive email updates about your account"
						size="medium"
					/>
					<ToggleRoot
						checked={sms}
						onCheckedChange={setSms}
						label="SMS notifications"
						hint="Receive SMS alerts for important updates"
						size="medium"
					/>
					<ToggleRoot
						checked={marketing}
						onCheckedChange={setMarketing}
						label="Marketing emails"
						hint="Receive emails about new features and promotions"
						size="medium"
					/>
				</div>
			</div>
		)
	},
}

// Privacy settings example
export const PrivacySettings: Story = {
	render: function PrivacyToggles() {
		const [profilePublic, setProfilePublic] = useState(true)
		const [activityStatus, setActivityStatus] = useState(true)
		const [searchable, setSearchable] = useState(false)

		return (
			<div className="w-96 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
				<h3 className="text-label-lg text-text-strong-950 mb-4">Privacy Settings</h3>
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-label-sm text-text-strong-950">Public profile</span>
							<span className="text-paragraph-xs text-text-sub-600">
								Allow others to see your profile
							</span>
						</div>
						<ToggleRoot
							checked={profilePublic}
							onCheckedChange={setProfilePublic}
							variant="slim"
						/>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-label-sm text-text-strong-950">Activity status</span>
							<span className="text-paragraph-xs text-text-sub-600">
								Show when you&apos;re active
							</span>
						</div>
						<ToggleRoot
							checked={activityStatus}
							onCheckedChange={setActivityStatus}
							variant="slim"
						/>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-label-sm text-text-strong-950">Searchable</span>
							<span className="text-paragraph-xs text-text-sub-600">
								Allow others to find you by email
							</span>
						</div>
						<ToggleRoot
							checked={searchable}
							onCheckedChange={setSearchable}
							variant="slim"
						/>
					</div>
				</div>
			</div>
		)
	},
}

// All states comparison
export const AllStates: Story = {
	render: function AllStatesToggle() {
		const [checked1, setChecked1] = useState(false)
		const [checked2, setChecked2] = useState(true)

		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<span className="text-label-xs text-text-sub-600">Unchecked</span>
					<ToggleRoot
						checked={checked1}
						onCheckedChange={setChecked1}
						label="Unchecked toggle"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-label-xs text-text-sub-600">Checked</span>
					<ToggleRoot
						checked={checked2}
						onCheckedChange={setChecked2}
						label="Checked toggle"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-label-xs text-text-sub-600">Disabled Unchecked</span>
					<ToggleRoot disabled checked={false} label="Disabled unchecked" />
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-label-xs text-text-sub-600">Disabled Checked</span>
					<ToggleRoot disabled checked label="Disabled checked" />
				</div>
			</div>
		)
	},
}
