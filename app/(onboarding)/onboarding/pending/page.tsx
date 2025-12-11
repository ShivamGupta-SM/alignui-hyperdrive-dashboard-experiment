'use client'

import Link from 'next/link'
import * as Button from '@/components/ui/button'
import { Envelope, Clock, Headset } from '@phosphor-icons/react/dist/ssr'

export default function PendingApprovalPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
        {/* Icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-warning-lighter mx-auto mb-6">
          <Clock weight="duotone" className="size-8 text-warning-base" />
        </div>

        {/* Title */}
        <h1 className="text-title-h4 text-text-strong-950 mb-2">
          Application Submitted!
        </h1>
        <p className="text-paragraph-sm text-text-sub-600 mb-8">
          Your organization is pending approval. Our team will review your application within 24-48 hours.
        </p>

        {/* What's Next */}
        <div className="rounded-12 bg-bg-weak-50 p-4 text-left mb-6">
          <h3 className="text-label-sm text-text-strong-950 mb-3">What&apos;s Next?</h3>
          <ul className="space-y-3 text-paragraph-sm text-text-sub-600">
            <li className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
                1
              </div>
              <span>Our team reviews your GST and business details</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
                2
              </div>
              <span>You&apos;ll receive an email notification once approved</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
                3
              </div>
              <span>Complete your profile and fund your wallet</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary-base text-white text-label-xs shrink-0">
                4
              </div>
              <span>Start creating campaigns!</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex items-center justify-center gap-2 text-paragraph-sm text-text-sub-600 mb-6">
          <Envelope weight="duotone" className="size-4" />
          <span>We&apos;ll notify you at your registered email</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button.Root variant="primary" className="w-full" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button.Root>
          <Button.Root variant="basic" className="w-full" asChild>
            <a href="mailto:support@hypedrive.com" className="inline-flex items-center gap-2">
              <Headset weight="duotone" className="size-5" />
              Contact Support
            </a>
          </Button.Root>
        </div>
      </div>
    </div>
  )
}
