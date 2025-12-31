import type { Meta, StoryObj } from "@storybook/react"
import { Root as SocialButtonRoot, Icon as SocialButtonIcon } from "@/components/ui/primitives/social-button"
import {
	AppleLogo,
	XLogo,
	GoogleLogo,
	FacebookLogo,
	LinkedinLogo,
	GithubLogo,
	DropboxLogo,
} from "@phosphor-icons/react"

const meta: Meta<typeof SocialButtonRoot> = {
	title: "Primitives/SocialButton",
	component: SocialButtonRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		brand: {
			control: "select",
			options: ["apple", "twitter", "google", "facebook", "linkedin", "github", "dropbox"],
		},
		mode: {
			control: "select",
			options: ["filled", "stroke"],
		},
	},
}

export default meta
type Story = StoryObj<typeof SocialButtonRoot>

// Basic social button
export const Basic: Story = {
	render: () => (
		<SocialButtonRoot brand="google" mode="filled">
			<SocialButtonIcon as={GoogleLogo} />
			Sign in with Google
		</SocialButtonRoot>
	),
}

// Filled mode - all brands
export const FilledMode: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<SocialButtonRoot brand="apple" mode="filled">
				<SocialButtonIcon as={AppleLogo} weight="fill" />
				Continue with Apple
			</SocialButtonRoot>
			<SocialButtonRoot brand="twitter" mode="filled">
				<SocialButtonIcon as={XLogo} weight="fill" />
				Continue with X
			</SocialButtonRoot>
			<SocialButtonRoot brand="google" mode="filled">
				<SocialButtonIcon as={GoogleLogo} weight="fill" />
				Continue with Google
			</SocialButtonRoot>
			<SocialButtonRoot brand="facebook" mode="filled">
				<SocialButtonIcon as={FacebookLogo} weight="fill" />
				Continue with Facebook
			</SocialButtonRoot>
			<SocialButtonRoot brand="linkedin" mode="filled">
				<SocialButtonIcon as={LinkedinLogo} weight="fill" />
				Continue with LinkedIn
			</SocialButtonRoot>
			<SocialButtonRoot brand="github" mode="filled">
				<SocialButtonIcon as={GithubLogo} weight="fill" />
				Continue with GitHub
			</SocialButtonRoot>
			<SocialButtonRoot brand="dropbox" mode="filled">
				<SocialButtonIcon as={DropboxLogo} weight="fill" />
				Continue with Dropbox
			</SocialButtonRoot>
		</div>
	),
}

// Stroke mode - all brands
export const StrokeMode: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<SocialButtonRoot brand="apple" mode="stroke">
				<SocialButtonIcon as={AppleLogo} weight="fill" />
				Continue with Apple
			</SocialButtonRoot>
			<SocialButtonRoot brand="twitter" mode="stroke">
				<SocialButtonIcon as={XLogo} weight="fill" />
				Continue with X
			</SocialButtonRoot>
			<SocialButtonRoot brand="google" mode="stroke">
				<SocialButtonIcon as={GoogleLogo} weight="fill" />
				Continue with Google
			</SocialButtonRoot>
			<SocialButtonRoot brand="facebook" mode="stroke">
				<SocialButtonIcon as={FacebookLogo} weight="fill" />
				Continue with Facebook
			</SocialButtonRoot>
			<SocialButtonRoot brand="linkedin" mode="stroke">
				<SocialButtonIcon as={LinkedinLogo} weight="fill" />
				Continue with LinkedIn
			</SocialButtonRoot>
			<SocialButtonRoot brand="github" mode="stroke">
				<SocialButtonIcon as={GithubLogo} weight="fill" />
				Continue with GitHub
			</SocialButtonRoot>
			<SocialButtonRoot brand="dropbox" mode="stroke">
				<SocialButtonIcon as={DropboxLogo} weight="fill" />
				Continue with Dropbox
			</SocialButtonRoot>
		</div>
	),
}

