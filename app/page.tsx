import Link from 'next/link'
import * as Button from '@/components/ui/button'
import { FeaturedCard } from '@/components/claude-generated-components/featured-card'
import { FeaturedIcon } from '@/components/claude-generated-components/featured-icon'
import { RiArrowRightLine, RiBarChartBoxLine, RiCheckDoubleLine, RiWallet3Line } from '@remixicon/react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-white-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stroke-soft-200">
        <div className="flex items-center gap-2">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-10 bg-primary-base">
            <span className="text-label-md sm:text-label-lg text-white font-bold">H</span>
          </div>
          <span className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">
            Hypedrive
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button.Root variant="ghost" size="xsmall" asChild className="sm:hidden">
            <Link href="/sign-in">Sign In</Link>
          </Button.Root>
          <Button.Root variant="ghost" size="small" asChild className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign In</Link>
          </Button.Root>
          <Button.Root variant="primary" size="xsmall" asChild className="sm:hidden">
            <Link href="/sign-up">Get Started</Link>
          </Button.Root>
          <Button.Root variant="primary" size="small" asChild className="hidden sm:inline-flex">
            <Link href="/sign-up">Get Started</Link>
          </Button.Root>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative">
        <div className="max-w-3xl text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-alpha-10 text-primary-base text-label-xs sm:text-label-sm mb-4 sm:mb-6">
            <span>🚀</span>
            <span className="whitespace-nowrap sm:whitespace-normal">Brand Dashboard for Influencer Marketing</span>
          </div>
          
          <h1 className="text-title-h3 sm:text-title-h2 lg:text-title-h1 text-text-strong-950 mb-3 sm:mb-4 leading-tight">
            Manage Your Influencer Campaigns with{' '}
            <span className="text-primary-base">Hypedrive</span>
          </h1>
          
          <p className="text-paragraph-md sm:text-paragraph-lg text-text-sub-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Create campaigns, review enrollments, manage your wallet, and track performance - all in one powerful dashboard built for brands.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button.Root variant="primary" size="medium" asChild className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start Free Trial
                <Button.Icon as={RiArrowRightLine} />
              </Link>
            </Button.Root>
            <Button.Root variant="basic" size="medium" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                View Demo
              </Link>
            </Button.Root>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
            <FeatureCard
              icon={<FeaturedIcon icon={RiBarChartBoxLine} color="primary" size="medium" />}
              title="Campaign Management"
              description="Create and manage influencer campaigns with ease. Track enrollments and approvals in real-time."
            />
            <FeatureCard
              icon={<FeaturedIcon icon={RiCheckDoubleLine} color="success" size="medium" />}
              title="OCR Verification"
              description="Automated order verification using OCR technology. Review submissions with confidence."
            />
            <FeatureCard
              icon={<FeaturedIcon icon={RiWallet3Line} color="primary" size="medium" />}
              title="Wallet & Billing"
              description="Transparent billing with hold-based payments. Fund your wallet and manage payouts."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stroke-soft-200 py-4 sm:py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-soft-400 text-center sm:text-left">
            © 2024 Hypedrive. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 hover:text-text-strong-950">
              Terms
            </Link>
            <Link href="/privacy" className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 hover:text-text-strong-950">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6 text-left transition-all hover:shadow-md hover:ring-stroke-sub-300">
      <div className="mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-label-md sm:text-label-lg text-text-strong-950 mb-1 sm:mb-2">{title}</h3>
      <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">{description}</p>
    </div>
  )
}
