'use client'

import Link from 'next/link'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Tracker } from '@/components/ui/tracker'
import { MetallicLogo } from '@/components/dashboard/metallic-logo'
import { MARKETING_STATS } from '@/lib/types/constants'

// Testimonials will be fetched from API/CMS if needed
// For now, testimonials section is removed to avoid hard-coded data
import {
  Megaphone,
  ArrowRight,
  CheckCircle,
  Lightning,
  Wallet,
  Users,
  ShieldCheck,
  ChartLineUp,
  Receipt,
  Sparkle,
  Play,
  Star,
  Check,
  X,
  ArrowUpRight,
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  Rocket,
  Target,
  Clock,
  CurrencyInr,
  List,
} from '@phosphor-icons/react'
import { useState } from 'react'

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-white-0/80 backdrop-blur-xl border-b border-stroke-soft-200/60 pt-[env(safe-area-inset-top)]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8">
              <MetallicLogo
                className="size-8"
                params={{ patternScale: 2, refraction: 0.015, speed: 0.3 }}
              />
            </div>
            <Logo width={110} height={24} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-colors">
              Testimonials
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button.Root variant="ghost" size="small" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign In</Link>
            </Button.Root>
            <Button.Root variant="primary" size="small" asChild className="hidden sm:inline-flex">
              <Link href="/sign-up">
                Get Started
                <Button.Icon as={ArrowRight} />
              </Link>
            </Button.Root>
            <Button.Root
              variant="ghost"
              size="small"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Button.Icon as={List} />
            </Button.Root>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stroke-soft-200 py-4 space-y-2">
            <Link href="#features" className="block px-4 py-2 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="block px-4 py-2 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="block px-4 py-2 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="block px-4 py-2 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors">
              Testimonials
            </Link>
            <div className="px-4 pt-2 flex gap-2">
              <Button.Root variant="neutral" size="small" asChild className="flex-1">
                <Link href="/sign-in">Sign In</Link>
              </Button.Root>
              <Button.Root variant="primary" size="small" asChild className="flex-1">
                <Link href="/sign-up">Get Started</Link>
              </Button.Root>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-weak-50 via-bg-white-0 to-bg-white-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Metallic Logo Hero */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="size-24 sm:size-32">
                <MetallicLogo
                  className="size-24 sm:size-32"
                  params={{ patternScale: 1.5, refraction: 0.02, speed: 0.25, liquid: 0.08 }}
                />
              </div>
              {/* Subtle glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary-base/5 blur-2xl scale-150" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200 px-4 py-1.5 mb-6">
            <Sparkle weight="fill" className="size-4 text-primary-base" />
            <span className="text-label-xs font-medium text-text-sub-600">Trusted by 500+ brands across India</span>
          </div>

          {/* Headline */}
          <h1 className="text-title-h2 sm:text-title-h1 text-text-strong-950 max-w-4xl mx-auto">
            The Influencer Marketing Platform{' '}
            <span className="text-primary-base">That Actually Works</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            Launch, manage, and scale creator campaigns with automated enrollment tracking,
            OCR-powered verification, and real-time wallet management.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button.Root variant="primary" size="medium" asChild className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start Free Trial
                <Button.Icon as={ArrowRight} />
              </Link>
            </Button.Root>
            <Button.Root variant="basic" size="medium" asChild className="w-full sm:w-auto">
              <Link href="#demo">
                <Button.Icon as={Play} />
                Watch Demo
              </Link>
            </Button.Root>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {MARKETING_STATS.map((stat) => (
              <div key={stat.label} className="relative p-4 rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
                <div className="text-title-h4 text-text-strong-950 font-semibold">{stat.value}</div>
                <div className="text-paragraph-xs text-text-sub-600 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview - Browser Chrome Style */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Chrome */}
            <div className="rounded-2xl bg-bg-white-0 shadow-custom-lg ring-1 ring-stroke-soft-200 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-bg-weak-50 border-b border-stroke-soft-200">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-error-base/60" />
                  <div className="size-3 rounded-full bg-warning-base/60" />
                  <div className="size-3 rounded-full bg-success-base/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 text-paragraph-xs text-text-soft-400">
                    <ShieldCheck weight="fill" className="size-3.5 text-success-base" />
                    app.hypedrive.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content Preview */}
              <Link href="/dashboard" className="block group">
                <div className="aspect-[16/9] bg-bg-weak-50 p-6 sm:p-8 relative overflow-hidden">
                  {/* Dashboard Grid Mockup */}
                  <div className="grid grid-cols-4 gap-4 h-full">
                    {/* Stat Cards Row */}
                    <div className="col-span-4 grid grid-cols-4 gap-4">
                      {[
                        { label: 'Active Campaigns', value: '12', color: 'primary' },
                        { label: 'Pending Reviews', value: '48', color: 'warning' },
                        { label: 'Total Creators', value: '1.2K', color: 'success' },
                        { label: 'Wallet Balance', value: '₹2.4L', color: 'information' },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 sm:p-4">
                          <div className={cn(
                            'text-label-xs sm:text-label-sm font-semibold',
                            stat.color === 'primary' && 'text-primary-base',
                            stat.color === 'warning' && 'text-warning-base',
                            stat.color === 'success' && 'text-success-base',
                            stat.color === 'information' && 'text-information-base',
                          )}>{stat.value}</div>
                          <div className="text-[10px] sm:text-paragraph-xs text-text-soft-400 mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="col-span-3 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 flex flex-col">
                      <div className="text-label-xs text-text-sub-600 mb-3">Enrollment Trends</div>
                      <div className="flex-1 flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height) => (
                          <div key={`bar-${height}`} className="flex-1 bg-primary-lighter rounded-t" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>

                    {/* Side Panel */}
                    <div className="col-span-1 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 space-y-2">
                      <div className="text-label-xs text-text-sub-600 mb-2">Recent</div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bg-weak-50">
                          <div className="size-6 rounded-full bg-primary-lighter" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-bg-soft-200 rounded w-full" />
                            <div className="h-1.5 bg-bg-soft-200 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary-base/0 group-hover:bg-primary-base/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-white-0 shadow-custom-md ring-1 ring-stroke-soft-200">
                        <span className="text-label-sm text-text-strong-950">Explore Dashboard</span>
                        <ArrowRight className="size-4 text-primary-base" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Logos Section
function LogosSection() {
  const brands = [
    'Nike', 'Samsung', 'Sony', 'Adidas', 'Puma', 'Apple', 'Google', 'Amazon'
  ]

  return (
    <section className="py-16 bg-bg-weak-50 border-y border-stroke-soft-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-label-sm text-text-soft-400 mb-8">
          TRUSTED BY LEADING BRANDS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand) => (
            <div key={brand} className="text-label-lg font-semibold text-text-disabled-300">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Megaphone,
      title: 'Campaign Management',
      description: 'Create cashback, discount, and loyalty campaigns in minutes with our intuitive 4-step wizard.',
      color: 'primary',
    },
    {
      icon: CheckCircle,
      title: 'Smart Verification',
      description: 'OCR-powered enrollment verification automatically extracts order details from receipts.',
      color: 'success',
    },
    {
      icon: Wallet,
      title: 'Wallet & Payouts',
      description: 'Real-time balance tracking with automated holds, releases, and instant payouts.',
      color: 'feature',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with role-based access control. Owner, Admin, Manager, or Viewer.',
      color: 'information',
    },
    {
      icon: Receipt,
      title: 'Automated Invoicing',
      description: 'GST-compliant invoices generated automatically with detailed enrollment breakdowns.',
      color: 'warning',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      description: 'Bank-grade security with 2FA, passkeys, and SOC 2 compliance. Your data is safe.',
      color: 'stable',
    },
  ]

  const colorClasses = {
    primary: 'bg-primary-lighter text-primary-base',
    success: 'bg-success-lighter text-success-base',
    feature: 'bg-feature-lighter text-feature-base',
    information: 'bg-information-lighter text-information-base',
    warning: 'bg-warning-lighter text-warning-base',
    stable: 'bg-stable-lighter text-stable-base',
  }

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-feature-lighter px-4 py-1.5 mb-4">
            <Lightning weight="fill" className="size-4 text-feature-base" />
            <span className="text-label-xs font-medium text-feature-dark">Powerful Features</span>
          </div>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950">
            Everything You Need to Scale
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            From campaign creation to payout management, Hypedrive handles the entire influencer marketing workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl bg-bg-white-0 p-6 shadow-custom-sm ring-1 ring-stroke-soft-200 transition-all duration-300 hover:shadow-custom-md hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn('inline-flex items-center justify-center size-12 rounded-xl mb-4', colorClasses[feature.color as keyof typeof colorClasses])}>
                <feature.icon weight="duotone" className="size-6" />
              </div>
              <h3 className="text-label-lg text-text-strong-950 mb-2">{feature.title}</h3>
              <p className="text-paragraph-sm text-text-sub-600">{feature.description}</p>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="size-5 text-primary-base" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Wallet,
      title: 'Fund Your Wallet',
      description: 'Add funds via UPI, bank transfer, or net banking. Your balance is ready for campaigns instantly.',
    },
    {
      step: '02',
      icon: Megaphone,
      title: 'Create Campaign',
      description: 'Set up your campaign in 4 easy steps. Choose products, set limits, and define deliverables.',
    },
    {
      step: '03',
      icon: Users,
      title: 'Creators Enroll',
      description: 'Creators discover and join your campaign. They submit proof of purchase with order screenshots.',
    },
    {
      step: '04',
      icon: CheckCircle,
      title: 'Verify & Pay',
      description: 'OCR extracts order details automatically. Approve enrollments and payouts are released instantly.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-bg-weak-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-success-lighter px-4 py-1.5 mb-4">
            <Rocket weight="fill" className="size-4 text-success-base" />
            <span className="text-label-xs font-medium text-success-dark">Simple Process</span>
          </div>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950">
            How Hypedrive Works
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            Get started in minutes. Our streamlined process makes influencer marketing effortless.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-primary-base via-feature-base to-success-base" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="relative z-10 flex items-center justify-center size-12 rounded-full bg-primary-base text-white text-label-lg font-semibold mb-6 shadow-fancy-buttons-primary">
                    {item.step}
                  </div>

                  {/* Card */}
                  <div className="w-full rounded-2xl bg-bg-white-0 p-6 shadow-custom-sm ring-1 ring-stroke-soft-200">
                    <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary-lighter mb-4">
                      <item.icon weight="duotone" className="size-5 text-primary-base" />
                    </div>
                    <h3 className="text-label-md text-text-strong-950 mb-2">{item.title}</h3>
                    <p className="text-paragraph-sm text-text-sub-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Metrics Section
function MetricsSection() {
  const trackerData = [
    { status: 'success' as const, count: 850 },
    { status: 'warning' as const, count: 120 },
    { status: 'error' as const, count: 30 },
  ]

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-information-lighter px-4 py-1.5 mb-4">
              <ChartLineUp weight="fill" className="size-4 text-information-base" />
              <span className="text-label-xs font-medium text-information-dark">Real-time Analytics</span>
            </div>
            <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950">
              Track Performance at a Glance
            </h2>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              Monitor campaign performance, enrollment trends, and financial metrics all in one beautiful dashboard.
            </p>

            <div className="mt-8 space-y-6">
              {[
                { icon: Target, text: 'Real-time enrollment tracking with status breakdown' },
                { icon: Clock, text: 'Priority queue for time-sensitive reviews' },
                { icon: CurrencyInr, text: 'Wallet balance with runway predictions' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-success-lighter shrink-0">
                    <item.icon weight="duotone" className="size-4 text-success-base" />
                  </div>
                  <p className="text-paragraph-md text-text-sub-600">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button.Root variant="primary" size="medium" asChild>
                <Link href="/sign-up">
                  Try Dashboard Free
                  <Button.Icon as={ArrowRight} />
                </Link>
              </Button.Root>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-bg-white-0 p-6 shadow-custom-md ring-1 ring-stroke-soft-200">
              <h3 className="text-label-md text-text-strong-950 mb-4">Enrollment Distribution</h3>
              <Tracker data={trackerData} size="lg" className="mb-6" />
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-success-lighter/50">
                  <div className="text-title-h5 text-success-base font-semibold">850</div>
                  <div className="text-label-xs text-text-sub-600">Approved</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-warning-lighter/50">
                  <div className="text-title-h5 text-warning-base font-semibold">120</div>
                  <div className="text-label-xs text-text-sub-600">Pending</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-error-lighter/50">
                  <div className="text-title-h5 text-error-base font-semibold">30</div>
                  <div className="text-label-xs text-text-sub-600">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '₹9,999',
      period: '/month',
      description: 'Perfect for small brands getting started',
      features: [
        '50 enrollments/month',
        '2 team members',
        '1 active campaign',
        'Email support',
        'Basic analytics',
      ],
      notIncluded: ['API access', 'Custom integrations', 'Dedicated support'],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: '₹24,999',
      period: '/month',
      description: 'For growing brands scaling their campaigns',
      features: [
        '500 enrollments/month',
        '10 team members',
        'Unlimited campaigns',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Webhooks',
      ],
      notIncluded: ['Custom integrations'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited enrollments',
        'Unlimited team members',
        'Unlimited campaigns',
        'Dedicated account manager',
        'Custom analytics',
        'Full API access',
        'Custom integrations',
        'SLA guarantee',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-bg-weak-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-warning-lighter px-4 py-1.5 mb-4">
            <CurrencyInr weight="fill" className="size-4 text-warning-base" />
            <span className="text-label-xs font-medium text-warning-dark">Transparent Pricing</span>
          </div>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950">
            Simple, Predictable Pricing
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl bg-bg-white-0 p-8 shadow-custom-sm ring-1 transition-all duration-300 hover:shadow-custom-md',
                plan.popular ? 'ring-primary-base ring-2 scale-105' : 'ring-stroke-soft-200'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-base px-4 py-1.5 text-label-xs font-medium text-white shadow-fancy-buttons-primary">
                    <Star weight="fill" className="size-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-label-lg text-text-strong-950 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-title-h3 text-text-strong-950 font-semibold">{plan.price}</span>
                  <span className="text-paragraph-sm text-text-sub-600">{plan.period}</span>
                </div>
                <p className="text-paragraph-sm text-text-sub-600 mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-5 rounded-full bg-success-lighter">
                      <Check weight="bold" className="size-3 text-success-base" />
                    </div>
                    <span className="text-paragraph-sm text-text-sub-600">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 opacity-50">
                    <div className="flex items-center justify-center size-5 rounded-full bg-bg-soft-200">
                      <X weight="bold" className="size-3 text-text-soft-400" />
                    </div>
                    <span className="text-paragraph-sm text-text-soft-400">{feature}</span>
                  </div>
                ))}
              </div>

              <Button.Root
                variant={plan.popular ? 'primary' : 'basic'}
                size="medium"
                asChild
                className="w-full"
              >
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/sign-up'}>
                  {plan.cta}
                  <Button.Icon as={ArrowRight} />
                </Link>
              </Button.Root>
            </div>
          ))}
        </div>

        <p className="text-center text-paragraph-sm text-text-sub-600 mt-8">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-highlighted-lighter px-4 py-1.5 mb-4">
            <Star weight="fill" className="size-4 text-highlighted-base" />
            <span className="text-label-xs font-medium text-highlighted-dark">Customer Stories</span>
          </div>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950">
            Loved by Marketing Teams
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            See what brands are saying about their experience with Hypedrive.
          </p>
        </div>

        {/* Testimonials section removed - will be populated from API/CMS when available */}
        <div className="text-center py-12">
          <p className="text-paragraph-md text-text-sub-600">
            Customer testimonials will be displayed here when available.
          </p>
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-bg-strong-950 p-8 sm:p-16 overflow-hidden">
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="relative text-center">
            {/* Metallic Logo */}
            <div className="flex justify-center mb-8">
              <div className="size-16 sm:size-20">
                <MetallicLogo
                  className="size-16 sm:size-20"
                  params={{ patternScale: 1.5, refraction: 0.02, speed: 0.2 }}
                />
              </div>
            </div>

            <h2 className="text-title-h3 sm:text-title-h2 text-white mb-4">
              Ready to Scale Your Influencer Marketing?
            </h2>
            <p className="text-paragraph-lg text-white/70 max-w-2xl mx-auto mb-8">
              Join 500+ brands using Hypedrive to streamline their creator campaigns.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button.Root variant="primary" size="medium" asChild className="w-full sm:w-auto">
                <Link href="/sign-up">
                  Get Started Free
                  <Button.Icon as={ArrowRight} />
                </Link>
              </Button.Root>
              <Button.Root variant="basic" size="medium" asChild className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5">
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button.Root>
            </div>
            <p className="text-paragraph-sm text-white/50 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Sign Up', href: '/sign-up' },
    ],
    Resources: [
      { label: 'Help Center', href: '/dashboard/help' },
      { label: 'API Docs', href: 'https://docs.hypedrive.com', external: true },
      { label: 'Support', href: 'mailto:support@hypedrive.com', external: true },
    ],
    Company: [
      { label: 'About', href: '#', disabled: true },
      { label: 'Contact', href: 'mailto:hello@hypedrive.com', external: true },
    ],
    Legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  }

  return (
    <footer className="bg-bg-strong-950 text-text-white-0 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8">
                <MetallicLogo
                  className="size-8"
                  params={{ patternScale: 2, refraction: 0.015, speed: 0.25 }}
                />
              </div>
              <Logo width={110} height={24} forceTheme="dark" />
            </div>
            <p className="text-paragraph-sm text-white/60 mt-4 max-w-xs">
              The influencer marketing platform that actually works. Launch, manage, and scale creator campaigns effortlessly.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://twitter.com/hypedrive" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Follow us on Twitter">
                <TwitterLogo weight="fill" className="size-5" />
              </a>
              <a href="https://linkedin.com/company/hypedrive" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Follow us on LinkedIn">
                <LinkedinLogo weight="fill" className="size-5" />
              </a>
              <a href="https://instagram.com/hypedrive" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Follow us on Instagram">
                <InstagramLogo weight="fill" className="size-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-label-sm text-white font-medium mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paragraph-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : 'disabled' in link && link.disabled ? (
                      <span className="text-paragraph-sm text-white/40 cursor-not-allowed">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-paragraph-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-paragraph-sm text-white/40">
            © 2025 Hypedrive. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-paragraph-sm text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-paragraph-sm text-white/40 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-white-0">
      <Navigation />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
