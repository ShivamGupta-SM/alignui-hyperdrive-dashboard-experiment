import type { Metadata } from "next"
import Link from "next/link"
import * as Button from "@/components/ui/primitives/button"
import {
	ArrowRight,
	Compass,
	SignIn,
} from "@phosphor-icons/react/dist/ssr"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
	title: "404 - Page Not Found | Authentication",
	description: "The authentication page you're looking for doesn't exist.",
}

export default function AuthNotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center p-6">
			<div className="w-full max-w-md text-center">
				{/* Icon */}
				<div className="mb-6">
					<div className="relative inline-flex">
						<div className="absolute -inset-4 rounded-full bg-primary-lighter/50 animate-pulse" />
						<div className="absolute -inset-2 rounded-full bg-primary-lighter/70" />
						<div className="relative flex size-20 items-center justify-center rounded-full bg-primary-base shadow-lg">
							<Compass weight="duotone" className="size-10 text-white" />
						</div>
					</div>
				</div>

				{/* Error Code Badge */}
				<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-lighter text-error-base text-label-xs font-medium mb-4">
					<span>Error 404</span>
				</div>

				{/* Header */}
				<h1 className="text-title-h4 text-text-strong-950 mb-2">
					Page Not Found
				</h1>
				<p className="text-paragraph-sm text-text-sub-600 mb-6">
					The authentication page you&apos;re looking for doesn&apos;t exist.
				</p>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button.Root variant="primary" size="medium" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon>
								<SignIn className="size-5" />
							</Button.Icon>
							Go to Sign In
						</Link>
					</Button.Root>
					<Button.Root variant="ghost" size="medium" asChild>
						<Link href="/">
							Back to Home
							<Button.Icon>
								<ArrowRight className="size-5" />
							</Button.Icon>
						</Link>
					</Button.Root>
				</div>
			</div>
		</div>
	)
}
