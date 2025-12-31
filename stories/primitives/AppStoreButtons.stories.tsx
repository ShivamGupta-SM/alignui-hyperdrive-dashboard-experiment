import type { Meta, StoryObj } from "@storybook/react"
import { AppStoreButton, PlayStoreButton, AppStoreButtonGroup } from "@/components/ui/primitives/app-store-buttons"

const meta: Meta<typeof AppStoreButton> = {
	title: "Primitives/AppStoreButtons",
	component: AppStoreButton,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["filled", "outline"],
		},
		size: {
			control: "select",
			options: ["small", "medium", "large"],
		},
	},
}

export default meta
type Story = StoryObj<typeof AppStoreButton>

// Basic App Store button
export const BasicAppStore: Story = {
	render: () => <AppStoreButton href="https://apps.apple.com" />,
}

// Basic Play Store button
export const BasicPlayStore: Story = {
	render: () => <PlayStoreButton href="https://play.google.com" />,
}

// All sizes - App Store
export const AllSizesAppStore: Story = {
	render: () => (
		<div className="space-y-4">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small</p>
				<AppStoreButton href="https://apps.apple.com" size="small" />
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Medium (Default)</p>
				<AppStoreButton href="https://apps.apple.com" size="medium" />
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Large</p>
				<AppStoreButton href="https://apps.apple.com" size="large" />
			</div>
		</div>
	),
}

// All sizes - Play Store
export const AllSizesPlayStore: Story = {
	render: () => (
		<div className="space-y-4">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small</p>
				<PlayStoreButton href="https://play.google.com" size="small" />
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Medium (Default)</p>
				<PlayStoreButton href="https://play.google.com" size="medium" />
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Large</p>
				<PlayStoreButton href="https://play.google.com" size="large" />
			</div>
		</div>
	),
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Filled (Default)</p>
				<div className="flex gap-3">
					<AppStoreButton href="https://apps.apple.com" variant="filled" />
					<PlayStoreButton href="https://play.google.com" variant="filled" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Outline</p>
				<div className="flex gap-3">
					<AppStoreButton href="https://apps.apple.com" variant="outline" />
					<PlayStoreButton href="https://play.google.com" variant="outline" />
				</div>
			</div>
		</div>
	),
}

// Button group
export const ButtonGroup: Story = {
	render: () => (
		<AppStoreButtonGroup
			appStoreUrl="https://apps.apple.com"
			playStoreUrl="https://play.google.com"
		/>
	),
}

// Button group with sizes
export const ButtonGroupSizes: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small</p>
				<AppStoreButtonGroup
					appStoreUrl="https://apps.apple.com"
					playStoreUrl="https://play.google.com"
					size="small"
				/>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Medium</p>
				<AppStoreButtonGroup
					appStoreUrl="https://apps.apple.com"
					playStoreUrl="https://play.google.com"
					size="medium"
				/>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Large</p>
				<AppStoreButtonGroup
					appStoreUrl="https://apps.apple.com"
					playStoreUrl="https://play.google.com"
					size="large"
				/>
			</div>
		</div>
	),
}

// Button group outline variant
export const ButtonGroupOutline: Story = {
	render: () => (
		<AppStoreButtonGroup
			appStoreUrl="https://apps.apple.com"
			playStoreUrl="https://play.google.com"
			variant="outline"
		/>
	),
}

// App store only
export const AppStoreOnly: Story = {
	render: () => (
		<AppStoreButtonGroup
			appStoreUrl="https://apps.apple.com"
		/>
	),
}

// Play store only
export const PlayStoreOnly: Story = {
	render: () => (
		<AppStoreButtonGroup
			playStoreUrl="https://play.google.com"
		/>
	),
}

// Landing page hero example
export const LandingPageHeroExample: Story = {
	render: () => (
		<div className="text-center p-8 max-w-md">
			<h1 className="text-heading-xl text-text-strong-950 mb-4">
				Download Our App
			</h1>
			<p className="text-paragraph-md text-text-sub-600 mb-6">
				Get the best experience on your mobile device. Available on iOS and Android.
			</p>
			<AppStoreButtonGroup
				appStoreUrl="https://apps.apple.com"
				playStoreUrl="https://play.google.com"
				size="large"
				className="justify-center"
			/>
		</div>
	),
}

