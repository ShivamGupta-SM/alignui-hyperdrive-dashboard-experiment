'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as DigitInput from '@/components/ui/digit-input'

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement actual 2FA verification
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch {
      setError('Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-submit when code is complete
  React.useEffect(() => {
    if (code.length === 6) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }, [code])

  return (
    <div className="w-full max-w-md">
      <div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-title-h4 text-text-strong-950 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-10 bg-error-lighter p-3 text-paragraph-sm text-error-base">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <DigitInput.Root
              numInputs={6}
              value={code}
              onChange={setCode}
            />
          </div>

          <Button.Root
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button.Root>
        </form>

        {/* Backup Code Link */}
        <div className="mt-6 text-center">
          <Link
            href="/verify/backup"
            className="text-paragraph-sm text-primary-base hover:underline"
          >
            Use backup code instead
          </Link>
        </div>
      </div>
    </div>
  )
}

