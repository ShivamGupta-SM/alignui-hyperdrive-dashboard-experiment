import type { Meta, StoryObj } from "@storybook/react"
import { Root as Divider } from "@/components/ui/layout/divider"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof Divider> = {
	title: "Layout/Divider",
	component: Divider,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Divider>

// Line variant (default)
export const Line: Story = {
	render: () => (
		<div className="w-80">
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				This is some content above the divider.
			</p>
			<Divider variant="line" />
			<p className="text-paragraph-sm text-text-sub-600 mt-4">
				This is some content below the divider.
			</p>
		</div>
	),
}

// Line with spacing
export const LineSpacing: Story = {
	render: () => (
		<div className="w-80">
			<p className="text-paragraph-sm text-text-sub-600 mb-2">Content above</p>
			<Divider variant="line-spacing" />
			<p className="text-paragraph-sm text-text-sub-600 mt-2">Content below</p>
		</div>
	),
}

// Line with text
export const LineText: Story = {
	render: () => (
		<div className="w-80">
			<Divider variant="line-text">OR</Divider>
		</div>
	),
}

// Content variant
export const Content: Story = {
	render: () => (
		<div className="w-96">
			<Divider variant="content">
				<ButtonRoot variant="basic" size="small">
					Show more
				</ButtonRoot>
			</Divider>
		</div>
	),
}

// Text variant
export const Text: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-4">
			<Divider variant="text">Section 1</Divider>
			<p className="text-paragraph-sm text-text-sub-600">Content for section 1</p>
			<Divider variant="text">Section 2</Divider>
			<p className="text-paragraph-sm text-text-sub-600">Content for section 2</p>
		</div>
	),
}

// Solid text variant
export const SolidText: Story = {
	render: () => (
		<div className="w-80">
			<Divider variant="solid-text">NEW SECTION</Divider>
		</div>
	),
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="w-96 flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Line</span>
				<Divider variant="line" />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Line Spacing</span>
				<Divider variant="line-spacing" />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Line Text</span>
				<Divider variant="line-text">OR</Divider>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Content</span>
				<Divider variant="content">
					<span className="text-label-sm text-primary-base">View all</span>
				</Divider>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Text</span>
				<Divider variant="text">Section</Divider>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Solid Text</span>
				<Divider variant="solid-text">IMPORTANT</Divider>
			</div>
		</div>
	),
}

// Login form example
export const LoginFormExample: Story = {
	render: () => (
		<div className="w-80 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<h3 className="text-heading-sm text-text-strong-950 mb-6 text-center">Welcome back</h3>
			<div className="flex flex-col gap-3 mb-6">
				<button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-stroke-soft-200 text-label-sm hover:bg-bg-weak-50 transition-colors">
					Continue with Google
				</button>
				<button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-stroke-soft-200 text-label-sm hover:bg-bg-weak-50 transition-colors">
					Continue with GitHub
				</button>
			</div>
			<Divider variant="line-text">or continue with email</Divider>
			<div className="mt-6 flex flex-col gap-4">
				<input
					type="email"
					placeholder="Email"
					className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
				<input
					type="password"
					placeholder="Password"
					className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
				<ButtonRoot variant="primary" className="w-full">
					Sign in
				</ButtonRoot>
			</div>
		</div>
	),
}

// Settings sections
export const SettingsSections: Story = {
	render: () => (
		<div className="w-96 p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			<h3 className="text-heading-sm text-text-strong-950 mb-4">Account Settings</h3>

			<Divider variant="text">Profile</Divider>
			<div className="py-4">
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your public profile information
				</p>
			</div>

			<Divider variant="text">Security</Divider>
			<div className="py-4">
				<p className="text-paragraph-sm text-text-sub-600">
					Update password and security settings
				</p>
			</div>

			<Divider variant="text">Notifications</Divider>
			<div className="py-4">
				<p className="text-paragraph-sm text-text-sub-600">
					Configure email and push notifications
				</p>
			</div>
		</div>
	),
}
