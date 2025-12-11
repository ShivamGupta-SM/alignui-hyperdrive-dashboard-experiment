'use client'

import Link from 'next/link'
import * as Button from '@/components/ui/button'
import { House, ArrowRight, MagnifyingGlass, Compass, Headset } from '@phosphor-icons/react/dist/ssr'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-linear-to-br from-bg-weak-50 via-bg-white-0 to-bg-soft-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-xl bg-primary-base">
            <span className="text-label-md sm:text-label-lg text-white font-bold">H</span>
          </div>
          <span className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">
            Hypedrive
          </span>
        </Link>
        <Button.Root variant="ghost" size="small" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button.Root>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-bg-white-0 p-6 sm:p-10 ring-1 ring-inset ring-stroke-soft-200 shadow-lg text-center">
            {/* 404 Illustration */}
            <div className="mb-6 sm:mb-8">
              <div className="relative inline-flex">
                {/* Decorative circles */}
                <div className="absolute -inset-4 rounded-full bg-primary-lighter/50 animate-pulse" />
                <div className="absolute -inset-2 rounded-full bg-primary-lighter/70" />
                {/* Main circle */}
                <div className="relative flex size-24 sm:size-28 items-center justify-center rounded-full bg-linear-to-br from-primary-base to-primary-darker shadow-lg">
                  <Compass weight="duotone" className="size-12 sm:size-14 text-white" />
                </div>
              </div>
            </div>

            {/* Error Code Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-lighter text-error-base text-label-xs font-medium mb-4">
              <span>Error 404</span>
            </div>

            {/* Header */}
            <h1 className="text-title-h4 sm:text-title-h3 text-text-strong-950 mb-2">
              Page Not Found
            </h1>
            <p className="text-paragraph-sm sm:text-paragraph-md text-text-sub-600 mb-6 sm:mb-8 max-w-sm mx-auto">
              Looks like you&apos;ve wandered off the map. The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
              <Button.Root variant="primary" size="medium" asChild className="flex-1 h-11">
                <Link href="/dashboard">
                  <Button.Icon as={House} />
                  Go to Dashboard
                </Link>
              </Button.Root>
              <Button.Root variant="basic" size="medium" asChild className="flex-1 h-11">
                <Link href="/">
                  Back to Home
                  <Button.Icon as={ArrowRight} />
                </Link>
              </Button.Root>
            </div>

            {/* Suggestions */}
            <div className="rounded-xl bg-bg-weak-50 p-4 sm:p-5">
              <h3 className="text-label-sm text-text-strong-950 mb-3">What you can do:</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-3 text-paragraph-sm text-text-sub-600">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shrink-0">
                    <MagnifyingGlass className="size-3.5 text-text-soft-400" />
                  </div>
                  <span>Check the URL for typos</span>
                </li>
                <li className="flex items-center gap-3 text-paragraph-sm text-text-sub-600">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shrink-0">
                    <House className="size-3.5 text-text-soft-400" />
                  </div>
                  <span>Navigate from the homepage</span>
                </li>
                <li className="flex items-center gap-3 text-paragraph-sm text-text-sub-600">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shrink-0">
                    <Headset className="size-3.5 text-text-soft-400" />
                  </div>
                  <span>
                    <a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">
                      Contact support
                    </a>{' '}
                    if the issue persists
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-stroke-soft-200 bg-bg-white-0/50">
        <p className="text-paragraph-xs text-text-soft-400">
          © 2024 Hypedrive. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
