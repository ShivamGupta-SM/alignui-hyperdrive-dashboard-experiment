import { Suspense } from "react"
import { SignInForm } from "./sign-in-client"

function SignInFormSkeleton() {
	return (
		<div className="w-full space-y-8 animate-pulse">
			{/* Header */}
			<div className="text-center space-y-3">
				<div className="h-8 bg-bg-weak-50 rounded-lg w-48 mx-auto" />
				<div className="h-5 bg-bg-weak-50 rounded w-64 mx-auto" />
			</div>
			{/* Form fields */}
			<div className="space-y-6">
				<div className="space-y-5">
					{/* Email field */}
					<div>
						<div className="h-4 bg-bg-weak-50 rounded w-24 mb-2" />
						<div className="h-12 bg-bg-weak-50 rounded-10" />
					</div>
					{/* Password field */}
					<div>
						<div className="h-4 bg-bg-weak-50 rounded w-20 mb-2" />
						<div className="h-12 bg-bg-weak-50 rounded-10" />
					</div>
					{/* Remember me & Forgot */}
					<div className="flex justify-between">
						<div className="h-4 bg-bg-weak-50 rounded w-28" />
						<div className="h-4 bg-bg-weak-50 rounded w-32" />
					</div>
					{/* Submit button */}
					<div className="h-12 bg-bg-weak-50 rounded-10" />
				</div>
				{/* Divider */}
				<div className="h-4 bg-bg-weak-50 rounded w-32 mx-auto" />
				{/* Google button */}
				<div className="h-12 bg-bg-weak-50 rounded-10" />
				{/* Sign up link */}
				<div className="h-4 bg-bg-weak-50 rounded w-48 mx-auto" />
			</div>
		</div>
	)
}

export default function SignInPage() {
	return (
		<Suspense fallback={<SignInFormSkeleton />}>
			<SignInForm />
		</Suspense>
	)
}
