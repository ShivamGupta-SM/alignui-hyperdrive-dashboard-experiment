"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";
import * as Button from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { MetallicLogo } from "@/components/dashboard/metallic-logo";
import {
  ArrowRight,
  CheckCircle,
  Wallet,
  Users,
  ChartLineUp,
  Receipt,
  Star,
  Check,
  X,
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  List,
  XCircle,
  ShieldCheck,
  Megaphone,
  ArrowUpRight,
  Play,
  Lightning,
  Scan,
  CurrencyInr,
} from "@phosphor-icons/react";
import { useState } from "react";

// ============================================
// Navigation
// ============================================
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-white-0/95 backdrop-blur-sm border-b border-stroke-soft-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo width={120} height={28} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button.Root
              variant="ghost"
              size="small"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button.Root>
            <Button.Root variant="primary" size="small" asChild>
              <Link href="/sign-up">
                Get Started
                <Button.Icon as={ArrowRight} />
              </Link>
            </Button.Root>

            <button
              type="button"
              className="md:hidden flex items-center justify-center size-10 text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XCircle className="size-5" weight="duotone" />
              ) : (
                <List className="size-5" weight="duotone" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stroke-soft-200 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-label-sm text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 px-4">
              <Button.Root
                variant="basic"
                size="small"
                asChild
                className="w-full"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button.Root>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// ============================================
// Hero Section
// ============================================
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-weak-50/50 to-bg-white-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-lighter ring-1 ring-inset ring-success-base/20 mb-6">
              <div className="size-1.5 rounded-full bg-success-base animate-pulse" />
              <span className="text-label-xs text-success-dark">
                500+ brands trust Hypedrive
              </span>
            </div>

            <h1 className="text-title-h2 sm:text-title-h1 text-text-strong-950 tracking-tight">
              Influencer marketing
              <br />
              <span className="text-text-sub-600">that actually works</span>
            </h1>

            <p className="mt-6 text-paragraph-lg text-text-sub-600 max-w-lg leading-relaxed">
              Launch campaigns, verify enrollments with OCR, and manage payouts
              — all in one platform built for modern brands.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button.Root variant="primary" size="medium" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <Button.Icon as={ArrowRight} />
                </Link>
              </Button.Root>
              <Button.Root variant="basic" size="medium" asChild>
                <Link href="#demo">
                  <Button.Icon as={Play} />
                  Watch Demo
                </Link>
              </Button.Root>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 pt-6 border-t border-stroke-soft-200">
              <div className="flex -space-x-2">
                {["PS", "RM", "AR", "VK"].map((initials, i) => (
                  <div
                    key={initials}
                    className="flex items-center justify-center size-9 rounded-full bg-bg-soft-200 text-text-sub-600 text-label-xs ring-2 ring-bg-white-0"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={`hero-star-${star}`}
                      weight="fill"
                      className="size-4 text-warning-base"
                    />
                  ))}
                </div>
                <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                  from 200+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* Right: Hero visual */}
          <div className="relative">
            {/* Main card */}
            <div className="relative rounded-2xl bg-bg-strong-950 p-1 ring-1 ring-white/10 shadow-md">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-white/5 text-paragraph-xs text-white/50">
                    dashboard.hypedrive.com
                  </div>
                </div>
              </div>

              {/* Metallic logo */}
              <div className="aspect-[4/3] flex items-center justify-center p-8 bg-gradient-to-br from-bg-strong-950 to-neutral-900">
                <MetallicLogo
                  className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
                  params={{
                    patternScale: 2,
                    refraction: 0.02,
                    edge: 2,
                    patternBlur: 0.005,
                    liquid: 0.08,
                    speed: 0.4,
                  }}
                />
              </div>
            </div>

            {/* Floating stat card - left */}
            <div className="absolute -left-4 top-1/4 hidden lg:block">
              <div className="rounded-xl bg-bg-white-0 p-3 shadow-md ring-1 ring-stroke-soft-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-success-lighter">
                    <ChartLineUp
                      weight="duotone"
                      className="size-5 text-success-base"
                    />
                  </div>
                  <div>
                    <p className="text-label-sm text-text-strong-950 font-semibold">
                      +45%
                    </p>
                    <p className="text-paragraph-xs text-text-sub-600">
                      Conversion
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat card - right */}
            <div className="absolute -right-4 bottom-1/4 hidden lg:block">
              <div className="rounded-xl bg-bg-white-0 p-3 shadow-md ring-1 ring-stroke-soft-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary-lighter">
                    <Lightning
                      weight="duotone"
                      className="size-5 text-primary-base"
                    />
                  </div>
                  <div>
                    <p className="text-label-sm text-text-strong-950 font-semibold">
                      2 min
                    </p>
                    <p className="text-paragraph-xs text-text-sub-600">
                      Avg. approval
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Stats Section
// ============================================
function StatsSection() {
  const stats = [
    { value: "500+", label: "Active Brands", icon: Users },
    { value: "₹50Cr+", label: "Payouts Processed", icon: Wallet },
    { value: "1M+", label: "Enrollments", icon: CheckCircle },
    { value: "95%", label: "Approval Rate", icon: ChartLineUp },
  ];

  return (
    <section className="py-16 bg-bg-weak-50 border-y border-stroke-soft-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-4 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200"
            >
              <div className="flex items-center justify-center size-12 rounded-xl bg-bg-weak-50">
                <stat.icon
                  weight="duotone"
                  className="size-6 text-text-sub-600"
                />
              </div>
              <div>
                <div className="text-title-h5 text-text-strong-950 font-semibold">
                  {stat.value}
                </div>
                <div className="text-paragraph-sm text-text-sub-600">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Features Section
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: Megaphone,
      title: "Campaign Management",
      description:
        "Create cashback, discount, and loyalty campaigns in minutes. Set limits, define deliverables, track performance in real-time.",
      color: "primary" as const,
    },
    {
      icon: Scan,
      title: "OCR Verification",
      description:
        "Automatically extract order details from receipts and screenshots. No manual data entry required.",
      color: "success" as const,
    },
    {
      icon: Wallet,
      title: "Wallet & Payouts",
      description:
        "Real-time balance tracking with automated holds, releases, and instant payouts to creators.",
      color: "warning" as const,
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Invite team members with role-based access. Owner, Admin, Manager, or Viewer permissions.",
      color: "information" as const,
    },
    {
      icon: Receipt,
      title: "Automated Invoicing",
      description:
        "GST-compliant invoices generated automatically with detailed enrollment breakdowns.",
      color: "stable" as const,
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      description:
        "Bank-grade security with 2FA, passkeys, and SOC 2 compliance. Your data is protected.",
      color: "feature" as const,
    },
  ];

  const colorMap = {
    primary: {
      bg: "bg-primary-lighter",
      icon: "text-primary-base",
      ring: "ring-primary-base/10",
    },
    success: {
      bg: "bg-success-lighter",
      icon: "text-success-base",
      ring: "ring-success-base/10",
    },
    warning: {
      bg: "bg-warning-lighter",
      icon: "text-warning-base",
      ring: "ring-warning-base/10",
    },
    information: {
      bg: "bg-information-lighter",
      icon: "text-information-base",
      ring: "ring-information-base/10",
    },
    stable: {
      bg: "bg-stable-lighter",
      icon: "text-stable-base",
      ring: "ring-stable-base/10",
    },
    feature: {
      bg: "bg-feature-lighter",
      icon: "text-feature-base",
      ring: "ring-feature-base/10",
    },
  };

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-subheading-xs text-primary-base uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950 tracking-tight">
            Everything you need to scale
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600">
            From campaign creation to payout management, Hypedrive handles the
            entire workflow.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={cn(
                  "group rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200",
                  "hover:ring-2 hover:shadow-sm transition-all duration-200",
                  `hover:${colors.ring}`
                )}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center size-12 rounded-xl mb-5",
                    colors.bg
                  )}
                >
                  <feature.icon
                    weight="duotone"
                    className={cn("size-6", colors.icon)}
                  />
                </div>
                <h3 className="text-label-lg text-text-strong-950 mb-2">
                  {feature.title}
                </h3>
                <p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// How It Works Section
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Wallet,
      title: "Fund Your Wallet",
      description:
        "Add funds via UPI, bank transfer, or net banking. Your balance is ready for campaigns instantly.",
    },
    {
      number: "02",
      icon: Megaphone,
      title: "Create Campaign",
      description:
        "Set up your campaign in 4 easy steps. Choose products, set limits, and define deliverables.",
    },
    {
      number: "03",
      icon: Users,
      title: "Creators Enroll",
      description:
        "Creators discover and join your campaign. They submit proof of purchase with order screenshots.",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Verify & Pay",
      description:
        "OCR extracts order details automatically. Approve enrollments and payouts release instantly.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-bg-weak-50 border-y border-stroke-soft-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-subheading-xs text-success-base uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950 tracking-tight">
            Get started in minutes
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600">
            Our streamlined process makes influencer marketing effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+24px)] right-0 h-px bg-stroke-soft-200" />
              )}

              <div className="text-center">
                {/* Step number */}
                <div className="relative inline-flex items-center justify-center size-16 rounded-full bg-bg-white-0 ring-1 ring-stroke-soft-200 shadow-sm mb-5">
                  <span className="text-label-lg text-text-strong-950 font-semibold">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary-lighter mx-auto mb-4">
                  <step.icon
                    weight="duotone"
                    className="size-6 text-primary-base"
                  />
                </div>

                <h3 className="text-label-md text-text-strong-950 mb-2">
                  {step.title}
                </h3>
                <p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Analytics Section
