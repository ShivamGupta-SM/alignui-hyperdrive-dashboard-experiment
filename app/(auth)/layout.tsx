import Link from "next/link"
import { Logo } from "@/components/ui/branding/logo"
import { Sparkle, ChartLineUp, Users, ShieldCheck, Rocket } from "@phosphor-icons/react/dist/ssr"
import { AuthHeader } from "@/components/auth/auth-header"

// Auth pages require dynamic rendering due to client-side providers

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div 
			className="flex min-h-screen bg-bg-white-0"
			suppressHydrationWarning
		>
			{/* Left Pane - Visual/Branding (Hidden on mobile, visible on lg+) */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary-base via-primary-darker to-primary-darkest">
				{/* Animated background pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0" style={{
						backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
						backgroundSize: '40px 40px'
					}} />
				</div>
				
				{/* Floating gradient orbs */}
				<div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-32 left-16 w-96 h-96 bg-feature-base/20 rounded-full blur-3xl animate-pulse delay-1000" />
				<div className="absolute top-1/2 left-1/3 w-64 h-64 bg-success-base/15 rounded-full blur-2xl animate-pulse delay-500" />
				
				{/* Content */}
				<div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
					{/* Logo */}
					<Link href="/" className="transition-opacity hover:opacity-90" suppressHydrationWarning>
						<Logo width={160} height={40} forceTheme="dark" />
					</Link>
					
					{/* Main content */}
					<div className="space-y-8 max-w-md">
						<div className="space-y-4">
							<h2 className="text-title-h2 font-bold text-white">
								The Influencer Marketing Platform That Actually Works
							</h2>
							<p className="text-paragraph-lg text-white/80">
								Launch, manage, and scale creator campaigns with automated enrollment tracking and real-time wallet management.
							</p>
						</div>
						
						{/* Feature highlights */}
						<div className="grid grid-cols-2 gap-4 pt-4">
							<div className="flex items-start gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
									<ChartLineUp weight="duotone" className="size-5 text-white" />
								</div>
								<div>
									<div className="text-label-sm font-semibold text-white mb-1">Real-time Analytics</div>
									<div className="text-paragraph-xs text-white/70">Track performance instantly</div>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
									<Users weight="duotone" className="size-5 text-white" />
								</div>
								<div>
									<div className="text-label-sm font-semibold text-white mb-1">Team Collaboration</div>
									<div className="text-paragraph-xs text-white/70">Work together seamlessly</div>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
									<ShieldCheck weight="duotone" className="size-5 text-white" />
								</div>
								<div>
									<div className="text-label-sm font-semibold text-white mb-1">Enterprise Security</div>
									<div className="text-paragraph-xs text-white/70">Bank-grade protection</div>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
									<Rocket weight="duotone" className="size-5 text-white" />
								</div>
								<div>
									<div className="text-label-sm font-semibold text-white mb-1">Scale Fast</div>
									<div className="text-paragraph-xs text-white/70">Grow without limits</div>
								</div>
							</div>
						</div>
					</div>
					
					{/* Footer */}
					<div className="text-paragraph-xs text-white/60">
						Trusted by 500+ brands across India
					</div>
				</div>
			</div>

			{/* Right Pane - Form Content */}
			<div className="flex-1 lg:w-1/2 flex flex-col min-h-screen">
				{/* Mobile Header */}
				<header 
					className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-4 backdrop-blur-sm bg-bg-white-0/80 border-b border-stroke-soft-200/50"
					suppressHydrationWarning
				>
					<Link href="/" className="transition-opacity hover:opacity-80" suppressHydrationWarning>
						<Logo width={130} height={32} />
					</Link>
					<AuthHeader isMobile />
				</header>

				{/* Desktop Header */}
				<header 
					className="hidden lg:flex items-center justify-between px-8 xl:px-12 py-6"
					suppressHydrationWarning
				>
					<div className="w-40" /> {/* Spacer */}
					<AuthHeader />
				</header>

				{/* Main Content */}
				<main 
					className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:px-8 xl:px-12 lg:py-16"
					suppressHydrationWarning
				>
					<div className="w-full max-w-md">
						{children}
					</div>
				</main>

				{/* Footer */}
				<footer 
					className="py-4 sm:py-6 text-center px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-stroke-soft-200/50 bg-bg-weak-50/30"
					suppressHydrationWarning
				>
					<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
						By continuing, you agree to our{" "}
						<Link 
							href="/terms" 
							className="text-primary-base hover:text-primary-darker font-medium hover:underline transition-colors"
							suppressHydrationWarning
						>
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link 
							href="/privacy" 
							className="text-primary-base hover:text-primary-darker font-medium hover:underline transition-colors"
							suppressHydrationWarning
						>
							Privacy Policy
						</Link>
					</p>
				</footer>
			</div>
		</div>
	)
}