// Footer download section example
export const FooterExample: Story = {
	render: () => (
		<div className="p-6 bg-static-black rounded-xl w-80">
			<p className="text-label-sm text-static-white mb-4">Get our mobile app</p>
			<AppStoreButtonGroup
				appStoreUrl="https://apps.apple.com"
				playStoreUrl="https://play.google.com"
				size="small"
			/>
		</div>
	),
}

// Card download example
export const CardExample: Story = {
	render: () => (
		<div className="p-6 border border-stroke-soft-200 rounded-xl w-80">
			<div className="flex items-center gap-3 mb-4">
				<div className="size-12 rounded-xl bg-gradient-to-br from-primary-base to-primary-dark flex items-center justify-center">
					<span className="text-white text-heading-md">H</span>
				</div>
				<div>
					<h3 className="text-label-md text-text-strong-950">Hyperdrive</h3>
					<p className="text-paragraph-xs text-text-sub-600">Manage your brand on the go</p>
				</div>
			</div>
			<AppStoreButtonGroup
				appStoreUrl="https://apps.apple.com"
				playStoreUrl="https://play.google.com"
				size="small"
				variant="outline"
			/>
		</div>
	),
}

// Modal download example
export const ModalExample: Story = {
	render: () => (
		<div className="p-6 bg-bg-white-0 border border-stroke-soft-200 rounded-xl w-96 text-center">
			<div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-lighter to-primary-base flex items-center justify-center">
				<svg className="size-8 text-white" viewBox="0 0 24 24" fill="currentColor">
					<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
				</svg>
			</div>
			<h3 className="text-heading-md text-text-strong-950 mb-2">
				Better on mobile
			</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">
				Download our app for a smoother experience with notifications and offline access.
			</p>
			<AppStoreButtonGroup
				appStoreUrl="https://apps.apple.com"
				playStoreUrl="https://play.google.com"
				className="justify-center"
			/>
		</div>
	),
}

// Stacked layout example
export const StackedLayoutExample: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-48">
			<AppStoreButton href="https://apps.apple.com" />
			<PlayStoreButton href="https://play.google.com" />
		</div>
	),
}

// Size comparison
export const SizeComparison: Story = {
	render: () => (
		<div className="flex items-end gap-4">
			<div className="flex flex-col items-center gap-2">
				<AppStoreButton href="https://apps.apple.com" size="small" />
				<span className="text-paragraph-xs text-text-soft-400">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AppStoreButton href="https://apps.apple.com" size="medium" />
				<span className="text-paragraph-xs text-text-soft-400">Medium</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<AppStoreButton href="https://apps.apple.com" size="large" />
				<span className="text-paragraph-xs text-text-soft-400">Large</span>
			</div>
		</div>
	),
}

// QR code with buttons example
export const QRCodeWithButtonsExample: Story = {
	render: () => (
		<div className="p-6 border border-stroke-soft-200 rounded-xl w-80 text-center">
			<div className="size-32 mx-auto mb-4 bg-bg-weak-50 rounded-lg flex items-center justify-center">
				<div className="size-24 bg-static-black rounded grid grid-cols-5 grid-rows-5 gap-0.5 p-1">
					{Array.from({ length: 25 }).map((_, i) => (
						<div
							key={i}
							className={`rounded-sm ${Math.random() > 0.4 ? "bg-static-white" : "bg-static-black"}`}
						/>
					))}
				</div>
			</div>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				Scan to download or use the links below
			</p>
			<AppStoreButtonGroup
				appStoreUrl="https://apps.apple.com"
				playStoreUrl="https://play.google.com"
				size="small"
				className="justify-center"
			/>
		</div>
	),
}

// Dark background example
export const DarkBackgroundExample: Story = {
	render: () => (
		<div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
			<h2 className="text-heading-lg text-white mb-2">Get Started Today</h2>
			<p className="text-paragraph-sm text-gray-400 mb-6">
				Join millions of users who already love our app.
			</p>
			<div className="flex gap-3">
				<AppStoreButton href="https://apps.apple.com" size="large" />
				<PlayStoreButton href="https://play.google.com" size="large" />
			</div>
		</div>
	),
}