// ============================================
function AnalyticsSection() {
  const metrics = [
    {
      label: "Approved",
      value: 850,
      percentage: 85,
      color: "success" as const,
    },
    { label: "Pending", value: 120, percentage: 12, color: "warning" as const },
    { label: "Rejected", value: 30, percentage: 3, color: "error" as const },
  ];

  const colorMap = {
    success: {
      bar: "bg-success-base",
      text: "text-success-base",
      bg: "bg-success-lighter",
    },
    warning: {
      bar: "bg-warning-base",
      text: "text-warning-base",
      bg: "bg-warning-lighter",
    },
    error: {
      bar: "bg-error-base",
      text: "text-error-base",
      bg: "bg-error-lighter",
    },
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <p className="text-subheading-xs text-information-base uppercase tracking-wider mb-3">
              Analytics
            </p>
            <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950 tracking-tight">
              Track performance at a glance
            </h2>
            <p className="mt-4 text-paragraph-lg text-text-sub-600 leading-relaxed">
              Monitor campaign performance, enrollment trends, and financial
              metrics in one beautiful dashboard.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Real-time enrollment tracking with status breakdown",
                "Priority queue for time-sensitive reviews",
                "Wallet balance with runway predictions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-6 rounded-full bg-success-lighter shrink-0 mt-0.5">
                    <Check
                      weight="bold"
                      className="size-3.5 text-success-base"
                    />
                  </div>
                  <span className="text-paragraph-md text-text-sub-600">
                    {item}
                  </span>
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

          {/* Right: Analytics card */}
          <div className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-label-md text-text-strong-950">
                Enrollment Overview
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-lighter">
                <div className="size-1.5 rounded-full bg-success-base animate-pulse" />
                <span className="text-label-xs text-success-dark">Live</span>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-5">
              {metrics.map((m) => {
                const colors = colorMap[m.color];
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-sm text-text-sub-600">
                        {m.label}
                      </span>
                      <span
                        className={cn(
                          "text-label-sm font-semibold",
                          colors.text
                        )}
                      >
                        {m.value}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-soft-200 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          colors.bar
                        )}
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-5 border-t border-stroke-soft-200 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-bg-weak-50">
                <div className="text-title-h6 text-text-strong-950 font-semibold">
                  1,000
                </div>
                <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
                  Total
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-success-lighter">
                <div className="text-title-h6 text-success-base font-semibold">
                  85%
                </div>
                <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
                  Approved
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-bg-weak-50">
                <div className="text-title-h6 text-text-strong-950 font-semibold">
                  2m
                </div>
                <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
                  Avg. Time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Pricing Section
// ============================================
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "₹9,999",
      period: "/month",
      description: "Perfect for small brands getting started",
      features: [
        "50 enrollments/month",
        "2 team members",
        "1 active campaign",
        "Email support",
        "Basic analytics",
      ],
      notIncluded: ["API access", "Custom integrations"],
      popular: false,
    },
    {
      name: "Growth",
      price: "₹24,999",
      period: "/month",
      description: "For growing brands scaling campaigns",
      features: [
        "500 enrollments/month",
        "10 team members",
        "Unlimited campaigns",
        "Priority support",
        "Advanced analytics",
        "API access",
      ],
      notIncluded: ["Custom integrations"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited enrollments",
        "Unlimited team",
        "Unlimited campaigns",
        "Dedicated manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      notIncluded: [],
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 lg:py-28 bg-bg-weak-50 border-y border-stroke-soft-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-subheading-xs text-warning-base uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950 tracking-tight">
            Simple, predictable pricing
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600">
            No hidden fees. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl bg-bg-white-0 p-6 flex flex-col",
                plan.popular
                  ? "ring-2 ring-text-strong-950 shadow-md"
                  : "ring-1 ring-inset ring-stroke-soft-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-text-strong-950 text-label-xs text-white">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={cn(plan.popular && "pt-2")}>
                <h3 className="text-label-lg text-text-strong-950">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-title-h4 text-text-strong-950 font-semibold">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-paragraph-sm text-text-sub-600">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-paragraph-sm text-text-sub-600 mt-2">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-5 rounded-full bg-success-lighter shrink-0">
                      <Check
                        weight="bold"
                        className="size-3 text-success-base"
                      />
                    </div>
                    <span className="text-paragraph-sm text-text-sub-600">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 opacity-50"
                  >
                    <div className="flex items-center justify-center size-5 rounded-full bg-bg-soft-200 shrink-0">
                      <X weight="bold" className="size-3 text-text-soft-400" />
                    </div>
                    <span className="text-paragraph-sm text-text-soft-400">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button.Root
                  variant={plan.popular ? "primary" : "basic"}
                  size="medium"
                  asChild
                  className="w-full"
                >
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/sign-up"}
                  >
                    {plan.name === "Enterprise"
                      ? "Contact Sales"
                      : "Start Free Trial"}
                  </Link>
                </Button.Root>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-paragraph-sm text-text-sub-600 mt-8">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ============================================
// Testimonials Section
// ============================================
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Hypedrive reduced our campaign management time by 80%. The OCR verification is a game-changer.",
      author: "Priya Sharma",
      role: "Marketing Head",
      company: "Fashion Brand",
    },
    {
      quote:
        "Finally, a platform that understands B2B influencer marketing. The wallet system is incredibly intuitive.",
      author: "Rahul Mehta",
      role: "Brand Manager",
      company: "Electronics Co.",
    },
    {
      quote:
        "We processed over ₹1Cr in payouts last quarter. The automation saved us countless hours.",
      author: "Ananya Reddy",
      role: "Growth Lead",
      company: "D2C Startup",
    },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-subheading-xs text-highlighted-base uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-title-h3 sm:text-title-h2 text-text-strong-950 tracking-tight">
            Loved by marketing teams
          </h2>
          <p className="mt-4 text-paragraph-lg text-text-sub-600">
            See what brands are saying about Hypedrive.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`${testimonial.author}-star-${star}`}
                    weight="fill"
                    className="size-4 text-warning-base"
                  />
                ))}
              </div>

              <blockquote className="text-paragraph-md text-text-sub-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-stroke-soft-200">
                <div className="flex items-center justify-center size-10 rounded-full bg-bg-soft-200 text-text-sub-600 text-label-xs font-medium">
                  {testimonial.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-label-sm text-text-strong-950">
                    {testimonial.author}
                  </div>
                  <div className="text-paragraph-xs text-text-sub-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA Section
// ============================================
function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-bg-strong-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-title-h3 sm:text-title-h2 text-white tracking-tight">
            Ready to scale your influencer marketing?
          </h2>
          <p className="mt-4 text-paragraph-lg text-white/70">
            Join 500+ brands using Hypedrive. Start your free trial today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button.Root
              size="medium"
              asChild
              className="bg-white text-text-strong-950 hover:bg-white/90"
            >
              <Link href="/sign-up">
                Get Started Free
                <Button.Icon as={ArrowRight} />
              </Link>
            </Button.Root>
            <Button.Root
              variant="ghost"
              size="medium"
              asChild
              className="text-white hover:bg-white/10 ring-1 ring-white/20"
            >
              <Link href="/contact">Talk to Sales</Link>
            </Button.Root>
          </div>
          <p className="mt-6 text-paragraph-sm text-white/50">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Footer
// ============================================
function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    Resources: [
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  };

  return (
    <footer className="py-12 lg:py-16 border-t border-stroke-soft-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Logo width={120} height={28} />
            <p className="mt-4 text-paragraph-sm text-text-sub-600 max-w-xs">
              The influencer marketing platform that actually works.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[
                { icon: TwitterLogo, label: "Twitter" },
                { icon: LinkedinLogo, label: "LinkedIn" },
                { icon: InstagramLogo, label: "Instagram" },
              ].map((social) => (
                <button
                  key={social.label}
                  type="button"
                  className="flex items-center justify-center size-9 rounded-lg text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 transition-colors"
                  aria-label={`Follow us on ${social.label}`}
                >
                  <social.icon weight="fill" className="size-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-subheading-2xs text-text-strong-950 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-paragraph-sm text-text-sub-600 hover:text-text-strong-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-stroke-soft-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-paragraph-xs text-text-sub-600">
            © 2025 Hypedrive. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-paragraph-xs text-text-sub-600 hover:text-text-strong-950 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-paragraph-xs text-text-sub-600 hover:text-text-strong-950 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// Main Page
// ============================================
export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-bg-white-0">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AnalyticsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
