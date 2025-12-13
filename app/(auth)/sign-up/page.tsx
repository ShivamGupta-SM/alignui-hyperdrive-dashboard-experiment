'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as ProgressBar from '@/components/ui/progress-bar'
import * as Divider from '@/components/ui/divider'
import { Callout } from '@/components/ui/callout'
import { GoogleLogo, Eye, EyeSlash, Envelope, Lock, UserPlus, Check, X } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import { signUpSchema, type SignUpFormData } from '@/lib/validations'

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  // Password requirements
  const passwordRequirements = React.useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }), [password])

  // Password strength calculation
  const passwordStrength = React.useMemo(() => {
    let strength = 0
    if (passwordRequirements.minLength) strength += 25
    if (passwordRequirements.hasUppercase) strength += 25
    if (passwordRequirements.hasNumber) strength += 25
    if (passwordRequirements.hasSpecial) strength += 25
    return strength
  }, [passwordRequirements])

  const passwordStrengthLabel = React.useMemo(() => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }, [passwordStrength])

  const passwordStrengthColor = React.useMemo(() => {
    if (passwordStrength <= 25) return 'red'
    if (passwordStrength <= 50) return 'orange'
    if (passwordStrength <= 75) return 'yellow'
    return 'green'
  }, [passwordStrength])

  const onSubmit = async (data: SignUpFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const { signUpEmail } = await import('@/app/actions')
      const result = await signUpEmail(data.email, data.password, data.email.split('@')[0])

      if (!result.success) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Trigger session refetch (like Better Auth does)
      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const { signInSocial } = await import('@/app/actions')
      const result = await signInSocial('google')

      if (!result.success) {
        throw new Error(result.error || 'Google sign-up failed')
      }

      // If redirect is needed, it will be handled by the server action
      if (!result.redirect) {
        router.push('/onboarding')
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up with Google. Please try again.')
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
            <UserPlus weight="duotone" className="size-7 sm:size-8 text-white" />
          </div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Create your account</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
            Start managing your influencer campaigns
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Callout variant="error" size="sm" className="mb-6">
            {error}
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
                <X weight="bold" className="size-3.5 shrink-0" />
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
                  placeholder="Create a strong password"
                  {...register('password')}
                  autoComplete="new-password"
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
                <X weight="bold" className="size-3.5 shrink-0" />
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar.Root
                      value={passwordStrength}
                      size="sm"
                      color={passwordStrengthColor as 'green' | 'red' | 'orange'}
                    />
                  </div>
                  <span className={cn(
                    'text-label-xs font-medium min-w-[50px]',
                    passwordStrength <= 25 && 'text-error-base',
                    passwordStrength > 25 && passwordStrength <= 50 && 'text-warning-base',
                    passwordStrength > 50 && passwordStrength <= 75 && 'text-warning-base',
                    passwordStrength > 75 && 'text-success-base',
                  )}>
                    {passwordStrengthLabel}
                  </span>
                </div>

                {/* Password Requirements Checklist */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-xl bg-bg-weak-50">
                  <RequirementItem met={passwordRequirements.minLength} text="8+ characters" />
                  <RequirementItem met={passwordRequirements.hasUppercase} text="Uppercase letter" />
                  <RequirementItem met={passwordRequirements.hasNumber} text="Number" />
                  <RequirementItem met={passwordRequirements.hasSpecial} text="Special character" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-label-sm text-text-strong-950 mb-2">
              Confirm password
            </label>
            <Input.Root hasError={!!errors.confirmPassword}>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-soft-400 hover:text-text-sub-600 transition-colors p-1 -mr-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </Input.Wrapper>
            </Input.Root>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                <X weight="bold" className="size-3.5 shrink-0" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button.Root
            type="submit"
            variant="primary"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button.Root>
        </form>

        {/* Divider */}
        <div className="my-6">
          <Divider.Root variant="content">
            <span className="text-paragraph-xs text-text-soft-400 px-2">or continue with</span>
          </Divider.Root>
        </div>

        {/* Google Sign Up */}
        <Button.Root
          variant="basic"
          className="w-full h-11"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <Button.Icon as={GoogleLogo} />
          Continue with Google
        </Button.Root>

        {/* Sign In Link */}
        <p className="mt-6 sm:mt-8 text-center text-paragraph-sm text-text-sub-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

// Password Requirement Item Component
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-paragraph-xs transition-colors',
      met ? 'text-success-base' : 'text-text-soft-400'
    )}>
      {met ? (
        <Check weight="bold" className="size-3.5 shrink-0" />
      ) : (
        <div className="size-3.5 rounded-full border border-stroke-soft-200 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  )
}
