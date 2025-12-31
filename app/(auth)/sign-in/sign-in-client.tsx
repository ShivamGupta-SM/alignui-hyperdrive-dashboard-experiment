"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Checkbox from "@/components/ui/forms/checkbox"
import { Callout } from "@/components/ui/feedback/callout"
import { signInSchema, type SignInFormData } from "@/lib/utils/validations"
import { logInfo, logError } from "@/lib/logging/error-logger-simple"
import { getErrorMessage } from "@/lib/utils/format"
import { routes, isValidInternalUrl } from "@/lib/routes"
import {
	GoogleLogo,
	Eye,
	EyeSlash,
	Envelope,
	Lock,
	WarningCircle,
} from "@phosphor-icons/react"

export function SignInForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [formError, setFormError] = useState("")

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	})

	const onSubmit = async (data: SignInFormData) => {
		logInfo("Form submitted", { source: "SignInPage" })
		setFormError("")
		setIsLoading(true)

		try {
			const { signInEmail } = await import("@/app/actions")
			const result = await signInEmail({ email: data.email, password: data.password, rememberMe: data.rememberMe })
			logInfo("Sign-in result received", { source: "SignInPage", data: { hasSuccess: result?.data?.success } })

			if (!result?.data?.success) {
				const errorMessage = result?.serverError || "Invalid email or password"
				throw new Error(errorMessage)
			}

			// Handle 2FA if required
			if (result.data.requiresTwoFactor && result.data.twoFactorToken) {
				// Use replace() - user shouldn't go back to login form after 2FA
				router.replace(routes.verify.withToken(result.data.twoFactorToken))
				return
			}

			// Determine redirect destination (single code path for clarity)
			// Priority: 1. Valid query param redirect, 2. Result URL, 3. Dashboard
			const redirectParam = searchParams.get("redirect")
			let destination = routes.dashboard.root

			// Check query param redirect (validate to prevent open redirect attacks)
			if (redirectParam && isValidInternalUrl(redirectParam)) {
				destination = redirectParam
				logInfo("Redirecting to query param", { source: "SignInPage", data: { url: destination } })
			}
			// Check result URL redirect
			else if ("redirect" in result && result.redirect && "url" in result) {
				const url = result.url
				if (url && typeof url === "string" && isValidInternalUrl(url)) {
					destination = url
					logInfo("Redirecting to result URL", { source: "SignInPage", data: { url: destination } })
				}
			} else {
				logInfo("Redirecting to dashboard", { source: "SignInPage" })
			}

			// Use replace() - user shouldn't go back to login form after successful auth
			router.replace(destination)
			router.refresh()

		} catch (error) {
			logError(error, { source: "SignInPage", data: { email: data.email } })
			setFormError(getErrorMessage(error, "Invalid email or password. Please try again."))
			setIsLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setIsLoading(true)
		try {
			const { signInSocial } = await import("@/app/actions")
			const result = await signInSocial({ provider: "google" })

			if (!result?.data?.success) {
				const errorMessage = result?.serverError || "Google sign-in failed"
				throw new Error(errorMessage)
			}

			// If redirect is needed (OAuth flow), it will be handled by the server action
			// OAuth callback will check org status and redirect properly
			if (!result.data.redirect) {
				// Go to dashboard - if no approved org, dashboard page will redirect to onboarding
				// Use replace() - user shouldn't go back to login form
				router.replace(routes.dashboard.root)
				router.refresh()
			}
		} catch (error) {
			setFormError(getErrorMessage(error, "Failed to sign in with Google. Please try again."))
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full space-y-8">
			{/* Header */}
			<div className="text-center space-y-3">
				<h1 className="text-title-h3 sm:text-title-h2 text-text-strong-950 font-bold">Welcome back</h1>
				<p className="text-paragraph-base text-text-sub-600">
					Sign in to your account to continue
				</p>
			</div>

			{/* Error Message */}
			{formError && (
				<Callout variant="error" size="sm" role="alert">
					{formError}
				</Callout>
			)}

			{/* Form */}
			<div className="space-y-6">
				<form onSubmit={handleSubmit(onSubmit, (errors) => logInfo("Form validation errors", { source: "SignInPage", data: { errors } }))} className="space-y-5" noValidate>
					<div>
						<label htmlFor="email" className="block text-label-sm text-text-strong-950 mb-2">
							Email address <span className="text-error-base">*</span>
						</label>
						<Input.Root hasError={!!errors.email}>
							<Input.Wrapper>
								<Input.Icon as={Envelope} />
								<Input.El
									id="email"
									type="email"
									placeholder="you@company.com"
									{...register("email")}
									autoComplete="email"
									aria-invalid={!!errors.email}
									aria-describedby={errors.email ? "email-error" : undefined}
									aria-required="true"
								/>
							</Input.Wrapper>
						</Input.Root>
						{errors.email && (
							<p
								id="email-error"
								className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base animate-in fade-in slide-in-from-top-1 duration-200"
								role="alert"
							>
								<WarningCircle weight="fill" className="size-3.5 shrink-0" />
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label htmlFor="password" className="block text-label-sm text-text-strong-950 mb-2">
							Password <span className="text-error-base">*</span>
						</label>
						<Input.Root hasError={!!errors.password}>
							<Input.Wrapper>
								<Input.Icon as={Lock} />
								<Input.El
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									{...register("password")}
									autoComplete="current-password"
									aria-invalid={!!errors.password}
									aria-describedby={errors.password ? "password-error" : undefined}
									aria-required="true"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="text-text-soft-400 hover:text-text-sub-600 transition-colors p-1 -mr-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
									aria-label={showPassword ? "Hide password" : "Show password"}
									aria-pressed={showPassword}
								>
									{showPassword ? <EyeSlash className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
								</button>
							</Input.Wrapper>
						</Input.Root>
						{errors.password && (
							<p
								id="password-error"
								className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base animate-in fade-in slide-in-from-top-1 duration-200"
								role="alert"
							>
								<WarningCircle weight="fill" className="size-3.5 shrink-0" />
								{errors.password.message}
							</p>
						)}
					</div>

					<div className="flex items-center justify-between pt-1">
						<label htmlFor="rememberMe" className="flex items-center gap-2.5 cursor-pointer group">
							<Checkbox.Root id="rememberMe" {...register("rememberMe")} aria-label="Remember me on this device" />
							<span className="text-paragraph-sm text-text-sub-600 group-hover:text-text-strong-950 transition-colors">
								Remember me
							</span>
						</label>
						<Link
							href={routes.auth.forgotPassword}
							className="text-paragraph-sm text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors"
						>
							Forgot password?
						</Link>
					</div>

					<Button.Root
						type="submit"
						variant="primary"
						className="w-full h-11 sm:h-12 font-medium"
						disabled={isLoading}
						isLoading={isLoading}
						loadingText="Signing in..."
					>
						Sign In
					</Button.Root>
				</form>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-stroke-soft-200" />
					</div>
					<div className="relative flex justify-center text-paragraph-xs">
						<span className="bg-bg-white-0 px-4 text-text-soft-400">or continue with</span>
					</div>
				</div>

				{/* Google Sign In */}
				<Button.Root
					variant="basic"
					size="medium"
					className="w-full h-11 sm:h-12 font-medium border border-stroke-soft-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 transition-all"
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					isLoading={isLoading}
					loadingText="Connecting..."
				>
					<Button.Icon><GoogleLogo className="size-5" /></Button.Icon>
					Continue with Google
				</Button.Root>

				{/* Sign Up Link - preserve redirect param so new users go to intended destination after signup */}
				<p className="text-center text-paragraph-sm text-text-sub-600">
					Don&apos;t have an account?{" "}
					<Link
						href={searchParams.get("redirect") && isValidInternalUrl(searchParams.get("redirect")!)
							? `${routes.auth.signUp}?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
							: routes.auth.signUp}
						className="text-primary-base font-semibold hover:text-primary-darker hover:underline transition-colors"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}
