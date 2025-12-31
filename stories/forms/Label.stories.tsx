import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as LabelRoot,
	Asterisk as LabelAsterisk,
	Sub as LabelSub,
} from "@/components/ui/forms/label"

const meta: Meta<typeof LabelRoot> = {
	title: "Forms/Label",
	component: LabelRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof LabelRoot>

// Basic label
export const Basic: Story = {
	render: () => <LabelRoot>Email address</LabelRoot>,
}

// Label with asterisk (required)
export const Required: Story = {
	render: () => (
		<LabelRoot>
			Email address
			<LabelAsterisk />
		</LabelRoot>
	),
}

// Label with sub text
export const WithSubText: Story = {
	render: () => (
		<div className="flex flex-col gap-1">
			<LabelRoot>
				Password
				<LabelSub>(optional)</LabelSub>
			</LabelRoot>
		</div>
	),
}

// Label with custom asterisk
export const CustomAsterisk: Story = {
	render: () => (
		<LabelRoot>
			Full name
			<LabelAsterisk> (required)</LabelAsterisk>
		</LabelRoot>
	),
}

// Disabled label
export const Disabled: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<LabelRoot disabled>
				Disabled label
				<LabelAsterisk />
			</LabelRoot>
			<LabelRoot disabled>
				Disabled with sub
				<LabelSub>(cannot edit)</LabelSub>
			</LabelRoot>
		</div>
	),
}

// All label variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Basic</span>
				<LabelRoot>Username</LabelRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Required</span>
				<LabelRoot>
					Email
					<LabelAsterisk />
				</LabelRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">With sub text</span>
				<LabelRoot>
					Phone number
					<LabelSub>(optional)</LabelSub>
				</LabelRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Required with sub</span>
				<LabelRoot>
					Company name
					<LabelAsterisk />
					<LabelSub>- for business accounts</LabelSub>
				</LabelRoot>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-paragraph-xs text-text-sub-600">Disabled</span>
				<LabelRoot disabled>
					Locked field
					<LabelAsterisk />
				</LabelRoot>
			</div>
		</div>
	),
}

// With form field example
export const FormFieldExample: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<LabelRoot htmlFor="email">
					Email address
					<LabelAsterisk />
				</LabelRoot>
				<input
					id="email"
					type="email"
					placeholder="you@example.com"
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<LabelRoot htmlFor="password">
					Password
					<LabelSub>(min. 8 characters)</LabelSub>
				</LabelRoot>
				<input
					id="password"
					type="password"
					placeholder="Enter password"
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<LabelRoot htmlFor="company" disabled>
					Company
					<LabelSub>(read-only)</LabelSub>
				</LabelRoot>
				<input
					id="company"
					type="text"
					value="Acme Inc."
					disabled
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm bg-bg-weak-50 text-text-disabled-300"
				/>
			</div>
		</div>
	),
}

// Registration form example
export const RegistrationFormExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-6">Create account</h2>
			<form className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="flex flex-col gap-1.5">
						<LabelRoot htmlFor="firstName">
							First name
							<LabelAsterisk />
						</LabelRoot>
						<input
							id="firstName"
							type="text"
							className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<LabelRoot htmlFor="lastName">
							Last name
							<LabelAsterisk />
						</LabelRoot>
						<input
							id="lastName"
							type="text"
							className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<LabelRoot htmlFor="regEmail">
						Email
						<LabelAsterisk />
					</LabelRoot>
					<input
						id="regEmail"
						type="email"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<LabelRoot htmlFor="phone">
						Phone number
						<LabelSub>(optional)</LabelSub>
					</LabelRoot>
					<input
						id="phone"
						type="tel"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<LabelRoot htmlFor="regPassword">
						Password
						<LabelAsterisk />
					</LabelRoot>
					<input
						id="regPassword"
						type="password"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
					<span className="text-paragraph-xs text-text-sub-600">
						Must be at least 8 characters with 1 uppercase and 1 number
					</span>
				</div>
			</form>
		</div>
	),
}

// Inline labels example
export const InlineLabelsExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Notification settings</h3>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<LabelRoot htmlFor="emailNotif">Email notifications</LabelRoot>
					<input id="emailNotif" type="checkbox" className="size-5 rounded" defaultChecked />
				</div>
				<div className="flex items-center justify-between">
					<LabelRoot htmlFor="smsNotif">
						SMS notifications
						<LabelSub>(charges may apply)</LabelSub>
					</LabelRoot>
					<input id="smsNotif" type="checkbox" className="size-5 rounded" />
				</div>
				<div className="flex items-center justify-between">
					<LabelRoot htmlFor="pushNotif" disabled>
						Push notifications
						<LabelSub>(coming soon)</LabelSub>
					</LabelRoot>
					<input id="pushNotif" type="checkbox" className="size-5 rounded" disabled />
				</div>
			</div>
		</div>
	),
}
