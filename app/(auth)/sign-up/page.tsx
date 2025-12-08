'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as ProgressBar from '@/components/ui/progress-bar'
import * as Divider from '@/components/ui/divider'
import * as Hint from '@/components/ui/hint'
import { Callout } from '@/components/ui/callout'
import { RiGoogleFill, RiEyeLine, RiEyeOffLine, RiInformationLine } from '@remixicon/react'
import { cn } from '@/utils/cn'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Password strength calculation
  const passwordStrength = React.useMemo(() => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }, [password])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 50) {
      setError('Please use a stronger password')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement actual registration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/onboarding')
    } catch {
      setError('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/onboarding')
    } catch {
      setError('Failed to sign up with Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-20 bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-2">Create your account</h1>
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

          <div>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-soft-400 hover:text-text-sub-600"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="size-5" />
                  ) : (
                    <RiEyeLine className="size-5" />
                  )}
                </button>
              </Input.Wrapper>
            </Input.Root>
            {password && (
              <div className="mt-2 space-y-1">
                <ProgressBar.Root
                  value={passwordStrength}
                  size="sm"
                  color={passwordStrengthColor as 'green' | 'red' | 'orange'}
                />
                <p className={cn(
                  'text-paragraph-xs',
                  passwordStrength <= 25 && 'text-error-base',
                  passwordStrength > 25 && passwordStrength <= 50 && 'text-orange-500',
                  passwordStrength > 50 && passwordStrength <= 75 && 'text-warning-base',
                  passwordStrength > 75 && 'text-success-base',
                )}>
                  {passwordStrengthLabel}
                </p>
              </div>
            )}
            <Hint.Root>
              <Hint.Icon as={RiInformationLine} />
              Use 8+ characters with uppercase, number, and special character
            </Hint.Root>
          </div>

          <div>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-soft-400 hover:text-text-sub-600"
                >
                  {showConfirmPassword ? (
                    <RiEyeOffLine className="size-5" />
                  ) : (
                    <RiEyeLine className="size-5" />
                  )}
                </button>
              </Input.Wrapper>
            </Input.Root>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-paragraph-xs text-error-base">
                Passwords do not match
              </p>
            )}
          </div>

          <Button.Root
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button.Root>
        </form>

        {/* Divider */}
        <div className="my-6">
          <Divider.Root variant="content">
            <span className="text-paragraph-xs text-text-soft-400">or</span>
          </Divider.Root>
        </div>

        {/* Google Sign Up */}
        <Button.Root
          variant="basic"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <Button.Icon as={RiGoogleFill} />
          Continue with Google
        </Button.Root>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-paragraph-sm text-text-sub-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary-base hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

