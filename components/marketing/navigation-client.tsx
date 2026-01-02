"use client"

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useModalState } from "@/hooks/ui"
import * as Button from "@/components/ui/primitives/button"
import { Logo } from "@/components/ui/branding/logo"
import {
  ArrowRight,
  List,
} from '@phosphor-icons/react'

export function NavigationClient() {
  const [mobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu] = useModalState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-white-0/80 backdrop-blur-xl border-b border-stroke-soft-200/60 pt-[env(safe-area-inset-top)]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
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
                <Button.Icon><ArrowRight className="size-5" /></Button.Icon>
              </Link>
            </Button.Root>
            <Button.Root
              variant="ghost"
              size="small"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Button.Icon><List className="size-5" /></Button.Icon>
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






