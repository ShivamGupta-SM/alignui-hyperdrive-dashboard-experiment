import Link from "next/link"
import ThemeSwitch from "@/components/theme-switch"
import { Logo } from "@/components/ui/logo"

// Auth pages require dynamic rendering due to client-side providers
// Note: dynamic export removed - incompatible with cacheComponents

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-bg-white-0 via-primary-lighter/5 to-feature-lighter/10">
			{/* Decorative background elements */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary-base/5 rounded-full blur-3xl" />
				<div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-feature-base/5 rounded-full blur-3xl" />
			</div>

			{/* Header */}
			<header className="relative flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-sm bg-bg-white-0/80 border-b border-stroke-soft-200/50">
				<Link href="/" className="transition-opacity hover:opacity-80">
					<Logo width={130} height={32} className="sm:w-[160px] sm:h-[40px]" />
				</Link>
				<ThemeSwitch />
			</header>

			{/* Main Content */}
			<main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
				{children}
			</main>

			{/* Footer */}
			<footer className="relative py-4 sm:py-6 text-center px-4 backdrop-blur-sm bg-bg-white-0/60 border-t border-stroke-soft-200/50">
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
					By continuing, you agree to our{" "}
					<Link href="/terms" className="text-primary-base hover:text-primary-darker font-medium hover:underline transition-colors">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link href="/privacy" className="text-primary-base hover:text-primary-darker font-medium hover:underline transition-colors">
						Privacy Policy
					</Link>
				</p>
			</footer>
		</div>
	)
}
