'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import { Callout } from '@/components/ui/callout'
import { delay, DELAY } from '@/lib/utils/delay'
import { Key, ArrowLeft, ShieldWarning, Info } from '@phosphor-icons/react'

export function BackupForm() {
  const router = useRouter()
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Backup codes are typically 8-10 characters
    if (code.length < 8) {
      setError('Please enter a valid backup code')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement actual backup code verification
      await delay(DELAY.FORM)
      router.push('/dashboard')
    } catch {
      setError('Invalid backup code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-linear-to-br from-warning-base to-warning-darker mx-auto mb-4 shadow-md">
            <Key weight="duotone" className="size-7 sm:size-8 text-white" />
          </div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">
            Use Backup Code
          </h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
            Enter one of your backup codes to access your account
          </p>
        </div>

        {/* Warning Callout */}
        <Callout variant="warning" size="sm" className="mb-6">
          <div className="flex items-start gap-2">
            <ShieldWarning weight="duotone" className="size-4 shrink-0 mt-0.5" />
            <span>Backup codes are single-use. Once used, this code will no longer work.</span>
          </div>
        </Callout>

        {/* Error Message */}
        {error && (
          <Callout variant="error" size="sm" className="mb-6">
            {error}
          </Callout>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="backup-code" className="block text-label-sm text-text-strong-950 mb-2">
              Backup Code
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Key} />
                <Input.El
                  id="backup-code"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                  autoComplete="off"
                  autoFocus
                  className="font-mono tracking-wider"
                />
              </Input.Wrapper>
            </Input.Root>
            <p className="mt-2 text-paragraph-xs text-text-soft-400">
              Enter your 12-character backup code
            </p>
          </div>

          <Button.Root
            type="submit"
            variant="primary"
            className="w-full h-11"
            disabled={isLoading || code.length < 8}
          >
            {isLoading ? 'Verifying...' : 'Verify Backup Code'}
          </Button.Root>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-stroke-soft-200" />

        {/* Back to 2FA */}
        <div className="rounded-xl bg-bg-weak-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shrink-0">
              <ArrowLeft weight="duotone" className="size-5 text-text-sub-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-label-sm text-text-strong-950 mb-0.5">
                Have your authenticator?
              </h3>
              <p className="text-paragraph-xs text-text-sub-600 mb-2">
                Use your authenticator app instead
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center text-paragraph-sm text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors"
              >
                ← Back to verification
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 flex items-start gap-2 text-paragraph-xs text-text-soft-400">
          <Info weight="fill" className="size-4 shrink-0 mt-0.5" />
          <span>
            If you&apos;ve lost access to your backup codes and authenticator app,{' '}
            <a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">
              contact support
            </a>{' '}
            for account recovery.
          </span>
        </div>
      </div>
    </div>
  )
}