// Icon only buttons
export const IconOnly: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Filled</span>
				<div className="flex items-center gap-4">
					<SocialButtonRoot brand="apple" mode="filled" aria-label="Apple">
						<SocialButtonIcon as={AppleLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="google" mode="filled" aria-label="Google">
						<SocialButtonIcon as={GoogleLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="facebook" mode="filled" aria-label="Facebook">
						<SocialButtonIcon as={FacebookLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="github" mode="filled" aria-label="GitHub">
						<SocialButtonIcon as={GithubLogo} weight="fill" />
					</SocialButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Stroke</span>
				<div className="flex items-center gap-4">
					<SocialButtonRoot brand="apple" mode="stroke" aria-label="Apple">
						<SocialButtonIcon as={AppleLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="google" mode="stroke" aria-label="Google">
						<SocialButtonIcon as={GoogleLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="facebook" mode="stroke" aria-label="Facebook">
						<SocialButtonIcon as={FacebookLogo} weight="fill" />
					</SocialButtonRoot>
					<SocialButtonRoot brand="github" mode="stroke" aria-label="GitHub">
						<SocialButtonIcon as={GithubLogo} weight="fill" />
					</SocialButtonRoot>
				</div>
			</div>
		</div>
	),
}

// Login form example
export const LoginFormExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 text-center mb-6">Sign in</h2>

			<div className="space-y-3 mb-6">
				<SocialButtonRoot brand="google" mode="stroke" className="w-full">
					<SocialButtonIcon as={GoogleLogo} weight="fill" />
					Continue with Google
				</SocialButtonRoot>
				<SocialButtonRoot brand="apple" mode="stroke" className="w-full">
					<SocialButtonIcon as={AppleLogo} weight="fill" />
					Continue with Apple
				</SocialButtonRoot>
				<SocialButtonRoot brand="github" mode="stroke" className="w-full">
					<SocialButtonIcon as={GithubLogo} weight="fill" />
					Continue with GitHub
				</SocialButtonRoot>
			</div>

			<div className="flex items-center gap-4 mb-6">
				<div className="flex-1 h-px bg-stroke-soft-200" />
				<span className="text-paragraph-xs text-text-soft-400">or</span>
				<div className="flex-1 h-px bg-stroke-soft-200" />
			</div>

			<div className="space-y-4">
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-strong-950">Email</label>
					<input
						type="email"
						placeholder="you@example.com"
						className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</div>
				<button className="w-full py-2.5 rounded-lg bg-primary-base text-static-white text-label-sm hover:bg-primary-darker transition-colors">
					Continue with email
				</button>
			</div>
		</div>
	),
}

// Signup form example
export const SignupFormExample: Story = {
	render: () => (
		<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 text-center mb-2">Create account</h2>
			<p className="text-paragraph-sm text-text-sub-600 text-center mb-6">
				Get started for free
			</p>

			<div className="space-y-3">
				<SocialButtonRoot brand="google" mode="filled" className="w-full">
					<SocialButtonIcon as={GoogleLogo} weight="fill" />
					Sign up with Google
				</SocialButtonRoot>
				<SocialButtonRoot brand="facebook" mode="filled" className="w-full">
					<SocialButtonIcon as={FacebookLogo} weight="fill" />
					Sign up with Facebook
				</SocialButtonRoot>
				<SocialButtonRoot brand="linkedin" mode="filled" className="w-full">
					<SocialButtonIcon as={LinkedinLogo} weight="fill" />
					Sign up with LinkedIn
				</SocialButtonRoot>
			</div>

			<p className="text-paragraph-xs text-text-soft-400 text-center mt-6">
				By signing up, you agree to our Terms of Service and Privacy Policy.
			</p>
		</div>
	),
}

// Connect accounts example
export const ConnectAccountsExample: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-4 border-b border-stroke-soft-200">
				<h3 className="text-label-md text-text-strong-950">Connected Accounts</h3>
				<p className="text-paragraph-xs text-text-sub-600">Connect your social accounts</p>
			</div>
			<div className="divide-y divide-stroke-soft-200">
				{[
					{ brand: "google" as const, name: "Google", icon: GoogleLogo, connected: true, email: "john@gmail.com" },
					{ brand: "github" as const, name: "GitHub", icon: GithubLogo, connected: true, email: "@johndoe" },
					{ brand: "twitter" as const, name: "X (Twitter)", icon: XLogo, connected: false },
					{ brand: "linkedin" as const, name: "LinkedIn", icon: LinkedinLogo, connected: false },
				].map((item) => (
					<div key={item.brand} className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-full bg-bg-weak-50 flex items-center justify-center">
								<item.icon className="size-5" weight="fill" />
							</div>
							<div>
								<p className="text-label-sm text-text-strong-950">{item.name}</p>
								{item.connected && item.email && (
									<p className="text-paragraph-xs text-text-sub-600">{item.email}</p>
								)}
							</div>
						</div>
						{item.connected ? (
							<button className="text-label-xs text-error-base hover:underline">
								Disconnect
							</button>
						) : (
							<button className="px-3 py-1.5 rounded-lg border border-stroke-soft-200 text-label-xs text-text-strong-950 hover:bg-bg-weak-50">
								Connect
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	),
}

// Grid layout
export const GridLayout: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-3 w-80">
			<SocialButtonRoot brand="google" mode="stroke" className="w-full">
				<SocialButtonIcon as={GoogleLogo} weight="fill" />
				Google
			</SocialButtonRoot>
			<SocialButtonRoot brand="facebook" mode="stroke" className="w-full">
				<SocialButtonIcon as={FacebookLogo} weight="fill" />
				Facebook
			</SocialButtonRoot>
			<SocialButtonRoot brand="apple" mode="stroke" className="w-full">
				<SocialButtonIcon as={AppleLogo} weight="fill" />
				Apple
			</SocialButtonRoot>
			<SocialButtonRoot brand="github" mode="stroke" className="w-full">
				<SocialButtonIcon as={GithubLogo} weight="fill" />
				GitHub
			</SocialButtonRoot>
		</div>
	),
}

// Mode comparison
export const ModeComparison: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-8">
			<div className="flex flex-col gap-4">
				<span className="text-label-sm text-text-sub-600 border-b pb-2">Filled Mode</span>
				<SocialButtonRoot brand="google" mode="filled">
					<SocialButtonIcon as={GoogleLogo} weight="fill" />
					Google
				</SocialButtonRoot>
				<SocialButtonRoot brand="facebook" mode="filled">
					<SocialButtonIcon as={FacebookLogo} weight="fill" />
					Facebook
				</SocialButtonRoot>
				<SocialButtonRoot brand="github" mode="filled">
					<SocialButtonIcon as={GithubLogo} weight="fill" />
					GitHub
				</SocialButtonRoot>
			</div>
			<div className="flex flex-col gap-4">
				<span className="text-label-sm text-text-sub-600 border-b pb-2">Stroke Mode</span>
				<SocialButtonRoot brand="google" mode="stroke">
					<SocialButtonIcon as={GoogleLogo} weight="fill" />
					Google
				</SocialButtonRoot>
				<SocialButtonRoot brand="facebook" mode="stroke">
					<SocialButtonIcon as={FacebookLogo} weight="fill" />
					Facebook
				</SocialButtonRoot>
				<SocialButtonRoot brand="github" mode="stroke">
					<SocialButtonIcon as={GithubLogo} weight="fill" />
					GitHub
				</SocialButtonRoot>
			</div>
		</div>
	),
}
