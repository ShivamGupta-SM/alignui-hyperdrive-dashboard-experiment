import { Suspense } from "react"
import { SignUpContent } from "./sign-up-client"

function SignUpLoading() {
	return (
		<div className="w-full max-w-md">
			<div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg animate-pulse">
				<div className="mb-6 sm:mb-8 text-center">
					<div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-bg-soft-200 mx-auto mb-4" />
					<div className="h-6 w-48 bg-bg-soft-200 rounded mx-auto mb-2" />
					<div className="h-4 w-64 bg-bg-soft-200 rounded mx-auto" />
				</div>
				<div className="space-y-4">
					<div className="h-11 bg-bg-soft-200 rounded" />
					<div className="h-11 bg-bg-soft-200 rounded" />
					<div className="h-11 bg-bg-soft-200 rounded" />
				</div>
			</div>
		</div>
	)
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<SignUpLoading />}>
			<SignUpContent />
		</Suspense>
	)
}
