'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import { Callout } from '@/components/ui/callout'
import { ArrowLeft, Envelope, WarningCircle } from '@phosphor-icons/react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const { forgotPassword } = await import('@/app/actions/auth')
      const result = await forgotPassword(data.email)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
                <Envelope weight="duotone" className="size-6 text-primary-base" />
              </div>
              <h1 className="text-title-h4 text-text-strong-950 mb-2">Forgot Password?</h1>
              <p className="text-paragraph-sm text-text-sub-600">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {error && (
              <Callout variant="error" size="sm" className="mb-6">
                {error}
              </Callout>
            )}

            {success ? (
              <div className="space-y-6">
                <Callout variant="success">
                  <strong>Check your email!</strong> We've sent a password reset link to your email address
                </Callout>
                <Button.Root variant="basic" className="w-full" asChild>
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button.Root>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

                <Button.Root
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button.Root>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
