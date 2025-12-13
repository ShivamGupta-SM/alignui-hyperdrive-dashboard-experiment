'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Checkbox from '@/components/ui/checkbox'
import * as Divider from '@/components/ui/divider'
import { Callout } from '@/components/ui/callout'
import { signInSchema, type SignInFormData } from '@/lib/validations'
import { GoogleLogo, Eye, EyeSlash, Envelope, Lock, WarningCircle, ShieldCheck } from '@phosphor-icons/react'

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [formError, setFormError] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    setFormError('')
    setIsLoading(true)

    try {
      const { signInEmail } = await import('@/app/actions')
      const result = await signInEmail(data.email, data.password, data.rememberMe)

      if (!result.success) {
        throw new Error(result.error || 'Invalid email or password')
      }

      // Handle 2FA if required
      if (result.requiresTwoFactor) {
        router.push(`/verify?token=${result.twoFactorToken}`)
        return
      }

      // Redirect will be handled by server action if needed
      if (!result.redirect) {
        // Trigger session refetch (like Better Auth does)
        // router.refresh() will trigger useSession to refetch
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { signInSocial } = await import('@/app/actions')
      const result = await signInSocial('google')

      if (!result.success) {
        throw new Error(result.error || 'Google sign-in failed')
      }

      // If redirect is needed, it will be handled by the server action
      if (!result.redirect) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-base to-primary-darker mx-auto mb-4 shadow-md">
            <ShieldCheck weight="duotone" className="size-7 sm:size-8 text-white" />
          </div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Welcome back</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
            Sign in to your Hypedrive account
          </p>
        </div>

        {/* Error Message */}
        {formError && (
          <Callout variant="error" size="sm" className="mb-6" role="alert">
            {formError}
          </Callout>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-label-sm text-text-strong-950 mb-2">
              Email address
            </label>
            <Input.Root hasError={!!errors.email}>
              <Input.Wrapper>
                <Input.Icon as={Envelope} />
                <Input.El
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.email && (
              <p id="email-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                <WarningCircle weight="fill" className="size-3.5 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-label-sm text-text-strong-950 mb-2">
              Password
            </label>
            <Input.Root hasError={!!errors.password}>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-soft-400 hover:text-text-sub-600 transition-colors p-1 -mr-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlash className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </Input.Wrapper>
            </Input.Root>
            {errors.password && (
              <p id="password-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                <WarningCircle weight="fill" className="size-3.5 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox.Root
                {...register('rememberMe')}
                aria-label="Remember me on this device"
              />
              <span className="text-paragraph-sm text-text-sub-600 group-hover:text-text-strong-950 transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-paragraph-sm text-primary-base hover:text-primary-darker hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button.Root
            type="submit"
            variant="primary"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button.Root>
        </form>

        {/* Divider */}
        <div className="my-6">
          <Divider.Root variant="content">
            <span className="text-paragraph-xs text-text-soft-400 px-2">or continue with</span>
          </Divider.Root>
        </div>

        {/* Google Sign In */}
        <Button.Root
          variant="basic"
          className="w-full h-11"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Button.Icon as={GoogleLogo} />
          Continue with Google
        </Button.Root>

        {/* Sign Up Link */}
        <p className="mt-6 sm:mt-8 text-center text-paragraph-sm text-text-sub-600">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
