'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import { Callout } from '@/components/ui/callout'
import { ArrowLeft, Lock, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isValidating, setIsValidating] = React.useState(true)
  const [isValid, setIsValid] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Validate token on mount
  React.useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false)
        setIsValid(false)
        setError('Invalid or missing reset token')
        return
      }

      try {
        const { resetPasswordCallback } = await import('@/app/actions/auth')
        const result = await resetPasswordCallback(token)
        
        if (result.success && result.valid) {
          setIsValid(true)
          setEmail(result.email || '')
        } else {
          setIsValid(false)
          setError(result.error || 'Invalid or expired reset token')
        }
      } catch (err) {
        setIsValid(false)
        setError('Failed to validate reset token')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('')

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      const { resetPassword } = await import('@/app/actions/auth')
      const result = await resetPassword(token, data.password)
      
      if (result.success) {
        setSuccess(true)
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push('/sign-in')
        }, 2000)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-white-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
          <Button.Root variant="ghost" size="small" asChild>
            <Link href="/sign-in">
              <Button.Icon as={ArrowLeft} />
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

  if (!isValid) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-white-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
          <Button.Root variant="ghost" size="small" asChild>
            <Link href="/sign-in">
              <Button.Icon as={ArrowLeft} />
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
                  {error || 'This password reset link is invalid or has expired'}
                </p>
              </div>

              <div className="space-y-4">
                <Button.Root variant="primary" className="w-full" asChild>
                  <Link href="/forgot-password">Request New Reset Link</Link>
                </Button.Root>
                <Button.Root variant="basic" className="w-full" asChild>
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button.Root>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-white-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
          <Button.Root variant="ghost" size="small" asChild>
            <Link href="/sign-in">
              <Button.Icon as={ArrowLeft} />
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
                <h1 className="text-title-h4 text-text-strong-950 mb-2">Password Reset Successful</h1>
                <p className="text-paragraph-sm text-text-sub-600">
                  Your password has been reset successfully. Redirecting to sign in...
                </p>
              </div>

              <Button.Root variant="primary" className="w-full" asChild>
                <Link href="/sign-in">Go to Sign In</Link>
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
            <Button.Icon as={ArrowLeft} />
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
                {email ? `Enter a new password for ${email}` : 'Enter your new password'}
              </p>
            </div>

            {error && (
              <Callout variant="error" size="sm" className="mb-6">
                {error}
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...register('password')}
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-label-sm text-text-strong-950 mb-2">
                  Confirm Password
                </label>
                <Input.Root hasError={!!errors.confirmPassword}>
                  <Input.Wrapper>
                    <Input.Icon as={Lock} />
                    <Input.El
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...register('confirmPassword')}
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </Input.Wrapper>
                </Input.Root>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                    <WarningCircle weight="fill" className="size-3.5 shrink-0" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button.Root
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button.Root>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
