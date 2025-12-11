'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Checkbox from '@/components/ui/checkbox'
import * as Divider from '@/components/ui/divider'
import { Callout } from '@/components/ui/callout'
import { signInSchema, type SignInFormData } from '@/lib/validations'
import { GoogleLogo, Eye, EyeSlash, Envelope, Lock, WarningCircle, ShieldCheck } from '@phosphor-icons/react'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof SignInFormData, string>>>({})
  const [formError, setFormError] = React.useState('')
  const [touched, setTouched] = React.useState<Partial<Record<keyof SignInFormData, boolean>>>({})

  const validateField = (field: keyof SignInFormData, value: unknown) => {
    const partialData = { ...formData, [field]: value }
    const result = signInSchema.safeParse(partialData)

    if (!result.success) {
      const fieldError = result.error.issues?.find(issue => issue.path[0] === field)
      return fieldError?.message
    }
    return undefined
  }

  const handleBlur = (field: keyof SignInFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleChange = (field: keyof SignInFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (touched[field] && errors[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validate all fields
    const result = signInSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Partial<Record<keyof SignInFormData, string>> = {}
      result.error.issues?.forEach(issue => {
        const field = issue.path[0] as keyof SignInFormData
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      })
      setErrors(newErrors)
      setTouched({ email: true, password: true })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invalid email or password')
      }

      router.push('/dashboard')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Mock Google OAuth - in production, this would redirect to Google
      // For demo, we create a mock Google user session
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'google.user@gmail.com',
          password: 'google-oauth-mock',
        }),
      })

      if (!response.ok) {
        throw new Error('Google sign-in failed')
      }

      router.push('/dashboard')
    } catch {
      setFormError('Failed to sign in with Google. Please try again.')
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
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-label-sm text-text-strong-950 mb-2">
              Email address
            </label>
            <Input.Root hasError={touched.email && !!errors.email}>
              <Input.Wrapper>
                <Input.Icon as={Envelope} />
                <Input.El
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                  autoComplete="email"
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </Input.Wrapper>
            </Input.Root>
            {touched.email && errors.email && (
              <p id="email-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                <WarningCircle weight="fill" className="size-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-label-sm text-text-strong-950 mb-2">
              Password
            </label>
            <Input.Root hasError={touched.password && !!errors.password}>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  autoComplete="current-password"
                  aria-invalid={touched.password && !!errors.password}
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
            {touched.password && errors.password && (
              <p id="password-error" className="flex items-center gap-1.5 mt-2 text-paragraph-xs text-error-base" role="alert">
                <WarningCircle weight="fill" className="size-3.5 shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox.Root
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleChange('rememberMe', checked === true)}
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
