"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Divider from "@/components/ui/layout/divider"
import { Callout } from "@/components/ui/feedback/callout"
import { signInSchema, type SignInFormData } from "@/lib/utils/validations"
import { logInfo, logError } from "@/lib/logging/error-logger-simple"
import {
	GoogleLogo,
	Eye,
	EyeSlash,
	Envelope,
	Lock,
	WarningCircle,
} from "@phosphor-icons/react"

export default function SignInPage() {
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
			const result = await signInEmail(data.email, data.password, data.rememberMe)
			logInfo("Sign-in result received", { source: "SignInPage", data: { hasSuccess: result.success } })

			if (!result.success) {
				const errorMessage = "error" in result ? result.error : "Invalid email or password"
				throw new Error(errorMessage)
			}

			// Handle 2FA if required
			if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
				router.push(`/verify?token=${result.twoFactorToken}`)
				return
			}

			// Industry Standard: Use Next.js searchParams instead of window.location
			const redirectParam = searchParams.get("redirect")

			if (redirectParam) {
				logInfo("Redirecting to query param", { source: "SignInPage", data: { url: redirectParam } })
				// Use router.replace for query param redirects to maintain history
				router.replace(redirectParam)
				router.refresh()
				return
			}

			if ("redirect" in result && result.redirect && "url" in result) {
				const url = result.url
				if (url && typeof url === "string") {
					logInfo("Redirecting to result URL", { source: "SignInPage", data: { url } })
					router.replace(url)
					router.refresh()
					return
				}
			}

			// Smart redirect based on organization status
			const hasOrg = "hasOrganization" in result ? result.hasOrganization : false
			const activeOrgSet = "activeOrgSet" in result ? result.activeOrgSet : false
			logInfo("Redirecting based on org status", { source: "SignInPage", data: { hasOrg, activeOrgSet } })

			// ✅ FIX: Wait a bit if active org was just set to ensure session is refreshed
			if (activeOrgSet) {
				await new Promise((resolve) => setTimeout(resolve, 500))
			}

			if (hasOrg) {
				router.replace("/dashboard")
				router.refresh()
			} else {
				router.replace("/onboarding")
				router.refresh()
			}

		} catch (error) {
			logError(error, { source: "SignInPage", data: { email: data.email } })
			setFormError(
				error instanceof Error ? error.message : "Invalid email or password. Please try again."
			)
			setIsLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setIsLoading(true)
		try {
			const { signInSocial } = await import("@/app/actions")
			const result = await signInSocial("google")

			if (!result.success) {
				const errorMessage = "error" in result ? result.error : "Google sign-in failed"
				throw new Error(errorMessage)
			}

			// If redirect is needed, it will be handled by the server action
			if (!("redirect" in result) || !result.redirect) {
				// Always go to dashboard - onboarding alert will show if needed
				// Don't force onboarding redirect
				router.push("/dashboard")
				router.refresh()
			}
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "Failed to sign in with Google. Please try again."
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full space-y-8" suppressHydrationWarning>
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
				<form onSubmit={handleSubmit(onSubmit, (errors) => logInfo("Form validation errors", { source: "SignInPage", data: { errors } }))} className="space-y-5" noValidate suppressHydrationWarning>
					<div suppressHydrationWarning>
						<label htmlFor="email" className="block text-label-sm text-text-strong-950 mb-2" suppressHydrationWarning>
							Email address
						</label>
						<Input.Root hasError={!!errors.email}>
							<Input.Wrapper suppressHydrationWarning>
								<Input.Icon as={Envelope} />
								<Input.El
									id="email"
									type="email"
									placeholder="you@company.com"
									{...register("email")}
									autoComplete="email"
									aria-invalid={!!errors.email}
									aria-describedby={errors.email ? "email-error" : undefined}
									suppressHydrationWarning
								/>
							</Input.Wrapper>
						</Input.Root>
						{errors.email && (
							<p
								id="email-error"
								className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base"
								role="alert"
							>
								<WarningCircle weight="fill" className="size-3.5 shrink-0" />
								{errors.email.message}
							</p>
						)}
					</div>

					<div suppressHydrationWarning>
						<label htmlFor="password" className="block text-label-sm text-text-strong-950 mb-2" suppressHydrationWarning>
							Password
						</label>
						<Input.Root hasError={!!errors.password}>
							<Input.Wrapper suppressHydrationWarning>
								<Input.Icon as={Lock} />
								<Input.El
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									{...register("password")}
									autoComplete="current-password"
									aria-invalid={!!errors.password}
									aria-describedby={errors.password ? "password-error" : undefined}
									suppressHydrationWarning
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="text-text-soft-400 hover:text-text-sub-600 transition-colors p-1 -mr-1"
									aria-label={showPassword ? "Hide password" : "Show password"}
									suppressHydrationWarning
								>
									{showPassword ? <EyeSlash className="size-5" /> : <Eye className="size-5" />}
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

					<div className="flex items-center justify-between pt-1" suppressHydrationWarning>
						<label className="flex items-center gap-2.5 cursor-pointer group" suppressHydrationWarning>
							<Checkbox.Root {...register("rememberMe")} aria-label="Remember me on this device" />
							<span className="text-paragraph-sm text-text-sub-600 group-hover:text-text-strong-950 transition-colors">
								Remember me
							</span>
						</label>
						<Link
							href="/forgot-password"
							className="text-paragraph-sm text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors"
							suppressHydrationWarning
						>
							Forgot password?
						</Link>
					</div>

					<Button.Root type="submit" variant="primary" className="w-full h-12 font-medium" disabled={isLoading} suppressHydrationWarning>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button.Root>
				</form>

				{/* Divider */}
				<div className="relative" suppressHydrationWarning>
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
					className="w-full h-12 font-medium border border-stroke-soft-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 transition-all"
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					suppressHydrationWarning
				>
					<Button.Icon><GoogleLogo className="size-5" /></Button.Icon>
					Continue with Google
				</Button.Root>

				{/* Sign Up Link */}
				<p className="text-center text-paragraph-sm text-text-sub-600" suppressHydrationWarning>
					Don&apos;t have an account?{" "}
					<Link
						href="/sign-up"
						className="text-primary-base font-semibold hover:text-primary-darker hover:underline transition-colors"
						suppressHydrationWarning
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}
