'use client'

import * as React from 'react'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import { Callout } from '@/components/ui/callout'
import { ArrowLeft, Envelope } from '@phosphor-icons/react/dist/ssr'

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch {
      setError('Failed to send reset email')
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
                  <strong>Check your email!</strong> We've sent a password reset link to {email}
                </Callout>
                <Button.Root variant="basic" className="w-full" asChild>
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button.Root>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.El
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </Input.Wrapper>
                  </Input.Root>
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
