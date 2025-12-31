import Link from "next/link"
import ThemeSwitch from "@/components/shared/theme-switch"
import { Logo } from "@/components/ui/branding/logo"
import { CheckCircle, ShieldCheck, Lightning, Wallet } from "@phosphor-icons/react/dist/ssr"

// Onboarding layout uses ISR - static branding panel can be cached
// Dynamic content (form state) is handled client-side
// Middleware handles auth protection at Edge level
export const revalidate = 60 // Revalidate layout every 60 seconds

const FEATURES = [
	{
		id: "quick-setup",
		icon: CheckCircle,
		title: "Quick Setup",
		description: "Get started in minutes",
	},
	{
		id: "gst-verified",
		icon: ShieldCheck,
		title: "GST Verified",
		description: "Secure business verification",
	},
	{
		id: "launch-fast",
		icon: Lightning,
		title: "Launch Fast",
		description: "Go live same day",
	},
	{
		id: "easy-payments",
		icon: Wallet,
		title: "Easy Payments",
		description: "Transparent pricing",
	},
]

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen bg-bg-white-0">
			{/* Left Panel - Branding (hidden on mobile) */}
			<div className="hidden lg:flex lg:w-[420px] xl:w-[480px] 2xl:w-[520px] bg-linear-to-br from-primary-base via-primary-darker to-primary-darkest relative overflow-hidden shrink-0">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0 bg-dot-pattern-sm" />
				</div>

				{/* Floating Orbs */}
				<div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
				<div className="absolute bottom-32 left-8 w-80 h-80 bg-feature-base/15 rounded-full blur-3xl" />

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-between p-8 lg:p-10 xl:p-12 w-full">
					{/* Logo */}
					<Link href="/" className="transition-opacity hover:opacity-90">
						<Logo width={150} height={38} forceTheme="dark" />
					</Link>

					{/* Main Content */}
					<div className="flex-1 flex flex-col justify-center py-10">
						<h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
							Set up your
							<br />
							<span className="text-white/90">Brand Account</span>
						</h1>
						<p className="text-base lg:text-lg text-white/75 max-w-sm leading-relaxed">
							Complete your profile to start creating influencer campaigns and reaching your audience.
						</p>

						{/* Features */}
						<div className="mt-10 grid grid-cols-2 gap-4">
							{FEATURES.map((feature) => (
								<div
									key={feature.id}
									className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm"
								>
									<div className="flex items-center justify-center size-9 rounded-lg bg-white/10">
										<feature.icon weight="duotone" className="size-5 text-white" />
									</div>
									<div className="min-w-0">
										<div className="text-label-sm font-semibold text-white truncate">
											{feature.title}
										</div>
										<div className="text-paragraph-xs text-white/60 truncate">
											{feature.description}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between text-paragraph-xs text-white/50">
						<span>&copy; {new Date().getFullYear()} Hypedrive</span>
						<div className="flex items-center gap-4">
							<Link href="/help" className="hover:text-white/80 transition-colors">
								Help
							</Link>
							<Link href="/terms" className="hover:text-white/80 transition-colors">
								Terms
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Form */}
			<div className="flex-1 flex flex-col min-h-screen">
				{/* Mobile Header */}
				<header className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stroke-soft-200 bg-bg-white-0 shrink-0">
					<Link href="/">
						<Logo width={120} height={30} />
					</Link>
					<ThemeSwitch />
				</header>

				{/* Desktop Header */}
				<header className="hidden lg:flex items-center justify-end px-8 py-5 shrink-0">
					<ThemeSwitch />
				</header>

				{/* Main Content - Scrollable */}
				<main className="flex-1 flex flex-col overflow-y-auto">
					<div className="flex-1 flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
						<div className="w-full max-w-xl">
							{children}
						</div>
					</div>

					{/* Mobile Footer */}
					<footer className="lg:hidden py-4 px-4 sm:px-6 text-center border-t border-stroke-soft-200/50 bg-bg-weak-50/30">
						<p className="text-paragraph-xs text-text-sub-600">
							Need help?{" "}
							<Link href="/help" className="text-primary-base hover:underline font-medium">
								Contact Support
							</Link>
						</p>
					</footer>
				</main>
			</div>
		</div>
	)
}
