"use client"

import { useState, useEffect, Suspense, useReducer } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import { Callout } from "@/components/ui/feedback/callout"
import { ArrowLeft, Lock, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react"
import { resetPasswordSchema, getSafeRedirectUrl, type ResetPasswordFormData } from "@/lib/utils"
import { TIMEOUTS } from "@/lib/constants"
import { routes } from "@/lib/routes"

// ✅ FIX: State machine pattern for page states
// Replaces 3 separate useState flags that could have invalid combinations
type PageState =
	| { status: "validating" }
	| { status: "invalid"; error: string }
	| { status: "ready" }
	| { status: "submitting" }
	| { status: "success" }

type PageAction =
	| { type: "VALIDATE_SUCCESS" }
	| { type: "VALIDATE_ERROR"; error: string }
	| { type: "SUBMIT_START" }
	| { type: "SUBMIT_SUCCESS" }
	| { type: "SUBMIT_ERROR"; error: string }

function pageReducer(state: PageState, action: PageAction): PageState {
	switch (action.type) {
		case "VALIDATE_SUCCESS":
			return { status: "ready" }
		case "VALIDATE_ERROR":
			return { status: "invalid", error: action.error }
		case "SUBMIT_START":
			return { status: "submitting" }
		case "SUBMIT_SUCCESS":
			return { status: "success" }
		case "SUBMIT_ERROR":
			return { status: "ready" } // Go back to ready so user can retry
		default:
			return state
	}
}

function ResetPasswordContent() {
	const router = useRouter()
	const params = useParams()
	const searchParams = useSearchParams()
	// Support both path param (/reset-password/[token]) and query param (?token=xxx)
	// useParams() returns a synchronous object in client components, not a Promise
	const token = (params?.token as string) || searchParams.get("token") || ""
	// Get callbackURL from query params (validated)
	const callbackURL = searchParams.get("callbackURL")

	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [pageState, dispatch] = useReducer(pageReducer, { status: "validating" })
	const [submitError, setSubmitError] = useState("")

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	})

	// Skip pre-validation API call - validate when password is submitted
	// This avoids issues with the token validation endpoint
	useEffect(() => {
		if (!token) {
			dispatch({ type: "VALIDATE_ERROR", error: "Invalid or missing reset token" })
			return
		}

		// Token exists, show the form
		// Actual validation will happen when user submits the password
		dispatch({ type: "VALIDATE_SUCCESS" })
	}, [token])

	const onSubmit = async (data: ResetPasswordFormData) => {
		setSubmitError("")

		if (!token) {
			setSubmitError("Invalid reset token")
			return
		}

		dispatch({ type: "SUBMIT_START" })

		try {
			const { resetPassword } = await import("@/app/actions")
			const result = await resetPassword({ token, newPassword: data.password })

			if (result?.data?.success) {
				dispatch({ type: "SUBMIT_SUCCESS" })
				// Redirect to callbackURL if provided and valid, otherwise to sign-in
				const redirectUrl = getSafeRedirectUrl(callbackURL || null, routes.auth.signIn)
				setTimeout(() => {
					router.push(redirectUrl)
				}, TIMEOUTS.SAVED_INDICATOR)
			} else {
				setSubmitError(result?.serverError || "Failed to reset password")
				dispatch({ type: "SUBMIT_ERROR", error: result?.serverError || "Failed to reset password" })
			}
		} catch {
			setSubmitError("Failed to reset password. Please try again.")
			dispatch({ type: "SUBMIT_ERROR", error: "Failed to reset password. Please try again." })
		}
	}

	if (pageState.status === "validating") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular text-center">
							<p className="text-paragraph-sm text-text-sub-600">Validating reset token...</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (pageState.status === "invalid") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
							<div className="mb-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-error-lighter mx-auto mb-4">
									<WarningCircle weight="fill" className="size-6 text-error-base" />
								</div>
								<h1 className="text-title-h4 text-text-strong-950 mb-2">Invalid Reset Link</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									{pageState.error || "This password reset link is invalid or has expired"}
								</p>
							</div>

							<div className="space-y-4">
								<Button.Root variant="primary" className="w-full" asChild>
									<Link href={routes.auth.forgotPassword}>Request New Reset Link</Link>
								</Button.Root>
								<Button.Root variant="ghost" className="w-full" asChild>
									<Link href={routes.auth.signIn}>Back to Sign In</Link>
								</Button.Root>
							</div>
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (pageState.status === "success") {
		return (
			<div className="flex min-h-screen flex-col bg-bg-white-0">
				<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
					<Button.Root variant="ghost" size="small" asChild>
						<Link href={routes.auth.signIn}>
							<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
							Back to Sign In
						</Link>
					</Button.Root>
				</header>

				<main className="flex flex-1 items-center justify-center px-4 py-12">
					<div className="w-full max-w-md">
						<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
							<div className="mb-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-success-lighter mx-auto mb-4">
									<Lock weight="fill" className="size-6 text-success-base" />
								</div>
								<h1 className="text-title-h4 text-text-strong-950 mb-2">
									Password Reset Successful
								</h1>
								<p className="text-paragraph-sm text-text-sub-600">
									Your password has been reset successfully. Redirecting to sign in...
								</p>
							</div>

							<Button.Root variant="primary" className="w-full" asChild>
								<Link href={routes.auth.signIn}>Go to Sign In</Link>
							</Button.Root>
						</div>
					</div>
				</main>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen flex-col bg-bg-white-0">
			<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
				<Button.Root variant="ghost" size="small" asChild>
					<Link href="/sign-in">
						<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
						Back to Sign In
					</Link>
				</Button.Root>
			</header>

			<main className="flex flex-1 items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
						<div className="mb-8 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary-lighter mx-auto mb-4">
								<Lock weight="duotone" className="size-6 text-primary-base" />
							</div>
							<h1 className="text-title-h4 text-text-strong-950 mb-2">Reset Password</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								Enter your new password
							</p>
						</div>

						{submitError && (
							<Callout variant="error" size="sm" className="mb-6">
								{submitError}
							</Callout>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
							<div>
								<label htmlFor="password" className="block text-label-sm text-text-strong-950 mb-2">
									New Password
								</label>
								<Input.Root hasError={!!errors.password}>
									<Input.Wrapper>
										<Input.Icon as={Lock} />
										<Input.El
											id="password"
											type={showPassword ? "text" : "password"}
											placeholder="Enter new password"
											{...register("password")}
											autoComplete="new-password"
											aria-invalid={!!errors.password}
											aria-describedby={errors.password ? "password-error" : undefined}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
											aria-label={showPassword ? "Hide password" : "Show password"}
										>
											{showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
										</button>
									</Input.Wrapper>
								</Input.Root>
								{errors.password && (
									<p
										id="password-error"
										className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base"
										role="alert"
									>
										<WarningCircle weight="fill" className="size-3.5 shrink-0" />
										{errors.password.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-label-sm text-text-strong-950 mb-2"
								>
									Confirm Password
								</label>
								<Input.Root hasError={!!errors.confirmPassword}>
									<Input.Wrapper>
										<Input.Icon as={Lock} />
										<Input.El
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Confirm new password"
											{...register("confirmPassword")}
											autoComplete="new-password"
											aria-invalid={!!errors.confirmPassword}
											aria-describedby={
												errors.confirmPassword ? "confirm-password-error" : undefined
											}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
											aria-label={showConfirmPassword ? "Hide password" : "Show password"}
										>
											{showConfirmPassword ? (
												<EyeSlash className="size-4" />
											) : (
												<Eye className="size-4" />
											)}
										</button>
									</Input.Wrapper>
								</Input.Root>
								{errors.confirmPassword && (
									<p
										id="confirm-password-error"
										className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base"
										role="alert"
									>
										<WarningCircle weight="fill" className="size-3.5 shrink-0" />
										{errors.confirmPassword.message}
									</p>
								)}
							</div>

							<Button.Root type="submit" variant="primary" className="w-full" disabled={pageState.status === "submitting"}>
								{pageState.status === "submitting" ? "Resetting..." : "Reset Password"}
							</Button.Root>
						</form>
					</div>
				</div>
			</main>
		</div>
	)
}

function ResetPasswordFallback() {
	return (
		<div className="flex min-h-screen flex-col bg-bg-white-0">
			<header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
				<div className="h-9 w-32 bg-bg-weak-50 rounded animate-pulse" />
			</header>

			<main className="flex flex-1 items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					<div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular text-center">
						<p className="text-paragraph-sm text-text-sub-600">Loading...</p>
					</div>
				</div>
			</main>
		</div>
	)
}

export default function ResetPasswordClient() {
	return (
		<Suspense fallback={<ResetPasswordFallback />}>
			<ResetPasswordContent />
		</Suspense>
	)
}
